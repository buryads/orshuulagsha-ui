import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { WordsMatcher } from '@/components/admin/words-matcher';

export const metadata: Metadata = {
  title: 'Сопоставление слов',
};

interface AdminWordsMatcherPageProps {
  params: { locale: string };
}

export default function AdminWordsMatcherPage({
  params,
}: AdminWordsMatcherPageProps) {
  setRequestLocale(params.locale);
  return (
    <Suspense fallback={null}>
      <WordsMatcher />
    </Suspense>
  );
}
