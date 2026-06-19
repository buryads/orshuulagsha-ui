import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SrsSession } from '@/components/learn/srs-session';

interface LearnPageProps {
  params: { locale: string };
}

export default async function LearnPage({ params }: LearnPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.srs');

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
      <SrsSession />
    </div>
  );
}
