'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { getOneBurWord } from '@/lib/api/words';
import { addWordToSrs, markWordKnown, unmarkWordKnown } from '@/lib/api/reader';
import type { Word } from '@/lib/api/types';

export interface WordPopupToken {
  token: string;
  burword_id: number;
  slug: string | null;
  known: boolean;
}

interface WordPopupProps {
  token: WordPopupToken;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onKnownChange: (burwordId: number, known: boolean) => void;
}

type PopupState = 'loading' | 'ready' | 'error' | 'unauthorized';

export function WordPopup({
  token,
  anchorRect,
  onClose,
  onKnownChange,
}: WordPopupProps): ReactElement {
  const t = useTranslations('learn.reader.popup');

  const [state, setState] = useState<PopupState>('loading');
  const [word, setWord] = useState<Word | null>(null);
  const [inSrs, setInSrs] = useState(false);
  const [srsLoading, setSrsLoading] = useState(false);
  const [known, setKnown] = useState(token.known);
  const [knownLoading, setKnownLoading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Вычисляем позицию попапа (desktop: под словом; mobile: bottom)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const popupStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        maxHeight: '80vh',
        overflowY: 'auto',
      }
    : anchorRect
    ? {
        position: 'fixed',
        top: Math.min(anchorRect.bottom + 8, window.innerHeight - 380),
        left: Math.min(
          Math.max(anchorRect.left, 8),
          window.innerWidth - 340,
        ),
        width: 320,
        borderRadius: 'var(--r-lg)',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320,
        borderRadius: 'var(--r-lg)',
      };

  const loadWord = useCallback(async () => {
    if (!token.slug) {
      setState('ready');
      return;
    }
    setState('loading');
    try {
      const data = await getOneBurWord(token.slug);
      setWord(data);
      setState('ready');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setState('unauthorized');
      } else {
        setState('error');
      }
    }
  }, [token.slug]);

  // Сбрасываем per-token стейт при смене слова — React переиспользует инстанс попапа.
  // Запускается ДО loadWord-эффекта (порядок объявления), поэтому slug-ветка
  // не мигает стейлом: word=null → loading → новые данные.
  // Slugless-ветка: word=null → ready → показывает noTranslation (верно).
  // known намеренно синхронизируется отдельным эффектом ниже, чтобы
  // не конфликтовать с оптимистичными обновлениями.
  useEffect(() => {
    setWord(null);
    setInSrs(false);
    setSrsLoading(false);
    setKnownLoading(false);
  }, [token.burword_id, token.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadWord();
  }, [loadWord]);

  // Синхронизируем known при смене слова — React переиспользует инстанс попапа,
  // поэтому useState(token.known) не пересчитывается при смене token.burword_id
  useEffect(() => {
    setKnown(token.known);
  }, [token.burword_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap + Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap внутри диалога
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Переводим фокус в попап при открытии
    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSrs = async () => {
    setSrsLoading(true);
    try {
      await addWordToSrs(token.burword_id);
      setInSrs(true);
    } catch {
      // тихая ошибка — не блокируем UX
    } finally {
      setSrsLoading(false);
    }
  };

  const handleKnown = async () => {
    setKnownLoading(true);
    const nextKnown = !known;
    setKnown(nextKnown);
    onKnownChange(token.burword_id, nextKnown);
    try {
      if (nextKnown) {
        await markWordKnown(token.burword_id);
      } else {
        await unmarkWordKnown(token.burword_id);
      }
    } catch {
      // откатываем оптимистичное обновление
      setKnown(!nextKnown);
      onKnownChange(token.burword_id, !nextKnown);
    } finally {
      setKnownLoading(false);
    }
  };

  const audioUrl = word?.speechs?.[0]?.url;
  const translations = [
    ...(word?.ru_words?.map((r) => r.name) ?? []),
    ...(word?.translations?.map((tr) => tr.name) ?? []),
  ].filter(Boolean);

  const playAudio = () => {
    if (!audioUrl) return;
    try {
      const audio = new Audio(audioUrl);
      void audio.play();
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: isMobile ? 'rgba(0,0,0,0.4)' : 'transparent',
        }}
      />

      {/* Попап */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={token.token}
        style={{
          ...popupStyle,
          zIndex: 1001,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: 20,
        }}
      >
        {/* Заголовок + кнопка закрытия */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--text)',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {token.token}
            </h3>
            {audioUrl && (
              <button
                type="button"
                onClick={playAudio}
                className="btn-icon"
                aria-label={t('playAudio')}
                style={{
                  marginTop: 6,
                  width: 32,
                  height: 32,
                  background: 'var(--primary)',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Icon name="play" size={12} />
              </button>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label={t('close')}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Контент попапа */}
        {state === 'loading' && (
          <div style={{ padding: '12px 0' }}>
            {/* Скелетон перевода */}
            <div
              style={{
                height: 18,
                width: '70%',
                borderRadius: 6,
                background: 'var(--surface-2)',
                animation: 'pulse-soft 1.4s ease-in-out infinite',
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 14,
                width: '50%',
                borderRadius: 6,
                background: 'var(--surface-2)',
                animation: 'pulse-soft 1.4s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {state === 'error' && (
          <div style={{ padding: '8px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--tertiary)', fontSize: 14, marginBottom: 10 }}>
              {t('error')}
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void loadWord()}
              style={{ fontSize: 13 }}
            >
              {t('retry')}
            </button>
          </div>
        )}

        {state === 'unauthorized' && (
          <div style={{ padding: '8px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 10 }}>
              {t('authRequired')}
            </p>
            <Link href="/signin" className="btn btn-primary" style={{ fontSize: 13 }}>
              {t('signIn')}
            </Link>
          </div>
        )}

        {state === 'ready' && (
          <>
            {/* Переводы */}
            {translations.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                {translations.map((tr, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 16,
                      color: 'var(--text)',
                      margin: '0 0 4px',
                      fontWeight: i === 0 ? 600 : 400,
                    }}
                  >
                    {tr}
                  </p>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                  fontStyle: 'italic',
                }}
              >
                {t('noTranslation')}
              </p>
            )}

            {/* Действия */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Сохранить в SRS */}
              <button
                type="button"
                className="btn btn-primary"
                disabled={srsLoading}
                onClick={() => void handleSrs()}
                style={{ justifyContent: 'center', fontSize: 14 }}
              >
                <Icon name={inSrs ? 'bookmark-fill' : 'bookmark'} size={14} />
                {inSrs ? t('savedToSrs') : t('saveToSrs')}
              </button>

              {/* Знаю / Не знаю */}
              <button
                type="button"
                className="btn btn-secondary"
                disabled={knownLoading}
                onClick={() => void handleKnown()}
                style={{
                  justifyContent: 'center',
                  fontSize: 14,
                  background: known ? 'var(--accent-green-soft)' : 'var(--surface-2)',
                  color: known ? 'var(--accent-green)' : 'var(--text)',
                  border: `1px solid ${known ? 'var(--accent-green-soft)' : 'var(--border)'}`,
                }}
              >
                <Icon name={known ? 'check' : 'plus'} size={14} />
                {known ? t('markUnknown') : t('markKnown')}
              </button>

              {/* Открыть в словаре */}
              {token.slug && (
                <Link
                  href={`/words/${encodeURIComponent(token.slug)}`}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'center', fontSize: 14 }}
                >
                  <Icon name="book" size={14} />
                  {t('openDictionary')}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
