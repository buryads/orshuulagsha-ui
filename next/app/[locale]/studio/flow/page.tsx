import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { StudioFlowPage } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'Поток' };

export default function StudioFlowRoute({ params }: { params: { locale: string } }): ReactElement {
  setRequestLocale(params.locale);
  return <StudioFlowPage />;
}
