import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CorpusExplorer } from '@/components/corpus/corpus-explorer';

interface CorpusPageProps {
  params: { locale: string };
  searchParams: { q?: string };
}

export default function CorpusPage({ params, searchParams }: CorpusPageProps): ReactElement {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <CorpusExplorer initialQuery={searchParams.q} />
    </div>
  );
}
