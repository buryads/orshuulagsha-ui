// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { STATS } from './demo-data';

export function ProfileStats(): ReactElement {
  return (
    <div
      style={{ padding: '0 clamp(16px, 4vw, 28px)', marginBottom: 24 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ padding: 22 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-soft)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {s.label}
              </span>
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
