import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { StudioEventsPage } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'События' };

export default function EventsPage({ params }: { params: { locale: string } }): ReactElement {
  setRequestLocale(params.locale);
  return <StudioEventsPage />;
}
