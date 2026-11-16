import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ExercisePlayer } from '@/components/learn/exercise-player';

interface LessonPageProps {
  params: { locale: string; slug: string };
}

export default async function LessonPage({ params }: LessonPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.lesson');

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <h1 className="sr-only">{t('loading')}</h1>
      <ExercisePlayer slug={params.slug} />
    </div>
  );
}
