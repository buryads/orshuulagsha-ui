import { Suspense, type ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LeaderboardView } from '@/components/learn/leaderboard';

interface LeaderboardPageProps {
  params: { locale: string };
}

/** Skeleton shown while LeaderboardView (which calls useSearchParams) hydrates. */
function LeaderboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 680, margin: '0 auto' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 52,
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-2)',
            animation: 'pulse-soft 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  // Pre-resolve translations for metadata; the client component loads its own via useTranslations.
  const t = await getTranslations('learn.leaderboard');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Suspense boundary required: LeaderboardView calls useSearchParams() which
          opts the subtree out of static prerendering in Next 14. */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardView />
      </Suspense>
      {/* Hidden h1 for screen readers; the client component renders its own heading */}
      <h1 className="sr-only">{t('title')}</h1>
    </div>
  );
}
