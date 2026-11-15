import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileAccount } from '@/components/profile/profile-account';

interface ProfilePageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'account',
  });
  return { title: t('title'), robots: { index: false } };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  setRequestLocale(params.locale);
  return <ProfileAccount />;
}
