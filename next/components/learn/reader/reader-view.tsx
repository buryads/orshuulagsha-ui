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
import { getTextBySlug } from '@/lib/api/reader';
import type { ReaderToken, TextDetail, WordStatus } from '@/lib/api/types';
import { WordPopup, type WordPopupToken } from './word-popup';

interface ReaderViewProps {
  slug: string;
}

type FontSize = 'small' | 'medium' | 'large';

const FONT_SIZES: Record<FontSize, number> = {
  small: 16,
  medium: 19,
  large: 22,
};

/** Вычисляет статус токена по контракту бэка */
function computeStatus(token: { burword_id: number | null; known: boolean }): WordStatus {
  if (token.burword_id === null) return 'ignored';
  if (token.known) return 'known';
  return 'new';
}

/** Строит начальный список ReaderToken из TextDetail */
function buildTokens(detail: TextDetail): ReaderToken[] {
  return detail.tokens.map((t) => ({
    ...t,
    status: computeStatus(t),
  }));
}

export function ReaderView({ slug }: ReaderViewProps): ReactElement {
  const t = useTranslations('learn.reader');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<TextDetail | null>(null);
  const [tokens, setTokens] = useState<ReaderToken[]>([]);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  // Попап
  const [popupToken, setPopupToken] = useState<WordPopupToken | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTextBySlug(slug);
      setDetail(data);
      setTokens(buildTokens(data));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('unauthorized');
      } else {
        setError(t('textError'));
      }
    } finally {
      setLoading(false);
    }
  }, [slug, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Делегирование кликов на контейнер токенов (не вешаем listener на каждое слово)
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-token-id]') as HTMLElement | null;
      if (!btn) return;
      const burwordId = Number(btn.dataset['tokenId']);
      const slug = btn.dataset['tokenSlug'] ?? null;
      const token = btn.dataset['tokenText'] ?? '';
      const known = btn.dataset['tokenKnown'] === 'true';
      if (!burwordId) return;
      setPopupAnchor(btn.getBoundingClientRect());
      setPopupToken({ token, burword_id: burwordId, slug, known });
    },
    [],
  );

  const handleKnownChange = useCallback((burwordId: number, known: boolean) => {
    setTokens((prev) =>
      prev.map((tk) => {
        if (tk.burword_id !== burwordId) return tk;
        return { ...tk, known, status: known ? 'known' : 'new' };
      }),
    );
    // Синхронизируем состояние кнопки в попапе
    setPopupToken((prev) => {
      if (!prev || prev.burword_id !== burwordId) return prev;
      return { ...prev, known };
    });
  }, []);

  // Footer stats
  const total = tokens.filter((tk) => tk.burword_id !== null).length;
  const knownCount = tokens.filter((tk) => tk.status === 'known').length;
  const newCount = tokens.filter((tk) => tk.status === 'new').length;
  const knownPct = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px' }}>
        <div
          style={{
            height: 24,
            width: '60%',
            borderRadius: 8,
            background: 'var(--surface-2)',
            animation: 'pulse-soft 1.4s ease-in-out infinite',
            marginBottom: 32,
          }}
        />
        {[100, 85, 95, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: 20,
              width: `${w}%`,
              borderRadius: 6,
              background: 'var(--surface-2)',
              animation: 'pulse-soft 1.4s ease-in-out infinite',
              marginBottom: 12,
            }}
          />
        ))}
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 24 }}>
          {t('textLoading')}
        </p>
      </div>
    );
  }

  if (error === 'unauthorized') {
    return (
      <div
        className="card fade-up"
        style={{ padding: 28, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          {t('popup.authRequired')}
        </p>
        <Link href="/signin" className="btn btn-primary">
          {t('popup.signIn')}
        </Link>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>
          {error ?? t('textError')}
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  const fontPx = FONT_SIZES[fontSize];
  const fontKeys: FontSize[] = ['small', 'medium', 'large'];
  const fontLabels: Record<FontSize, string> = {
    small: t('fontSmall'),
    medium: t('fontMedium'),
    large: t('fontLarge'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Топбар */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--header-h)',
          zIndex: 10,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/learn/reader"
          className="btn btn-ghost"
          style={{ padding: '6px 10px', fontSize: 13, flexShrink: 0 }}
        >
          <Icon name="arrow-left" size={14} />
          {t('back')}
        </Link>

        <h1
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            margin: 0,
          }}
        >
          {detail.title}
        </h1>

        {/* Переключатель размера шрифта Aa */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            background: 'var(--surface-2)',
            borderRadius: 'var(--r-sm)',
            padding: 2,
          }}
          role="group"
          aria-label={t('fontSizeLabel')}
        >
          {fontKeys.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={fontSize === key}
              onClick={() => setFontSize(key)}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--r-xs)',
                fontSize: key === 'small' ? 11 : key === 'medium' ? 14 : 17,
                fontWeight: 700,
                background: fontSize === key ? 'var(--surface)' : 'transparent',
                color: fontSize === key ? 'var(--text)' : 'var(--text-muted)',
                boxShadow:
                  fontSize === key ? 'var(--shadow-xs)' : 'none',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
                minWidth: 28,
                minHeight: 28,
              }}
            >
              {fontLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Область чтения */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{
          flex: 1,
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          padding: '32px 16px 24px',
          fontSize: fontPx,
          lineHeight: 1.75,
          color: 'var(--text)',
          wordSpacing: '0.05em',
        }}
      >
        {tokens.map((tk, i) => {
          if (tk.status === 'ignored' || !tk.burword_id) {
            // Пунктуация / числа / имена: не кликабельны
            return (
              <span key={i} style={{ userSelect: 'text' }}>
                {tk.token}
              </span>
            );
          }

          const isNew = tk.status === 'new';
          const isKnown = tk.status === 'known';

          return (
            <button
              key={i}
              type="button"
              data-token-id={tk.burword_id}
              data-token-slug={tk.slug ?? ''}
              data-token-text={tk.token}
              data-token-known={String(isKnown)}
              aria-label={`${tk.token}, ${isNew ? t('statusNew') : t('statusKnown')}`}
              style={{
                // Сброс стилей кнопки
                font: 'inherit',
                cursor: 'pointer',
                border: 'none',
                padding: '0 1px',
                margin: '0 1px',
                lineHeight: 'inherit',
                display: 'inline',
                // Статусная подсветка
                background: isNew ? 'var(--accent-warm-soft)' : 'transparent',
                color: 'var(--text)',
                // a11y: не только цвет
                textDecoration: isNew ? 'underline dotted var(--accent-warm)' : 'none',
                textDecorationThickness: isNew ? '2px' : undefined,
                textUnderlineOffset: '3px',
                borderRadius: 3,
                // Тап-таргет ≥44px через padding + минимальная высота
                minHeight: 44,
                verticalAlign: 'middle',
              }}
            >
              {tk.token}
            </button>
          );
        })}
      </div>

      {/* Footer-статус */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '10px 16px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
        }}
      >
        {/* Прогресс-бар */}
        <div
          role="progressbar"
          aria-valuenow={knownPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('footerKnown', { pct: knownPct })}
          style={{
            flex: '0 0 80px',
            height: 6,
            borderRadius: 999,
            background: 'var(--surface-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${knownPct}%`,
              background: 'var(--accent-green)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            {t('footerKnown', { pct: knownPct })}
          </span>
          {' · '}
          <span style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
            {t('footerNew', { count: newCount })}
          </span>
        </span>
      </div>

      {/* Попап слова */}
      {popupToken && (
        <WordPopup
          token={popupToken}
          anchorRect={popupAnchor}
          onClose={() => setPopupToken(null)}
          onKnownChange={handleKnownChange}
        />
      )}
    </div>
  );
}
