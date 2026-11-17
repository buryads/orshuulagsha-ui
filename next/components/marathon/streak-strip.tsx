'use client';

import type { ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { EventDayInfo } from '@/lib/api/events';
import { cellFor, formatDate, type StripCell } from '@/lib/marathon/days';

interface StreakStripProps {
  days: EventDayInfo[];
  completed: number[];
  selected: number | null;
  onSelect: (n: number) => void;
}

const MARK: Record<StripCell, ReactElement | string> = {
  done: '✔',
  missed: '–',
  open: '',
  locked: (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor" aria-hidden>
      <path d="M2 4.5V3a3 3 0 0 1 6 0v1.5h.5a1 1 0 0 1 1 1V10a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1H2Zm1.5 0h3V3a1.5 1.5 0 0 0-3 0v1.5Z" />
    </svg>
  ),
};

export function StreakStrip({ days, completed, selected, onSelect }: StreakStripProps): ReactElement {
  const t = useTranslations('marathon.strip');
  const locale = useLocale();

  return (
    <div role="group" aria-label={t('label')} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {days.map((d) => {
        const cell = cellFor(d, completed);
        const isSel = selected === d.n;
        const title =
          cell === 'locked'
            ? t('opensOn', { date: formatDate(d.date, locale) })
            : `${t('day', { n: d.n })}: ${t(cell)}`;
        return (
          <button
            key={d.n}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={isSel}
            onClick={() => onSelect(d.n)}
            style={{
              width: 40,
              height: 48,
              borderRadius: 10,
              border: `2px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
              background:
                cell === 'done'
                  ? 'var(--accent-green-soft)'
                  : cell === 'open'
                    ? 'var(--primary-50)'
                    : 'var(--surface)',
              color: cell === 'locked' ? 'var(--text-soft)' : 'var(--text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <span>{d.n}</span>
            <span aria-hidden style={{ fontSize: 11, minHeight: 12 }}>
              {MARK[cell]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
