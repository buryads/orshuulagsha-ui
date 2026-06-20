import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Public (own guest-CTA): /learn (hub), /learn/srs, /learn/reader (+/[slug]), /learn/leaderboard.
// Protected (no guest-CTA / submit requires auth):
//   profile, packs, admin (incl. /admin/moderation — also gated by bэк 403 without a role),
//   /learn/path, /learn/lesson/*, /learn/contribute (skill-tree / exercise-player have no guest-CTA;
//   contribute form requires auth to submit — hub card leads guest to signin).
// Authed requests with an expired token hit the API → 401 → global handler → signin.
const PROTECTED = /^\/(ru|bur|en)\/(profile|packs|admin|learn\/(path|lesson|contribute))(\/|$)/;
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
