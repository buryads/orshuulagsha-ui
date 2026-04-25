// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface MeaningItem {
  n: string;
  title: string;
  description?: string;
  tag?: string;
}

export interface TabMeaningProps {
  items?: MeaningItem[];
  context?: string;
}

const DEFAULT_ITEMS: MeaningItem[] = [
  {
    n: '1',
    title: 'Небо, небеса',
    description: 'Видимая часть атмосферы над горизонтом',
    tag: 'основное',
  },
  {
    n: '2',
    title: 'Высшее божество',
    description:
      'В традиционной религии бурят — отец всего сущего, верховный дух',
    tag: 'религ.',
  },
  {
    n: '3',
    title: 'Судьба, провидение',
    description: 'Поэтическое — то, что предопределено свыше',
    tag: 'поэт.',
  },
];

const DEFAULT_CONTEXT =
  'В монгольских и бурятских языках «тэнгри» — древнейший религиозный концепт, восходящий к шаманизму VIII в. Этот корень дал начало целому пласту лексики: тэнгэриин гэрэл (свет неба), тэнгэриин ёһо (закон неба).';

export function TabMeaning({ items, context }: TabMeaningProps): ReactElement {
  const hasReal = Boolean(items && items.length > 0);
  const list = hasReal ? (items as MeaningItem[]) : DEFAULT_ITEMS;
  const ctx = context ?? DEFAULT_CONTEXT;

  return (
    <div className="card fade-up" style={{ padding: 28, marginTop: 16 }}>
      <h3
        style={{
          fontSize: 13,
          color: 'var(--text-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Значения
      </h3>
      {list.map((m, i) => (
        <div
          key={`${m.n}-${i}`}
          style={{
            display: 'flex',
            gap: 18,
            padding: '16px 0',
            borderTop: i ? '1px solid var(--border)' : 'none',
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--primary)',
              fontFamily: 'var(--font-display)',
              minWidth: 24,
            }}
          >
            {m.n}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600 }}>{m.title}</span>
              {m.tag ? (
                <span className="chip" style={{ fontSize: 11, padding: '3px 8px' }}>
                  {m.tag}
                </span>
              ) : null}
            </div>
            {m.description ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {m.description}
              </p>
            ) : null}
          </div>
        </div>
      ))}

      {!hasReal && (
        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 14,
            background: 'linear-gradient(90deg, var(--primary-50) 0%, transparent 80%)',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--primary)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="ai" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              AI: культурный контекст
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {ctx}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
