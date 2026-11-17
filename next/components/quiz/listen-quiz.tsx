'use client';

import { useCallback, useEffect, useReducer, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import {
  getListenSeries,
  isExpiredAnswer,
  postListenAnswer,
  type ListenAnswerInput,
} from '@/lib/api/quiz';
import type { ListenItem, ListenSeriesMeta } from '@/lib/api/types';
import { getListenSessionId } from '@/lib/quiz/listen-session';
import {
  EMPTY_SERIES,
  canPickCantHear,
  isSeriesFinished,
  seriesReducer,
  summarizeSeries,
  type Pending,
  type SeriesState,
  type Step,
} from '@/lib/quiz/listen-series';

type View = 'loading' | 'error' | 'empty' | 'series';
type Translator = ReturnType<typeof useTranslations<'quiz.listen'>>;

export function ListenQuiz({ onSwitchToWords }: { onSwitchToWords: () => void }): ReactElement {
  const t = useTranslations('quiz.listen');
  const [session, setSession] = useState<string | null>(null);
  const [view, setView] = useState<View>('loading');
  const [meta, setMeta] = useState<ListenSeriesMeta | null>(null);
  const [series, dispatch] = useReducer(seriesReducer, EMPTY_SERIES);

  const startSeries = useCallback(async (sid: string) => {
    setView('loading');
    try {
      const res = await getListenSeries(sid);
      if (!res.meta.available || res.items.length === 0) {
        setMeta(res.meta);
        setView('empty');
        return;
      }
      dispatch({ type: 'start', items: res.items });
      setView('series');
    } catch {
      setView('error');
    }
  }, []);

  useEffect(() => {
    const sid = getListenSessionId();
    setSession(sid);
    void startSeries(sid);
  }, [startSeries]);

  const restart = () => {
    if (session) void startSeries(session);
  };

  const send = async (pending: Pending) => {
    const current = series.items[series.index];
    if (!session || !current) return;
    if (series.step.status !== 'asking' && series.step.status !== 'failed') return;
    if (pending.kind === 'cant_hear' && !canPickCantHear(series.verdicts)) return;
    dispatch({ type: 'pick', pending });
    try {
      const result = await postListenAnswer(toAnswerInput(session, current.token, pending));
      dispatch({ type: 'answered', result });
    } catch (err) {
      dispatch({ type: 'failed', expired: isExpiredAnswer(err) });
    }
  };

  const wordsLink = (
    <div style={{ marginTop: 24, textAlign: 'center' }}>
      <button type="button" className="btn btn-secondary" onClick={onSwitchToWords}>
        {t('wordsLink')}
      </button>
    </div>
  );

  if (view === 'loading') {
    return (
      <div
        className="card"
        style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}
      >
        {t('loading')}
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div>
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('loadError')}</p>
          <button type="button" className="btn btn-secondary" onClick={restart}>
            {t('reload')}
          </button>
        </div>
        {wordsLink}
      </div>
    );
  }

  if (view === 'empty' && meta) {
    return (
      <div>
        <div
          className="card"
          style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}
        >
          {t('empty', { eligible: meta.eligible, min: meta.min })}
        </div>
        {wordsLink}
      </div>
    );
  }

  if (isSeriesFinished(series)) {
    return (
      <div>
        <Summary verdicts={series.verdicts} onNewSeries={restart} t={t} />
        {wordsLink}
      </div>
    );
  }

  const item = series.items[series.index];
  if (!item) return <div />;

  return (
    <div>
      <Question
        key={series.index}
        item={item}
        index={series.index}
        total={series.items.length}
        step={series.step}
        canCantHear={canPickCantHear(series.verdicts)}
        onPick={send}
        onNext={() => dispatch({ type: 'next' })}
        onAudioError={() => dispatch({ type: 'audioFailed' })}
        t={t}
      />
      {wordsLink}
    </div>
  );
}

function toAnswerInput(session: string, token: string, pending: Pending): ListenAnswerInput {
  if (pending.kind === 'choice') return { session, token, choice: pending.choice };
  if (pending.kind === 'cant_hear') return { session, token, cant_hear: true };
  return { session, token, dont_know: true };
}

interface QuestionProps {
  item: ListenItem;
  index: number;
  total: number;
  step: Step;
  canCantHear: boolean;
  onPick: (pending: Pending) => void;
  onNext: () => void;
  onAudioError: () => void;
  t: Translator;
}

