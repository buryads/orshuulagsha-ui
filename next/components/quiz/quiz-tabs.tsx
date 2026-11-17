'use client';

import { useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { ListenQuiz } from '@/components/quiz/listen-quiz';
import { QuizPlayer } from '@/components/quiz/quiz-player';

type Tab = 'words' | 'listen';

const TABS: Tab[] = ['words', 'listen'];

export function QuizTabs(): ReactElement {
  const t = useTranslations('quiz');
  const [tab, setTab] = useState<Tab>('words');

  return (
    <div>
      <div
        role="tablist"
        aria-label={t('title')}
        style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`quiz-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="quiz-tabpanel"
            className={tab === id ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setTab(id)}
          >
            {id === 'words' ? t('tabWords') : t('tabListen')}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="quiz-tabpanel" aria-labelledby={`quiz-tab-${tab}`}>
        {tab === 'words' ? <QuizPlayer /> : <ListenQuiz onSwitchToWords={() => setTab('words')} />}
      </div>
    </div>
  );
}
