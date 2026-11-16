'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { QueueStatus } from './use-flow-queue';

export function QueueState({
  status,
  mode,
  onRetry,
}: {
  status: Exclude<QueueStatus, 'ready'>;
  mode: 'voice' | 'review';
  onRetry: () => void;
}): ReactElement {
  const t = useTranslations('studio.flow.state');
  const body = (title: string, text?: string, retry = false): ReactElement => (
    <div
      className="card"
      style={{
        padding: 28,
        textAlign: 'center',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      data-testid={`flow-${status}`}
    >
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
        {title}
      </div>
      {text && <p style={{ margin: 0, color: 'var(--text-muted)' }}>{text}</p>}
      {retry && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onRetry}
          data-testid="flow-retry"
        >
          {t('retry')}
        </button>
      )}
    </div>
  );
  switch (status) {
    case 'loading':
      return body(t('loading'));
    case 'empty':
      return mode === 'voice'
        ? body(t('emptyVoiceTitle'), t('emptyVoiceBody'))
        : body(t('emptyReviewTitle'), t('emptyReviewBody'));
    case 'notReady':
      return body(t('notReady'), undefined, true);
    case 'error':
      return body(t('error'), undefined, true);
  }
}
