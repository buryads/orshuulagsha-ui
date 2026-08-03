'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { getAuthToken } from '@/lib/api/cookies';
import * as userApi from '@/lib/api/user';
import type { IRole } from '@/lib/api/types';

interface SubnavItem {
  id: string;
  labelKey: string;
  href: string;
  matchPaths?: string[];
  requiresMod?: boolean;
}

const SUBNAV_ITEMS: readonly SubnavItem[] = [
  { id: 'hub',         labelKey: 'hub',         href: '/learn' },
  { id: 'srs',         labelKey: 'srs',         href: '/learn/srs' },
  { id: 'path',        labelKey: 'path',        href: '/learn/path',        matchPaths: ['/learn/path', '/learn/lesson'] },
  { id: 'reader',      labelKey: 'reader',      href: '/learn/reader',      matchPaths: ['/learn/reader'] },
  { id: 'leaderboard', labelKey: 'leaderboard', href: '/learn/leaderboard' },
  { id: 'contribute',  labelKey: 'contribute',  href: '/learn/contribute' },
  { id: 'moderation',  labelKey: 'moderation',  href: '/admin/moderation',  requiresMod: true },
];

// Items always shown on mobile (main tabs)
const MOBILE_MAIN_IDS = ['hub', 'srs', 'path', 'reader'];

function isModerator(roles: IRole[]): boolean {
  return roles.some((r) => r.slug === 'moderator' || r.slug === 'admin');
}

function isActiveItem(pathname: string, item: SubnavItem): boolean {
  const paths = item.matchPaths ?? [item.href];
  if (item.href === '/learn') {
    return pathname === '/learn' || pathname === '';
  }
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function LearnSubnav(): ReactElement {
  const t = useTranslations('learn.subnav');
  const pathname = usePathname() ?? '';
  const [canModerate, setCanModerate] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    userApi
      .getUser()
      .then((u) => {
        if (isModerator(u.roles)) setCanModerate(true);
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const visibleItems = SUBNAV_ITEMS.filter((item) => {
    if (item.requiresMod && !canModerate) return false;
    return true;
  });

  const mobileMain = visibleItems.filter((item) => MOBILE_MAIN_IDS.includes(item.id));
  const mobileMore = visibleItems.filter((item) => !MOBILE_MAIN_IDS.includes(item.id));

  return (
    <>
      {/* ──── Desktop subnav ──── */}
      <nav
        className="hide-sm"
        aria-label="Learn navigation"
        style={{
          position: 'sticky',
          top: 'var(--header-h)',
          zIndex: 20,
          background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', gap: 2, padding: '0 clamp(16px, 4vw, 28px)', overflowX: 'auto' }}
        >
          {visibleItems.map((item) => {
            const active = isActiveItem(pathname, item);
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                  borderBottom: active
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
                  background: active ? 'var(--primary-50)' : 'transparent',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ──── Mobile bottom tab bar ──── */}
      {/* show-sm-flex: hidden on desktop, display:flex on mobile (≤720px) */}
      <nav
        className="show-sm-flex"
        aria-label="Learn navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {mobileMain.map((item) => {
          const active = isActiveItem(pathname, item);
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                background: active ? 'var(--primary-50)' : 'transparent',
                textDecoration: 'none',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>
                {item.id === 'hub' ? '🏠' : item.id === 'srs' ? '🔁' : item.id === 'path' ? '🌳' : '📖'}
              </span>
              {t(item.labelKey)}
            </Link>
          );
        })}

        {/* «Ещё» — если есть дополнительные пункты */}
        {mobileMore.length > 0 && (
          <div style={{ flex: 1, position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--text-muted)',
                background: 'transparent',
                gap: 2,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>⋯</span>
              {t('more')}
            </button>
            {moreOpen && (
              <>
                {/* Backdrop */}
                <div
                  aria-hidden
                  onClick={() => setMoreOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 28 }}
                />
                {/* More menu */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 29,
                    minWidth: 180,
                    overflow: 'hidden',
                  }}
                >
                  {mobileMore.map((item) => {
                    const active = isActiveItem(pathname, item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          fontSize: 14,
                          fontWeight: active ? 700 : 500,
                          color: active ? 'var(--primary-700)' : 'var(--text)',
                          background: active ? 'var(--primary-50)' : 'transparent',
                          textDecoration: 'none',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
