import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SkillTree } from '@/components/learn/skill-tree';

interface LearnPathPageProps {
  params: { locale: string };
}

export default async function LearnPathPage({ params }: LearnPathPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('learn.tree');

  return (
    <div className="container fade-up" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800,
          margin: '0 0 32px',
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
          textAlign: 'center',
        }}
      >
        {t('title')}
      </h1>
      <SkillTree />
    </div>
  );
}
