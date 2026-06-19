'use client';

import { useState, type ReactElement, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import type { SrsCard, SrsGrade } from '@/lib/api/types';

interface GradeButton {
  grade: SrsGrade;
  color: string;
}

const GRADE_BUTTONS: readonly GradeButton[] = [
  { grade: 'again', color: 'var(--tertiary)' },
  { grade: 'hard', color: 'var(--accent-warm)' },
  { grade: 'good', color: 'var(--primary)' },
  { grade: 'easy', color: 'var(--accent-green)' },
];

interface SrsCardProps {
  card: SrsCard;
  index: number;
  total: number;
  onGrade: (grade: SrsGrade) => void;
}

export function SrsCardView({ card, index, total, onGrade }: SrsCardProps): ReactElement {
  const t = useTranslations('srs');
  const [flipped, setFlipped] = useState(false);

  const handleFlip = (): void => {
    setFlipped((f) => !f);
  };

  const handleGrade = (grade: SrsGrade): void => {
    setFlipped(false);
    onGrade(grade);
  };

  const stopProp = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
  };

  const handleListen = (e: MouseEvent<HTMLButtonElement>): void => {
    stopProp(e);
    if (card.audioUrl) {
      new Audio(card.audioUrl).play().catch(() => {
        // Игнорируем ошибку воспроизведения — пользователь сам видит кнопку
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
          {/* Лицевая сторона */}
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
              {card.imageUrl && (
                <div style={{ marginBottom: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.word}
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
                  fontSize: card.imageUrl ? 64 : 88,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {card.word}
              </div>
              {card.ipa && (
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
              )}
              {card.audioUrl && (
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

          {/* Обратная сторона */}
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
              {(card.exampleBur || card.exampleRu) && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 18,
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: 14,
                    backdropFilter: 'blur(8px)',
                    maxWidth: 460,
                    margin: '24px auto 0',
                  }}
                >
                  {card.exampleBur && (
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {card.exampleBur}
                    </div>
                  )}
                  {card.exampleRu && (
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        marginTop: 6,
                      }}
                    >
                      {card.exampleRu}
                    </div>
                  )}
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
              {t(`grade.${b.grade}`)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              {t(`gradeDelay.${b.grade}`)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
