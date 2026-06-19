'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { XpToast } from '@/components/learn/xp-toast';
import { BurKeyboard } from '@/components/home/bur-keyboard';
import { getLessonDetail, checkLesson } from '@/lib/api/lessons';
import type { LessonDetail, Exercise, CheckAnswer, CheckResponse } from '@/lib/api/types';

// ─── shared option-tile state ─────────────────────────────────────────────────
type TileState = 'idle' | 'selected' | 'correct' | 'wrong';

function tileBg(s: TileState): string {
  switch (s) {
    case 'selected': return 'var(--primary-50, rgba(99,102,241,0.08))';
    case 'correct':  return 'var(--accent-green-soft, rgba(34,197,94,0.12))';
    case 'wrong':    return 'var(--tertiary-soft, rgba(239,68,68,0.12))';
    default:         return 'var(--surface-2)';
  }
}

function tileBorder(s: TileState): string {
  switch (s) {
    case 'selected': return '2px solid var(--primary)';
    case 'correct':  return '2px solid var(--accent-green)';
    case 'wrong':    return '2px solid var(--tertiary)';
    default:         return '2px solid var(--border)';
  }
}

// ─── match exercise ───────────────────────────────────────────────────────────
interface MatchPair { id: string; bur: string; ru: string; }

interface MatchExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  feedbackPhase: boolean;
  correct: boolean | null;
}

