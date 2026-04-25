import { apiCall } from './client';
import { clearAuthToken, setAuthToken } from '@/lib/api/cookies';
import type { DataEnvelope, TokenResponse } from '@/lib/api/types';

const RESOURCE_LOGIN = '/api/jwt/login';
const RESOURCE_REGISTER = '/api/jwt/signup';

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

/**
 * Client-side logout: drops the auth cookie. The backend has no JWT
 * invalidation endpoint in the legacy client either.
 */
export function logout(): void {
  clearAuthToken();
}
