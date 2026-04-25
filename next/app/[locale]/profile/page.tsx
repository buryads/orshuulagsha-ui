import { redirect } from '@/i18n/navigation';

interface ProfilePageProps {
  params: { locale: string };
}

// Profile UI is unfinished — bounce to /packs which is the actual landing
// page after sign-in. Restore the real profile when ProfileCover/Stats/Tabs
// are wired to backend data.
export default function ProfilePage({ params }: ProfilePageProps) {
  redirect({ href: '/packs', locale: params.locale });
}
