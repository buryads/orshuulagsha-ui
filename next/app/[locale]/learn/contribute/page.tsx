import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ContributionForm } from '@/components/contrib/contribution-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Contribute' };
}

interface ContributePageProps {
  params: { locale: string };
}

export default async function ContributePage({
  params,
}: ContributePageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.contrib');

  return (
    <div
      className="container fade-up"
      style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 640 }}
    >
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
          }}
        >
          {t('pageTitle')}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>
          {t('pageSubtitle')}
        </p>
      </header>

      <ContributionForm />
    </div>
  );
}
