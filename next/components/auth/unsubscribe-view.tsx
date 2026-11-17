'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/brand/logo';
import { Link } from '@/i18n/navigation';
import {
  isEmailCategory,
  resubscribe,
  unsubscribe,
} from '@/lib/api/email-preferences';

import { AuthCard } from './auth-card';

type Step = 'confirm' | 'unsubscribed' | 'resubscribed' | 'invalid';

export function UnsubscribeView() {
  const t = useTranslations('unsubscribe');
  const params = useSearchParams();
  const u = params.get('u');
  const c = params.get('c');
  const s = params.get('s');
  const valid = Boolean(u && s && isEmailCategory(c));
  const [step, setStep] = useState<Step>(valid ? 'confirm' : 'invalid');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function run(action: typeof unsubscribe, next: Step): Promise<void> {
    if (!u || !c || !s) return;
    setBusy(true);
    setError(false);
    try {
      await action(u, c, s);
      setStep(next);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 403) setStep('invalid');
      else setError(true);
    } finally {
      setBusy(false);
    }
  }

  const label = isEmailCategory(c) ? t(`categories.${c}`) : '';

  const heading = {
    confirm: t('confirmTitle', { category: label }),
    unsubscribed: t('doneTitle', { category: label }),
    resubscribed: t('resubscribedTitle'),
    invalid: t('invalidTitle'),
  }[step];

  return (
    <AuthCard>
      <Logo size={28} />
      <h1
        style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}
        data-testid="unsubscribe-heading"
      >
        {heading}
      </h1>

      {step === 'invalid' ? (
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('invalidHint')}</p>
      ) : null}

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
          {t('error')}
        </div>
      ) : null}

      {step === 'confirm' ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', height: 44 }}
          disabled={busy}
          onClick={() => void run(unsubscribe, 'unsubscribed')}
        >
          {t('unsubscribe')}
        </button>
      ) : null}

      {step === 'unsubscribed' ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', height: 44 }}
          disabled={busy}
          onClick={() => void run(resubscribe, 'resubscribed')}
        >
          {t('resubscribe')}
        </button>
      ) : null}

      {step === 'resubscribed' ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', height: 44 }}
          disabled={busy}
          onClick={() => void run(unsubscribe, 'unsubscribed')}
        >
          {t('unsubscribeAgain')}
        </button>
      ) : null}

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/profile" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {t(step === 'invalid' ? 'toProfile' : 'manageAll')}
        </Link>
      </div>
    </AuthCard>
  );
}
