'use client';

import { useSearchParams } from 'next/navigation';
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
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isSafeNext(next: string | null): next is string {
  return Boolean(next) && next!.startsWith('/') && !next!.startsWith('//');
}

export function SigninForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const nextPath = isSafeNext(nextRaw) ? nextRaw : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return t('errors.emailRequired');
    if (!EMAIL_RE.test(value)) return t('errors.emailInvalid');
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return t('errors.passwordRequired');
    if (value.length < 6) return t('errors.passwordMin');
    return undefined;
  }

  function handleBlur(field: keyof FieldErrors): void {
    setErrors((prev) => {
      const next: FieldErrors = { ...prev };
      if (field === 'email') {
        const e = validateEmail(email);
        if (e) next.email = e;
        else delete next.email;
      } else {
        const e = validatePassword(password);
        if (e) next.password = e;
        else delete next.password;
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors: FieldErrors = {};
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await auth.login(email, password);
      router.push(nextPath);
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setSubmitError(t('errors.invalidCredentials'));
        } else if (err.response?.status === 422) {
          setSubmitError(t('errors.validationFailed'));
        } else if (!err.response) {
          setSubmitError(t('errors.serverUnavailable'));
        } else {
          setSubmitError(t('errors.loginFailed'));
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
          {t('signIn')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {t('signInSubtitle')}
        </p>
      </div>

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
          onBlur={() => handleBlur('email')}
          error={errors.email}
          disabled={submitting}
        />

        <AuthInput
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          error={errors.password}
          disabled={submitting}
          rightSlot={
            <button
              type="button"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              onClick={() => setShowPassword((v) => !v)}
              className="btn-icon"
              style={{ width: 32, height: 32 }}
              disabled={submitting}
            >
              <Icon name={showPassword ? 'x' : 'lock'} size={16} />
            </button>
          }
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
              {t('signingIn')}
            </>
          ) : (
            t('signInButton')
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        {t('noAccount')}{' '}
        <Link
          href="/signup"
          style={{ color: 'var(--primary)', fontWeight: 600 }}
        >
          {t('createAccountLink')}
        </Link>
      </div>
    </AuthCard>
  );
}
