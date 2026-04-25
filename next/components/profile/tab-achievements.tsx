// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { BADGES } from './demo-data';

export function TabAchievements(): ReactElement {
  return (
    <div
      className="fade-up"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}
    >
      {BADGES.map((b) => (
        <div
          key={b.title}
          className="card"
          style={{
            padding: 22,
            textAlign: 'center',
            opacity: b.unlocked ? 1 : 0.6,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: b.unlocked
                ? `color-mix(in srgb, ${b.color} 16%, transparent)`
                : 'var(--surface-2)',
              color: b.unlocked ? b.color : 'var(--text-soft)',
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
              border: b.unlocked
                ? `3px solid ${b.color}`
                : '3px dashed var(--border-strong)',
            }}
          >
            <Icon name={b.icon} size={28} />
            {!b.unlocked && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '2px solid var(--border)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="lock" size={11} style={{ color: 'var(--text-soft)' }} />
              </div>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
          <div
            style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}
          >
            {b.description}
          </div>
          {!b.unlocked && b.progress !== undefined && (
            <div
              style={{
                marginTop: 10,
                height: 4,
                background: 'var(--surface-2)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${b.progress}%`,
                  height: '100%',
                  background: b.color,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
