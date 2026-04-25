// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({
  currentPage,
  totalPages,
}: PaginationProps): ReactElement | null {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number): void {
    const safe = Math.max(1, Math.min(totalPages, page));
    const params = new URLSearchParams(searchParams.toString());
    if (safe === 1) {
      params.delete('page');
    } else {
      params.set('page', String(safe));
    }
    const qs = params.toString();
    router.push(qs.length > 0 ? `?${qs}` : '?');
  }

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 24,
        marginBottom: 8,
      }}
    >
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => goTo(currentPage - 1)}
        disabled={prevDisabled}
        style={{
          opacity: prevDisabled ? 0.45 : 1,
          cursor: prevDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Icon name="arrow-left" size={14} /> Назад
      </button>
      <span
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        Страница <b style={{ color: 'var(--text)' }}>{currentPage}</b> из{' '}
        {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => goTo(currentPage + 1)}
        disabled={nextDisabled}
        style={{
          opacity: nextDisabled ? 0.45 : 1,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        Вперёд <Icon name="arrow-right" size={14} />
      </button>
    </div>
  );
}
