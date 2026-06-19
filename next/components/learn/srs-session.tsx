'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { SrsCardView } from '@/components/learn/srs-card';
import { getDueCards, gradeCard } from '@/lib/api/srs';
import type { SrsCard, SrsGrade } from '@/lib/api/types';

type SessionState = 'loading' | 'error' | 'empty' | 'active' | 'complete';

export function SrsSession(): ReactElement {
  const t = useTranslations('srs');
  const router = useRouter();

  const [state, setState] = useState<SessionState>('loading');
  const [cards, setCards] = useState<SrsCard[]>([]);
  const [index, setIndex] = useState(0);
  const [graded, setGraded] = useState(0);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await getDueCards();
      if (res.count === 0 || res.cards.length === 0) {
        setState('empty');
      } else {
        setCards(res.cards);
        setIndex(0);
        setGraded(0);
        setState('active');
      }
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGrade = async (grade: SrsGrade): Promise<void> => {
    const card = cards[index];
    if (!card) return;

    try {
      await gradeCard(card.id, grade);
    } catch {
      // Не блокируем прогресс сессии при ошибке отправки оценки —
      // пользователь продолжает, потеря одной оценки некритична
    }

    const nextGraded = graded + 1;
    setGraded(nextGraded);

    if (index + 1 >= cards.length) {
      setState('complete');
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (state === 'loading') {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        {t('loading')}…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('loadError')}</p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="card fade-up" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: '0 0 12px',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('emptyTitle')}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('emptyBody')}</p>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/')}>
          <Icon name="arrow-left" size={14} /> {t('goHome')}
        </button>
      </div>
    );
  }

  if (state === 'complete') {
    return (
      <div className="card fade-up" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: '0 0 12px',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('completeTitle')}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          {t('completeBody', { count: graded })}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => void load()}>
            <Icon name="play" size={14} /> {t('restart')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/')}>
            <Icon name="arrow-left" size={14} /> {t('goHome')}
          </button>
        </div>
      </div>
    );
  }

  // state === 'active'
  const current = cards[index];
  if (!current) return <></>;

  return (
    <SrsCardView
      card={current}
      index={index}
      total={cards.length}
      onGrade={(grade) => void handleGrade(grade)}
    />
  );
}
