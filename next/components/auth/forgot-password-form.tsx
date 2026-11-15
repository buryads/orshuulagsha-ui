'use client';

import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';

import * as auth from '@/lib/api/auth';
import { Logo } from '@/components/brand/logo';
import { Soyombo } from '@/components/ui/soyombo';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';

import { AuthCard } from './auth-card';
import { AuthInput } from './auth-input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return t('errors.emailRequired');
    if (!EMAIL_RE.test(value)) return t('errors.emailInvalid');
    return undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setSubmitting(true);
    try {
      await auth.requestPasswordReset(email.trim(), locale);
      setSent(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setEmailError(t('errors.emailInvalid'));
        } else if (err.response?.status === 429) {
          setSubmitError(t('errors.tooManyAttempts'));
        } else if (!err.response) {
          setSubmitError(t('errors.serverUnavailable'));
        } else {
          setSubmitError(t('errors.generic'));
        }
      } else {
        setSubmitError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Logo size={28} />
        <Soyombo size={26} color="var(--accent-warm)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {t('forgotPasswordTitle')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {t('forgotPasswordSubtitle')}
        </p>
      </div>

      {sent ? (
        <div
          role="status"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: 'var(--accent-green-soft)',
            color: 'var(--accent-green)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {t('resetLinkSent')}
        </div>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <AuthInput
            label={t('email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailError(validateEmail(email))}
            error={emailError}
            disabled={submitting}
          />

          {submitError ? (
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
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: 44 }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Icon
                  name="settings"
                  size={16}
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                />
                {t('sendingResetLink')}
              </>
            ) : (
              t('sendResetLink')
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      )}

      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        <Link
          href="/signin"
          style={{ color: 'var(--primary)', fontWeight: 600 }}
        >
          {t('backToSignIn')}
        </Link>
      </div>
    </AuthCard>
  );
}
