'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { KUDOS_EMOJI, KUDOS_MESSAGE_MAX, sendKudos, type KudosEmoji } from '@/lib/api/studio-board';
import { inputStyle } from './field';

interface Props {
  to: { id: number; name: string };
  onClose: () => void;
  onSent: () => void;
}

export function KudosDialog({ to, onClose, onSent }: Props): ReactElement {
  const t = useTranslations('studio.kudos');
  const [emoji, setEmoji] = useState<KudosEmoji>(KUDOS_EMOJI[0]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    setBusy(true);
    setError(null);
    const text = message.trim();
    try {
      await sendKudos({ to_user_id: to.id, emoji, ...(text ? { message: text } : {}) });
      onSent();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.status === 429 ? t('tooSoon') : t('failed'));
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(14,16,19,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title', { name: to.name })}
        data-testid="kudos-dialog"
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 400, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--surface-elev)' }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>{t('title', { name: to.name })}</h2>
        <div role="radiogroup" aria-label={t('emojiLabel')} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {KUDOS_EMOJI.map((e, i) => (
            <button
              key={e}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              role="radio"
              aria-checked={emoji === e}
              onClick={() => setEmoji(e)}
              style={{
                fontSize: 26,
                padding: '8px 0',
                borderRadius: 12,
                cursor: 'pointer',
                background: emoji === e ? 'var(--primary-50)' : 'var(--surface)',
                border: emoji === e ? '2px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          {t('message')}
          <textarea
            value={message}
            maxLength={KUDOS_MESSAGE_MAX}
            rows={3}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <span style={{ alignSelf: 'flex-end', fontSize: 12 }} data-testid="kudos-counter">
            {t('counter', { count: message.length, max: KUDOS_MESSAGE_MAX })}
          </span>
        </label>
        {error && (
          <p role="alert" style={{ color: 'var(--tertiary-700)', fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void submit()}>
            {busy ? t('sending') : t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}
