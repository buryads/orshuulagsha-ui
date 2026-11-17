'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { signOut } from '@/lib/api/auth';
import * as user from '@/lib/api/user';
import type { IUser } from '@/lib/api/types';
import { EmailNotifications } from './email-notifications';

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 600, wordBreak: 'break-word' }}>
        {value ?? '…'}
      </span>
    </div>
  );
}

function ActionRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{hint}</div>
      </div>
      {children}
    </div>
  );
}

export function ProfileAccount() {
  const t = useTranslations('account');
  const locale = useLocale();
  const [me, setMe] = useState<IUser | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    user
      .getUser()
      .then(setMe)
      .catch(() => setFailed(true));
  }, []);

  return (
    <div
      className="container fade-up"
      style={{
        paddingTop: 32,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 800,
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {t('title')}
      </h1>

      <section
        className="card"
        style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <Field label={t('name')} value={me?.name ?? (failed ? '—' : undefined)} />
        <Field label={t('email')} value={me?.email ?? (failed ? '—' : undefined)} />
      </section>

      <EmailNotifications />

      <section
        className="card"
        style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <ActionRow title={t('mcpTitle')} hint={t('mcpHint')}>
          <Link
            href="/profile/mcp"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Icon name="lock" size={16} />
            {t('mcpTitle')}
          </Link>
        </ActionRow>
        <ActionRow title={t('changePassword')} hint={t('changePasswordHint')}>
          <Link
            href="/forgot-password"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            {t('changePassword')}
          </Link>
        </ActionRow>
        <ActionRow title={t('logout')} hint={t('logoutHint')}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => signOut(locale)}
          >
            {t('logout')}
          </button>
        </ActionRow>
      </section>
    </div>
  );
}
