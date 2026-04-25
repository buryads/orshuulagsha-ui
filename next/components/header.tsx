'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Logo } from '@/components/brand/logo';
import { Icon } from '@/components/ui/icon';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getAuthToken } from '@/lib/api/cookies';
import * as user from '@/lib/api/user';

type NavItem = {
  id: 'home' | 'dictionary' | 'names' | 'learn' | 'community';
  href: string;
};

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', href: '/' },
  { id: 'dictionary', href: '/explore' },
  { id: 'names', href: '/names' },
  { id: 'learn', href: '/learn' },
  { id: 'community', href: '/community' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [initials, setInitials] = useState('У');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setSignedIn(false);
      return;
    }
    setSignedIn(true);
    user
      .getUser()
      .then((u) => {
        if (!u?.name) return;
        const parts = u.name.trim().split(/\s+/);
        const init = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
        const fallback = u.name.charAt(0).toUpperCase() || 'У';
        setInitials(init.toUpperCase() || fallback);
      })
      .catch(() => {
        // ignore — keep default initials
      });
  }, []);

  const currentTheme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';

  const handleMobileNav = (e: ChangeEvent<HTMLSelectElement>) => {
    router.push(e.target.value);
  };

  const currentHref =
    NAV_ITEMS.find((item) => isActive(pathname, item.href))?.href ?? '/';

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
          gap: 24,
        }}
      >
        <Link href="/" style={{ padding: 0, display: 'inline-flex' }} aria-label={t('home')}>
          <Logo />
        </Link>

        <nav
          className="nav-desktop"
          style={{ display: 'flex', gap: 4, marginLeft: 20 }}
        >
          {NAV_ITEMS.map((item) => {
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
                  padding: '8px 14px',
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                {t(item.id)}
              </Link>
            );
          })}
        </nav>

        <select
          className="nav-mobile"
          value={currentHref}
          onChange={handleMobileNav}
          aria-label={t('menu')}
          style={{
            display: 'none',
            marginLeft: 12,
            padding: '8px 12px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.href}>
              {t(item.id)}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-icon"
            title={t('search')}
            aria-label={t('search')}
            style={{ width: 38, height: 38 }}
          >
            <Icon name="search" size={18} />
          </button>
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
          <LocaleSwitcher />
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

          {signedIn ? (
            <Link
              href="/profile"
              style={{
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
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                {tAuth('login')}
              </Link>
              <Link
                href="/signup"
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                {tAuth('createAccountLink')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
