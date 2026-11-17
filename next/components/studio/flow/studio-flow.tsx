'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { RecordedClip } from '@/components/audio/use-audio-recorder';
import {
  getFlowSummary,
  skipFlowItem,
  type FlowMode,
  type FlowSummary,
  type ReviewItem,
  type VoiceItem,
} from '@/lib/api/studio-flow';
import { acceptEffects, type ConfettiPalette } from '@/lib/studio/flow-easter';
import { enForm, ruForm } from '@/lib/studio/word-plural';
import { feedKonami, konamiInput, KONAMI_START, swallowsArrow } from '@/lib/studio/flow-konami';
import { getStudioStreak, type StudioStreak } from '@/lib/api/studio-streak';
import { isMilestone } from '@/lib/studio/flow-milestones';
import {
  isStreakMilestone,
  markCelebratedToday,
  wasCelebratedToday,
} from '@/lib/studio/flow-streak';
import { INITIAL_SESSION, sessionReducer, type SessionAction } from '@/lib/studio/flow-session';
import { isTypingTarget } from '@/lib/studio/shortcuts';
import { KudosInbox } from '../kudos-inbox';
import { VoiceCreditCard } from '../voice-credit-card';
import { Banner, Celebration, type Burst } from './celebration';
import { MilestoneDialog } from './milestone-dialog';
import { RestScreen } from './rest-screen';
import { ReviewTab } from './review-tab';
import { StreakChip } from './streak-chip';
import { useFlowQueue } from './use-flow-queue';
import { useReducedMotion } from './use-reduced-motion';
import { useRerecord } from './use-rerecord';
import { useVoiceUploads } from './use-voice-uploads';
import { VoiceTab } from './voice-tab';
import { WordsTab } from './words-tab';

const CSS = `
.flow-touch-only{display:none}
@media (pointer:coarse){.flow-kbd-only{display:none}.flow-touch-only{display:inline}}
.flow-check{animation:flowpop .5s ease-out both}
.flow-banner{animation:flowrise 2s ease-out both}
.flow-big{animation:flowspin 2.4s ease-out both}
.flow-fun{background:linear-gradient(135deg,#FFF4B8,#FBDADA,#C7DEF1,#D4ECD9);background-size:300% 300%;animation:flowfun 8s ease infinite;border-radius:var(--r-xl);padding:16px}
.flow-fun .card{transform:rotate(-0.6deg);border:2px dashed var(--accent-warm)}
@keyframes flowpop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:0}}
@keyframes flowrise{0%{transform:translate(-50%,16px);opacity:0}15%,80%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-12px);opacity:0}}
@keyframes flowspin{0%{transform:translate(-50%,0) scale(.2) rotate(-360deg);opacity:0}30%{transform:translate(-50%,0) scale(1.1) rotate(0);opacity:1}85%{transform:translate(-50%,0) scale(1) rotate(0);opacity:1}100%{transform:translate(-50%,0) scale(1);opacity:0}}
@keyframes flowfun{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@media (prefers-reduced-motion:reduce){.flow-check,.flow-banner,.flow-big,.flow-fun{animation:none!important}.flow-check{opacity:1}}
`;

type Dispatcher = Dispatch<SessionAction>;

interface SectionProps {
  active: boolean;
  blocked: ReadonlySet<string>;
  dispatch: Dispatcher;
}

function VoiceSection({
  active,
  blocked,
  dispatch,
  enqueue,
  onGoReview,
  onToast,
}: SectionProps & {
  enqueue: ReturnType<typeof useVoiceUploads>['enqueue'];
  onGoReview: () => void;
  onToast: (m: string) => void;
}): ReactElement {
  const { state, advance, reload } = useFlowQueue('voice', blocked);
  const { send, keep } = useRerecord(dispatch, advance, onToast);
  const onAccept = useCallback(
    (item: VoiceItem, clip: RecordedClip) => {
      enqueue({
        id: item.item_key,
        text: item.text,
        blob: clip.blob,
        mime: clip.mime,
        durationMs: clip.durationMs,
      });
      dispatch({ type: 'accept' });
      void advance(() => skipFlowItem('voice', item.item_key));
    },
    [advance, dispatch, enqueue],
  );
  return (
    <VoiceTab
      queue={state}
      active={active}
      advance={advance}
      reload={reload}
      onAccept={onAccept}
      onRerecord={send}
      onKeep={keep}
      onSkip={() => dispatch({ type: 'skip' })}
      onGoReview={onGoReview}
    />
  );
}

function ReviewSection({
  active,
  blocked,
  dispatch,
  onToast,
  onReviewed,
}: SectionProps & { onToast: (m: string) => void; onReviewed: () => void }): ReactElement {
  const { state, advance, reload } = useFlowQueue('review', blocked);
  return (
    <ReviewTab
      queue={state}
      active={active}
      advance={advance}
      reload={reload}
      onDone={() => {
        dispatch({ type: 'accept' });
        onReviewed();
      }}
      onSkip={() => dispatch({ type: 'skip' })}
      onToast={onToast}
    />
  );
}

