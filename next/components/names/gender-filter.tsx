// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import type { ReactElement } from 'react';

export type GenderFilter = 'all' | 'male' | 'female';

export interface GenderFilterChipsProps {
  value: GenderFilter;
  onChange: (next: GenderFilter) => void;
  total: number;
  maleCount: number;
  femaleCount: number;
}

interface ChipDef {
  id: GenderFilter;
  label: string;
  activeBg: string;
  activeColor: string;
}

export function GenderFilterChips({
  value,
  onChange,
  total,
  maleCount,
  femaleCount,
}: GenderFilterChipsProps): ReactElement {
  const chips: ChipDef[] = [
    {
      id: 'all',
      label: `Все ${total}`,
      activeBg: 'var(--neutral-900)',
      activeColor: 'white',
    },
    {
      id: 'male',
      label: `Мужские · ${maleCount}`,
      activeBg: 'var(--primary)',
      activeColor: 'white',
    },
    {
      id: 'female',
      label: `Женские · ${femaleCount}`,
      activeBg: 'var(--tertiary)',
      activeColor: 'white',
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Фильтр по полу"
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {chips.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.id)}
            className="chip"
            style={{
              background: active ? c.activeBg : 'var(--surface)',
              color: active ? c.activeColor : 'var(--text-muted)',
              border: '1px solid transparent',
              padding: '10px 20px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
