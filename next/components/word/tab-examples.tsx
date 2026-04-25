// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';

export interface ExampleItem {
  source: string;
  translation: string;
  from: string;
  year?: string;
}

export interface TabExamplesProps {
  items?: ExampleItem[];
  highlight: string;
}

const DEFAULT_ITEMS: ExampleItem[] = [
  {
    source: 'Сэнхир тэнгэри доро аян замдаа гарбабди.',
    translation: 'Под синим небом мы отправились в путь.',
    from: 'Хоца Намсараев, «Цыремпил»',
  },
  {
    source: 'Тэнгэри ехэ, дэлхэй үргэн.',
    translation: 'Небо велико, земля широка. (пословица)',
    from: 'народная',
  },
  {
    source: 'Тэнгэриин нюдэн мэтэ одод.',
    translation: 'Звёзды как глаза неба.',
    from: 'Дамба Жалсараев',
  },
];

function renderHighlighted(text: string, term: string): ReactElement[] {
  if (!term) return [<span key="0">{text}</span>];
  const lower = term.toLocaleLowerCase('ru-RU');
  const parts: ReactElement[] = [];
  let cursor = 0;
  let idx = 0;
  let key = 0;
  while (cursor < text.length) {
    const found = text.toLocaleLowerCase('ru-RU').indexOf(lower, cursor);
    if (found === -1) {
      parts.push(<span key={key++}>{text.slice(cursor)}</span>);
      break;
    }
    if (found > cursor) {
      parts.push(<span key={key++}>{text.slice(cursor, found)}</span>);
    }
    const matched = text.slice(found, found + term.length);
    parts.push(
      <mark
        key={key++}
        style={{
          background: 'var(--primary-50)',
          color: 'var(--primary-700)',
          padding: '1px 4px',
          borderRadius: 4,
          fontWeight: 700,
        }}
      >
        {matched}
      </mark>,
    );
    cursor = found + term.length;
    idx += 1;
    if (idx > 50) break; // safety
  }
  return parts;
}

export function TabExamples({ items, highlight }: TabExamplesProps): ReactElement {
  const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
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
        В литературе и речи
      </h3>
      {list.map((ex, i) => (
        <div
          key={`${ex.from}-${i}`}
          style={{
            padding: '18px 0',
            borderTop: i ? '1px solid var(--border)' : 'none',
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              lineHeight: 1.5,
              marginBottom: 6,
            }}
          >
            {renderHighlighted(ex.source, highlight)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            {ex.translation}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-soft)', fontStyle: 'italic' }}>
            — {ex.from}
            {ex.year ? `, ${ex.year}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
