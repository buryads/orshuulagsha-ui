import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PacksList } from '@/components/packs/packs-list';

export const metadata: Metadata = {
  title: 'Мои пакеты',
};

interface PacksPageProps {
  params: { locale: string };
}

export default function PacksPage({ params }: PacksPageProps) {
  setRequestLocale(params.locale);
  return <PacksList />;
}
