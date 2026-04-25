// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement, type MouseEvent } from 'react';
import { Icon } from '@/components/ui/icon';

interface FlashcardModeProps {
  onDone: () => void;
}

interface Flashcard {
  word: string;
  translation: string;
  ipa: string;
  exampleBur: string;
  exampleRu: string;
  pos: string;
}

const CARDS: readonly Flashcard[] = [
  {
    word: 'Эжы',
    translation: 'мама',
    ipa: '/ɛʒi/',
    exampleBur: 'Эжы намда дуу дуулана.',
    exampleRu: 'Мама поёт мне песню.',
    pos: 'сущ., семья',
  },
  {
    word: 'Аба',
    translation: 'папа',
    ipa: '/aba/',
    exampleBur: 'Аба гэртээ ерээ.',
    exampleRu: 'Папа пришёл домой.',
    pos: 'сущ., семья',
  },
  {
    word: 'Морин',
    translation: 'лошадь',
    ipa: '/mɔrin/',
    exampleBur: 'Морин талаар гүйнэ.',
    exampleRu: 'Лошадь скачет по степи.',
    pos: 'сущ., животные',
  },
  {
    word: 'Уһан',
    translation: 'вода',
    ipa: '/uhan/',
    exampleBur: 'Уһан хүйтэн байна.',
    exampleRu: 'Вода холодная.',
    pos: 'сущ., природа',
  },
  {
    word: 'Гэр',
    translation: 'дом, юрта',
    ipa: '/gɛr/',
    exampleBur: 'Гэртээ һуунаб.',
    exampleRu: 'Я сижу дома.',
    pos: 'сущ., быт',
  },
  {
    word: 'Хүн',
    translation: 'человек',
    ipa: '/xun/',
    exampleBur: 'Хүн бүхэн өөрын һанаатай.',
    exampleRu: 'У каждого человека своё мнение.',
    pos: 'сущ., общество',
  },
  {
    word: 'Үдэр',
    translation: 'день',
    ipa: '/ydɛr/',
    exampleBur: 'Үдэр һайхан байна.',
    exampleRu: 'День прекрасный.',
    pos: 'сущ., время',
  },
  {
    word: 'Найза',
    translation: 'друг',
    ipa: '/najza/',
    exampleBur: 'Найза минии гэртэ ерээ.',
    exampleRu: 'Друг пришёл ко мне домой.',
    pos: 'сущ., общество',
  },
];

interface RatingButton {
  label: string;
  color: string;
  delay: string;
}

const RATINGS: readonly RatingButton[] = [
  { label: 'Не помню', color: 'var(--tertiary)', delay: '1 мин' },
  { label: 'Сложно', color: 'var(--accent-warm)', delay: '4 мин' },
  { label: 'Хорошо', color: 'var(--primary)', delay: '1 д' },
  { label: 'Легко', color: 'var(--accent-green)', delay: '5 д' },
];

export function FlashcardMode({ onDone }: FlashcardModeProps): ReactElement {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = CARDS.length;
  const card = CARDS[idx] ?? CARDS[0]!;

  const advance = (): void => {
    setIdx((prev) => (prev + 1) % total);
    setFlipped(false);
  };

  const stopProp = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
  };

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <button onClick={onDone} className="btn btn-ghost">
          <Icon name="arrow-left" size={14} /> Закончить
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {idx + 1} из {total}
        </span>
        <span className="chip chip-warm">
          <Icon name="flame" size={12} /> +30 XP
        </span>
      </div>

      <div
        style={{
          height: 6,
          background: 'var(--surface-2)',
          borderRadius: 999,
          marginBottom: 32,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((idx + 1) / total) * 100}%`,
            height: '100%',
            background: 'var(--primary)',
            borderRadius: 999,
            transition: 'width 0.3s',
          }}
        />
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          perspective: 1200,
          height: 360,
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: flipped ? 'rotateY(180deg)' : 'none',
          }}
        >
          <div
            className="card"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'grid',
              placeItems: 'center',
              padding: 40,
              background:
                'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span
                className="chip chip-primary"
                style={{ marginBottom: 24 }}
              >
                {card.pos}
              </span>
              <div
                style={{
                  fontSize: 88,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {card.word}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: 12,
                }}
              >
                {card.ipa}
              </div>
              <button
                onClick={stopProp}
                style={{
                  marginTop: 24,
                  padding: '10px 18px',
                  borderRadius: 999,
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                }}
              >
                <Icon name="play" size={12} /> Послушать
              </button>
              <div
                style={{
                  marginTop: 28,
                  fontSize: 12,
                  color: 'var(--text-soft)',
                }}
              >
                Нажми, чтобы увидеть перевод →
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'grid',
              placeItems: 'center',
              padding: 40,
              background:
                'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-warm-soft) 100%)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                {card.translation}
              </div>
              <div
                style={{
                  marginTop: 24,
                  padding: 18,
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 14,
                  backdropFilter: 'blur(8px)',
                  maxWidth: 460,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {card.exampleBur}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    marginTop: 6,
                  }}
                >
                  {card.exampleRu}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 8,
        }}
      >
        {RATINGS.map((b) => (
          <button
            key={b.label}
            onClick={advance}
            className="card"
            style={{
              padding: '14px 12px',
              textAlign: 'center',
              border: `1px solid ${b.color}`,
              color: b.color,
              cursor: 'pointer',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `color-mix(in srgb, ${b.color} 8%, transparent)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14 }}>{b.label}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              через {b.delay}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
