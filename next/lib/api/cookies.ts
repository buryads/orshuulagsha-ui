import Cookies from 'js-cookie';

// Cookie name must match the legacy Nuxt client (`useCookie('token')`).
export const AUTH_TOKEN_COOKIE = 'token';

function isHttps(): boolean {
  return (
    typeof window !== 'undefined' && window.location.protocol === 'https:'
  );
}

export function setAuthToken(token: string, expiresAt: string | Date): void {
  const expires =
    expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    expires,
    sameSite: 'lax',
    secure: isHttps(),
    path: '/',
  });
}

export function getAuthToken(): string | undefined {
  // js-cookie reads document.cookie; on the server it returns undefined.
  if (typeof document === 'undefined') return undefined;
  return Cookies.get(AUTH_TOKEN_COOKIE);
}

export function clearAuthToken(): void {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
}
