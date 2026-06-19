'use client';

import { useEffect, useState, type MouseEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { getOneBurWord } from '@/lib/api/words';
import type { SrsDueItem, SrsGradeValue, Word } from '@/lib/api/types';

/**
 * Маппинг кнопок оценки → числовой grade (grade < 3 = lapse):
 *   Again = 1  (lapse)
 *   Hard  = 3  (не lapse)
 *   Good  = 4
 *   Easy  = 5
 */
interface GradeButton {
  grade: SrsGradeValue;
  labelKey: 'again' | 'hard' | 'good' | 'easy';
  color: string;
}

const GRADE_BUTTONS: readonly GradeButton[] = [
  { grade: 1, labelKey: 'again', color: 'var(--tertiary)' },
  { grade: 3, labelKey: 'hard', color: 'var(--accent-warm)' },
  { grade: 4, labelKey: 'good', color: 'var(--primary)' },
  { grade: 5, labelKey: 'easy', color: 'var(--accent-green)' },
];

interface SrsCardProps {
  item: SrsDueItem;
  index: number;
  total: number;
  onGrade: (grade: SrsGradeValue) => void;
}

export function SrsCardView({ item, index, total, onGrade }: SrsCardProps): ReactElement {
  const t = useTranslations('srs');

  // Гидрация: лениво тянем детали карточки (перевод, фото, аудио)
  const [details, setDetails] = useState<Word | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setDetails(null);
    setFlipped(false);

    if (!item.slug) return;

    let cancelled = false;
    getOneBurWord(item.slug)
      .then((word) => {
        if (!cancelled) setDetails(word);
      })
      .catch(() => {
        // Деградируем: показываем хотя бы word и кнопки оценки
      });
    return () => {
      cancelled = true;
    };
  }, [item.slug]);

  const translation = details?.ru_words?.[0]?.name ?? details?.translations?.[0]?.name ?? null;
  const imageUrl = details?.images?.[0]?.url ?? null;
  const audioUrl = details?.speechs?.[0]?.url ?? null;

  const handleFlip = (): void => {
    setFlipped((f) => !f);
  };

  const handleGrade = (grade: SrsGradeValue): void => {
    setFlipped(false);
    onGrade(grade);
  };

  const stopProp = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
  };

  const handleListen = (e: MouseEvent<HTMLButtonElement>): void => {
    stopProp(e);
    if (audioUrl) {
      new Audio(audioUrl).play().catch(() => {
        // Игнорируем ошибку воспроизведения
      });
    }
  };

  const progress = ((index + 1) / total) * 100;

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Прогресс */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {t('progress', { current: index + 1, total })}
        </span>
        {item.is_new && (
          <span className="chip chip-primary" style={{ fontSize: 11 }}>
            {t('newCard')}
          </span>
        )}
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
            width: `${progress}%`,
            height: '100%',
            background: 'var(--primary)',
            borderRadius: 999,
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Карточка с флипом */}
      <div
        onClick={handleFlip}
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
          {/* Лицевая сторона — слово на бурятском */}
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
            <div style={{ textAlign: 'center', width: '100%' }}>
              {imageUrl && (
                <div style={{ marginBottom: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.word}
                    style={{
                      maxHeight: 120,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 12,
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  fontSize: imageUrl ? 64 : 88,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {item.word}
              </div>
              {audioUrl && (
                <button
                  type="button"
                  onClick={handleListen}
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
                  <Icon name="play" size={12} /> {t('listen')}
                </button>
              )}
              <div
                style={{
                  marginTop: 28,
                  fontSize: 12,
                  color: 'var(--text-soft)',
                }}
              >
                {t('tapToReveal')} →
              </div>
            </div>
          </div>

          {/* Обратная сторона — перевод */}
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
            <div style={{ textAlign: 'center', width: '100%' }}>
              {translation ? (
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {translation}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>
                  {t('noTranslation')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки оценки */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8,
        }}
      >
        {GRADE_BUTTONS.map((b) => (
          <button
            key={b.grade}
            type="button"
            onClick={() => handleGrade(b.grade)}
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
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {t(`grade.${b.labelKey}`)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              {t(`gradeDelay.${b.labelKey}`)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
