import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { StudioEventPage } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'Событие' };

export default function EventPage({
  params,
}: {
  params: { locale: string; id: string };
}): ReactElement {
  setRequestLocale(params.locale);
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <StudioEventPage id={id} />;
}
