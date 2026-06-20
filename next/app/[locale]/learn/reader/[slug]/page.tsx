import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ReaderView } from '@/components/learn/reader/reader-view';

interface ReaderTextPageProps {
  params: { locale: string; slug: string };
}

export default function ReaderTextPage({
  params,
}: ReaderTextPageProps): ReactElement {
  setRequestLocale(params.locale);

  return <ReaderView slug={params.slug} />;
}
