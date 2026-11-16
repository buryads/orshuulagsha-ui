import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { HonorBoardPage } from '@/components/studio/honor-board';

export const metadata: Metadata = { title: 'Доска почёта' };

export default function StudioHonorPage({ params }: { params: { locale: string } }): ReactElement {
  setRequestLocale(params.locale);
  return <HonorBoardPage />;
}
