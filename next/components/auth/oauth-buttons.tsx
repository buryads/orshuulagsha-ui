'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getOAuthProviders, startOAuth, type OAuthProvider } from '@/lib/api/oauth';

const ERROR_KEYS = ['cancelled', 'no_email', 'email_conflict'];

const LOGOS: Record<OAuthProvider, ReactNode> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.7c1.300 0 2.100-1.200 2.900-2.300.9-1.300 1.300-2.600 1.300-2.700 0 0-2.400-.9-2.400-3.500zM14 5.500c.7-.8 1.100-1.900 1-3-1 0-2.100.7-2.800 1.500-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.6 2.800-1.400z"
      />
    </svg>
  ),
};

export function OAuthButtons() {
  const t = useTranslations('oauth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const errorCode = searchParams.get('error');
  const error = errorCode
    ? t(`errors.${ERROR_KEYS.includes(errorCode) ? errorCode : 'failed'}`)
    : null;

  const [providers, setProviders] = useState<OAuthProvider[]>([]);

  useEffect(() => {
    getOAuthProviders().then(setProviders);
  }, []);

  return (
    <>
      {error ? (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: 'var(--tertiary-soft)',
            color: 'var(--tertiary-700)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      ) : null}

      {providers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            {t('or')}
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          {providers.map((provider) => (
            <button
              key={provider}
              type="button"
              className="btn"
              style={{ width: '100%', height: 44, gap: 10 }}
              onClick={() => startOAuth(provider, locale, next)}
            >
              {LOGOS[provider]}
              {t(provider)}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
