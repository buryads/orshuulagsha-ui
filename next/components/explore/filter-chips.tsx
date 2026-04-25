// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { CSSProperties, ReactElement } from 'react';

interface FilterDef {
  id: string;
  label: string;
}

const FILTERS: FilterDef[] = [
  { id: 'all', label: 'Все' },
  { id: 'fav', label: 'Избранные' },
  { id: 'new', label: 'Новые' },
  { id: 'noun', label: 'Существительные' },
  { id: 'verb', label: 'Глаголы' },
  { id: 'adj', label: 'Прилагательные' },
];

export function FilterChips(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('filter') ?? 'all';

  function setFilter(id: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', id);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `?${qs}` : '?');
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 4,
      }}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        const style: CSSProperties = {
          background: isActive ? 'var(--neutral-900)' : 'var(--surface)',
          color: isActive ? 'var(--text-inv)' : 'var(--text-muted)',
          border: isActive
            ? '1px solid transparent'
            : '1px solid var(--border)',
          padding: '8px 14px',
          fontSize: 13,
          cursor: 'pointer',
          flexShrink: 0,
        };
        return (
          <button
            type="button"
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="chip"
            style={style}
            aria-pressed={isActive}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
