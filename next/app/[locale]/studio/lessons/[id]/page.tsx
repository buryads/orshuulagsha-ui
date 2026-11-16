import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { StudioLessonPage as Page } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'Студия' };

export default function StudioLessonPage({ params }: { params: { locale: string; id: string } }): ReactElement {
  setRequestLocale(params.locale);
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <Page id={id} />;
}
