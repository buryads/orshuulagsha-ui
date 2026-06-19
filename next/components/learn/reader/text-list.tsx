'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { getTexts } from '@/lib/api/reader';
import type { TextListItem } from '@/lib/api/types';

// Допустимые CEFR-уровни, известные из контракта
const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
type Level = (typeof LEVELS)[number];

export function TextList(): ReactElement {
  const t = useTranslations('learn.reader');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texts, setTexts] = useState<TextListItem[]>([]);
  const [activeLevel, setActiveLevel] = useState<Level | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTexts();
      setTexts(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('unauthorized');
      } else {
        setError(t('loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    activeLevel === 'all'
      ? texts
      : texts.filter((tx) => tx.level === activeLevel);

  if (loading) {
    return (
      <div>
        {/* Скелетон фильтров */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[80, 60, 60, 60, 60].map((w, i) => (
            <div
              key={i}
              style={{
                width: w,
                height: 36,
                borderRadius: 'var(--r-pill)',
                background: 'var(--surface-2)',
                animation: 'pulse-soft 1.4s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        {/* Скелетон карточек */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card"
              style={{
                height: 140,
                background: 'var(--surface-2)',
                animation: 'pulse-soft 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>
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

  if (error) {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Фильтры по уровню */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {(['all', ...LEVELS] as const).map((level) => {
          const isActive = activeLevel === level;
          return (
            <button
              key={level}
              type="button"
              className="chip"
              aria-pressed={isActive}
              onClick={() => setActiveLevel(level)}
              style={{
                background: isActive ? 'var(--neutral-900)' : 'var(--surface)',
                color: isActive ? 'var(--text-inv)' : 'var(--text-muted)',
                border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                padding: '8px 14px',
                fontSize: 13,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {level === 'all' ? t('filterAll') : level}
            </button>
          );
        })}
      </div>

      {/* Список текстов */}
      {filtered.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Icon name="book" size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((tx) => (
            <Link
              key={tx.id}
              href={`/learn/reader/${encodeURIComponent(tx.slug)}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <article
                className="card"
                style={{
                  padding: 20,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                {/* Иконка + заголовок */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    aria-hidden
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--primary-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--primary)',
                    }}
                  >
                    <Icon name="book" size={20} />
                  </div>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text)',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {tx.title}
                  </h2>
                </div>

                {/* Чипы: уровень + длина */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tx.level && (
                    <span className="chip chip-primary" style={{ fontSize: 11 }}>
                      {tx.level}
                    </span>
                  )}
                  <span
                    className="chip"
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      background: 'var(--surface-2)',
                    }}
                  >
                    {t('wordCount', { count: tx.word_count })}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
