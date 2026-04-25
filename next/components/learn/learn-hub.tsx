// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { DailyMission } from './daily-mission';
import { QuickActivities } from './quick-activities';
import { CourseGrid } from './course-grid';
import { FlashcardMode } from './flashcard-mode';
import { QuizMode } from './quiz-mode';

export type LearnMode = 'hub' | 'flashcards' | 'quiz';

interface TabDef {
  id: LearnMode;
  label: string;
}

const TABS: readonly TabDef[] = [
  { id: 'hub', label: 'Обзор' },
  { id: 'flashcards', label: 'Флешкарты' },
  { id: 'quiz', label: 'Квиз' },
];

export function LearnHub(): ReactElement {
  const [mode, setMode] = useState<LearnMode>('hub');

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Обучение
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          Учись играя · уровень <b>A2 → B1</b> · сегодня осталось{' '}
          <b>3 урока</b>
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => {
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className="btn"
              style={{
                background: active
                  ? 'var(--neutral-900)'
                  : 'var(--surface)',
                color: active ? 'var(--text-inv)' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {mode === 'hub' && (
        <div className="fade-up">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <DailyMission onContinue={() => setMode('flashcards')} />
            <QuickActivities onSelect={(m) => setMode(m)} />
          </div>
          <CourseGrid />
        </div>
      )}

      {mode === 'flashcards' && (
        <FlashcardMode onDone={() => setMode('hub')} />
      )}

      {mode === 'quiz' && <QuizMode onDone={() => setMode('hub')} />}
    </div>
  );
}
