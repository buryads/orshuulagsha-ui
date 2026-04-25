'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { getQuizQuestions } from '@/lib/api/quiz';
import type { QuizQuestion } from '@/lib/api/types';

type QuestionState = QuizQuestion & { yourAnswer?: number };

const ADVANCE_DELAY_MS = 700;

export function QuizPlayer(): ReactElement {
  const t = useTranslations('quiz');
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIndex(0);
    setSelected(null);
    try {
      const res = await getQuizQuestions();
      setQuestions(res.questions.map((q) => ({ ...q })));
    } catch {
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAnswer = (answerIdx: number) => {
    if (selected !== null) return;
    setSelected(answerIdx);
    setQuestions((qs) => {
      const next = qs.slice();
      const cur = next[index];
      if (cur) next[index] = { ...cur, yourAnswer: answerIdx };
      return next;
    });
    window.setTimeout(() => {
      setSelected(null);
      setIndex((i) => i + 1);
    }, ADVANCE_DELAY_MS);
  };

  if (loading) {
    return <Loading text={t('loading')} />;
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

  if (index >= questions.length) {
    return <Results questions={questions} onRestart={() => void load()} t={t} />;
  }

  const current = questions[index]!;
  const total = questions.length;
  const correctIdx = current.correctAnswer;
  const isAnswered = selected !== null;
  const correctSoFar = questions
    .slice(0, index)
    .filter((q) => q.yourAnswer === q.correctAnswer).length;
  const progress = ((index + (isAnswered ? 1 : 0)) / total) * 100;

  return (
    <div>
      {/* Progress row: counter on left, correct tally on right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 8,
        }}
      >
        <span>{t('progress', { current: index + 1, total })}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('correctSoFar', { count: correctSoFar })}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--surface-2)',
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        className="card fade-up"
        style={{ padding: 'clamp(28px, 4vw, 48px)', textAlign: 'center' }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text-soft)',
            marginBottom: 14,
          }}
        >
          {t('translateWord')}
        </div>
        <h2
          style={{
            fontSize: 'clamp(34px, 5vw, 56px)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {current.question}
        </h2>
      </div>

      <div className="quiz-answers">
        {current.answers.map((answer, i) => {
          const isCorrect = isAnswered && i === correctIdx;
          const isWrongPick = isAnswered && selected === i && i !== correctIdx;
          return (
            <button
              key={`${current.question}-${i}`}
              type="button"
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              style={{
                padding: '16px 18px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: isCorrect
                  ? 'var(--accent-green)'
                  : isWrongPick
                    ? 'var(--tertiary)'
                    : 'var(--surface-2)',
                color: isCorrect || isWrongPick ? 'white' : 'var(--text)',
                cursor: isAnswered ? 'default' : 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              {answer}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Loading({ text }: { text: string }): ReactElement {
  return (
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      {text}…
    </div>
  );
}

interface ResultsProps {
  questions: QuestionState[];
  onRestart: () => void;
  t: ReturnType<typeof useTranslations<'quiz'>>;
}

function Results({ questions, onRestart, t }: ResultsProps): ReactElement {
  const correct = questions.filter((q) => q.yourAnswer === q.correctAnswer).length;
  const wrong = questions.length - correct;

  return (
    <div className="card fade-up" style={{ padding: 28, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('results')}
        </h2>
        <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
            {t('correctTotal', { count: correct })}
          </span>
          {' · '}
          <span style={{ color: 'var(--tertiary)', fontWeight: 700 }}>
            {t('wrongTotal', { count: wrong })}
          </span>
        </p>
      </div>

      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {questions.map((q, i) => {
          const yourAnswer = q.yourAnswer != null ? q.answers[q.yourAnswer] : '—';
          const correctAnswer = q.answers[q.correctAnswer];
          const isCorrect = q.yourAnswer === q.correctAnswer;
          return (
            <li
              key={`${q.question}-${i}`}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                {i + 1}. {q.question}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                {t('yourAnswer')}:{' '}
                <b
                  style={{
                    color: isCorrect ? 'var(--accent-green)' : 'var(--tertiary)',
                  }}
                >
                  {yourAnswer}
                </b>
              </div>
              {!isCorrect && (
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                  {t('correctAnswer')}:{' '}
                  <b style={{ color: 'var(--accent-green)' }}>{correctAnswer}</b>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          <Icon name="play" size={14} /> {t('newGame')}
        </button>
      </div>
    </div>
  );
}
