'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

interface SubnavItem {
  id: 'path' | 'leaderboard';
  href: string;
  matchPaths: string[];
  emoji: string;
}

const SUBNAV_ITEMS: readonly SubnavItem[] = [
  { id: 'path', href: '/learn/path', matchPaths: ['/learn/path', '/learn/lesson'], emoji: '🌳' },
  { id: 'leaderboard', href: '/learn/leaderboard', matchPaths: ['/learn/leaderboard'], emoji: '🏆' },
];

function isActiveItem(pathname: string, item: SubnavItem): boolean {
  return item.matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function LearnSubnav(): ReactElement {
  const t = useTranslations('learn.subnav');
  const pathname = usePathname() ?? '';

  return (
    <>
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
          {SUBNAV_ITEMS.map((item) => {
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
                  borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                  background: active ? 'var(--primary-50)' : 'transparent',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {t(item.id)}
              </Link>
            );
          })}
        </div>
      </nav>

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
        {SUBNAV_ITEMS.map((item) => {
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
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.emoji}</span>
              {t(item.id)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
