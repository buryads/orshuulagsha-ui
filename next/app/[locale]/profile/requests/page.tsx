import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MyRequests } from '@/components/profile/my-requests';

interface RequestsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: RequestsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'ask' });
  return { title: t('page.title') };
}

export default function RequestsPage({ params }: RequestsPageProps) {
  setRequestLocale(params.locale);
  return <MyRequests />;
}
