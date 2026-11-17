'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { StudioStreak } from '@/lib/api/studio-streak';

const R = 11;
const C = 2 * Math.PI * R;

export function StreakChip({ streak }: { streak: StudioStreak }): ReactElement {
  const t = useTranslations('studio.flow.streak');
  const ratio = streak.goal > 0 ? Math.min(1, streak.today_points / streak.goal) : 0;
  const label = t('label', { points: streak.today_points, goal: streak.goal });
  const warn = streak.at_risk && !streak.done_today;
  return (
    <span
      role="img"
      aria-label={`${t('days', { n: streak.current })}. ${label}`}
      title={`${label}. ${t('hint')}`}
      data-testid="flow-streak-chip"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 12px 3px 4px',
        whiteSpace: 'nowrap',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background: warn ? 'var(--tertiary-soft)' : 'var(--surface-2)',
        color: warn ? 'var(--tertiary-700)' : 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ position: 'relative', width: 28, height: 28, display: 'inline-flex' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <circle cx="14" cy="14" r={R} fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="14"
            cy="14"
            r={R}
            fill="none"
            stroke={streak.done_today ? 'var(--accent-green)' : 'var(--accent-warm)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ratio)}
            transform="rotate(-90 14 14)"
          />
        </svg>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            filter: streak.current > 0 ? undefined : 'grayscale(1)',
          }}
        >
          🔥
        </span>
      </span>
      {t('days', { n: streak.current })}
    </span>
  );
}
