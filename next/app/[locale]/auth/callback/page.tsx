'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { exchangeOAuthCode } from '@/lib/api/oauth';
import * as user from '@/lib/api/user';

function Callback() {
  const t = useTranslations('oauth');
  const locale = useLocale();
  const code = useSearchParams().get('code');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fail = () =>
      window.location.assign(`/${locale}/signin?error=failed`);
    if (!code) return fail();
    exchangeOAuthCode(code)
      .then(async (next) => {
        await user.getUser().catch(() => undefined);
        window.location.assign(next ?? `/${locale}/packs`);
      })
      .catch(fail);
  }, [code, locale]);

  return (
    <p style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      {t('signingIn')}
    </p>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
