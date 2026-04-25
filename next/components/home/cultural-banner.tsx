// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { Soyombo } from '@/components/ui/soyombo';
import { CHAPTERS } from './demo-data';

export function CulturalBanner(): ReactElement {
  return (
    <section style={{ padding: '60px 28px 0' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          padding: '44px 48px',
          background:
            'linear-gradient(120deg, #1A1C1E 0%, #2A2D31 60%, #163C6E 100%)',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* mountains svg */}
        <svg
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.6,
          }}
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4B860" stopOpacity="0.3" />
              <stop offset="1" stopColor="#163C6E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 320 L200 240 L380 290 L580 200 L760 270 L960 220 L1200 280 L1200 400 L0 400 Z"
            fill="url(#mtn)"
          />
          <path
            d="M0 360 L160 300 L320 340 L520 270 L720 320 L880 290 L1080 330 L1200 310 L1200 400 L0 400 Z"
            fill="rgba(255,255,255,0.05)"
          />
          <circle cx="900" cy="100" r="40" fill="#F4B860" opacity="0.4" />
        </svg>

        <div style={{ position: 'relative' }}>
          <Soyombo size={36} color="#F4B860" />
          <h2
            style={{
              fontSize: 38,
              fontWeight: 800,
              marginTop: 16,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            «Хэлэн — арадай зүрхэн»
          </h2>
          <p
            style={{
              fontSize: 15,
              opacity: 0.85,
              marginTop: 12,
              lineHeight: 1.6,
              maxWidth: 480,
            }}
          >
            «Язык — сердце народа». Открой культурный код через 12 интерактивных
            историй об эпосе «Гэсэр», шаманизме, степной мудрости и буддийской
            философии.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Link
              href="/learn"
              className="btn"
              style={{
                background: '#F4B860',
                color: 'var(--neutral-900)',
                textDecoration: 'none',
              }}
            >
              <Icon name="play" size={12} /> Начать историю
            </Link>
            <button
              type="button"
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                backdropFilter: 'blur(8px)',
              }}
            >
              Все 12 глав
            </button>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {CHAPTERS.map((x, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#F4B860',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {x.num}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{x.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{x.desc}</div>
              </div>
              <Icon name="arrow-right" size={16} style={{ opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
