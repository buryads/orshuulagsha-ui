// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useEffect, useMemo, useState } from 'react';
import * as user from '@/lib/api/user';
import type { TrainingPackQuiz, Word } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

interface PackQuizProps {
  packSlug: string;
}

export function PackQuiz({ packSlug }: PackQuizProps) {
  const [questions, setQuestions] = useState<TrainingPackQuiz[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    user
      .getPackQuizQuestionsBySlug(packSlug)
      .then((data) => {
        if (cancelled) return;
        setQuestions(data);
        setIndex(0);
        setPicked(null);
        setScore(0);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError('Не удалось загрузить вопросы');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [packSlug]);

  const current = questions[index];
  const total = questions.length;
  const isFinished = total > 0 && index >= total;

  const answers = useMemo<Word[]>(() => {
    if (!current) return [];
    return current.answers?.data ?? [];
  }, [current]);

  function pick(answerId: number) {
    if (picked !== null || !current) return;
    setPicked(answerId);
    if (answerId === current.correctAnswer.id) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setLoading(true);
    setError(null);
    user
      .getPackQuizQuestionsBySlug(packSlug)
      .then((data) => {
        setQuestions(data);
        setIndex(0);
        setPicked(null);
        setScore(0);
      })
      .catch((e) => {
        console.error(e);
        setError('Не удалось загрузить вопросы');
      })
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <div
        className="card"
        style={{
          padding: 32,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Загружаем вопросы...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="card"
        style={{
          padding: 24,
          background: 'var(--tertiary-soft)',
          color: 'var(--tertiary-700)',
        }}
      >
        {error}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div
        className="card"
        style={{
          padding: 32,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        В пакете недостаточно слов для тренировки.
      </div>
    );
  }

  if (isFinished) {
    const percent = Math.round((score / total) * 100);
    return (
      <div
        className="card"
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Icon name="trophy" size={40} />
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Тренировка завершена</h2>
        <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>
          Правильных ответов: <strong>{score}</strong> из{' '}
          <strong>{total}</strong> ({percent}%)
        </p>
        <button type="button" onClick={restart} className="btn btn-primary">
          <Icon name="zap" size={16} />
          Пройти ещё раз
        </button>
      </div>
    );
  }

  if (!current) return null;

  const correctId = current.correctAnswer.id;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Вопрос {index + 1} из {total}
        </span>
        <span>
          Правильно: <strong>{score}</strong>
        </span>
      </div>

      <div
        style={{
          height: 6,
          background: 'var(--surface-2)',
          borderRadius: 'var(--r-pill)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((index + 1) / total) * 100}%`,
            height: '100%',
            background: 'var(--primary)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      <div
        className="card"
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Переведите слово
        </span>
        <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>
          {current.correctAnswer.name}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {answers.map((answer) => {
          const isPicked = picked === answer.id;
          const isCorrect = answer.id === correctId;
          const showResult = picked !== null;

          let bg = 'var(--surface)';
          let color = 'var(--text)';
          let border = '1px solid var(--border)';

          if (showResult) {
            if (isCorrect) {
              bg = 'var(--accent-green-soft)';
              color = 'var(--accent-green)';
              border = '1px solid var(--accent-green)';
            } else if (isPicked) {
              bg = 'var(--tertiary-soft)';
              color = 'var(--tertiary-700)';
              border = '1px solid var(--tertiary)';
            }
          }

          const text =
            answer.ru_words?.map((w) => w.name).join(', ') || answer.name;

          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => pick(answer.id)}
              disabled={showResult}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--r-md)',
                background: bg,
                color,
                border,
                fontSize: 15,
                fontWeight: 500,
                textAlign: 'left',
                cursor: showResult ? 'default' : 'pointer',
                transition:
                  'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {text}
            </button>
          );
        })}
      </div>

      {picked !== null ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={next} className="btn btn-primary">
            {index + 1 >= total ? 'Завершить' : 'Следующий вопрос'}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
