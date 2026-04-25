// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Soyombo } from '@/components/ui/soyombo';

export interface NamesHeroProps {
  totalCount: number;
}

export function NamesHero({ totalCount }: NamesHeroProps): ReactElement {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--primary-50) 0%, transparent 100%)',
        padding: '60px clamp(16px, 4vw, 28px) 120px',
        borderRadius: 'var(--r-xl)',
      }}
    >
      <svg
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
        viewBox="0 0 1400 400"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 320 L180 220 L340 280 L520 200 L700 250 L880 180 L1060 240 L1240 200 L1400 260 L1400 400 L0 400 Z"
          fill="var(--primary-200)"
          opacity="0.5"
        />
        <path
          d="M0 360 L160 290 L320 330 L500 250 L680 310 L860 270 L1040 320 L1220 280 L1400 320 L1400 400 L0 400 Z"
          fill="var(--primary)"
          opacity="0.3"
        />
        <circle cx="1100" cy="100" r="50" fill="var(--accent-warm)" opacity="0.4" />
      </svg>

      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex' }}>
          <Soyombo size={32} color="var(--primary)" />
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(40px, 7vw, 56px)',
            fontWeight: 800,
            marginTop: 14,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          Бурятские имена
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--text-muted)',
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          {totalCount} имён · этимология и значения · аудио произношения от носителей
        </p>
      </div>
    </section>
  );
}
