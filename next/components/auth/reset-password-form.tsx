'use client';

import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

import * as auth from '@/lib/api/auth';
import { Logo } from '@/components/brand/logo';
import { Soyombo } from '@/components/ui/soyombo';
import { Icon } from '@/components/ui/icon';
import { Link, useRouter } from '@/i18n/navigation';

import { AuthCard } from './auth-card';
import { AuthInput } from './auth-input';

interface FieldErrors {
  password?: string;
  confirmation?: string;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('auth');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validatePassword(value: string): string | undefined {
    if (!value) return t('errors.passwordRequired');
    if (value.length < 6) return t('errors.passwordMin');
    return undefined;
  }

  function validateConfirmation(value: string): string | undefined {
    if (!value) return t('errors.confirmRequired');
    if (value !== password) return t('errors.passwordMismatch');
    return undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors: FieldErrors = {};
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    const confirmationError = validateConfirmation(confirmation);
    if (confirmationError) nextErrors.confirmation = confirmationError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await auth.resetPassword(token, password, confirmation);
      router.push('/signin?reset=1');
    } catch (err: unknown) {
      setSubmitting(false);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          const body = err.response.data?.errors;
          if (body?.token) {
            setLinkInvalid(true);
          } else if (body?.password) {
            const first = Array.isArray(body.password)
              ? body.password[0]
              : body.password;
            setErrors({ password: String(first) });
          } else {
            setSubmitError(t('errors.validationFailed'));
          }
        } else if (!err.response) {
          setSubmitError(t('errors.serverUnavailable'));
        } else {
          setSubmitError(t('errors.generic'));
        }
      } else {
        setSubmitError(t('errors.generic'));
      }
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
          {t('resetPasswordTitle')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {t('resetPasswordSubtitle')}
        </p>
      </div>

      {linkInvalid ? (
        <>
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
            {t('errors.resetLinkInvalid')}
          </div>
          <Link
            href="/forgot-password"
            className="btn btn-primary"
            style={{ width: '100%', height: 44 }}
          >
            {t('requestNewLink')}
          </Link>
        </>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <AuthInput
            label={t('newPassword')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('passwordCreatePlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={submitting}
            rightSlot={
              <button
                type="button"
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
                onClick={() => setShowPassword((v) => !v)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                disabled={submitting}
              >
                <Icon name={showPassword ? 'x' : 'lock'} size={16} />
              </button>
            }
          />

          <AuthInput
            label={t('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('passwordPlaceholder')}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            error={errors.confirmation}
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
                {t('savingPassword')}
              </>
            ) : (
              t('savePassword')
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      )}
    </AuthCard>
  );
}
