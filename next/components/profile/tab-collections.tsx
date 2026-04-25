// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { COLLECTIONS } from './demo-data';

const CONTRIBUTORS = [1, 2, 3] as const;

export function TabCollections(): ReactElement {
  return (
    <div
      className="fade-up"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      {COLLECTIONS.map((c) => (
        <div
          key={c.title}
          className="card"
          style={{ padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `color-mix(in srgb, ${c.color} 14%, transparent)`,
                color: c.color,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={c.icon} size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {c.count} слов
              </div>
            </div>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 28, height: 28 }}
              aria-label="Опции"
            >
              <Icon name="more" size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', marginTop: 12, alignItems: 'center' }}>
            {CONTRIBUTORS.map((j) => (
              <div
                key={j}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: c.color,
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  marginLeft: j === 1 ? 0 : -8,
                  border: '2px solid var(--surface)',
                  opacity: 0.7 + j * 0.1,
                }}
              >
                А
              </div>
            ))}
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-soft)',
                marginLeft: 8,
              }}
            >
              3 контрибьютора
            </span>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="card"
        style={{
          padding: 22,
          border: '2px dashed var(--border-strong)',
          background: 'transparent',
          color: 'var(--text-muted)',
          display: 'grid',
          placeItems: 'center',
          minHeight: 130,
          cursor: 'pointer',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icon name="plus" size={24} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
            Новая коллекция
          </div>
        </div>
      </button>
    </div>
  );
}
