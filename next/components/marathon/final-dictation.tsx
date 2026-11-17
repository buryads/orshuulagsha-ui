'use client';

import { useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  getFinal,
  postFinalAnswers,
  type FinalData,
  type FinalResult,
  type MarathonEvent,
} from '@/lib/api/events';
import { formatDate } from '@/lib/marathon/days';
import { AudioButton } from './audio-button';

type Phase =
  | { name: 'intro' }
  | { name: 'loading' }
  | { name: 'loadError' }
  | { name: 'quiz'; data: FinalData; index: number; answers: Record<string, string | null> }
  | { name: 'sending'; data: FinalData; answers: Record<string, string | null> }
  | { name: 'sendError'; data: FinalData; answers: Record<string, string | null> }
  | { name: 'result'; result: FinalResult };

export function FinalDictation({ event, signedIn }: { event: MarathonEvent; signedIn: boolean }): ReactElement {
  const t = useTranslations('marathon.final');
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });

  if (!event.final.open) {
    return (
      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{t('title')}</h2>
        <p style={{ margin: 0 }}>{t('opensOn', { date: formatDate(event.final.opens_on, locale) })}</p>
      </section>
    );
  }

  const start = () => {
    setPhase({ name: 'loading' });
    getFinal(event.slug)
      .then((data) => setPhase({ name: 'quiz', data, index: 0, answers: {} }))
      .catch(() => setPhase({ name: 'loadError' }));
  };

  const send = async (data: FinalData, answers: Record<string, string | null>) => {
    setPhase({ name: 'sending', data, answers });
    try {
      const filled = Object.fromEntries(data.questions.map((q) => [q.id, answers[q.id] ?? null]));
      const result = await postFinalAnswers(event.slug, filled, data.seed);
      setPhase({ name: 'result', result });
    } catch {
      setPhase({ name: 'sendError', data, answers });
    }
  };

  const answer = (value: string | null) => {
    if (phase.name !== 'quiz') return;
    const q = phase.data.questions[phase.index];
    if (!q) return;
    const answers = { ...phase.answers, [q.id]: value };
    if (phase.index + 1 >= phase.data.questions.length) void send(phase.data, answers);
    else setPhase({ ...phase, index: phase.index + 1, answers });
  };

  const currentQuestion = phase.name === 'quiz' ? phase.data.questions[phase.index] : undefined;

  return (
    <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('title')}</h2>

      {phase.name === 'intro' && (
        <>
          <p style={{ margin: 0 }}>{t('intro')}</p>
          <div>
            <button type="button" className="btn btn-primary" onClick={start}>
              {t('start')}
            </button>
          </div>
        </>
      )}
      {phase.name === 'loading' && <p style={{ margin: 0, color: 'var(--text-muted)' }}>…</p>}
      {phase.name === 'loadError' && (
        <div>
          <button type="button" className="btn btn-secondary" onClick={start}>
            {t('loadFailed')}
          </button>
        </div>
      )}

      {phase.name === 'quiz' && currentQuestion && (
        <QuestionStep
          key={currentQuestion.id}
          total={phase.data.questions.length}
          index={phase.index}
          question={currentQuestion}
          onAnswer={answer}
        />
      )}

      {(phase.name === 'sending' || phase.name === 'sendError') && (
        <div role={phase.name === 'sendError' ? 'alert' : 'status'} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          <span>{phase.name === 'sending' ? t('sending') : t('failed')}</span>
          {phase.name === 'sendError' && (
            <button type="button" className="btn btn-secondary" onClick={() => void send(phase.data, phase.answers)}>
              {t('loadFailed')}
            </button>
          )}
        </div>
      )}

      {phase.name === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p role="status" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            {phase.result.ready
              ? t('ready', { c: phase.result.correct, t: phase.result.total })
              : t('notReady', { c: phase.result.correct, t: phase.result.total })}
          </p>
          {phase.result.best !== null && phase.result.best > phase.result.correct && (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('best', { n: phase.result.best })}</p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {event.greetings_available && (
              <Link className="btn btn-primary" href="/cards">
                {t('sendCard')}
              </Link>
            )}
            {!phase.result.saved && !signedIn && (
              <Link className="btn btn-secondary" href={`/signin?next=${encodeURIComponent(`/${locale}/marathon`)}`}>
                {t('loginSave')}
              </Link>
            )}
            <button type="button" className="btn btn-secondary" onClick={start}>
              {t('retry')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function QuestionStep({
  index,
  total,
  question,
  onAnswer,
}: {
  index: number;
  total: number;
  question: FinalData['questions'][number];
  onAnswer: (value: string | null) => void;
}): ReactElement {
  const t = useTranslations('marathon.final');
  const [picked, setPicked] = useState<string | null>(null);
  const last = index + 1 >= total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
        {t('question', { n: index + 1, total })}
      </p>
      <div>
        <AudioButton url={question.audio_url} />
      </div>
      <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {question.options.map((opt) => (
          <label
            key={opt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1px solid ${picked === opt ? 'var(--primary)' : 'var(--border)'}`,
              background: picked === opt ? 'var(--primary-50)' : 'var(--surface)',
              cursor: 'pointer',
            }}
          >
            <input type="radio" name={`final-${question.id}`} checked={picked === opt} onChange={() => setPicked(opt)} />
            {opt}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-primary" disabled={!picked} onClick={() => onAnswer(picked)}>
          {last ? t('finish') : t('next')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onAnswer(null)}>
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
