import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import * as user from '@/lib/api/user';
import type { IUser } from '@/lib/api/types';
import { ProfileCover } from '@/components/profile/profile-cover';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { DEMO_USER } from '@/components/profile/demo-data';

interface DisplayUser {
  name: string;
  email: string;
  dialect?: string;
  level?: string;
  joined?: string;
}

function toDisplayUser(u: IUser | null): DisplayUser {
  if (!u) return DEMO_USER;
  return {
    name: u.name,
    email: u.email,
    dialect: DEMO_USER.dialect,
    level: DEMO_USER.level,
    joined: DEMO_USER.joined,
  };
}

interface ProfilePageProps {
  params: { locale: string };
}

export default async function ProfilePage({
  params,
}: ProfilePageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const fetchedUser: IUser | null = await user.getUser().catch(() => null);
  const displayUser = toDisplayUser(fetchedUser);

  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
      <ProfileCover user={displayUser} />
      <ProfileStats />
      <ProfileTabs />
    </div>
  );
}
