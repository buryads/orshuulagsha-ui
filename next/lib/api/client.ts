import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from 'axios';

import { getAuthToken, clearAuthToken } from './cookies';

// Supported locales — must match i18n/routing.ts.
const KNOWN_LOCALES = ['ru', 'bur', 'en'] as const;
const DEFAULT_LOCALE = 'ru';

// Auth endpoints that must NOT trigger the global 401 handler — their callers
// need to receive the error directly (e.g. to show a "wrong password" message).
const AUTH_ENDPOINT_PATTERNS = ['/api/jwt/login', '/api/jwt/signup'];

// Module-level guard: redirect only once even if multiple requests 401 at the same time.
let redirecting401 = false;

/** Extract the locale prefix from window.location.pathname (always-prefix mode). */
function currentLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const first = window.location.pathname.split('/')[1] ?? '';
  return (KNOWN_LOCALES as readonly string[]).includes(first)
    ? first
    : DEFAULT_LOCALE;
}

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

// Global 401 handler: clear auth and redirect to /signin when an AUTHED request
// (one that carried a Bearer token) receives a 401 — i.e. the token is stale or
// revoked. Guest requests (no token → no Authorization header) are NOT redirected
// so components can render their own guest-CTA. Guards against redirect loops.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !redirecting401
    ) {
      const requestUrl = error.config?.url ?? '';

      // Skip auth endpoints — callers need the raw error to show form feedback.
      const isAuthEndpoint = AUTH_ENDPOINT_PATTERNS.some((p) =>
        requestUrl.includes(p),
      );

      // Skip if already on sign-in / sign-up to avoid a redirect loop.
      const isAuthPage =
        window.location.pathname.includes('/signin') ||
        window.location.pathname.includes('/signup');

      // Only redirect when the request actually carried a Bearer token — that
      // means the token was present but stale/revoked. Guests have no token,
      // so the request interceptor never sets Authorization; their 401s should
      // fall through so components can render their own guest-CTA instead.
      const hadToken = Boolean(error.config?.headers?.['Authorization']);

      if (!isAuthEndpoint && !isAuthPage && hadToken) {
        redirecting401 = true;

        // Clear the stale token and any cached user data.
        clearAuthToken();
        try {
          localStorage.removeItem('user');
        } catch {
          // localStorage unavailable (private mode, cross-origin, etc.) — ignore.
        }

        const locale = currentLocale();
        window.location.assign(`/${locale}/signin`);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Mirrors the legacy HttpFactory.call signature. Returns the parsed response
 * body (typed as `T`) — callers are responsible for unwrapping any
 * `{ data: ... }` envelopes the backend wraps payloads in.
 */
/** The API origin used by this client (resolved at module init time). */
export const apiBaseUrl = baseURL;

/**
 * Resolve a path or URL against the API base.
 * Absolute URLs (http/https) are returned as-is.
 * Relative paths are joined with apiBaseUrl.
 */
export function resolveApiUrl(u: string): string {
  if (/^https?:\/\//.test(u)) return u;
  const base = apiBaseUrl.replace(/\/$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${base}${path}`;
}

/**
 * Return u only when it is a safe http/https URL; otherwise return undefined.
 * Blocks javascript:, data:, vbscript: and other non-web protocols that can
 * execute code when placed in an href attribute.
 */
export function safeHref(u: string | undefined | null): string | undefined {
  if (!u) return undefined;
  try {
    const url = new URL(u, apiBaseUrl || 'https://x');
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export async function apiCall<T>(
  method: Method,
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response = await api.request<T>({ url, method, ...config });
  return response.data;
}

export default api;
