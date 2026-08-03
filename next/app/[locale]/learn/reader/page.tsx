import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { TextList } from '@/components/learn/reader/text-list';

interface ReaderPageProps {
  params: { locale: string };
}

export default async function ReaderPage({
  params,
}: ReaderPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.reader');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800,
          margin: '0 0 8px',
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {t('title')}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--text-muted)',
          margin: '0 0 32px',
        }}
      >
        {t('subtitle')}
      </p>
      <TextList />
    </div>
  );
}
