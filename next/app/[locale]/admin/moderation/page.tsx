import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ModerationPanel } from '@/components/contrib/moderation-panel';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Moderation' };
}

interface ModerationPageProps {
  params: { locale: string };
}

export default async function ModerationPage({
  params,
}: ModerationPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('moderation');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 40 }}>
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

      <ModerationPanel />
    </div>
  );
}
