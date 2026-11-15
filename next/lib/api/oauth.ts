import { apiBaseUrl, apiCall } from './client';
import { setAuthToken } from '@/lib/api/cookies';
import type { DataEnvelope, TokenResponse } from '@/lib/api/types';

export type OAuthProvider = 'google' | 'apple';

const PENDING_KEY = 'oauth_pending';

export function isSafeNext(next: string | null): next is string {
  return Boolean(next) && next!.startsWith('/') && !next!.startsWith('//') && !next!.startsWith('/\\');
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function getOAuthProviders(): Promise<OAuthProvider[]> {
  try {
    const body = await apiCall<DataEnvelope<OAuthProvider[]>>(
      'GET',
      '/api/auth/providers',
    );
    return body.data.filter((p) => p === 'google' || p === 'apple');
  } catch {
    return [];
  }
}

export async function startOAuth(
  provider: OAuthProvider,
  locale: string,
  next: string | null,
): Promise<void> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  const challenge = base64url(new Uint8Array(digest));
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ verifier, next }));
  const base = apiBaseUrl.replace(/\/$/, '');
  window.location.assign(
    `${base}/api/auth/${provider}/redirect?locale=${locale}&challenge=${challenge}`,
  );
}

export async function exchangeOAuthCode(code: string): Promise<string | null> {
  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  if (!raw) throw new Error('oauth_pending_missing');
  const { verifier, next } = JSON.parse(raw) as {
    verifier: string;
    next: string | null;
  };
  const body = await apiCall<DataEnvelope<TokenResponse>>(
    'POST',
    '/api/jwt/oauth/exchange',
    { data: { code, verifier, remember_me: true } },
  );
  setAuthToken(body.data.token, body.data.expires_at);
  return isSafeNext(next) ? next : null;
}
