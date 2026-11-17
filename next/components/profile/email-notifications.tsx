'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  getEmailPreferences,
  updateEmailPreferences,
  type EmailCategory,
  type EmailPreferences,
} from '@/lib/api/email-preferences';

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--primary)' }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 600 }}>{label}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)' }}>{hint}</span>
      </span>
    </label>
  );
}

export function EmailNotifications() {
  const t = useTranslations('account.notifications');
  const locale = useLocale();
  const [prefs, setPrefs] = useState<EmailPreferences | null>(null);
  const [failed, setFailed] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getEmailPreferences()
      .then(setPrefs)
      .catch(() => setFailed(true));
  }, []);

  async function toggle(category: EmailCategory, value: boolean): Promise<void> {
    if (!prefs) return;
    const previous = prefs;
    setPrefs({ ...prefs, [category]: value });
    setSaveError(false);
    setBusy(true);
    try {
      setPrefs(await updateEmailPreferences({ [category]: value, locale, source: 'profile' }));
    } catch {
      setPrefs(previous);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="card"
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
      data-testid="email-notifications"
    >
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('title')}</h2>

      {prefs ? (
        <>
          {prefs.is_teacher ? (
            <Toggle
              label={t('teacherReminders')}
              hint={t('teacherRemindersHint')}
              checked={prefs.teacher_reminders}
              disabled={busy}
              onChange={(v) => void toggle('teacher_reminders', v)}
            />
          ) : null}
          <Toggle
            label={t('productNews')}
            hint={t('productNewsHint')}
            checked={prefs.product_news}
            disabled={busy}
            onChange={(v) => void toggle('product_news', v)}
          />
        </>
      ) : (
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {failed ? t('loadFailed') : '…'}
        </div>
      )}

      {saveError ? (
        <div role="alert" style={{ fontSize: 13, color: 'var(--tertiary-700)', fontWeight: 500 }}>
          {t('saveFailed')}
        </div>
      ) : null}

      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{t('serviceNote')}</p>
    </section>
  );
}
