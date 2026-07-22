'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps): ReactElement | null {
  const t = useTranslations('common');
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Show at most 5 page numbers around current page
  const pages: (number | '…')[] = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);
  if (left > 1) { pages.push(1); if (left > 2) pages.push('…'); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    height: 36,
    padding: '0 10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'var(--surface)',
    color: 'var(--text)',
  };

  return (
    <nav
      aria-label={t('results')}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!hasPrev}
        aria-label={t('previous')}
        style={{
          ...btnBase,
          opacity: hasPrev ? 1 : 0.4,
          cursor: hasPrev ? 'pointer' : 'default',
        }}
      >
        <Icon name="chevron-left" size={14} />
      </button>

      {pages.map((p, idx) =>
        p === '…' ? (
          <span
            key={`ellipsis-${idx}`}
            style={{ padding: '0 4px', color: 'var(--text-soft)', fontSize: 13 }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            style={{
              ...btnBase,
              background: p === page ? 'var(--primary)' : 'var(--surface)',
              color: p === page ? 'white' : 'var(--text)',
              borderColor: p === page ? 'var(--primary)' : 'var(--border)',
              fontWeight: p === page ? 700 : 500,
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
        aria-label={t('next')}
        style={{
          ...btnBase,
          opacity: hasNext ? 1 : 0.4,
          cursor: hasNext ? 'pointer' : 'default',
        }}
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  );
}
