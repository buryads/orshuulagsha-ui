// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { SETTINGS_LANGUAGE, SETTINGS_NOTIFICATIONS } from './demo-data';

export function TabSettings(): ReactElement {
  const [toggles, setToggles] = useState<boolean[]>(() =>
    SETTINGS_NOTIFICATIONS.map(([, on]) => on),
  );

  function toggle(index: number): void {
    setToggles((prev) =>
      prev.map((value, i) => (i === index ? !value : value)),
    );
  }

  return (
    <div
      className="fade-up"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}
    >
      <div className="card" style={{ padding: 24 }}>
        <h3
          style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 0 }}
        >
          Язык и диалект
        </h3>
        {SETTINGS_LANGUAGE.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: i ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {label}
            </span>
            <button
              type="button"
              className="chip"
              style={{ cursor: 'pointer' }}
            >
              {value} <Icon name="arrow-right" size={11} />
            </button>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h3
          style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 0 }}
        >
          Уведомления
        </h3>
        {SETTINGS_NOTIFICATIONS.map(([label], i) => {
          const on = toggles[i] ?? false;
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13 }}>{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={label}
                onClick={() => toggle(i)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 999,
                  background: on ? 'var(--primary)' : 'var(--surface-2)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  border: 'none',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: on ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'left 0.2s',
                    display: 'block',
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
