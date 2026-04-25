import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PackEdit } from '@/components/packs/pack-edit';

export const metadata: Metadata = {
  title: 'Редактирование пакета',
};

interface EditPackPageProps {
  params: { locale: string; slug: string };
}

export default function EditPackPage({ params }: EditPackPageProps) {
  setRequestLocale(params.locale);
  return <PackEdit slug={params.slug} />;
}
