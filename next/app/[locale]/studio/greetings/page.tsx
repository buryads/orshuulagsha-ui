import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { StudioGreetingsPage } from '@/components/studio/studio-pages';

export const metadata: Metadata = { title: 'Благопожелания' };

export default function GreetingsPage({ params }: { params: { locale: string } }): ReactElement {
  setRequestLocale(params.locale);
  return <StudioGreetingsPage />;
}
