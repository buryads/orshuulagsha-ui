'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BOARD_PERIODS, getBoard, type Board, type BoardPeriod, type BoardRow } from '@/lib/api/studio-board';
import { earnedBadges, nextBadge } from '@/lib/studio/badges';
import { KudosDialog } from './kudos-dialog';
import { KudosInbox } from './kudos-inbox';
import { ReminderButton } from './reminder-button';
import { StudioGate } from './studio-gate';

const MEDALS = ['🥇', '🥈', '🥉'];
const COUNTERS = ['recorded', 'reviewed', 'fixed', 'lessons'] as const;

function Row({
  row,
  rank,
  isMe,
  period,
  onThanks,
}: {
  row: BoardRow;
  rank: number;
  isMe: boolean;
  period: BoardPeriod;
  onThanks: (to: { id: number; name: string }) => void;
}): ReactElement {
  const t = useTranslations('studio.honor');
  const tr = useTranslations();
  const badges = earnedBadges(
    period === 'all'
      ? { allTimeTotal: row.all_time_total, recorded: row.recorded, reviewed: row.reviewed, fixed: row.fixed }
      : { allTimeTotal: row.all_time_total },
  );
  const next = isMe ? nextBadge(row.all_time_total) : null;
  const medal = row.total > 0 ? MEDALS[rank - 1] : undefined;
  return (
    <li
      className="card"
      data-testid="honor-row"
      data-me={isMe ? 'true' : undefined}
      style={{
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: isMe ? 'var(--primary-50)' : undefined,
        borderColor: isMe ? 'var(--primary)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span aria-label={t('rank', { rank })} style={{ minWidth: 32, textAlign: 'center', fontSize: medal ? 24 : 15, fontWeight: 700, color: 'var(--text-muted)' }}>
          {medal ?? rank}
        </span>
        <span style={{ fontWeight: 700, fontSize: 16, minWidth: 0, overflowWrap: 'anywhere' }}>{row.user.name}</span>
        {isMe && (
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary)', color: 'var(--text-inv)', borderRadius: 999, padding: '2px 8px' }}>
            {t('you')}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--text-muted)' }}>
          <strong style={{ fontSize: 20, color: 'var(--text)' }}>{row.total}</strong> {t('total')}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
        {COUNTERS.map((c) => (
          <span key={c}>
            <strong style={{ color: 'var(--text)' }}>{row[c]}</strong> {t(`counters.${c}`)}
          </span>
        ))}
        {row.flagged > 0 && (
          <span style={{ fontSize: 12 }}>
            ({row.flagged} {t('counters.flagged')})
          </span>
        )}
      </div>
      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {badges.map((b) => (
            <span
              key={b.id}
              title={tr(b.key)}
              style={{ fontSize: 12, background: 'var(--accent-warm-soft)', borderRadius: 999, padding: '2px 10px' }}
            >
              <span aria-hidden>{b.icon}</span> {tr(b.key)}
            </span>
          ))}
        </div>
      )}
      {next && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {t('next', { badge: tr(next.key), current: next.current, target: next.target })}
          <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', marginTop: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((next.current / next.target) * 100)}%`, background: 'var(--primary)' }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {row.kudos_received > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🙌 {t('kudosReceived', { count: row.kudos_received })}</span>
        )}
        {!isMe && (
          <button
            type="button"
            className="btn btn-ghost"
            aria-label={t('thanksTo', { name: row.user.name })}
            style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 13 }}
            onClick={() => onThanks(row.user)}
          >
            👏 {t('thanks')}
          </button>
        )}
      </div>
    </li>
  );
}

function HonorBoard(): ReactElement {
  const t = useTranslations('studio.honor');
  const tk = useTranslations('studio.kudos');
  const [period, setPeriod] = useState<BoardPeriod>('week');
  const [board, setBoard] = useState<Board | null>(null);
  const [failed, setFailed] = useState(false);
  const [thanksTo, setThanksTo] = useState<{ id: number; name: string } | null>(null);
  const [sent, setSent] = useState(false);

  const load = useCallback((p: BoardPeriod) => {
    setFailed(false);
    setBoard(null);
    getBoard(p)
      .then(setBoard)
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => load(period), [load, period]);

  useEffect(() => {
    if (!sent) return;
    const id = window.setTimeout(() => setSent(false), 4000);
    return () => window.clearTimeout(id);
  }, [sent]);

  const link = { textDecoration: 'none', padding: '8px 14px', fontSize: 14 } as const;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/studio" className="btn btn-ghost" style={link}>
          ← {t('back')}
        </Link>
        <Link href="/studio/flow" className="btn btn-primary" style={link}>
          {t('toFlow')}
        </Link>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <KudosInbox />
          <ReminderButton />
        </span>
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: 26 }}>🏅 {t('title')}</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{t('subtitle')}</p>
      </div>
      <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {BOARD_PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            className={period === p ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '6px 16px', fontSize: 14 }}
            onClick={() => setPeriod(p)}
          >
            {t(`periods.${p}`)}
          </button>
        ))}
      </div>
      {sent && (
        <p role="status" style={{ margin: 0, fontSize: 14, color: 'var(--accent-green)' }}>
          {tk('sent')}
        </p>
      )}
      {failed && (
        <div className="card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span role="alert">{t('loadFailed')}</span>
          <button type="button" className="btn btn-ghost" onClick={() => load(period)}>
            {t('retry')}
          </button>
        </div>
      )}
      {!board && !failed && <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {board && board.rows.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t('empty')}</p>}
      {board && board.rows.length > 0 && (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }} data-testid="honor-list">
          {board.rows.map((row, i) => (
            <Row key={row.user.id} row={row} rank={i + 1} isMe={row.user.id === board.meta.me} period={period} onThanks={setThanksTo} />
          ))}
        </ol>
      )}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{t('badgesNote')}</p>
      {thanksTo && (
        <KudosDialog
          to={thanksTo}
          onClose={() => setThanksTo(null)}
          onSent={() => {
            setThanksTo(null);
            setSent(true);
            load(period);
          }}
        />
      )}
    </div>
  );
}

export function HonorBoardPage(): ReactElement {
  return <StudioGate>{() => <HonorBoard />}</StudioGate>;
}
