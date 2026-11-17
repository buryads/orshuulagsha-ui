import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { UnsubscribeView } from '@/components/auth/unsubscribe-view';

export const metadata: Metadata = {
  title: 'Отписка — Orshuulagsha',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <Suspense fallback={null}>
      <UnsubscribeView />
    </Suspense>
  );
}
