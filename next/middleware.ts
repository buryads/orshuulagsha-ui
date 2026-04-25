import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PROTECTED = /^\/(ru|bur|en)\/(profile|packs|admin)(\/|$)/;
const AUTH_COOKIE = 'token';

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (PROTECTED.test(url.pathname)) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      const localeSegment = url.pathname.split('/')[1] || routing.defaultLocale;
      const signinUrl = new URL(`/${localeSegment}/signin`, req.url);
      signinUrl.searchParams.set('next', url.pathname + url.search);
      return NextResponse.redirect(signinUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
