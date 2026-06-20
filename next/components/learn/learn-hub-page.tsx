'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { DailyMission } from '@/components/learn/daily-mission';
import { getAuthToken } from '@/lib/api/cookies';
import * as userApi from '@/lib/api/user';
import type { IRole } from '@/lib/api/types';

interface HubCard {
  labelKey: 'srs' | 'path' | 'reader' | 'leaderboard' | 'contribute' | 'moderation';
  descKey: 'srsDesc' | 'pathDesc' | 'readerDesc' | 'leaderboardDesc' | 'contributeDesc' | 'moderationDesc';
  href: string;
  emoji: string;
  requiresMod?: boolean;
  requiresAuth?: boolean;
}

const HUB_CARDS: readonly HubCard[] = [
  { labelKey: 'srs',          descKey: 'srsDesc',          href: '/learn/srs',          emoji: '🔁' },
  { labelKey: 'path',         descKey: 'pathDesc',         href: '/learn/path',         emoji: '🌳' },
  { labelKey: 'reader',       descKey: 'readerDesc',       href: '/learn/reader',       emoji: '📖' },
  { labelKey: 'leaderboard',  descKey: 'leaderboardDesc',  href: '/learn/leaderboard',  emoji: '🏆' },
  { labelKey: 'contribute',   descKey: 'contributeDesc',   href: '/learn/contribute',   emoji: '✍️', requiresAuth: true },
  { labelKey: 'moderation',   descKey: 'moderationDesc',   href: '/admin/moderation',   emoji: '🛡️', requiresMod: true },
];

function isModerator(roles: IRole[]): boolean {
  return roles.some((r) => r.slug === 'moderator' || r.slug === 'admin');
}

export function LearnHub(): ReactElement {
  const t = useTranslations('learn.hub');

  const [signedIn, setSignedIn] = useState(false);
  const [canModerate, setCanModerate] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    setSignedIn(true);
    userApi
      .getUser()
      .then((u) => {
        if (isModerator(u.roles)) setCanModerate(true);
      })
      .catch(() => {
        // ignore — RBAC cards simply won't show
      });
  }, []);

  const visibleCards = HUB_CARDS.filter((c) => {
    if (c.requiresMod && !canModerate) return false;
    return true;
  });

  return (
    <div>
      {/* Дневная миссия */}
      <div style={{ marginBottom: 32 }}>
        <DailyMission onContinue={() => { window.location.href = '/learn/srs'; }} />
      </div>

      {/* Грид карточек-входов */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {visibleCards.map((card) => {
          const href = card.requiresAuth && !signedIn ? '/signin' : card.href;
          return (
            <Link
              key={card.labelKey}
              href={href}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <article
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                  cursor: 'pointer',
                  minHeight: 120,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div style={{ fontSize: 28, lineHeight: 1 }}>{card.emoji}</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text)',
                  }}
                >
                  {t(card.labelKey)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {t(card.descKey)}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
