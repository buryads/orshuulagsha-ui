'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { getLeaderboard } from '@/lib/api/gamification';
import type { LeaderboardRow, LeaderboardMe, LeaderboardPeriod } from '@/lib/api/gamification';

type LeaderboardState = 'loading' | 'error' | 'empty' | 'active';

const PERIODS: { id: LeaderboardPeriod; labelKey: string }[] = [
  { id: 'week', labelKey: 'periodWeek' },
  { id: 'all', labelKey: 'periodAll' },
];

/** Maps rank 1/2/3 to podium colours. */
function podiumColor(rank: number): string {
  if (rank === 1) return 'var(--accent-warm)';
  if (rank === 2) return 'var(--neutral-400)';
  return 'var(--bronze)';
}

/** Delta arrow + aria-label */
function DeltaCell({ delta, t }: { delta?: number; t: (key: string, values?: Record<string, string | number>) => string }) {
  if (delta == null || delta === 0) {
    return (
      <span aria-label={t('deltaStable')} style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        —
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span
        aria-label={t('deltaUp', { n: delta })}
        style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}
      >
        ↑{delta}
      </span>
    );
  }
  return (
    <span
      aria-label={t('deltaDown', { n: Math.abs(delta) })}
      style={{ color: 'var(--tertiary)', fontWeight: 700, fontSize: 13 }}
    >
      ↓{Math.abs(delta)}
    </span>
  );
}

/** Avatar placeholder circle with initials. */
function AvatarCircle({ name, size = 36 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-200) 0%, var(--primary) 100%)',
        color: 'var(--text-inv)',
        fontWeight: 700,
        fontSize: size * 0.4,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

interface RowProps {
  row: LeaderboardRow & { delta?: number };
  isMe?: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function RankRow({ row, isMe = false, t }: RowProps) {
  return (
    <div
      aria-current={isMe ? 'true' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 'var(--r-md)',
        background: isMe ? 'var(--primary-50)' : 'transparent',
        border: isMe ? '1px solid var(--primary-100)' : '1px solid transparent',
        minHeight: 52,
        transition: 'background 0.15s ease',
      }}
    >
      {/* Rank */}
      <span
        style={{
          width: 32,
          flexShrink: 0,
          textAlign: 'right',
          fontWeight: 700,
          fontSize: 14,
          color: isMe ? 'var(--primary-700)' : 'var(--text-muted)',
        }}
      >
        #{row.rank}
      </span>

      {/* Avatar */}
      <AvatarCircle name={row.name} size={36} />

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontWeight: isMe ? 700 : 500,
          fontSize: 14,
          color: isMe ? 'var(--primary-700)' : 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {isMe ? `${row.name} (${t('you')})` : row.name}
      </span>

      {/* XP */}
      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', flexShrink: 0 }}>
        {row.xp.toLocaleString()} XP
      </span>

      {/* Delta */}
      <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
        <DeltaCell delta={row.delta} t={t} />
      </div>
    </div>
  );
}

function PodiumItem({ row, t }: { row: LeaderboardRow; t: (key: string, values?: Record<string, string | number>) => string }) {
  const color = podiumColor(row.rank);
  const isFirst = row.rank === 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: 'var(--r-lg)',
        background: 'var(--surface)',
        border: `2px solid ${color}`,
        minWidth: isFirst ? 120 : 96,
        order: isFirst ? 2 : row.rank === 2 ? 1 : 3,
        marginTop: isFirst ? 0 : 24,
      }}
    >
      <span style={{ fontSize: isFirst ? 28 : 22 }}>
        {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : '🥉'}
      </span>
      <AvatarCircle name={row.name} size={isFirst ? 48 : 40} />
      <span
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: 'var(--text)',
          textAlign: 'center',
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {row.name}
      </span>
      <span style={{ fontWeight: 700, fontSize: 12, color }}>
        {row.xp.toLocaleString()} XP
      </span>
    </div>
  );
}

export function LeaderboardView() {
  const t = useTranslations('learn.leaderboard');
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPeriod = searchParams.get('period') ?? 'week';
  const period: LeaderboardPeriod = rawPeriod === 'all' ? 'all' : 'week';

  const [state, setState] = useState<LeaderboardState>('loading');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<LeaderboardMe | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await getLeaderboard({ period });
      if (res.rows.length === 0) {
        setState('empty');
      } else {
        setRows(res.rows);
        setMe(res.me);
        setState('active');
      }
    } catch {
      setState('error');
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  function setPeriod(p: LeaderboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', p);
    router.replace(`?${params.toString()}`);
  }

  const podiumRows = rows.slice(0, 3);
  const listRows = rows.slice(3);

  // Find "me" row inside the full list (to highlight inline too)
  const meRow = me ? rows.find((r) => r.rank === me.rank) : null;

  // Sticky-self: me outside the top-20 visible list
  const meIsVisible = meRow != null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 800,
            margin: 0,
            color: 'var(--text)',
          }}
        >
          {t('title')}
        </h1>

        {/* Period filter chips */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map((p) => {
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className="chip"
                style={{
                  background: isActive ? 'var(--neutral-900)' : 'var(--surface)',
                  color: isActive ? 'var(--text-inv)' : 'var(--text-muted)',
                  border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                  cursor: 'pointer',
                  minHeight: 44,
                  padding: '0 16px',
                  fontSize: 13,
                }}
                aria-pressed={isActive}
                onClick={() => setPeriod(p.id)}
              >
                {t(p.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope note — friends filter is a stretch/future feature */}
      <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 16, marginTop: -8 }}>
        {t('scopeGlobal')}
      </p>

      {/* Loading: skeleton rows */}
      {state === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 52,
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
                animation: 'pulse-soft 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('error')}</p>
          <button type="button" className="btn btn-secondary" onClick={() => void load()}>
            {t('retry')}
          </button>
        </div>
      )}

      {/* Empty */}
      {state === 'empty' && (
        <div className="card fade-up" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('empty')}</p>
          <Link href="/learn" className="btn btn-primary">
            {t('startLearning')}
          </Link>
        </div>
      )}

      {/* Active: podium + rows */}
      {state === 'active' && (
        <>
          {/* Podium top-3 */}
          {podiumRows.length >= 3 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 12,
                marginBottom: 28,
              }}
              aria-label={t('podiumLabel')}
            >
              {podiumRows.map((r) => (
                <PodiumItem key={r.rank} row={r} t={t} />
              ))}
            </div>
          )}

          {/* Ranked rows (rank 4+) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {listRows.map((r) => (
              <RankRow
                key={r.rank}
                row={r}
                isMe={meRow?.rank === r.rank}
                t={t}
              />
            ))}
          </div>

          {/* Sticky self-row when me is not in visible list */}
          {!meIsVisible && me && (
            <div
              style={{
                position: 'sticky',
                bottom: 16,
                marginTop: 16,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <RankRow
                row={{ rank: me.rank, user_id: 0, name: t('you'), xp: me.xp, level: 0 }}
                isMe
                t={t}
              />
            </div>
          )}

          {/* Guest CTA when no "me" data returned */}
          {!me && (
            <div
              style={{
                position: 'sticky',
                bottom: 16,
                marginTop: 16,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('guestCta')}</span>
              <Link href="/signin" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                {t('signIn')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
