// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface ExploreHeadProps {
  totalCount: number;
}

function formatCount(n: number): string {
  // ru locale grouping with non-breaking space.
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

export function ExploreHead({ totalCount }: ExploreHeadProps): ReactElement {
  const display = totalCount > 0 ? formatCount(totalCount) : '124 318';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Словарь
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          Исследуй <b>{display}</b> слов · поиск по корпусу
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-secondary">
          <Icon name="filter" size={14} /> Фильтры
        </button>
        <button type="button" className="btn btn-primary">
          <Icon name="plus" size={14} /> Предложить слово
        </button>
      </div>
    </div>
  );
}
