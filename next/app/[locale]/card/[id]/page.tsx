import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CardView } from '@/components/cards/card-view';
import { loadCard } from '@/lib/cards/load-card';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'cards.card' });
  const ru = (await loadCard(params.id))?.ru;
  const title = ru ? `${t('metaTitle')}: ${ru}` : t('metaTitle');
  return { title, openGraph: { title }, robots: { index: false }, twitter: { card: 'summary_large_image', title } };
}

export default function CardPage({ params }: { params: { locale: string; id: string } }) {
  setRequestLocale(params.locale);
  return <CardView id={params.id} />;
}
