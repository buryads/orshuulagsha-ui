// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';

export interface EtymologyStep {
  era: string;
  word: string;
  description: string;
  color: string;
}

export interface TabEtymologyProps {
  steps?: EtymologyStep[];
}

const DEFAULT_STEPS: EtymologyStep[] = [
  {
    era: 'пра-алтайский',
    word: '*teŋri',
    description: 'божество неба',
    color: 'var(--accent-warm)',
  },
  {
    era: 'др.-тюрк.',
    word: 'tängri',
    description: 'небо, бог',
    color: 'var(--accent-green)',
  },
  {
    era: 'ст.-монгольский',
    word: 'tngri',
    description: 'небо, дух-небожитель',
    color: 'var(--primary)',
  },
  {
    era: 'соврем. бурят.',
    word: 'тэнгэри',
    description: 'небо; высшее божество',
    color: 'var(--tertiary)',
  },
];

export function TabEtymology({ steps }: TabEtymologyProps): ReactElement {
  const list = steps && steps.length > 0 ? steps : DEFAULT_STEPS;
  return (
    <div className="card fade-up" style={{ padding: 28, marginTop: 16 }}>
      <h3
        style={{
          fontSize: 13,
          color: 'var(--text-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Этимологическая цепочка
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {list.map((x, i) => (
          <div
            key={`${x.era}-${i}`}
            style={{ display: 'flex', gap: 18, position: 'relative' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: x.color,
                  border: '3px solid var(--surface)',
                  boxShadow: `0 0 0 2px ${x.color}`,
                }}
              />
              {i < list.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    background: 'var(--border)',
                    margin: '4px 0',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-soft)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                }}
              >
                {x.era}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                {x.word}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{x.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
