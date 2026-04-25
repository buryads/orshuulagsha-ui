// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

type SortMode = 'alpha' | 'era' | 'gender';

interface SortChip {
  id: SortMode;
  label: string;
}

const SORT_CHIPS: SortChip[] = [
  { id: 'alpha', label: 'А–Я' },
  { id: 'era', label: 'По эпохе' },
  { id: 'gender', label: 'По полу' },
];

export function NamesSearch(): ReactElement {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('alpha');

  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <Icon
        name="search"
        size={18}
        style={{ margin: '0 8px 0 6px', color: 'var(--text-soft)' }}
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени или значению…"
        aria-label="Поиск по имени или значению"
        style={{
          flex: 1,
          minWidth: 180,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 15,
          padding: '8px 0',
          color: 'var(--text)',
        }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SORT_CHIPS.map((c) => {
          const active = sort === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSort(c.id)}
              className="chip"
              aria-pressed={active}
              style={{
                background: active ? 'var(--primary-50)' : 'var(--surface-2)',
                color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
