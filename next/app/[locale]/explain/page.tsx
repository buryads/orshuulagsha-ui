import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ExplainView } from '@/components/explain/explain-view';

export const metadata: Metadata = {
  title: 'Разбор фраз',
};

interface ExplainPageProps {
  params: { locale: string };
}

export default function ExplainPage({ params }: ExplainPageProps) {
  setRequestLocale(params.locale);
  return <ExplainView />;
}
