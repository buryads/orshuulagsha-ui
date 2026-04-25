import { Suspense, type ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/hero';
import { TranslatorPanel } from '@/components/home/translator-panel';
import { PublicPacks } from '@/components/home/public-packs';
import { DiscordCta } from '@/components/home/discord-cta';

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);

  return (
    <div className="fade-up">
      <Hero>
        {/* TranslatorPanel reads useSearchParams; Suspense lets the page
            statically pre-render the rest while the panel hydrates client-side. */}
        <Suspense fallback={null}>
          <TranslatorPanel />
        </Suspense>
      </Hero>
      <PublicPacks />
      <DiscordCta />
    </div>
  );
}
