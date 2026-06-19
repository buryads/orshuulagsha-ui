'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { SrsCardView } from '@/components/learn/srs-card';
import { XpToast } from '@/components/learn/xp-toast';
import { getDueCards, gradeCard } from '@/lib/api/srs';
import { getGamificationMe } from '@/lib/api/gamification';
import type { SrsDueItem, GamificationMe } from '@/lib/api/types';

type SessionState = 'loading' | 'error' | 'unauthorized' | 'empty' | 'active' | 'complete';

export function SrsSession(): ReactElement {
  const t = useTranslations('learn.srs');
  const tHud = useTranslations('learn.hud');
  const router = useRouter();

  const [state, setState] = useState<SessionState>('loading');
  const [items, setItems] = useState<SrsDueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [graded, setGraded] = useState(0);
  const [xp, setXp] = useState(0);

  // Session-HUD gamification state
  const [gamification, setGamification] = useState<GamificationMe | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [goalJustMet, setGoalJustMet] = useState(false);
  const [streakJustGained, setStreakJustGained] = useState(false);

  // Track whether this session's XP crossed the daily goal
  const xpTodayRef = useRef<number>(0);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [res, me] = await Promise.all([
        getDueCards(),
        getGamificationMe().catch(() => null), // non-critical
      ]);

      if (me) {
        setGamification(me);
        xpTodayRef.current = me.xp_today;
      }

      if (res.count === 0 || res.items.length === 0) {
        setState('empty');
      } else {
        setItems(res.items);
        setIndex(0);
        setGraded(0);
        setXp(0);
        // Reset celebration flags so a restarted session starts clean.
        setGoalJustMet(false);
        setStreakJustGained(false);
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

  const handleGrade = async (grade: number): Promise<void> => {
    const item = items[index];
    if (!item) return;

    try {
      await gradeCard(item.word_id, grade);
    } catch {
      // Не блокируем прогресс сессии при ошибке отправки оценки —
      // оптимистичный переход, потеря одной оценки некритична для UX
    }

    const awardedXp = grade >= 5 ? 15 : grade >= 3 ? 10 : 2;
    const nextGraded = graded + 1;
    const nextXp = xp + awardedXp;

    setGraded(nextGraded);
    setXp(nextXp);
    setXpToast(awardedXp);

    // Check if daily goal crossed during this session
    if (gamification && !goalJustMet && !gamification.goal_met) {
      const newXpToday = xpTodayRef.current + nextXp;
      if (newXpToday >= gamification.daily_goal_xp) {
        setGoalJustMet(true);
        // Streak increments when daily goal is met — celebrate
        if (gamification.streak >= 0) {
          setStreakJustGained(true);
        }
      }
    }

    if (index + 1 >= items.length) {
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
        <p style={{ color: 'var(--accent-warm)', fontWeight: 700, marginBottom: streakJustGained ? 4 : 24, fontSize: 18 }}>
          🔥 {t('xp', { xp })}
        </p>
        {streakJustGained && (
          <p
            style={{
              color: 'var(--accent-green)',
              fontWeight: 700,
              marginBottom: 24,
              fontSize: 15,
              animation: 'pulse-soft 2s ease-in-out 3',
            }}
          >
            {tHud('streakGained', { streak: (gamification?.streak ?? 0) + 1 })}
          </p>
        )}
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
  const current = items[index];
  if (!current) return <></>;

  const dailyGoal = gamification?.daily_goal_xp ?? 0;
  const xpTodayBase = gamification ? xpTodayRef.current : 0;
  const xpTodayTotal = xpTodayBase + xp;
  const goalProgress = dailyGoal > 0 ? Math.min(xpTodayTotal / dailyGoal, 1) : 0;
  const goalColor = goalJustMet ? 'var(--accent-green)' : 'var(--primary)';

  return (
    <>
      {/* Session-HUD: daily-goal bar */}
      {gamification && dailyGoal > 0 && (
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
          aria-label={tHud('dailyGoalBar', { current: Math.round(xpTodayTotal), goal: dailyGoal })}
          role="progressbar"
          aria-valuenow={Math.round(xpTodayTotal)}
          aria-valuemin={0}
          aria-valuemax={dailyGoal}
        >
          <Icon name="zap" size={14} style={{ color: goalColor, flexShrink: 0 }} />
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: 'var(--surface-2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${goalProgress * 100}%`,
                borderRadius: 999,
                background: goalColor,
                transition: 'width 0.4s ease, background-color 0.4s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>
            {Math.round(xpTodayTotal)}/{dailyGoal}
          </span>
          {goalJustMet && (
            <span
              style={{
                color: 'var(--accent-green)',
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                animation: 'pulse-soft 1.5s ease-in-out 3',
              }}
            >
              {tHud('goalMet')}
            </span>
          )}
        </div>
      )}

      <SrsCardView
        item={current}
        index={index}
        total={items.length}
        xpTotal={xp}
        onGrade={(grade) => void handleGrade(grade)}
        onFinish={handleFinish}
      />

      {/* XP micro-toast */}
      <XpToast amount={xpToast} onDone={() => setXpToast(null)} />
    </>
  );
}
