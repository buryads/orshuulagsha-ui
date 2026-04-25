import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { LearnHub } from '@/components/learn/learn-hub';

interface LearnPageProps {
  params: { locale: string };
}

export default function LearnPage({ params }: LearnPageProps): ReactElement {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
      <LearnHub />
    </div>
  );
}
