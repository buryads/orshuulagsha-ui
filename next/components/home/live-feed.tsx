// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { FEED_ITEMS } from './demo-data';

function initial(name: string): string {
  const first = name.split(' ')[0] ?? '';
  return first.charAt(0);
}

export function LiveFeed(): ReactElement {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Живая активность</h3>
        <span className="chip chip-green">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-green)',
              animation: 'pulse-soft 2s infinite',
            }}
          />{' '}
          247 онлайн
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FEED_ITEMS.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 10,
              borderRadius: 12,
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: it.color,
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initial(it.user)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <b>{it.user}</b>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{it.text}</span>
              </div>
              <div
                style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}
              >
                {it.time}
              </div>
            </div>
            <Icon
              name={it.icon}
              size={14}
              style={{ color: it.color, opacity: 0.6 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
