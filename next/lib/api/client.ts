import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from 'axios';

import { getAuthToken } from './cookies';

const ENV_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURL =
  ENV_BASE ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
if (!baseURL && typeof window !== 'undefined') {
  // Loud-but-non-fatal: production build without an API URL configured.
  // eslint-disable-next-line no-console
  console.error(
    '[api] NEXT_PUBLIC_API_BASE_URL not set; API calls will fail',
  );
}

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// Always attach the JWT when the cookie is present. Endpoints that do not
// require auth simply ignore the header. SSR is a no-op (cookie unavailable).
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Apply JSON content type by default, but never override FormData uploads —
  // the browser must set its own multipart boundary for those.
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (!isFormData) {
    config.headers = config.headers ?? {};
    if (config.headers['Content-Type'] == null) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
});

/**
 * Mirrors the legacy HttpFactory.call signature. Returns the parsed response
 * body (typed as `T`) — callers are responsible for unwrapping any
 * `{ data: ... }` envelopes the backend wraps payloads in.
 */
export async function apiCall<T>(
  method: Method,
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response = await api.request<T>({ url, method, ...config });
  return response.data;
}

export default api;
