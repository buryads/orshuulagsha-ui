// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { Link } from '@/i18n/navigation';
import { useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { Soyombo } from '@/components/ui/soyombo';

export function WordOfTheDay(): ReactElement {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, var(--neutral-900) 0%, var(--primary-900) 100%)',
        color: 'white',
        border: 'none',
        position: 'relative',
      }}
    >
      {/* steppe pattern */}
      <svg
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.08,
        }}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="bur-pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 20 q 10 -10 20 0 t 20 0"
              stroke="white"
              strokeWidth="0.6"
              fill="none"
            />
            <circle cx="20" cy="20" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#bur-pattern)" />
      </svg>

      <div style={{ padding: 28, position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            opacity: 0.9,
          }}
        >
          <Soyombo size={20} color="rgba(255,255,255,0.9)" />
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            Слово дня · 25 апреля
          </span>
        </div>

        <h2
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          Тэнгэри
        </h2>
        <div
          style={{
            fontSize: 14,
            opacity: 0.7,
            fontFamily: 'var(--font-mono)',
            marginBottom: 16,
          }}
        >
          /tæŋ.gə.ri/ · сущ., м.р.
        </div>

        {revealed ? (
          <div className="fade-up">
            <p style={{ fontSize: 18, marginBottom: 8, fontWeight: 500 }}>
              Небо; небеса
            </p>
            <p
              style={{
                fontSize: 13,
                opacity: 0.75,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              В традиционной картине мира — высшее божество, отец всего сущего.
              Используется в эпосе «Гэсэр» как символ справедливости.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 16,
              backdropFilter: 'blur(8px)',
            }}
          >
            Угадать перевод →
          </button>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            style={{
              background: 'white',
              color: 'var(--neutral-900)',
              padding: '8px 14px',
            }}
          >
            <Icon name="play" size={12} /> Послушать
          </button>
          <button
            type="button"
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              padding: '8px 14px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Icon name="bookmark" size={14} /> В избранное
          </button>
          <Link
            href="/words/tengeri"
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              padding: '8px 14px',
              marginLeft: 'auto',
              textDecoration: 'none',
            }}
            aria-label="Открыть слово"
          >
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
