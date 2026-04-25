// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { STREAK_DAYS } from './demo-data';

export function StreakCard(): ReactElement {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 700,
            }}
          >
            Серия дней
          </div>
          <div
            style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
              }}
            >
              17
            </span>
            <span
              style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}
            >
              дней подряд
            </span>
          </div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--accent-warm) 0%, var(--tertiary) 100%)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            boxShadow: '0 8px 24px -4px rgba(244,184,96,0.5)',
          }}
        >
          <Icon name="flame" size={26} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          marginBottom: 20,
        }}
      >
        {STREAK_DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div
              style={{
                height: 32,
                borderRadius: 8,
                background: d.on ? 'var(--primary)' : 'var(--surface-2)',
                border: d.today ? '2px solid var(--accent-warm)' : 'none',
                display: 'grid',
                placeItems: 'center',
                color: d.on ? 'white' : 'var(--text-soft)',
                marginBottom: 4,
              }}
            >
              {d.on ? <Icon name="check" size={14} stroke={3} /> : null}
            </div>
            <div
              style={{ fontSize: 10, color: 'var(--text-soft)', fontWeight: 600 }}
            >
              {d.d}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/learn"
        className="btn btn-secondary"
        style={{ width: '100%', textDecoration: 'none' }}
      >
        <Icon name="zap" size={14} /> Продолжить обучение
      </Link>
    </div>
  );
}
