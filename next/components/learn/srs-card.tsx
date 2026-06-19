'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { getOneBurWord } from '@/lib/api/words';
import type { SrsDueItem, Word } from '@/lib/api/types';

/**
 * Маппинг кнопок оценки → числовой grade для POST /api/srs/grade (0–5).
 * grade < 3 = lapse (reps сбрасываются):
 *   Again = 1  (единственная даёт lapse)
 *   Hard  = 3  (не lapse)
 *   Good  = 4
 *   Easy  = 5
 * Горячие клавиши (desktop): 1/2/3/4 соответственно.
 */
interface GradeButton {
  grade: number;
  labelKey: 'again' | 'hard' | 'good' | 'easy';
  color: string;
  hotkey: string;
}

const GRADE_BUTTONS: readonly GradeButton[] = [
  { grade: 1, labelKey: 'again', color: 'var(--tertiary)',     hotkey: '1' },
  { grade: 3, labelKey: 'hard',  color: 'var(--accent-warm)',  hotkey: '2' },
  { grade: 4, labelKey: 'good',  color: 'var(--primary)',      hotkey: '3' },
  { grade: 5, labelKey: 'easy',  color: 'var(--accent-green)', hotkey: '4' },
];

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

interface SrsCardProps {
  item: SrsDueItem;
  index: number;
  total: number;
  xpTotal: number;
  onGrade: (grade: number) => void;
  onFinish: () => void;
}

