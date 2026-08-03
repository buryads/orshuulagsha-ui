import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LeaderboardView } from '@/components/learn/leaderboard';

interface LeaderboardPageProps {
  params: { locale: string };
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  // Pre-resolve translations for metadata; the client component loads its own via useTranslations.
  const t = await getTranslations('learn.leaderboard');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <LeaderboardView />
      {/* Hidden h1 for screen readers; the client component renders its own heading */}
      <h1 className="sr-only">{t('title')}</h1>
    </div>
  );
}
