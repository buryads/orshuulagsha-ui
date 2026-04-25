import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { QuizPlayer } from '@/components/quiz/quiz-player';

interface QuizPageProps {
  params: { locale: string };
}

export default async function QuizPage({ params }: QuizPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('quiz');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800,
          margin: '0 0 24px',
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {t('title')}
      </h1>
      <QuizPlayer />
    </div>
  );
}
