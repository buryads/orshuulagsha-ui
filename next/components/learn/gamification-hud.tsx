'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { getGamificationMe } from '@/lib/api/gamification';
import type { GamificationMe } from '@/lib/api/gamification';

/** Maps numeric level to a CEFR badge label. */
function levelLabel(level: number): string {
  const labels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  return labels[Math.min(level - 1, labels.length - 1)] ?? 'A1';
}

/**
 * Compact gamification status strip for the global header.
 * Shows 🔥 streak · ◆ XP · level badge.
 * Hidden for guests (renders nothing when signedIn=false).
 */
export function GamificationHud({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('learn.hud');
  const [stats, setStats] = useState<GamificationMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signedIn) {
      setLoading(false);
      return;
    }
    getGamificationMe()
      .then(setStats)
      .catch(() => {
        // silently hide on error — HUD is non-critical
      })
      .finally(() => setLoading(false));
  }, [signedIn]);

  if (!signedIn) return null;

  if (loading) {
    // Skeleton pills
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        aria-hidden="true"
      >
        {[44, 60, 36].map((w) => (
          <div
            key={w}
            className="animation-pulse-soft"
            style={{
              width: w,
              height: 24,
              borderRadius: 999,
              background: 'var(--surface-2)',
              animation: 'pulse-soft 1.4s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const atRisk = !stats.goal_met && stats.streak > 0;
  const streakColor = stats.streak === 0 ? 'var(--text-muted)' : 'var(--accent-warm)';

  return (
    <Link
      href="/learn/leaderboard"
      aria-label={t('ariaLabel', {
        streak: stats.streak,
        xp: stats.xp,
        level: levelLabel(stats.level),
      })}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Streak */}
      <span
        title={atRisk ? t('streakAtRisk') : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: streakColor,
          fontWeight: 700,
          fontSize: 13,
          animation: atRisk ? 'pulse-soft 2s ease-in-out infinite' : undefined,
        }}
      >
        <Icon name="flame" size={14} />
        {stats.streak}
      </span>

      {/* XP */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        <Icon name="zap" size={14} />
        {stats.xp.toLocaleString()}
      </span>

      {/* CEFR level badge */}
      <span className="chip chip-primary" style={{ padding: '3px 8px', fontSize: 11 }}>
        {levelLabel(stats.level)}
      </span>
    </Link>
  );
}

/**
 * Compact mobile version: "🔥7 · 1240 XP" in a single chip.
 * Rendered at ≤640px via CSS, desktop version hidden there.
 */
export function GamificationHudMobile({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('learn.hud');
  const [stats, setStats] = useState<GamificationMe | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    getGamificationMe()
      .then(setStats)
      .catch(() => {/* silently hide */});
  }, [signedIn]);

  if (!signedIn || !stats) return null;

  return (
    <Link
      href="/learn/leaderboard"
      className="chip chip-warm"
      aria-label={t('ariaLabel', {
        streak: stats.streak,
        xp: stats.xp,
        level: levelLabel(stats.level),
      })}
      style={{
        textDecoration: 'none',
        minHeight: 44,
        padding: '0 14px',
        fontSize: 13,
        fontWeight: 700,
        gap: 6,
      }}
    >
      <Icon name="flame" size={13} />
      {stats.streak} · {stats.xp.toLocaleString()}
    </Link>
  );
}