export function SrsCardView({
  item,
  index,
  total,
  xpTotal,
  onGrade,
  onFinish,
}: SrsCardProps): ReactElement {
  const t = useTranslations('learn.srs');

  // Гидрация: лениво тянем детали карточки (перевод, фото, аудио) по slug
  const [details, setDetails] = useState<Word | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDetails(null);
    setFlipped(false);
    setAudioState('idle');
    setImgError(false);
    setImgLoaded(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

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

  // Фокус на враппере при смене карточки — чтобы a11y клавиатура работала сразу
  useEffect(() => {
    wrapperRef.current?.focus();
  }, [item.word_id]);

  // Горячие клавиши: Space/Enter = flip; 1-4 = оценка (только после flip)
  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent): void => {
      // Не перехватываем если фокус на интерактивном элементе
      if (
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLAnchorElement ||
        e.target instanceof HTMLInputElement
      ) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }

      if (flipped) {
        const btn = GRADE_BUTTONS.find((b) => b.hotkey === e.key);
        if (btn) {
          e.preventDefault();
          handleGrade(btn.grade);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  // Перевод: ru_words → translations (фолбэк)
  const translation =
    (details?.ru_words && details.ru_words.length > 0
      ? details.ru_words.map((w) => w.name).join(', ')
      : null) ??
    details?.translations?.[0]?.name ??
    null;

  const imageUrl = !imgError ? (details?.images?.[0]?.url ?? null) : null;
  const audioUrl = details?.speechs?.[0]?.url ?? null;

  const handleFlip = (): void => {
    setFlipped((f) => !f);
  };

  const handleGrade = (grade: number): void => {
    setFlipped(false);
    onGrade(grade);
  };

  const stopProp = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
  };

  const handleListen = (e: MouseEvent<HTMLButtonElement>): void => {
    stopProp(e);
    if (!audioUrl) return;

    // Если уже играет — ставим на паузу
    if (audioRef.current && audioState === 'playing') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState('idle');
      return;
    }

    setAudioState('loading');
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('canplay', () => setAudioState('playing'), { once: true });
    audio.addEventListener('ended', () => setAudioState('idle'), { once: true });
    audio.addEventListener('pause', () => {
      if (audioState !== 'error') setAudioState('idle');
    }, { once: true });
    audio.addEventListener('error', () => setAudioState('error'), { once: true });

    audio.play().catch(() => setAudioState('error'));
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    }
  };

  const progress = ((index + 1) / total) * 100;
  const hasImage = imageUrl !== null;

  // Кнопка аудио — переиспользуется на лице и обороте
  const renderAudioButton = (): ReactElement | null => {
    if (!audioUrl) return null;

    const isLoading = audioState === 'loading';
    const isPlaying = audioState === 'playing';
    const isError = audioState === 'error';

    return (
      <button
        type="button"
        onClick={handleListen}
        aria-label={isPlaying ? 'Остановить' : t('listen')}
        disabled={isLoading}
        style={{
          marginTop: 20,
          padding: '10px 18px',
          borderRadius: 999,
          background: isError ? 'var(--tertiary)' : 'var(--primary)',
          color: 'white',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 600,
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading && (
          <>
            <span
              style={{
                width: 12,
                height: 12,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: 'white',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }}
            />
            {t('audioLoading')}
          </>
        )}
        {isError && t('audioError')}
        {isPlaying && (
          <>
            {/* Эквалайзер — 3 полоски с wave-анимацией */}
            <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
              {(['0s', '0.15s', '0.3s'] as const).map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 3,
                    height: 12,
                    background: 'white',
                    borderRadius: 2,
                    animation: `wave 0.6s ease-in-out ${delay} infinite`,
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
            </span>
            {t('listen')}
          </>
        )}
        {!isLoading && !isError && !isPlaying && (
          <>
            <Icon name="play" size={12} /> {t('listen')}
          </>
        )}
      </button>
    );
  };

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      style={{ maxWidth: 720, margin: '0 auto', outline: 'none' }}
    >
      {/* Топбар сессии */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          gap: 8,
        }}
      >
        <button type="button" onClick={onFinish} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          <Icon name="arrow-left" size={14} /> {t('finish')}
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {t('progress', { current: index + 1, total })}
        </span>
        <span className="chip chip-warm" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          🔥 {t('xp', { xp: xpTotal })}
        </span>
      </div>

      {/* Progress bar — 6px */}
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

      {/* Flip-карточка */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          flipped
            ? 'Перевод показан. Нажмите Enter или Space чтобы вернуться.'
            : 'Нажмите Enter или Space чтобы увидеть перевод.'
        }
        aria-pressed={flipped}
        onClick={handleFlip}
        onKeyDown={handleCardKeyDown}
        style={{
          perspective: 1200,
          height: 'clamp(300px, 45vw, 360px)',
          cursor: 'pointer',
          marginBottom: 24,
          outline: 'none',
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
          {/* ===== ЛИЦО: стимул без перевода ===== */}
          <div
            className="card"
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'grid',
              placeItems: 'center',
              padding: 'clamp(24px, 4vw, 40px)',
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%' }}>
              {/* Чип «Новое» для is_new карточек */}
              {item.is_new && (
                <div style={{ marginBottom: 12 }}>
                  <span className="chip chip-primary" style={{ fontSize: 11 }}>
                    {t('newCard')}
                  </span>
                </div>
              )}

              {/* Картинка: скелетон пока грузится; не рендерим при ошибке */}
              {imageUrl && (
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  {!imgLoaded && (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 180,
                        height: 135,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--surface-2)',
                        animation: 'pulse-soft 1.4s ease-in-out infinite',
                      }}
                    />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.word}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    style={{
                      maxWidth: 220,
                      maxHeight: 165,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: 'var(--r-md)',
                      display: imgLoaded ? 'block' : 'none',
                    }}
                  />
                </div>
              )}

              {/* Бурятское слово крупно */}
              <div
                style={{
                  fontSize: hasImage ? 'clamp(36px, 7vw, 64px)' : 'clamp(48px, 10vw, 88px)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--text)',
                }}
              >
                {item.word}
              </div>

              {/* IPA — скрыт (нет в API Word) */}

              {/* Аудио-кнопка */}
              {renderAudioButton()}

              {/* Хинт-подсказка */}
              <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-soft)' }}>
                {t('tapToReveal')}
              </div>
            </div>
          </div>

          {/* ===== ОБОРОТ: перевод ===== */}
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
              padding: 'clamp(24px, 4vw, 40px)',
              background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-warm-soft) 100%)',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%' }}>
              {translation ? (
                <div
                  style={{
                    fontSize: 'clamp(28px, 6vw, 56px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    textWrap: 'balance' as React.CSSProperties['textWrap'],
                    color: 'var(--text)',
                  }}
                >
                  {translation}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>
                  {t('noTranslation')}
                </div>
              )}

              {/* Блок примера — скрыт (нет в API Word) */}

              {/* Аудио доступно и на обороте */}
              {renderAudioButton()}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки оценки — ТОЛЬКО после flip (анти-чит, как в Anki) */}
      {flipped && (
        <div
          className="fade-up"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 8,
          }}
        >
          {GRADE_BUTTONS.map((b) => (
            <button
              key={b.grade}
              type="button"
              onClick={() => handleGrade(b.grade)}
              aria-label={`${t(`grade.${b.labelKey}`)} (клавиша ${b.hotkey})`}
              className="card"
              style={{
                padding: 'clamp(10px, 2vw, 14px) 12px',
                textAlign: 'center',
                border: `1px solid ${b.color}`,
                color: b.color,
                cursor: 'pointer',
                background: 'transparent',
                minHeight: 44,
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
              {/* Подсказка горячей клавиши вместо интервала (интервалов в API нет) */}
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                {b.hotkey}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
