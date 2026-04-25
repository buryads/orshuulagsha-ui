import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Categories } from '@/components/home/categories';
import { CulturalBanner } from '@/components/home/cultural-banner';
import { Hero } from '@/components/home/hero';
import { LiveFeed } from '@/components/home/live-feed';
import { StreakCard } from '@/components/home/streak-card';
import { TranslationResults } from '@/components/home/translation-results';
import { Translator } from '@/components/home/translator';
import { WordOfTheDay } from '@/components/home/word-of-the-day';

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);

  return (
    <div className="fade-up">
      <Hero>
        <Translator />
        <TranslationResults />
      </Hero>

      <section style={{ padding: '20px 28px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          <WordOfTheDay />
          <StreakCard />
          <LiveFeed />
        </div>
      </section>

      <Categories />
      <CulturalBanner />
    </div>
  );
}
