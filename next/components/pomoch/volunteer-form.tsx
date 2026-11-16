'use client';

import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { submitVolunteerApplication } from '@/lib/api/volunteers';
import { normalizeTelegram, validateVolunteerForm } from '@/lib/volunteer-form';

const HELP_TYPES = ['voice', 'review', 'words', 'other'] as const;

const ERROR_KEYS = {
  name: 'errName',
  telegram: 'errTelegram',
  help: 'errHelp',
  about: 'errAbout',
  consent: 'errConsent',
} as const;

interface Errors {
  name?: string;
  telegram?: string;
  help?: string;
  about?: string;
  consent?: string;
  form?: string;
}

const fieldStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  font: 'inherit',
} as const;

const linkStyle = { color: 'var(--primary-700)', textDecoration: 'underline' } as const;

const errorStyle = { color: 'var(--tertiary-700)', fontSize: 13, marginTop: 4 } as const;

export function VolunteerForm() {
  const t = useTranslations('pomoch.form');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [helpTypes, setHelpTypes] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (type: string) =>
    setHelpTypes((cur) => (cur.includes(type) ? cur.filter((x) => x !== type) : [...cur, type]));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const failed = validateVolunteerForm({ name, telegram, helpTypes, about, consent });
    const next: Errors = {};
    for (const key of Object.keys(failed) as (keyof typeof ERROR_KEYS)[]) next[key] = t(ERROR_KEYS[key]);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await submitVolunteerApplication({
        name: name.trim(),
        telegram: normalizeTelegram(telegram),
        help_types: helpTypes,
        about: about.trim() || undefined,
        locale,
        website,
        consent: true,
      });
      setDone(true);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setErrors({ form: status === 429 ? t('errThrottle') : t('errServer') });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="card" style={{ padding: 20 }} role="status">
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>🏆 {t('successTitle')}</h2>
        <p style={{ margin: 0 }}>{t('successText')}</p>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>{t('title')}</h2>
      <p style={{ margin: '0 0 16px', color: 'var(--text-muted)' }}>{t('text')}</p>
      <div style={{ margin: '0 0 18px', padding: 14, borderRadius: 12, background: 'var(--surface-2)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{t('usageTitle')}</h3>
        <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
          {(t.raw('usage') as string[]).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <a href={t('licenseUrl')} target="_blank" rel="noreferrer noopener" style={{ ...linkStyle, display: 'inline-block', marginTop: 8, fontSize: 14 }}>
          {t('licenseLink')}
        </a>
      </div>
      <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t('name')}</span>
          <input
            style={fieldStyle}
            value={name}
            maxLength={100}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <div role="alert" style={errorStyle}>{errors.name}</div>}
        </label>

        <label>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t('telegram')}</span>
          <input
            style={fieldStyle}
            value={telegram}
            maxLength={64}
            placeholder={t('telegramHint')}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setTelegram(e.target.value)}
            aria-invalid={Boolean(errors.telegram)}
          />
          {errors.telegram && <div role="alert" style={errorStyle}>{errors.telegram}</div>}
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t('helpTypes')}</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {HELP_TYPES.map((type) => (
              <label key={type} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={helpTypes.includes(type)}
                  onChange={() => toggle(type)}
                />
                {t(type)}
              </label>
            ))}
          </div>
          {errors.help && <div role="alert" style={errorStyle}>{errors.help}</div>}
        </fieldset>

        <label>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t('about')}</span>
          <textarea
            style={{ ...fieldStyle, minHeight: 90, resize: 'vertical' }}
            value={about}
            maxLength={1000}
            placeholder={t('aboutHint')}
            onChange={(e) => setAbout(e.target.value)}
          />
          {errors.about && <div role="alert" style={errorStyle}>{errors.about}</div>}
        </label>

        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />

        <div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={Boolean(errors.consent)}
              style={{ marginTop: 3 }}
            />
            <span>
              {t('consentBefore')}
              <Link href="/privacy" style={linkStyle}>{t('consentLink')}</Link>
            </span>
          </label>
          {errors.consent && <div role="alert" style={errorStyle}>{errors.consent}</div>}
        </div>

        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('privacy')}</p>
        {errors.form && <div role="alert" style={errorStyle}>{errors.form}</div>}
        <div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('sending') : t('submit')}
          </button>
        </div>
      </form>
    </section>
  );
}
