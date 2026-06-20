import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LearnHub } from '@/components/learn/learn-hub-page';

interface LearnPageProps {
  params: { locale: string };
}

export default async function LearnPage({ params }: LearnPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.hub');

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            margin: '0 0 6px',
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>
          {t('subtitle')}
        </p>
      </header>
      <LearnHub />
    </div>
  );
}
