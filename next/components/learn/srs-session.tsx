'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { SrsCardView } from '@/components/learn/srs-card';
import { getDueCards, gradeCard } from '@/lib/api/srs';
import type { SrsDueItem, SrsGradeValue } from '@/lib/api/types';

// XP за каждую оценённую карточку (косметический фикс, бэк не возвращает xpDelta)
const XP_PER_CARD = 10;

type SessionState = 'loading' | 'error' | 'unauthorized' | 'empty' | 'active' | 'complete';

export function SrsSession(): ReactElement {
  const t = useTranslations('learn.srs');
  const router = useRouter();

  const [state, setState] = useState<SessionState>('loading');
  const [cards, setCards] = useState<SrsDueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [graded, setGraded] = useState(0);
  const [xp, setXp] = useState(0);

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
        setXp(0);
        setState('active');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setState('unauthorized');
      } else {
        setState('error');
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGrade = async (grade: SrsGradeValue): Promise<void> => {
    const item = cards[index];
    if (!item) return;

    try {
      await gradeCard(item.word_id, grade);
    } catch {
      // Не блокируем прогресс сессии при ошибке отправки оценки —
      // оптимистичный переход, потеря одной оценки некритична для UX
    }

    setGraded((n) => n + 1);
    setXp((n) => n + XP_PER_CARD);

    if (index + 1 >= cards.length) {
      setState('complete');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleFinish = (): void => {
    router.push('/');
  };

  // ── loading: скелетон карточки ──────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Топбар-плейсхолдер */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div style={{ width: 90, height: 32, borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse-soft 1.4s ease-in-out infinite' }} />
          <div style={{ width: 60, height: 20, borderRadius: 6, background: 'var(--surface-2)', animation: 'pulse-soft 1.4s ease-in-out infinite' }} />
          <div style={{ width: 60, height: 24, borderRadius: 999, background: 'var(--surface-2)', animation: 'pulse-soft 1.4s ease-in-out infinite' }} />
        </div>
        {/* Progress bar-плейсхолдер */}
        <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', marginBottom: 32, animation: 'pulse-soft 1.4s ease-in-out infinite' }} />
        {/* Карточка-скелетон */}
        <div
          className="card"
          style={{
            height: 'clamp(300px, 45vw, 360px)',
            background: 'var(--surface-2)',
            animation: 'pulse-soft 1.4s ease-in-out infinite',
            marginBottom: 24,
          }}
        />
      </div>
    );
  }

  // ── unauthorized ────────────────────────────────────────────────────────────
  if (state === 'unauthorized') {
    return (
      <div className="card fade-up" style={{ padding: 28, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('authRequired')}</p>
        <Link href="/signin" className="btn btn-primary">
          {t('signIn')}
        </Link>
      </div>
    );
  }

  // ── error ───────────────────────────────────────────────────────────────────
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

  // ── empty: всё повторено на сегодня ─────────────────────────────────────────
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
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/')}>
            <Icon name="arrow-left" size={14} /> {t('goHome')}
          </button>
        </div>
      </div>
    );
  }

  // ── complete: итоги сессии ───────────────────────────────────────────────────
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
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
          {t('completeBody', { count: graded })}
        </p>
        <p style={{ color: 'var(--accent-warm)', fontWeight: 700, marginBottom: 24, fontSize: 18 }}>
          🔥 {t('xp', { xp })}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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

  // ── active ───────────────────────────────────────────────────────────────────
  const current = cards[index];
  if (!current) return <></>;

  return (
    <SrsCardView
      item={current}
      index={index}
      total={cards.length}
      xpTotal={xp}
      onGrade={(grade) => void handleGrade(grade)}
      onFinish={handleFinish}
    />
  );
}