function MatchExercise({ exercise, onAnswer, feedbackPhase, correct }: MatchExerciseProps): ReactElement {
  const t = useTranslations('learn.lesson.match');

  const pairs: MatchPair[] = Array.isArray((exercise.payload as Record<string, unknown>).pairs)
    ? (exercise.payload as { pairs: MatchPair[] }).pairs
    : [];

  const [selectedBurId, setSelectedBurId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());

  // Shuffle ru side once
  const [shuffledRu] = useState<MatchPair[]>(() => [...pairs].sort(() => Math.random() - 0.5));

  const allMatched = matched.size === pairs.length;

  useEffect(() => {
    if (allMatched) {
      onAnswer('matched');
    }
  }, [allMatched, onAnswer]);

  const handleBurClick = (id: string) => {
    if (matched.has(id) || feedbackPhase) return;
    setSelectedBurId(id === selectedBurId ? null : id);
  };

  const handleRuClick = (id: string) => {
    if (matched.has(id) || feedbackPhase) return;
    if (!selectedBurId) return;

    if (selectedBurId === id) {
      setMatched((prev) => new Set([...prev, id]));
      setSelectedBurId(null);
    } else {
      // Wrong pair — flash both red
      setWrongIds(new Set([selectedBurId, id]));
      setTimeout(() => {
        setWrongIds(new Set());
        setSelectedBurId(null);
      }, 600);
    }
  };

  const burTileState = (id: string): TileState => {
    if (matched.has(id)) return correct === false ? 'wrong' : 'correct';
    if (wrongIds.has(id)) return 'wrong';
    if (selectedBurId === id) return 'selected';
    return 'idle';
  };

  const ruTileState = (id: string): TileState => {
    if (matched.has(id)) return correct === false ? 'wrong' : 'correct';
    if (wrongIds.has(id)) return 'wrong';
    return 'idle';
  };

  return (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {t('instruction')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Left column — bur */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pairs.map((p) => {
            const s = burTileState(p.id);
            return (
              <button
                key={`bur-${p.id}`}
                type="button"
                disabled={matched.has(p.id) || feedbackPhase}
                onClick={() => handleBurClick(p.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: tileBg(s),
                  border: tileBorder(s),
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: matched.has(p.id) || feedbackPhase ? 'default' : 'pointer',
                  minHeight: 48,
                  transition: 'background 0.15s, border-color 0.15s',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {p.bur}
              </button>
            );
          })}
        </div>
        {/* Right column — ru (shuffled) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shuffledRu.map((p) => {
            const s = ruTileState(p.id);
            return (
              <button
                key={`ru-${p.id}`}
                type="button"
                disabled={matched.has(p.id) || feedbackPhase}
                onClick={() => handleRuClick(p.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: tileBg(s),
                  border: tileBorder(s),
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: matched.has(p.id) || feedbackPhase ? 'default' : 'pointer',
                  minHeight: 48,
                  transition: 'background 0.15s, border-color 0.15s',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {p.ru}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── type exercise ────────────────────────────────────────────────────────────
interface TypeExerciseProps {
  exercise: Exercise;
  value: string;
  onChange: (v: string) => void;
  feedbackPhase: boolean;
}

function TypeExercise({ exercise, value, onChange, feedbackPhase }: TypeExerciseProps): ReactElement {
  const t = useTranslations('learn.lesson.type');
  const [showKb, setShowKb] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInsert = (text: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + text);
      return;
    }
    const start = caretRef.current;
    const end = el.selectionEnd ?? start;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    caretRef.current = start + text.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    const start = caretRef.current;
    if (start > 0) {
      const next = value.slice(0, start - 1) + value.slice(start);
      onChange(next);
      caretRef.current = start - 1;
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start - 1, start - 1);
      });
    }
  };

  const payload = exercise.payload as { prompt?: string; audio_url?: string };

  return (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
        {t('instruction')}
      </p>
      {payload.prompt && (
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 20,
            fontFamily: 'var(--font-display)',
          }}
        >
          {payload.prompt}
        </p>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={feedbackPhase}
        placeholder={t('placeholder')}
        onSelect={(e) => {
          caretRef.current = (e.target as HTMLInputElement).selectionStart ?? 0;
        }}
        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
          caretRef.current = (e.target as HTMLInputElement).selectionStart ?? 0;
        }}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 12,
          border: '2px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 17,
          fontFamily: 'var(--font-display)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        autoComplete="off"
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowKb((s) => !s)}
          style={{ fontSize: 13, gap: 6, display: 'flex', alignItems: 'center' }}
        >
          <Icon name="keyboard" size={15} />
          {t('keyboard')}
        </button>
      </div>
      {showKb && (
        <BurKeyboard
          onInsert={handleInsert}
          onBackspace={handleBackspace}
          onClose={() => setShowKb(false)}
        />
      )}
    </div>
  );
}

// ─── listen-pick exercise ─────────────────────────────────────────────────────
interface ListenPickProps {
  exercise: Exercise;
  selected: string | null;
  onSelect: (v: string) => void;
  feedbackPhase: boolean;
  correctAnswers: Set<number> | null;
  wrongAnswers: Set<number> | null;
}

function ListenPickExercise({
  exercise,
  selected,
  onSelect,
  feedbackPhase,
  correctAnswers,
  wrongAnswers,
}: ListenPickProps): ReactElement {
  const t = useTranslations('learn.lesson.listenPick');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const payload = exercise.payload as { audio_url?: string; options?: string[] };
  const options: string[] = useMemo(
    () => (Array.isArray(payload.options) ? payload.options : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id],
  );

  useEffect(() => {
    if (payload.audio_url) {
      const audio = new Audio(payload.audio_url);
      audioRef.current = audio;
      void audio.play().catch(() => null);
    }
    return () => {
      audioRef.current?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  // Number hotkeys 1-4
  useEffect(() => {
    if (feedbackPhase) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= options.length) {
        onSelect(options[n - 1] ?? '');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedbackPhase, options, onSelect]);

  const tileState = (opt: string, idx: number): TileState => {
    if (feedbackPhase) {
      if (correctAnswers?.has(idx)) return 'correct';
      if (wrongAnswers?.has(idx)) return 'wrong';
    }
    if (selected === opt) return 'selected';
    return 'idle';
  };

  return (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        {t('instruction')}
      </p>
      {payload.audio_url ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                void audioRef.current.play().catch(() => null);
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="volume" size={16} />
            {t('replay')}
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{t('noAudio')}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt, idx) => {
          const s = tileState(opt, idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={feedbackPhase}
              onClick={() => onSelect(opt)}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                background: tileBg(s),
                border: tileBorder(s),
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: 15,
                cursor: feedbackPhase ? 'default' : 'pointer',
                minHeight: 48,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.15s, border-color 0.15s',
                fontFamily: 'var(--font-display)',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  color: 'var(--text-muted)',
                }}
              >
                {idx + 1}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── image-pick exercise ──────────────────────────────────────────────────────
interface ImageOption { label: string; image_url?: string; }

interface ImagePickProps {
  exercise: Exercise;
  selected: string | null;
  onSelect: (v: string) => void;
  feedbackPhase: boolean;
  correctAnswers: Set<number> | null;
  wrongAnswers: Set<number> | null;
}

function ImagePickExercise({
  exercise,
  selected,
  onSelect,
  feedbackPhase,
  correctAnswers,
  wrongAnswers,
}: ImagePickProps): ReactElement {
  const t = useTranslations('learn.lesson.imagePick');
  const payload = exercise.payload as { options?: ImageOption[] };
  const options: ImageOption[] = Array.isArray(payload.options) ? payload.options : [];
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const tileState = (opt: ImageOption, idx: number): TileState => {
    if (feedbackPhase) {
      if (correctAnswers?.has(idx)) return 'correct';
      if (wrongAnswers?.has(idx)) return 'wrong';
    }
    if (selected === opt.label) return 'selected';
    return 'idle';
  };

  return (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        {t('instruction')}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {options.map((opt, idx) => {
          const s = tileState(opt, idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={feedbackPhase}
              onClick={() => onSelect(opt.label)}
              style={{
                borderRadius: 14,
                background: tileBg(s),
                border: tileBorder(s),
                cursor: feedbackPhase ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 0,
                minHeight: 120,
              }}
            >
              {opt.image_url && !imgErrors.has(idx) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opt.image_url}
                  alt={opt.label}
                  onError={() => setImgErrors((prev) => new Set([...prev, idx]))}
                  style={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    display: 'block',
                    background: 'var(--surface-2)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 100,
                    background: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    animation: 'pulse-soft 1.4s ease-in-out infinite',
                  }}
                >
                  {opt.label}
                </div>
              )}
              <div
                style={{
                  padding: '8px 10px',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                  textAlign: 'center',
                }}
              >
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── main player ──────────────────────────────────────────────────────────────
interface ExercisePlayerProps {
  slug: string;
}

type PlayerState = 'loading' | 'error' | 'active' | 'result';

export function ExercisePlayer({ slug }: ExercisePlayerProps): ReactElement {
  const t = useTranslations('learn.lesson');
  const tHud = useTranslations('learn.hud');

  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckAnswer[]>([]);

  // Per-exercise answer buffer
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  // Feedback phase (after "Проверить")
  const [feedbackPhase, setFeedbackPhase] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  // For option exercises — which indices are correct/wrong in feedback
  const [correctIdxs, setCorrectIdxs] = useState<Set<number> | null>(null);
  const [wrongIdxs, setWrongIdxs] = useState<Set<number> | null>(null);

  // Result screen
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);
  const [checkPending, setCheckPending] = useState(false);

  // Session XP counter
  const [sessionXp, setSessionXp] = useState(0);

  // XP toast
  const [xpToast, setXpToast] = useState<number | null>(null);

  // Streak celebration
  const [streakCelebration, setStreakCelebration] = useState(false);
  const prevGoalMetRef = useRef<boolean | null>(null);

  // For listen-pick/image-pick option selection
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPlayerState('loading');
    try {
      const data = await getLessonDetail(slug);
      setLesson(data);
      setPlayerState('active');
    } catch {
      setPlayerState('error');
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset per-exercise state when index changes
  useEffect(() => {
    setCurrentAnswer('');
    setSelectedOption(null);
    setFeedbackPhase(false);
    setFeedbackCorrect(null);
    setCorrectIdxs(null);
    setWrongIdxs(null);
  }, [index]);

  if (playerState === 'loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: 'var(--surface-2)',
            marginBottom: 40,
            animation: 'pulse-soft 1.4s ease-in-out infinite',
          }}
        />
        <div
          className="card"
          style={{
            height: 280,
            background: 'var(--surface-2)',
            animation: 'pulse-soft 1.4s ease-in-out infinite',
          }}
        />
      </div>
    );
  }

  if (playerState === 'error') {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center', maxWidth: 480, margin: '60px auto 0' }}>
        <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('error')}</p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────────
  if (playerState === 'result' && checkResult) {
    const passed = checkResult.passed;
    return (
      <div
        className="card fade-up"
        style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '60px auto 0' }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {passed ? '🎉' : '😅'}
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: '0 0 10px',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('resultTitle')}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
          {t('score', { score: checkResult.score })}
        </p>
        <p
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: passed ? 'var(--accent-green)' : 'var(--tertiary)',
            marginBottom: 8,
          }}
        >
          {passed ? t('passed') : t('failed')}
        </p>
        <p style={{ color: 'var(--accent-warm)', fontWeight: 700, fontSize: 17, marginBottom: 24 }}>
          🔥 {t('xpAwarded', { xp: checkResult.xp_awarded })}
        </p>
        {streakCelebration && (
          <p
            style={{
              color: 'var(--accent-green)',
              fontWeight: 700,
              marginBottom: 20,
              fontSize: 15,
              animation: 'pulse-soft 2s ease-in-out 3',
            }}
          >
            {tHud('streakGained', { streak: checkResult.stats.streak })}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/learn/path" className="btn btn-primary">
            {t('next')}
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.location.reload()}
          >
            {t('retryLesson')}
          </button>
        </div>

        <XpToast amount={xpToast} onDone={() => setXpToast(null)} />
      </div>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────────────────────────
  if (!lesson) return <></>;
  const exercises = lesson.exercises;
  const total = exercises.length;
  const current = exercises[index];
  if (!current) return <></>;

  const progressPct = ((index) / total) * 100;

  const getEffectiveAnswer = (): string => {
    if (current.type === 'listen-pick' || current.type === 'image-pick') {
      return selectedOption ?? '';
    }
    return currentAnswer;
  };

  const canCheck = (): boolean => {
    if (feedbackPhase) return false;
    const ans = getEffectiveAnswer();
    // For match type, the component calls onAnswer when done; we check if we have answer already
    if (current.type === 'match') {
      return currentAnswer === 'matched';
    }
    return ans.trim().length > 0;
  };

  const handleCheck = async () => {
    if (!canCheck()) return;

    const ans = getEffectiveAnswer();

    // Naive local feedback (will be confirmed by server on last exercise)
    // Just show "answered" state for now, real correctness comes from POST /check
    setFeedbackPhase(true);
    setFeedbackCorrect(null); // unknown until server responds

    const newAnswers: CheckAnswer[] = [
      ...answers,
      { exercise_id: current.id, answer: ans },
    ];
    setAnswers(newAnswers);

    if (index + 1 >= total) {
      // Last exercise — call check API; block Continue until resolved
      setCheckPending(true);
      try {
        const result = await checkLesson(slug, newAnswers);
        setCheckResult(result);
        setSessionXp((prev) => prev + result.xp_awarded);
        setXpToast(result.xp_awarded);

        // Check streak celebration
        if (prevGoalMetRef.current === false && result.stats.goal_met) {
          setStreakCelebration(true);
        }
        prevGoalMetRef.current = result.stats.goal_met;

        // Mark per-exercise correctness from results
        const resultMap = new Map(result.results.map((r) => [r.exercise_id, r.correct]));
        setFeedbackCorrect(resultMap.get(current.id) ?? null);
      } catch {
        // /check failed — show error state so user can retry; do NOT advance index
        setFeedbackPhase(false);
        setFeedbackCorrect(null);
        // Remove the answer we just added so user can re-check
        setAnswers(answers);
      } finally {
        setCheckPending(false);
      }
    } else {
      // Non-last exercise — optimistic (no local correctness check)
      setFeedbackCorrect(null);
    }
  };

  const handleContinue = () => {
    if (checkResult && index + 1 >= total) {
      setPlayerState('result');
      return;
    }
    setIndex((i) => i + 1);
  };

  const handleMatchAnswer = (ans: string) => {
    setCurrentAnswer(ans);
  };

  const feedbackBg = feedbackCorrect === true
    ? 'var(--accent-green-soft, rgba(34,197,94,0.1))'
    : feedbackCorrect === false
      ? 'var(--tertiary-soft, rgba(239,68,68,0.1))'
      : 'var(--surface-2)';
  const feedbackBorder = feedbackCorrect === true
    ? 'var(--accent-green)'
    : feedbackCorrect === false
      ? 'var(--tertiary)'
      : 'var(--border)';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 100 }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 12,
        }}
      >
        <Link
          href="/learn/path"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <Icon name="arrow-left" size={16} />
          {t('exit')}
        </Link>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('progress', { current: index + 1, total })}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--accent-warm)',
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          <Icon name="zap" size={14} />
          {sessionXp} XP
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'var(--surface-2)',
          overflow: 'hidden',
          marginBottom: 32,
        }}
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            borderRadius: 999,
            background: 'var(--primary)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Prompt */}
      <h2
        style={{
          fontSize: 'clamp(18px, 3vw, 24px)',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: 24,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
        }}
      >
        {current.prompt}
      </h2>

      {/* Exercise area */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        {current.type === 'match' && (
          <MatchExercise
            key={current.id}
            exercise={current}
            onAnswer={handleMatchAnswer}
            feedbackPhase={feedbackPhase}
            correct={feedbackCorrect}
          />
        )}
        {current.type === 'type' && (
          <TypeExercise
            exercise={current}
            value={currentAnswer}
            onChange={setCurrentAnswer}
            feedbackPhase={feedbackPhase}
          />
        )}
        {current.type === 'listen-pick' && (
          <ListenPickExercise
            exercise={current}
            selected={selectedOption}
            onSelect={setSelectedOption}
            feedbackPhase={feedbackPhase}
            correctAnswers={correctIdxs}
            wrongAnswers={wrongIdxs}
          />
        )}
        {current.type === 'image-pick' && (
          <ImagePickExercise
            exercise={current}
            selected={selectedOption}
            onSelect={setSelectedOption}
            feedbackPhase={feedbackPhase}
            correctAnswers={correctIdxs}
            wrongAnswers={wrongIdxs}
          />
        )}
      </div>

      {/* Feedback footer */}
      {feedbackPhase ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: feedbackBg,
            border: `2px solid ${feedbackBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            {feedbackCorrect === true
              ? `✓ ${t('correct')}`
              : feedbackCorrect === false
                ? `✗ ${t('wrong')}`
                : '…'}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={checkPending}
            onClick={handleContinue}
          >
            {checkPending ? '…' : t('continue')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canCheck()}
          onClick={() => void handleCheck()}
          style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 16, fontWeight: 700 }}
        >
          {t('check')}
        </button>
      )}

      <XpToast amount={xpToast} onDone={() => setXpToast(null)} />
    </div>
  );
}