function Question({
  item,
  index,
  total,
  step,
  canCantHear,
  onPick,
  onNext,
  onAudioError,
  t,
}: QuestionProps): ReactElement {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isAsking = step.status === 'asking';
  const pickedChoice =
    step.status === 'sending' || step.status === 'failed' || step.status === 'revealed'
      ? step.pending.kind === 'choice'
        ? step.pending.choice
        : null
      : null;
  const revealed = step.status === 'revealed' ? step.result : null;
  const revealedKind = step.status === 'revealed' ? step.pending.kind : null;

  const play = (fromStart: boolean) => {
    const el = audioRef.current;
    if (!el) return;
    if (fromStart) el.currentTime = 0;
    void el.play().catch(() => undefined);
  };

  const progressText = t('progress', { current: index + 1, total });

  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-valuetext={progressText}
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--surface-2)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((index + (revealed || step.status === 'audioFailed' || (step.status === 'failed' && step.expired) ? 1 : 0)) / total) * 100}%`,
            background: 'var(--primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{progressText}</p>

      <audio ref={audioRef} src={item.audioUrl} preload="none" onError={onAudioError} />

      <div
        className="card fade-up"
        style={{ padding: 'clamp(24px, 4vw, 40px)', textAlign: 'center' }}
      >
        {step.status === 'audioFailed' ? (
          <>
            <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('audioError')}</p>
            <button type="button" className="btn btn-primary" onClick={onNext}>
              {t('nextQuestion')}
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <button type="button" className="btn btn-primary" onClick={() => play(false)}>
                <Icon name="play" size={14} /> {t('listen')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => play(true)}>
                {t('replay')}
              </button>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              {t('question')}
            </p>

            <div className="quiz-answers">
              {item.options.map((option, i) => {
                const isCorrect = revealed !== null && i === revealed.correctIndex;
                const isWrongPick = revealed !== null && i === pickedChoice && !isCorrect;
                const isPicked = pickedChoice === i && !revealed;
                return (
                  <button
                    key={`${item.token}-${i}`}
                    type="button"
                    onClick={() => onPick({ kind: 'choice', choice: i })}
                    disabled={!isAsking}
                    style={{
                      padding: '16px 18px',
                      fontSize: 15,
                      fontWeight: 600,
                      borderRadius: 14,
                      border: isPicked ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isCorrect
                        ? 'var(--accent-green)'
                        : isWrongPick
                          ? 'var(--tertiary)'
                          : 'var(--surface-2)',
                      color: isCorrect || isWrongPick ? 'white' : 'var(--text)',
                      cursor: isAsking ? 'pointer' : 'default',
                      textAlign: 'left',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isAsking && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: 20,
                }}
              >
                {canCantHear ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onPick({ kind: 'cant_hear' })}
                  >
                    {t('cantHear')}
                  </button>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('cantHearLimit')}</p>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onPick({ kind: 'dont_know' })}
                >
                  {t('dontKnow')}
                </button>
              </div>
            )}

            {step.status === 'failed' && step.expired && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'var(--tertiary)', marginBottom: 12 }}>{t('answerExpired')}</p>
                <button type="button" className="btn btn-primary" onClick={onNext}>
                  {t('nextQuestion')}
                </button>
              </div>
            )}
            {step.status === 'failed' && !step.expired && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'var(--tertiary)', marginBottom: 12 }}>{t('answerError')}</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onPick(step.pending)}
                >
                  {t('retry')}
                </button>
              </div>
            )}

            {revealed && (
              <div style={{ marginTop: 20 }} role="status">
                {revealedKind === 'cant_hear' && (
                  <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{t('thanks')}</p>
                )}
                {revealedKind === 'choice' && revealed.correct ? (
                  <p style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{t('correct')}</p>
                ) : (
                  <p style={{ color: 'var(--text)', fontWeight: 600 }}>
                    {t('correctAnswer', { text: revealed.correctText })}
                  </p>
                )}
                {revealed.ru && (
                  <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{revealed.ru}</p>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onNext}
                  style={{ marginTop: 16 }}
                >
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface SummaryProps {
  verdicts: SeriesState['verdicts'];
  onNewSeries: () => void;
  t: Translator;
}

function Summary({ verdicts, onNewSeries, t }: SummaryProps): ReactElement {
  const s = summarizeSeries(verdicts);
  return (
    <div
      className="card fade-up"
      style={{ padding: 28, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          margin: 0,
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {t('score', { correct: s.correct, scored: s.scored })}
        {s.cantHear > 0 && ` ${t('cantHearSuffix', { count: s.cantHear })}`}
      </h2>
      <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>
        {t('listened', { count: s.listened })}
      </p>
      <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-soft)' }}>{t('privacy')}</p>
      <div style={{ marginTop: 22 }}>
        <button type="button" className="btn btn-primary" onClick={onNewSeries}>
          <Icon name="play" size={14} /> {t('newSeries')}
        </button>
      </div>
    </div>
  );
}
