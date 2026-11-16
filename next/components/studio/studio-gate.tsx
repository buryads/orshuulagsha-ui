'use client';

import type { ReactElement, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StudioMe } from '@/lib/api/studio';
import { useStudioAccess } from './use-studio-access';

export function StudioGate({ children }: { children: (me: StudioMe) => ReactNode }): ReactElement {
  const t = useTranslations('studio.gate');
  const access = useStudioAccess();
  const box = (body: ReactNode, testId: string): ReactElement => (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }} data-testid={testId}>
      <div className="card" style={{ padding: 24, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        {body}
      </div>
    </div>
  );
  switch (access.state) {
    case 'loading':
      return box(<p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('loading')}</p>, 'studio-loading');
    case 'guest':
      return box(
        <>
          <p style={{ marginTop: 0 }}>{t('guest')}</p>
          <Link href="/signin" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            {t('signin')}
          </Link>
        </>,
        'studio-guest',
      );
    case 'denied':
      return box(<p style={{ margin: 0 }}>{t('denied')}</p>, 'studio-denied');
    case 'error':
      return box(<p style={{ margin: 0 }}>{t('error')}</p>, 'studio-error');
    case 'ok':
      return <>{children(access.me)}</>;
  }
}
