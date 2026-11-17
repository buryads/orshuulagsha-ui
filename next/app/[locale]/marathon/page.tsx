import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MarathonView } from '@/components/marathon/marathon-view';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'marathon' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default function MarathonPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <MarathonView />;
}
