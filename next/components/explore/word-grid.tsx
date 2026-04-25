// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import type { BurWord } from '@/lib/api/types';

export interface WordGridProps {
  words: BurWord[];
}

interface CardModel {
  href: string;
  word: string;
  translation: string;
  category: string;
  level: string;
  dotColor: string;
}

const DOT_COLORS = [
  'var(--primary)',
  'var(--accent-warm)',
  'var(--tertiary)',
  'var(--accent-green)',
];

function buildHref(w: BurWord): string {
  const slugOrId = w.slug ?? String(w.id);
  return `/words/${slugOrId}`;
}

function firstTranslation(w: BurWord): string {
  if (w.ru_words && w.ru_words.length > 0) {
    return w.ru_words.map((r) => r.name).join(', ');
  }
  if (w.translations && w.translations.length > 0) {
    return w.translations.map((t) => t.name).join(', ');
  }
  return '';
}

function toCard(w: BurWord, idx: number): CardModel {
  return {
    href: buildHref(w),
    word: w.name,
    translation: firstTranslation(w),
    // API does not expose part-of-speech / category — fall back to generic label.
    category: 'СЛОВО',
    // API does not expose CEFR level — default to A1.
    level: 'A1',
    dotColor: DOT_COLORS[idx % DOT_COLORS.length] ?? 'var(--primary)',
  };
}

function PlaceholderCard(): ReactElement {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--border-strong)',
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          ПУСТО
        </span>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
          marginBottom: 4,
          color: 'var(--text)',
        }}
      >
        —
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.4 }}>
        Слова появятся здесь
      </div>
    </div>
  );
}

function WordCard({ card }: { card: CardModel }): ReactElement {
  return (
    <Link
      href={card.href}
      className="card explore-card"
      style={{
        padding: 20,
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
    >
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <Icon
          name="heart"
          size={16}
          style={{ color: 'var(--text-soft)' }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: card.dotColor,
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          {card.category}
        </span>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {card.word}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          minHeight: 18,
        }}
      >
        {card.translation}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 14,
        }}
      >
        <span className="chip" style={{ fontSize: 10, padding: '3px 8px' }}>
          {card.level}
        </span>
        <span
          className="btn-icon"
          style={{
            width: 28,
            height: 28,
            background: 'var(--primary-50)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <Icon name="play" size={11} />
        </span>
      </div>
    </Link>
  );
}

const HOVER_CSS = `
.explore-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.explore-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
`;

export function WordGrid({ words }: WordGridProps): ReactElement {
  const hasWords = words.length > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HOVER_CSS }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {hasWords ? (
          words.map((w, i) => <WordCard key={w.id} card={toCard(w, i)} />)
        ) : (
          <PlaceholderCard />
        )}
      </div>
    </>
  );
}
