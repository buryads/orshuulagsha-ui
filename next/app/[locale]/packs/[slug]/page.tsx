import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PackDetail } from '@/components/packs/pack-detail';

export const metadata: Metadata = {
  title: 'Пакет',
};

interface PackPageProps {
  params: { locale: string; slug: string };
}

export default function PackPage({ params }: PackPageProps) {
  setRequestLocale(params.locale);
  return <PackDetail slug={params.slug} />;
}
