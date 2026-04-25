// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { Link } from '@/i18n/navigation';
import { useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import {
  AI_VARIANTS,
  DICT_ENTRIES,
  DIALECT_ENTRIES,
  PHRASE_ENTRIES,
} from './demo-data';

type Tab = 'dict' | 'phrases' | 'ai' | 'context';

interface TabSpec {
  id: Tab;
  label: string;
  count?: number;
}

const TABS: TabSpec[] = [
  { id: 'dict', label: 'Словарь', count: 4 },
  { id: 'phrases', label: 'Фразы и вхождения', count: 7 },
  { id: 'ai', label: 'AI и Google', count: 2 },
  { id: 'context', label: 'Культурный контекст' },
];

function ResultsDict(): ReactElement {
  return (
    <div className="grid-2">
      {DICT_ENTRIES.map((e, i) => (
        <Link
          key={i}
          href="/words/sain-baina"
          className="card"
          style={{
            padding: 18,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
          }}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.borderColor = 'var(--primary)';
            ev.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.borderColor = 'var(--border)';
            ev.currentTarget.style.transform = 'none';
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--primary-700)',
                padding: '3px 8px',
                background: 'var(--primary-50)',
                borderRadius: 999,
              }}
            >
              {e.pos}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-soft)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              · {e.uses.toLocaleString('ru')} употр.
            </span>
            <button
              type="button"
              className="btn-icon"
              style={{
                width: 28,
                height: 28,
                marginLeft: 'auto',
                color: 'var(--primary)',
              }}
              onClick={(ev) => ev.preventDefault()}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={14} />
            </button>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 4,
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {e.bxr}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-soft)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 8,
            }}
          >
            {e.ipa}
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text)',
              lineHeight: 1.5,
              marginBottom: 6,
            }}
          >
            {e.ru}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            {e.note}
          </div>
        </Link>
      ))}

      {/* CTA card */}
      <Link
        href="/words"
        className="card"
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          borderStyle: 'dashed',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          textAlign: 'center',
          textDecoration: 'none',
        }}
      >
        <Icon name="search" size={20} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Ещё 12 значений</div>
        <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
          включая диалектные варианты
        </div>
      </Link>
    </div>
  );
}

function ResultsPhrases(): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--surface)',
      }}
    >
      {PHRASE_ENTRIES.map((p, i) => (
        <div
          key={i}
          className="phrase-row"
          style={{
            padding: '14px 18px',
            borderBottom:
              i < PHRASE_ENTRIES.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.45 }}>
            {p.ru}
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text)',
              lineHeight: 1.45,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {p.bxr}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-soft)',
                textAlign: 'right',
                lineHeight: 1.3,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: p.literary ? 'var(--accent-warm)' : 'var(--text-muted)',
                }}
              >
                {p.source}
              </div>
              <div>{p.year}</div>
            </div>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 30, height: 30, color: 'var(--text-muted)' }}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={14} />
            </button>
          </div>
        </div>
      ))}
      <div
        style={{
          padding: '10px 18px',
          fontSize: 12,
          color: 'var(--text-soft)',
          textAlign: 'center',
          background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
        }}
      >
        + 7 фраз из корпуса ·{' '}
        <Link
          href="/explore"
          style={{ color: 'var(--primary)', fontWeight: 600 }}
        >
          показать все
        </Link>
      </div>
    </div>
  );
}

function ResultsAI(): ReactElement {
  return (
    <div className="grid-2">
      {AI_VARIANTS.map((v, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  v.kind === 'ai'
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent-warm) 100%)'
                    : 'var(--surface-2)',
                border: v.kind === 'google' ? '1px solid var(--border)' : 'none',
                display: 'grid',
                placeItems: 'center',
                color: v.kind === 'ai' ? 'white' : 'var(--text-muted)',
              }}
            >
              <Icon name={v.kind === 'ai' ? 'sparkles' : 'globe'} size={14} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
              {v.label}
            </div>
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--text-soft)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  background: 'var(--surface-2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${v.confidence}%`,
                    background:
                      v.confidence > 85
                        ? 'var(--accent-green)'
                        : 'var(--accent-warm)',
                  }}
                />
              </div>
              {v.confidence}%
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.3,
              marginBottom: 10,
              fontFamily: 'var(--font-display)',
            }}
          >
            {v.title}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span className="chip" style={{ fontSize: 11, padding: '3px 8px' }}>
              {v.tone}
            </span>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 26, height: 26 }}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={12} />
            </button>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 26, height: 26 }}
              aria-label="Скопировать"
            >
              <Icon name="copy" size={12} />
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              paddingTop: 12,
              borderTop: '1px dashed var(--border)',
            }}
          >
            {v.note}
          </div>

          {v.warning && (
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: 'var(--accent-warm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-warm)',
                }}
              />{' '}
              {v.warning}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultsContext(): ReactElement {
  return (
    <div className="ctx-grid">
      <div className="card" style={{ padding: 22 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-soft)',
            marginBottom: 10,
          }}
        >
          Этикет приветствия
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          В традиционной бурятской культуре приветствие <b>«Сайн байна»</b>{' '}
          сопровождается лёгким наклоном головы. Старшим говорят полное{' '}
          <b>«Амар сайн»</b> (буквально «мирно-хорошо») — это пожелание спокойствия и
          здоровья.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-muted)' }}>
          В деревнях после <i>«Сайн байна»</i> обычно следует расспрос о скоте,
          погоде и родственниках — это часть ритуала, а не любопытство.
        </p>
      </div>

      <div className="card" style={{ padding: 22, background: 'var(--surface-2)' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-soft)',
            marginBottom: 14,
          }}
        >
          Произношение по диалектам
        </div>
        {DIALECT_ENTRIES.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom:
                i < DIALECT_ENTRIES.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                width: 6,
                height: 32,
                borderRadius: 3,
                background: d.primary ? 'var(--primary)' : 'var(--border-strong)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {d.form}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                {d.name} · {d.region}
              </div>
            </div>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 30, height: 30, color: 'var(--primary)' }}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TranslationResults(): ReactElement {
  const [tab, setTab] = useState<Tab>('dict');

  return (
    <div className="fade-up" style={{ marginTop: 20 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
          paddingBottom: 0,
          overflowX: 'auto',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 600,
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom:
                tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
            {t.count != null && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background:
                    tab === t.id ? 'var(--primary-50)' : 'var(--surface-2)',
                  color: tab === t.id ? 'var(--primary-700)' : 'var(--text-soft)',
                  fontWeight: 700,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--text-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingRight: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-green)',
            }}
          />
          Найдено за 0.18s
        </div>
      </div>

      {tab === 'dict' && <ResultsDict />}
      {tab === 'phrases' && <ResultsPhrases />}
      {tab === 'ai' && <ResultsAI />}
      {tab === 'context' && <ResultsContext />}
    </div>
  );
}
