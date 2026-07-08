import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CorpusExplorer } from '@/components/corpus/corpus-explorer';

interface CorpusPageProps {
  params: { locale: string };
}

export default function CorpusPage({ params }: CorpusPageProps): ReactElement {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <CorpusExplorer />
    </div>
  );
}
