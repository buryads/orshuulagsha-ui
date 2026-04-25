// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import { Soyombo } from '@/components/ui/soyombo';
import {
  ACTIVITY_AREA_PATH,
  ACTIVITY_LINE_PATH,
  FAVORITE_WORDS,
  LEARNING_HISTORY,
} from './demo-data';

const PERIOD_TABS = ['7д', '30д', 'год'] as const;
const GOAL_PERCENT = 72;
const GOAL_DASH = `${GOAL_PERCENT * 2.51} 999`;

export function TabOverview(): ReactElement {
  return (
    <div
      className="fade-up"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* progress chart */}
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 18,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Активность за 30 дней
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                Слова, минуты, точность
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {PERIOD_TABS.map((p, i) => {
                const active = i === 1;
                return (
                  <button
                    key={p}
                    type="button"
                    className="chip"
                    style={{
                      background: active ? 'var(--neutral-900)' : 'transparent',
                      color: active ? 'white' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <svg viewBox="0 0 600 180" style={{ width: '100%', height: 180 }}>
            <defs>
              <linearGradient id="overview-actfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={30 + i * 40}
                x2="600"
                y2={30 + i * 40}
                stroke="var(--border)"
                strokeDasharray="2 4"
              />
            ))}
            <path d={ACTIVITY_AREA_PATH} fill="url(#overview-actfill)" />
            <path
              d={ACTIVITY_LINE_PATH}
              stroke="var(--primary)"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="600"
              cy="40"
              r="6"
              fill="var(--surface)"
              stroke="var(--primary)"
              strokeWidth="3"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 11,
              color: 'var(--text-soft)',
            }}
          >
            <span>26 марта</span>
            <span>10 апр</span>
            <span>18 апр</span>
            <span>сегодня</span>
          </div>
        </div>

        {/* learning history */}
        <div className="card" style={{ padding: 24 }}>
          <h3
            style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, marginTop: 0 }}
          >
            История обучения
          </h3>
          {LEARNING_HISTORY.map((h, i) => (
            <div
              key={h.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `color-mix(in srgb, ${h.color} 12%, transparent)`,
                  color: h.color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={h.icon} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {h.progress} · {h.date}
                </div>
              </div>
              {h.done && (
                <span className="chip chip-green">
                  <Icon name="check" size={11} /> завершено
                </span>
              )}
              <button
                type="button"
                className="btn-icon"
                style={{ width: 30, height: 30 }}
              >
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* goal */}
        <div
          className="card"
          style={{
            padding: 22,
            background:
              'linear-gradient(135deg, var(--primary-50) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Icon name="target" size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              Цель на апрель
            </h4>
          </div>
          <div
            style={{
              position: 'relative',
              width: 140,
              height: 140,
              margin: '0 auto',
            }}
          >
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--surface-2)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--primary)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={GOAL_DASH}
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {GOAL_PERCENT}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  360/500 слов
                </div>
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            140 слов до новой ачивки
          </p>
        </div>

        {/* favorites preview */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              Избранные слова
            </h4>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>47</span>
          </div>
          {FAVORITE_WORDS.map((p, i) => (
            <div
              key={p[0]}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {p[0]}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginLeft: 8,
                  }}
                >
                  {p[1]}
                </span>
              </div>
              <Icon
                name="heart-fill"
                size={14}
                style={{ color: 'var(--tertiary)' }}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 12, fontSize: 12 }}
          >
            Все 47 слов →
          </button>
        </div>

        {/* community rank */}
        <div
          className="card"
          style={{
            padding: 22,
            background: 'var(--neutral-900)',
            color: 'white',
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.15,
            }}
          >
            <Soyombo size={120} color="white" />
          </div>
          <Icon name="trophy" size={20} style={{ color: 'var(--accent-warm)' }} />
          <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 8, marginBottom: 0 }}>
            Лидерборд недели
          </h4>
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginTop: 4,
            }}
          >
            #42
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 0 }}>
            из 8 412 учеников
          </p>
          <button
            type="button"
            className="btn"
            style={{
              marginTop: 12,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              width: '100%',
            }}
          >
            Открыть рейтинг
          </button>
        </div>
      </div>
    </div>
  );
}
