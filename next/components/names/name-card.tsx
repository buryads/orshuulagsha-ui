// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import type { Name } from './data';

export interface NameCardProps {
  name: Name;
}

export function NameCard({ name }: NameCardProps): ReactElement {
  const isMale = name.gender === 'male';
  return (
    <article
      className="card"
      style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* decorative blob */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: name.accent,
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
          position: 'relative',
        }}
      >
        <span
          className="chip"
          style={{
            background: isMale ? 'var(--primary-50)' : 'var(--tertiary-soft)',
            color: isMale ? 'var(--primary-700)' : 'var(--tertiary-700)',
            border: 'none',
            fontSize: 11,
          }}
        >
          {isMale ? '♂ Мужское' : '♀ Женское'}
        </span>
        <button
          type="button"
          aria-label="В избранное"
          className="btn-icon"
          style={{ width: 28, height: 28 }}
        >
          <Icon name="heart" size={13} />
        </button>
      </div>

      <div
        className="font-display"
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          position: 'relative',
        }}
      >
        {name.name}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 4,
          lineHeight: 1.4,
          position: 'relative',
        }}
      >
        {name.meaning}
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
          происхождение:{' '}
          <b style={{ color: 'var(--text-muted)' }}>{name.origin}</b>
        </span>
        <button
          type="button"
          aria-label="Прослушать произношение"
          className="btn-icon"
          style={{
            width: 26,
            height: 26,
            background: 'var(--primary-50)',
            color: 'var(--primary)',
          }}
        >
          <Icon name="play" size={10} />
        </button>
      </div>
    </article>
  );
}
