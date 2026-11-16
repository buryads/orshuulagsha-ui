'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { ReactElement, ReactNode } from 'react';
import { LEARN_ENABLED } from '@/lib/learn-enabled';
import { isLearnVisible } from '@/lib/learn-access';
import { useCurrentUser } from '@/lib/use-current-user';

export function LearnGate({ children }: { children: ReactNode }): ReactElement | null {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const { signedIn, isTeacher, ready, error } = useCurrentUser();
  const redirectToSignin = !LEARN_ENABLED && ready && !signedIn;
  useEffect(() => {
    if (redirectToSignin) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
  }, [redirectToSignin, router, pathname]);
  if (LEARN_ENABLED) return <>{children}</>;
  if (!ready || redirectToSignin) return null;
  if (error) {
    return (
      <div className="container" style={{ paddingTop: 64, paddingBottom: 64, textAlign: 'center' }} data-testid="learn-gate-error">
        <p style={{ color: 'var(--text-muted)' }}>{t('tryAgain')}</p>
      </div>
    );
  }
  if (!isLearnVisible(LEARN_ENABLED, isTeacher)) {
    return (
      <div className="container" style={{ paddingTop: 64, paddingBottom: 64, textAlign: 'center' }} data-testid="learn-not-found">
        <h1 style={{ margin: 0 }}>404</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('notFound')}</p>
      </div>
    );
  }
  return <>{children}</>;
}
