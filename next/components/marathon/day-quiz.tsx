'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getQuiz, postAnswers, type AnswerResult, type QuizQuestion } from '@/lib/api/events';
import { saveGuestDay } from '@/lib/marathon/guest-progress';
import { AudioButton } from './audio-button';

interface DayQuizProps {
  slug: string;
  day: number;
  signedIn: boolean;
  onSaved: () => void;
}

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; questions: QuizQuestion[] };

export function DayQuiz({ slug, day, signedIn, onSaved }: DayQuizProps): ReactElement {
  const t = useTranslations('marathon.quiz');
  const locale = useLocale();
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [later, setLater] = useState(false);

  const fetchQuiz = useCallback(() => {
    setLoad({ status: 'loading' });
    getQuiz(slug, day)
      .then((questions) => setLoad({ status: 'ready', questions }))
      .catch(() => setLoad({ status: 'error' }));
  }, [slug, day]);

  useEffect(() => {
    setPicked({});
    setResult(null);
    setSendFailed(false);
    setLater(false);
    fetchQuiz();
  }, [fetchQuiz]);

  if (load.status === 'loading') return <p style={{ color: 'var(--text-muted)' }}>…</p>;
  if (load.status === 'error') {
    return (
      <button type="button" className="btn btn-secondary" onClick={fetchQuiz}>
        {t('loadFailed')}
      </button>
    );
  }

  const { questions } = load;
  const complete = questions.length > 0 && questions.every((q) => picked[q.id]);

  const submit = async () => {
    setSending(true);
    setSendFailed(false);
    try {
      const res = await postAnswers(slug, day, picked);
      setResult(res);
      if (!signedIn && res.passed) saveGuestDay(slug, day, picked);
      if (res.saved) onSaved();
    } catch {
      setSendFailed(true);
    } finally {
      setSending(false);
    }
  };

  const retake = () => {
    setPicked({});
    setResult(null);
    setLater(false);
  };

  const next = locale ? `/${locale}/marathon` : '/marathon';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t('title')}</h3>
      {questions.map((q, i) => {
        const verdict = result?.results[q.id];
        return (
          <fieldset key={q.id} style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <legend style={{ fontWeight: 700, marginBottom: 8, padding: 0 }}>
              {i + 1}. {q.prompt}
            </legend>
            {q.audio_url && (
              <div style={{ marginBottom: 6 }}>
                <AudioButton url={q.audio_url} compact />
              </div>
            )}
            <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt) => {
                const chosen = picked[q.id] === opt;
                const isRight = !!verdict && verdict.answer === opt;
                const isWrong = !!verdict && chosen && !verdict.correct;
                return (
                  <label
                    key={opt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: `1px solid ${chosen && !result ? 'var(--primary)' : 'var(--border)'}`,
                      background: isRight ? 'var(--accent-green-soft)' : isWrong ? 'var(--tertiary-soft)' : chosen ? 'var(--primary-50)' : 'var(--surface)',
                      cursor: result ? 'default' : 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`${day}-${q.id}`}
                      checked={chosen}
                      disabled={!!result}
                      onChange={() => setPicked((p) => ({ ...p, [q.id]: opt }))}
                    />
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isRight && <span aria-hidden>✔</span>}
                    {isWrong && <span aria-hidden>✖</span>}
                  </label>
                );
              })}
            </div>
            {verdict && (
              <p role="status" style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                {verdict.correct ? `✔ ${t('correct')}` : `✔ ${t('right', { answer: verdict.answer })}`}
              </p>
            )}
          </fieldset>
        );
      })}

      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <button type="button" className="btn btn-primary" disabled={!complete || sending} onClick={submit}>
            {sending ? t('checking') : t('submit')}
          </button>
          {sendFailed && (
            <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontSize: 14 }}>
              {t('failed')}
            </p>
          )}
        </div>
      )}

      {result && (
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{t('score', { c: result.correct, t: result.total })}</p>
          {result.passed ? (
            <>
              <p role="status" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                {result.saved && result.in_streak === false ? t('passedNoStreak', { n: day }) : t('passed', { n: day })}
              </p>
              {result.saved && <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('saved')}</p>}
              {!result.saved && !signedIn && !later && (
                <>
                  <p style={{ margin: 0 }}>{t('guestSave')}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn btn-primary" href={`/signin?next=${encodeURIComponent(next)}`}>
                      {t('login')}
                    </Link>
                    <button type="button" className="btn btn-secondary" onClick={() => setLater(true)}>
                      {t('later')}
                    </button>
                  </div>
                </>
              )}
              {!result.saved && !signedIn && later && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>{t('laterNote')}</p>
              )}
            </>
          ) : (
            <p role="status" style={{ margin: 0 }}>
              {t('notPassed')}
            </p>
          )}
          <div>
            <button type="button" className="btn btn-ghost" onClick={retake} style={{ paddingLeft: 0 }}>
              {t('again')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
