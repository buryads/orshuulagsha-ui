'use client';

import { useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { KeepReason, RerecordInfo } from '@/lib/api/studio-flow';
import { inputStyle } from '../field';

export function RerecordNotice({
  rerecord,
  onListen,
}: {
  rerecord: RerecordInfo;
  onListen: (url: string) => void;
}): ReactElement {
  const t = useTranslations('studio.flow.rerecord');
  const first = rerecord.confusions[0];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        maxWidth: 480,
      }}
    >
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onListen(rerecord.old_audio_url)}
        data-testid="rerecord-listen"
      >
        ▶ {t('listenOld')}
      </button>
      <p
        style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}
        data-testid="rerecord-stats"
      >
        {rerecord.reason === 'cant_hear'
          ? t('statCantHear', { notRecognized: rerecord.not_recognized, heard: rerecord.heard })
          : t('statMisheard', { notRecognized: rerecord.not_recognized, heard: rerecord.heard })}
        {first && ' '}
        {first && t('confusion', { confusion: first })}
      </p>
    </div>
  );
}

export function KeepForm({
  disabled,
  onKeep,
}: {
  disabled: boolean;
  onKeep: (reason: KeepReason, note?: string) => void;
}): ReactElement {
  const t = useTranslations('studio.flow');
  const [reason, setReason] = useState<KeepReason | ''>('');
  const [note, setNote] = useState('');
  const ready = reason !== '' && (reason !== 'other' || note.trim() !== '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 420 }}>
      <select
        aria-label={t('keep.title')}
        value={reason}
        disabled={disabled}
        onChange={(e) => setReason(e.target.value as KeepReason | '')}
        style={{ ...inputStyle, minHeight: 44 }}
        data-testid="keep-reason"
      >
        <option value="" disabled>
          {t('keep.pick')}
        </option>
        <option value="as_is">{t('keep.reasons.as_is')}</option>
        <option value="hard">{t('keep.reasons.hard')}</option>
        <option value="other">{t('keep.reasons.other')}</option>
      </select>
      {reason === 'other' && (
        <input
          type="text"
          value={note}
          maxLength={200}
          disabled={disabled}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('keep.otherPlaceholder')}
          style={{ ...inputStyle, minHeight: 44 }}
          data-testid="keep-note"
        />
      )}
      <button
        type="button"
        className="btn btn-secondary"
        disabled={!ready || disabled}
        onClick={() => onKeep(reason as KeepReason, reason === 'other' ? note.trim() : undefined)}
        style={{ minHeight: 48, opacity: ready ? 1 : 0.45 }}
        data-testid="keep-submit"
      >
        {t('keep.title')}
      </button>
      {!ready && (
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }} data-testid="keep-hint">
          {t('keep.pick')}
        </span>
      )}
    </div>
  );
}
