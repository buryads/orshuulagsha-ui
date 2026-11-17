'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/brand/logo';
import { Icon } from '@/components/ui/icon';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { signOut } from '@/lib/api/auth';
import { GamificationHud, GamificationHudMobile } from '@/components/learn/gamification-hud';
import { getGamificationMe } from '@/lib/api/gamification';
import type { GamificationMe } from '@/lib/api/gamification';
import { LEARN_ENABLED } from '@/lib/learn-enabled';
import { isLearnVisible } from '@/lib/learn-access';
import { useCurrentUser } from '@/lib/use-current-user';
import { getUnseenWordRequestCount } from '@/lib/api/word-requests';
import { WORD_REQUESTS_SEEN_EVENT } from '@/lib/word-requests';

type NavItem = {
  id: 'home' | 'learn' | 'dictionary' | 'names' | 'packs' | 'quiz' | 'corpus' | 'ai' | 'explain';
  href: string;
  authOnly?: boolean;
  learnOnly?: boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', href: '/' },
  { id: 'learn', href: '/learn/path', authOnly: true, learnOnly: true },
  { id: 'dictionary', href: '/explore' },
  { id: 'names', href: '/names' },
  { id: 'corpus', href: '/corpus' },
  { id: 'packs', href: '/packs' },
  { id: 'quiz', href: '/quiz' },
  { id: 'ai', href: '/ai' },
  { id: 'explain', href: '/explain', authOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UnseenDot({ inline = false }: { inline?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={
        inline
          ? { display: 'inline-block', width: 8, height: 8, marginLeft: 6, borderRadius: '50%', background: 'var(--tertiary)' }
          : {
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              background: 'var(--tertiary)',
              borderRadius: '50%',
              border: '2px solid var(--surface)',
            }
      }
    />
  );
}

export function Header() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tAccount = useTranslations('account');
  const tAsk = useTranslations('ask');
  const locale = useLocale();
  const pathname = usePathname() ?? '/';
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { signedIn, user: currentUser, isTeacher } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamification, setGamification] = useState<GamificationMe | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [unseenRequests, setUnseenRequests] = useState(0);

  // Close drawer when route changes — otherwise tapping a link leaves the
  // drawer hanging open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = (() => {
    const name = currentUser?.name?.trim();
    if (!name) return 'У';
    const parts = name.split(/\s+/);
    const init = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    return init.toUpperCase() || name.charAt(0).toUpperCase() || 'У';
  })();

  const learnVisible = isLearnVisible(LEARN_ENABLED, isTeacher);

  useEffect(() => {
    if (!signedIn) {
      setUnseenRequests(0);
      return;
    }
    getUnseenWordRequestCount()
      .then(setUnseenRequests)
      .catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    const clear = () => setUnseenRequests(0);
    window.addEventListener(WORD_REQUESTS_SEEN_EVENT, clear);
    return () => window.removeEventListener(WORD_REQUESTS_SEEN_EVENT, clear);
  }, []);

  useEffect(() => {
    if (!learnVisible || !signedIn) {
      setGamificationLoading(false);
      return;
    }
    setGamificationLoading(true);
    getGamificationMe()
      .then(setGamification)
      .catch(() => {
        // HUD is non-critical
      })
      .finally(() => setGamificationLoading(false));
  }, [signedIn, learnVisible, pathname]);

  const navItems = NAV_ITEMS.filter(
    (item) => (!item.authOnly || signedIn) && (!item.learnOnly || learnVisible),
  );

  const currentTheme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          padding: '14px clamp(16px, 4vw, 28px) 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
        }}
      >
        <Link href="/" style={{ padding: 0, display: 'inline-flex' }} aria-label={t('home')}>
          <Logo />
        </Link>

        <nav
          className="nav-desktop"
          style={{ display: 'flex', gap: 2, marginLeft: 8 }}
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className="btn"
                style={{
                  background: active ? 'var(--primary-50)' : 'transparent',
                  color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500,
                  padding: '6px 10px',
                  fontSize: 13,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(item.id)}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="nav-toggle btn-icon"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t('menu')}
          aria-expanded={menuOpen}
          style={{ width: 38, height: 38 }}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={18} />
        </button>

        <div style={{ flex: 1 }} />

        {learnVisible && (
          <>
            <span className="hide-sm" style={{ display: 'inline-flex' }}>
              <GamificationHud
                signedIn={signedIn}
                stats={gamification}
                loading={gamificationLoading}
              />
            </span>
            <span className="show-sm">
              <GamificationHudMobile signedIn={signedIn} stats={gamification} />
            </span>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            title={t('theme')}
            aria-label={t('theme')}
            style={{ width: 38, height: 38 }}
          >
            {/* Avoid hydration mismatch — render neutral icon until mounted */}
            {mounted ? (
              <Icon name={currentTheme === 'dark' ? 'sun' : 'moon'} size={18} />
            ) : (
              <Icon name="moon" size={18} />
            )}
          </button>
          <span className="hide-md" style={{ display: 'inline-flex' }}>
            <LocaleSwitcher />
          </span>
          {signedIn && (
            <Link
              href="/profile/mcp"
              className="btn-icon"
              title={t('mcp')}
              aria-label={t('mcp')}
              style={{ width: 38, height: 38 }}
            >
              <Icon name="lock" size={18} />
            </Link>
          )}
          {signedIn && (
            <Link
              href="/profile/requests"
              className="btn-icon hide-md"
              title={tAsk('myRequests')}
              aria-label={tAsk('myRequests')}
              style={{ width: 38, height: 38, position: 'relative' }}
            >
              <Icon name="bookmark" size={18} />
              {unseenRequests > 0 && <UnseenDot />}
            </Link>
          )}
          {isTeacher && (
            <Link
              href="/studio"
              className="btn btn-secondary hide-md"
              style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 13 }}
              data-testid="nav-studio"
            >
              {t('studio')}
            </Link>
          )}
          {signedIn && (
            <button
              type="button"
              className="btn-icon"
              title={t('notifications')}
              aria-label={t('notifications')}
              style={{ width: 38, height: 38, position: 'relative' }}
            >
              <Icon name="bell" size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  background: 'var(--tertiary)',
                  borderRadius: '50%',
                  border: '2px solid var(--surface)',
                }}
              />
            </button>
          )}

          {signedIn && (
            <button
              type="button"
              className="btn btn-secondary hide-md"
              onClick={() => signOut(locale)}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              {tAuth('logout')}
            </button>
          )}

          {signedIn ? (
            <Link
              href="/profile"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 4px 4px 12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              <span className="hide-sm" style={{ fontSize: 13, fontWeight: 600 }}>
                Сайн
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--accent-warm) 0%, var(--tertiary) 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {initials}
              </div>
              {unseenRequests > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    background: 'var(--tertiary)',
                    borderRadius: '50%',
                    border: '2px solid var(--surface)',
                  }}
                />
              )}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="btn btn-secondary hide-md"
              style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 13 }}
            >
              {tAuth('login')}
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div
          className="nav-drawer"
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '10px clamp(16px, 4vw, 28px) 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className="btn"
                style={{
                  background: active ? 'var(--primary-50)' : 'transparent',
                  color: active ? 'var(--primary-700)' : 'var(--text)',
                  fontWeight: active ? 700 : 500,
                  padding: '10px 12px',
                  fontSize: 15,
                  textDecoration: 'none',
                  textAlign: 'left',
                  borderRadius: 10,
                }}
              >
                {t(item.id)}
              </Link>
            );
          })}

          <div
            style={{
              marginTop: 6,
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <LocaleSwitcher />
            {signedIn && (
              <Link
                href="/profile"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 14 }}
              >
                {tAccount('title')}
              </Link>
            )}
            {signedIn && (
              <Link
                href="/profile/mcp"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 14 }}
              >
                {t('mcp')}
              </Link>
            )}
            {signedIn && (
              <Link
                href="/profile/requests"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 14 }}
              >
                {tAsk('myRequests')}
                {unseenRequests > 0 && <UnseenDot inline />}
              </Link>
            )}
            {isTeacher && (
              <Link
                href="/studio"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', padding: '8px 14px', fontSize: 14 }}
                data-testid="nav-studio-mobile"
              >
                {t('studio')}
              </Link>
            )}
            {signedIn && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => signOut(locale)}
                style={{ padding: '8px 14px', fontSize: 14, marginLeft: 'auto' }}
              >
                {tAuth('logout')}
              </button>
            )}
            {!signedIn && (
              <Link
                href="/signin"
                className="btn btn-secondary"
                style={{
                  textDecoration: 'none',
                  padding: '8px 14px',
                  fontSize: 14,
                  marginLeft: 'auto',
                }}
              >
                {tAuth('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
