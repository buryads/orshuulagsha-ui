'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';

import * as auth from '@/lib/api/auth';
import * as user from '@/lib/api/user';
import { Logo } from '@/components/brand/logo';
import { Soyombo } from '@/components/ui/soyombo';
import { Icon } from '@/components/ui/icon';
import { isSafeNext } from '@/lib/api/oauth';
import { Link } from '@/i18n/navigation';

import { AuthCard } from './auth-card';
import { AuthInput } from './auth-input';
import { OAuthButtons } from './oauth-buttons';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const nextPath = isSafeNext(nextRaw) ? nextRaw : '/packs';

  const otherHref = isSafeNext(nextRaw)
    ? `/signin?next=${encodeURIComponent(nextRaw)}`
    : '/signin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validateName(value: string): string | undefined {
    if (!value.trim()) return t('errors.nameRequired');
    if (value.trim().length < 2) return t('errors.nameMin');
    return undefined;
  }

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
      let e: string | undefined;
      if (field === 'name') e = validateName(name);
      else if (field === 'email') e = validateEmail(email);
      else e = validatePassword(password);
      if (e) next[field] = e;
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors: FieldErrors = {};
    const nameError = validateName(name);
    if (nameError) nextErrors.name = nameError;
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await auth.register(name.trim(), email, password, emailOptIn, locale);
      await user.getUser().catch(() => undefined);
      window.location.assign(nextPath);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setSubmitError(t('errors.registerEmailTaken'));
        } else if (err.response?.status === 409) {
          setSubmitError(t('errors.registerConflict'));
        } else if (!err.response) {
          setSubmitError(t('errors.serverUnavailable'));
        } else {
          setSubmitError(t('errors.registerFailed'));
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
          {t('signUp')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {t('signUpSubtitle')}
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <AuthInput
          label={t('name')}
          type="text"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          error={errors.name}
          disabled={submitting}
        />

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
          autoComplete="new-password"
          placeholder={t('passwordCreatePlaceholder')}
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

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 13,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => setEmailOptIn(e.target.checked)}
            disabled={submitting}
            style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--primary)' }}
          />
          {t('emailOptIn')}
        </label>

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
                style={{ animation: 'spin 1s linear infinite' }}
              />
              {t('creating')}
            </>
          ) : (
            t('signUpButton')
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <OAuthButtons emailOptIn={emailOptIn} />

      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        {t('haveAccount')}{' '}
        <Link
          href={otherHref}
          style={{ color: 'var(--primary)', fontWeight: 600 }}
        >
          {t('signInLink')}
        </Link>
      </div>
    </AuthCard>
  );
}
