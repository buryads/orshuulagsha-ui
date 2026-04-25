import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PackDetail } from '@/components/packs/pack-detail';

export const metadata: Metadata = {
  title: 'Публичный пакет',
};

interface PublicPackPageProps {
  params: { locale: string; slug: string };
}

export default function PublicPackPage({ params }: PublicPackPageProps) {
  setRequestLocale(params.locale);
  return <PackDetail slug={params.slug} publicView />;
}
