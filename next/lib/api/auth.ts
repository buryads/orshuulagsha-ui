import { apiCall } from './client';
import { clearAuthToken, setAuthToken } from '@/lib/api/cookies';
import type { DataEnvelope, TokenResponse } from '@/lib/api/types';

const RESOURCE_LOGIN = '/api/jwt/login';
const RESOURCE_LOGOUT = '/api/jwt/logout';
const RESOURCE_REGISTER = '/api/jwt/signup';
const RESOURCE_PASSWORD_RESET = '/api/password/reset';

async function persistToken(token: TokenResponse): Promise<void> {
  setAuthToken(token.token, token.expires_at);
}

export async function login(email: string, password: string): Promise<void> {
  const body = await apiCall<DataEnvelope<TokenResponse>>(
    'POST',
    RESOURCE_LOGIN,
    { data: { email, password } },
  );
  await persistToken(body.data);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const body = await apiCall<DataEnvelope<TokenResponse>>(
    'POST',
    RESOURCE_REGISTER,
    { data: { name, email, password } },
  );
  await persistToken(body.data);
}

export async function requestPasswordReset(
  email: string,
  locale: string,
): Promise<void> {
  await apiCall<void>('POST', RESOURCE_PASSWORD_RESET, {
    data: { email, locale },
  });
}

export async function resetPassword(
  token: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  await apiCall<void>(
    'POST',
    `${RESOURCE_PASSWORD_RESET}/${encodeURIComponent(token)}`,
    {
      data: { password, password_confirmation: passwordConfirmation },
    },
  );
}

/**
 * Client-side logout: drops the auth cookie. The JWT itself is not revoked
 * server-side and stays valid until it expires.
 */
export function logout(): void {
  clearAuthToken();
}

/**
 * Best-effort backend session logout, then drop the cookie and hard-navigate
 * so all in-memory client state is reset.
 */
export async function signOut(locale: string): Promise<void> {
  try {
    await apiCall<void>('GET', RESOURCE_LOGOUT, { timeout: 4000 });
  } catch {
    // the cookie is dropped regardless
  }
  logout();
  try {
    localStorage.removeItem('user');
  } catch {
    // storage unavailable
  }
  window.location.replace(`/${locale}`);
}