function WordsSection({
  blocked,
  dispatch,
  onToast,
  onDone,
  onSummaryStale,
  onGoReview,
}: {
  blocked: ReadonlySet<string>;
  dispatch: Dispatcher;
  onToast: (m: string) => void;
  onDone: () => void;
  onSummaryStale: () => void;
  onGoReview: () => void;
}): ReactElement {
  const { state, advance, reload } = useFlowQueue('words', blocked);
  return (
    <WordsTab
      queue={state}
      advance={advance}
      reload={reload}
      onDone={onDone}
      onSkip={() => dispatch({ type: 'skip' })}
      onSummaryStale={onSummaryStale}
      onToast={onToast}
      onGoReview={onGoReview}
    />
  );
}

export function StudioFlow({
  initialMode,
  reminderSlot,
}: {
  initialMode: FlowMode;
  reminderSlot?: ReactNode;
}): ReactElement {
  const t = useTranslations('studio.flow');
  const th = useTranslations('studio.honor');
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<FlowMode>(initialMode);
  const [session, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [banner, setBanner] = useState<'item108' | 'rare' | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [streak, setStreak] = useState<StudioStreak | null>(null);
  const [streakPending, setStreakPending] = useState<number | null>(null);
  const [streakBanner, setStreakBanner] = useState<number | null>(null);
  const [resting, setResting] = useState(false);
  const [fun, setFun] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [summary, setSummary] = useState<FlowSummary | null>(null);
  const konami = useRef(KONAMI_START);
  const lastCount = useRef(0);
  const prevDone = useRef<boolean | null>(null);

  const { enqueue, retryFailed } = useVoiceUploads(dispatch, session.failed);
  const blocked = useMemo(
    () => new Set([...session.pending, ...session.failed]),
    [session.pending, session.failed],
  );
  const idle = milestone === null && !resting;

  const streakSeq = useRef(0);
  const refreshStreak = useCallback(() => {
    const seq = ++streakSeq.current;
    getStudioStreak()
      .then((next) => {
        if (seq !== streakSeq.current) return;
        if (prevDone.current === false && next.done_today && !wasCelebratedToday()) {
          markCelebratedToday();
          setStreakPending(next.current);
        }
        prevDone.current = next.done_today;
        setStreak(next);
      })
      .catch(() => undefined);
  }, []);

  const summarySeq = useRef(0);
  const refreshSummary = useCallback(() => {
    const seq = ++summarySeq.current;
    getFlowSummary()
      .then((next) => {
        if (seq === summarySeq.current) setSummary(next);
      })
      .catch(() => undefined);
  }, []);

  useEffect(refreshStreak, [refreshStreak]);
  useEffect(refreshSummary, [refreshSummary]);
  useEffect(() => {
    if (session.uploaded > 0) refreshStreak();
  }, [session.uploaded, refreshStreak]);
  useEffect(() => {
    if (resting) refreshSummary();
  }, [resting, refreshSummary]);

  const onWordsDone = useCallback(() => {
    dispatch({ type: 'accept' });
    refreshStreak();
    refreshSummary();
  }, [refreshStreak, refreshSummary]);

  useEffect(() => {
    if (streakPending === null || milestone !== null || banner !== null || resting) return;
    setStreakBanner(streakPending);
    setStreakPending(null);
  }, [streakPending, milestone, banner, resting]);

  useEffect(() => {
    if (streakBanner === null) return;
    const id = window.setTimeout(() => setStreakBanner(null), 4000);
    return () => window.clearTimeout(id);
  }, [streakBanner]);

  const showToast = useCallback((message: string) => setToast(message), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (session.count <= lastCount.current) {
      lastCount.current = session.count;
      return;
    }
    lastCount.current = session.count;
    const fx = acceptEffects(session.count, Math.random, new Date());
    const palette: ConfettiPalette = fx.palette;
    setBurst({ id: session.count, palette, big: fx.item108 });
    setBanner(fx.item108 ? 'item108' : fx.rareGreeting ? 'rare' : null);
    if (isMilestone(session.count)) setMilestone(session.count);
  }, [session.count]);

  useEffect(() => {
    if (!banner) return;
    const id = window.setTimeout(() => setBanner(null), 2400);
    return () => window.clearTimeout(id);
  }, [banner]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target as HTMLElement | null) || e.ctrlKey || e.metaKey || e.altKey)
        return;
      const input = konamiInput(e);
      const res = feedKonami(konami.current, input);
      konami.current = res.progress;
      if (res.done) {
        setFun((f) => {
          setToast(f ? t('egg.konamiOff') : t('egg.konamiOn'));
          return !f;
        });
      }
      if (res.done || swallowsArrow(res.progress, input)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [t]);

  useEffect(() => {
    if (session.pending.length + session.failed.length === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [session.pending.length, session.failed.length]);

  const switchMode = (next: FlowMode) => {
    setMode(next);
    window.history.replaceState(null, '', `?mode=${next}`);
  };

  const tab = (m: FlowMode, label: string): ReactElement => (
    <button
      key={m}
      type="button"
      role="tab"
      aria-selected={mode === m}
      className={mode === m ? 'btn btn-primary' : 'btn btn-secondary'}
      style={{ padding: '8px 18px', minHeight: 44 }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => switchMode(m)}
      data-testid={`flow-tab-${m}`}
    >
      {label}
    </button>
  );

  const chip = (text: string, id: string, tone?: 'warn'): ReactElement => (
    <span
      data-testid={id}
      style={{
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background: tone === 'warn' ? 'var(--tertiary-soft)' : 'var(--surface-2)',
        color: tone === 'warn' ? 'var(--tertiary-700)' : 'var(--text-muted)',
        border: '1px solid var(--border)',
      }}
    >
      {text}
    </span>
  );

  return (
    <div className="container fade-up" style={{ paddingTop: 20, paddingBottom: 48, maxWidth: 760 }}>
      <style>{CSS}</style>
      <div
        className={fun ? 'flow-fun' : undefined}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        data-testid="flow-root"
        data-fun={fun || undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/studio"
            style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            ← {t('state.back')}
          </Link>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
            }}
          >
            {t('title')}
          </h1>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {streak && <StreakChip streak={streak} />}
            <Link
              href="/studio/board"
              className="btn btn-ghost"
              style={{ textDecoration: 'none', fontSize: 14 }}
              data-testid="flow-honor-link"
            >
              {th('title')}
            </Link>
            <KudosInbox />
          </span>
        </div>
        <div role="tablist" style={{ display: 'flex', gap: 8 }}>
          {tab('voice', t('tabs.voice'))}
          {tab('review', t('tabs.review'))}
          {tab(
            'words',
            summary && summary.words_remaining > 0
              ? `${t('tabs.words')} · ${summary.words_remaining}`
              : t('tabs.words'),
          )}
        </div>
        <div
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
          aria-live="polite"
        >
          {chip(t('counter.session', { n: session.count }), 'flow-count')}
          {session.streak >= 2 && chip(t('counter.streak', { n: session.streak }), 'flow-streak')}
          {mode === 'words' &&
            summary !== null &&
            summary.words_remaining > 0 &&
            chip(
              t(
                `words.waiting.${locale === 'en' ? enForm(summary.words_remaining) : ruForm(summary.words_remaining)}`,
                {
                  n: summary.words_remaining,
                },
              ),
              'flow-words-waiting',
            )}
          {session.pending.length > 0 &&
            chip(t('uploads.uploading', { n: session.pending.length }), 'flow-uploading')}
          {session.failed.length > 0 && (
            <>
              {chip(t('uploads.failed', { n: session.failed.length }), 'flow-failed', 'warn')}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: 13 }}
                onClick={retryFailed}
                data-testid="flow-retry-uploads"
              >
                {t('uploads.retry')}
              </button>
            </>
          )}
        </div>

        {resting ? (
          <RestScreen
            session={session}
            wordsWaited={summary?.words_waited ?? 0}
            reminderSlot={reminderSlot}
            onResume={() => setResting(false)}
          />
        ) : mode === 'voice' ? (
          <>
            <VoiceCreditCard consentOnly />
            <VoiceSection
              key="voice"
              active={idle}
              blocked={blocked}
              dispatch={dispatch}
              enqueue={enqueue}
              onGoReview={() => switchMode('review')}
              onToast={showToast}
            />
          </>
        ) : mode === 'review' ? (
          <ReviewSection
            key="review"
            active={idle}
            blocked={blocked}
            dispatch={dispatch}
            onToast={showToast}
            onReviewed={refreshStreak}
          />
        ) : (
          <WordsSection
            key="words"
            blocked={blocked}
            dispatch={dispatch}
            onToast={showToast}
            onDone={onWordsDone}
            onSummaryStale={refreshSummary}
            onGoReview={() => switchMode('review')}
          />
        )}
      </div>

      {createPortal(
        <>
          <Celebration burst={burst} reducedMotion={reduced} />
          {banner === 'item108' && <Banner big text={t('egg.item108')} />}
          {banner === 'rare' && <Banner text={t('egg.rare')} />}
          {streakBanner !== null && (
            <Banner
              text={
                isStreakMilestone(streakBanner)
                  ? t(`streak.milestone.m${streakBanner}`, { n: streakBanner })
                  : t('streak.done', { n: streakBanner })
              }
            />
          )}
          {milestone !== null && (
            <MilestoneDialog
              count={milestone}
              onMore={() => setMilestone(null)}
              onRest={() => {
                setMilestone(null);
                setResting(true);
              }}
            />
          )}
          {toast && (
            <div
              role="status"
              style={{
                position: 'fixed',
                left: '50%',
                bottom: 24,
                transform: 'translateX(-50%)',
                zIndex: 80,
                padding: '10px 18px',
                borderRadius: 12,
                background: 'var(--neutral-900)',
                color: '#fff',
                fontWeight: 600,
                maxWidth: '90vw',
              }}
              data-testid="flow-toast"
            >
              {toast}
            </div>
          )}
        </>,
        document.body,
      )}
    </div>
  );
}
