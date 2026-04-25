// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { HISTORY_ENTRIES } from './demo-data';

export function TabHistory(): ReactElement {
  return (
    <div className="fade-up card" style={{ padding: 0 }}>
      {HISTORY_ENTRIES.map((h, i) => (
        <div
          key={`${h.date}-${h.description}`}
          style={{
            display: 'flex',
            gap: 16,
            padding: '16px 24px',
            borderTop: i ? '1px solid var(--border)' : 'none',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-soft)',
              minWidth: 130,
              paddingTop: 2,
            }}
          >
            {h.date}
          </div>
          <span
            className="chip"
            style={{
              background: `color-mix(in srgb, ${h.color} 12%, transparent)`,
              color: h.color,
              border: 'none',
              minWidth: 90,
              justifyContent: 'center',
            }}
          >
            {h.type}
          </span>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
            {h.description}
          </div>
          <button
            type="button"
            className="btn-icon"
            style={{ width: 28, height: 28 }}
            aria-label="Открыть"
          >
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
