// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import * as quiz from '@/lib/api/quiz';
import type { QuizQuestion } from '@/lib/api/types';

interface QuizModeProps {
  onDone: () => void;
}

const FALLBACK_QUESTIONS: readonly QuizQuestion[] = [
  {
    question: 'Морин',
    answers: ['река', 'лошадь', 'степь', 'юрта'],
    correctAnswer: 1,
  },
  {
    question: 'Уһан',
    answers: ['огонь', 'вода', 'небо', 'земля'],
    correctAnswer: 1,
  },
  {
    question: 'Гэр',
    answers: ['лес', 'дорога', 'дом', 'река'],
    correctAnswer: 2,
  },
  {
    question: 'Эжы',
    answers: ['брат', 'дед', 'мама', 'сестра'],
    correctAnswer: 2,
  },
  {
    question: 'Үдэр',
    answers: ['ночь', 'утро', 'вечер', 'день'],
    correctAnswer: 3,
  },
];

const LETTERS = ['А', 'Б', 'В', 'Г'] as const;
const TIMER_LABEL = '0:18';

export function QuizMode({ onDone }: QuizModeProps): ReactElement {
  const [questions, setQuestions] = useState<readonly QuizQuestion[]>(
    FALLBACK_QUESTIONS,
  );
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await quiz.getQuizQuestions();
        if (!cancelled && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = questions.length;
  const current = questions[idx];
  const correct = current?.correctAnswer ?? 0;
  const opts = current?.answers ?? [];

  const onPick = (i: number): void => {
    if (picked !== null) return;
    setPicked(i);
    if (i === correct) setScore((s) => s + 1);
  };

  const next = (): void => {
    setPicked(null);
    setIdx((prev) => (prev + 1) % total);
  };

  const progressPct = total > 0 ? ((idx + 1) / total) * 100 : 0;

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <button onClick={onDone} className="btn btn-ghost">
          <Icon name="arrow-left" size={14} /> Выйти
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Вопрос {idx + 1} из {total}
          {score > 0 && ` · ${score} верных`}
        </span>
        <span className="chip chip-warm">
          <Icon name="clock" size={12} /> {TIMER_LABEL}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--surface-2)',
          borderRadius: 999,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'var(--accent-warm)',
            borderRadius: 999,
            transition: 'width 0.3s',
          }}
        />
      </div>

      <div className="card" style={{ padding: 32, marginBottom: 16 }}>
        <span className="chip chip-primary" style={{ marginBottom: 18 }}>
          Перевод с бурятского
        </span>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          {loading && questions === FALLBACK_QUESTIONS
            ? '…'
            : current?.question ?? ''}
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            margin: '0 auto',
            padding: '8px 14px',
            borderRadius: 999,
            background: 'var(--surface-2)',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <Icon name="volume" size={12} /> Послушать произношение
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 10,
        }}
      >
        {opts.map((o, i) => {
          const isPicked = picked === i;
          const isRight = picked !== null && i === correct;
          const isWrong = isPicked && i !== correct;
          let bg = 'var(--surface)';
          let color = 'var(--text)';
          let border = '1px solid var(--border)';
          if (isRight) {
            bg = 'var(--accent-green-soft)';
            color = '#2D6448';
            border = '2px solid var(--accent-green)';
          }
          if (isWrong) {
            bg = 'var(--tertiary-soft)';
            color = 'var(--tertiary-700)';
            border = '2px solid var(--tertiary)';
          }
          const letter = LETTERS[i] ?? String(i + 1);
          return (
            <button
              key={`${idx}-${i}`}
              onClick={() => onPick(i)}
              disabled={picked !== null}
              className="card"
              style={{
                padding: 22,
                textAlign: 'left',
                cursor: picked !== null ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: bg,
                color,
                border,
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              >
                {letter}
              </span>
              <span
                style={{ fontSize: 17, fontWeight: 600, flex: 1 }}
              >
                {o}
              </span>
              {isRight && <Icon name="check" size={20} stroke={3} />}
              {isWrong && <Icon name="x" size={20} stroke={3} />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          className="card fade-up"
          style={{
            marginTop: 16,
            padding: 18,
            background:
              picked === correct
                ? 'var(--accent-green-soft)'
                : 'var(--tertiary-soft)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Icon
            name={picked === correct ? 'check' : 'lightbulb'}
            size={24}
            style={{
              color:
                picked === correct ? '#2D6448' : 'var(--tertiary-700)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color:
                  picked === correct
                    ? '#2D6448'
                    : 'var(--tertiary-700)',
              }}
            >
              {picked === correct ? 'Верно! +12 XP' : 'Не совсем'}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              Правильный ответ: «{opts[correct]}».
            </div>
          </div>
          <button onClick={next} className="btn btn-primary">
            Дальше →
          </button>
        </div>
      )}
    </div>
  );
}
