import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { StudioBoardPage } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'Студия' };

export default function StudioPage({ params }: { params: { locale: string } }): ReactElement {
  setRequestLocale(params.locale);
  return <StudioBoardPage />;
}
