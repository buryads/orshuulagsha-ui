'use client';

import { useTranslations } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import { LEARN_ENABLED } from '@/lib/learn-enabled';
import { isLearnVisible } from '@/lib/learn-access';
import { useCurrentUser } from '@/lib/use-current-user';

export function LearnGate({ children }: { children: ReactNode }): ReactElement | null {
  const t = useTranslations('common');
  const { isTeacher, ready } = useCurrentUser();
  if (LEARN_ENABLED) return <>{children}</>;
  if (!ready) return null;
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
