'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import {
  consentVoiceCredit,
  getVoiceCredit,
  patchVoiceCredit,
  type VoiceCredit,
} from '@/lib/api/studio-events';
import { inputStyle } from './field';

const NAME_MAX = 40;

export function VoiceCreditCard({
  consentOnly = false,
}: {
  consentOnly?: boolean;
}): ReactElement | null {
  const t = useTranslations('studioEvents.credit');
  const [credit, setCredit] = useState<VoiceCredit | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVoiceCredit()
      .then((c) => {
        setCredit(c);
        setName(c.display_name ?? c.default_name);
      })
      .catch(() => undefined);
  }, []);

  if (!credit) return null;

  const run = async (job: () => Promise<VoiceCredit>) => {
    setBusy(true);
    setError(false);
    try {
      setCredit(await job());
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= NAME_MAX;

  if (!credit.consented_at) {
    return (
      <form
        className="card"
        style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
        data-testid="voice-credit-consent"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void run(() => consentVoiceCredit(trimmed));
        }}
      >
        <strong>{t('title')}</strong>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>{t('body')}</p>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          {t('nameLabel')}
          <input
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            autoComplete="off"
            data-testid="voice-credit-name"
          />
        </label>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>{t('hint')}</p>
        {error && (
          <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontSize: 13 }}>
            {t('failed')}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start' }}
          disabled={busy || !valid}
          data-testid="voice-credit-agree"
        >
          {t('agree')}
        </button>
      </form>
    );
  }

  if (consentOnly) return null;

  return (
    <div
      className="card"
      style={{
        padding: '10px 14px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
      data-testid="voice-credit-settings"
    >
      <label
        style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, fontWeight: 600 }}
      >
        <input
          type="checkbox"
          checked={credit.credit_enabled}
          disabled={busy}
          onChange={(e) => void run(() => patchVoiceCredit({ credit_enabled: e.target.checked }))}
          data-testid="voice-credit-toggle"
        />
        {t('toggle')}
      </label>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {credit.credit_enabled
          ? t('shownAs', { name: credit.display_name ?? credit.default_name })
          : t('hidden')}
      </span>
      {error && (
        <span role="alert" style={{ color: 'var(--tertiary-700)', fontSize: 13 }}>
          {t('failed')}
        </span>
      )}
    </div>
  );
}
