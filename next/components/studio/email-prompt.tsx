'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  dismissStudioPrompt,
  getEmailPreferences,
  updateEmailPreferences,
} from '@/lib/api/email-preferences';

type State = 'hidden' | 'prompt' | 'done';

export function EmailPrompt(): ReactElement | null {
  const t = useTranslations('studio.emailPrompt');
  const locale = useLocale();
  const [state, setState] = useState<State>('hidden');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getEmailPreferences()
      .then((p) => setState(p.studio_prompt ? 'prompt' : 'hidden'))
      .catch(() => setState('hidden'));
  }, []);

  async function enable(): Promise<void> {
    setBusy(true);
    try {
      await updateEmailPreferences({
        teacher_reminders: true,
        source: 'studio_prompt',
        locale,
      });
      setState('done');
      window.setTimeout(() => setState('hidden'), 4000);
    } catch {
      setState('hidden');
    } finally {
      setBusy(false);
    }
  }

  function dismiss(): void {
    setState('hidden');
    dismissStudioPrompt().catch(() => undefined);
  }

  if (state === 'hidden') return null;

  return (
    <div
      className="card"
      role="status"
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
      data-testid="email-prompt"
    >
      {state === 'done' ? (
        <span style={{ fontWeight: 600 }}>{t('done')}</span>
      ) : (
        <>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{t('title')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('hint')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void enable()}
            >
              {t('enable')}
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={dismiss}>
              {t('later')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
