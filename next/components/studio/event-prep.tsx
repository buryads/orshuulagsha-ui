'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { FlowSummary } from '@/lib/api/studio-flow';

export function EventPrep({ summary }: { summary: FlowSummary }): ReactElement | null {
  const t = useTranslations('studioEvents.prep');
  const prep = summary.event_prep;
  const opens = summary.card_opens ?? 0;
  const learned = summary.learned_by_my_phrases ?? 0;
  if (!prep && !opens && !learned) return null;
  const pct = prep && prep.total > 0 ? Math.round((prep.ready / prep.total) * 100) : 0;
  return (
    <>
      {prep && (
        <div
          className="card"
          style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
          data-testid="event-prep"
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <strong style={{ fontSize: 16 }} data-testid="event-prep-left">
                {t('left', { n: prep.remaining, total: prep.total })}
              </strong>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{prep.title}</span>
            </div>
            <span style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <Link
                href="/studio/flow?mode=review"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
                data-testid="event-prep-review"
              >
                {t('review')}
              </Link>
              <Link
                href="/studio/flow?mode=voice"
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
                data-testid="event-prep-voice"
              >
                {t('voice')}
              </Link>
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={prep.total}
            aria-valuenow={prep.ready}
            aria-label={t('left', { n: prep.remaining, total: prep.total })}
            style={{
              height: 8,
              borderRadius: 999,
              background: 'var(--surface-2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-green)' }} />
          </div>
        </div>
      )}
      {(opens > 0 || learned > 0) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} data-testid="event-prep-stats">
          {opens > 0 && (
            <span className="chip chip-primary" data-testid="card-opens">
              {t('opens', { n: opens })}
            </span>
          )}
          {learned > 0 && (
            <span className="chip chip-green" data-testid="phrases-learned">
              {t('learned', { n: learned })}
            </span>
          )}
        </div>
      )}
    </>
  );
}
