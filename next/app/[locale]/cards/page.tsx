import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CardsBuilder } from '@/components/cards/cards-builder';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'cards' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default function CardsPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <CardsBuilder />;
}
