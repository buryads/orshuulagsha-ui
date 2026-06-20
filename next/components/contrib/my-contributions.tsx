'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { getMyContributions } from '@/lib/api/contributions';
import type { Contribution, ContributionType } from '@/lib/api/types';

interface MyContributionsProps {
  /** Called when user clicks "Edit and resubmit" on a rejected contribution */
  onResubmit?: (item: Contribution) => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

type LoadState = 'loading' | 'error' | 'done';

export function MyContributions({ onResubmit }: MyContributionsProps): ReactElement {
  const t = useTranslations('learn.contrib');
  const [state, setState] = useState<LoadState>('loading');
  const [items, setItems] = useState<Contribution[]>([]);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const data = await getMyContributions();
      setItems(data);
      setState('done');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        {t('myContribLoading')}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ padding: '24px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
          {t('myContribError')}
        </p>
        <button type="button" className="btn btn-secondary" onClick={load} style={{ fontSize: 13 }}>
          {t('myContribError')}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '32px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}
      >
        <Icon name="comment" size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p style={{ margin: 0 }}>{t('myContribEmpty')}</p>
      </div>
    );
  }

  return (
    <div aria-label={t('myContribTitle')} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item) => (
        <ContribCard
          key={item.id}
          item={item}
          onResubmit={onResubmit}
        />
      ))}
    </div>
  );
}

interface ContribCardProps {
  item: Contribution;
  onResubmit?: (item: Contribution) => void;
}

function ContribCard({ item, onResubmit }: ContribCardProps): ReactElement {
  const t = useTranslations('learn.contrib');

  const statusChipClass =
    item.status === 'approved'
      ? 'chip chip-green'
      : item.status === 'rejected'
        ? 'chip chip-rose'
        : 'chip chip-warm';

  const statusLabel =
    item.status === 'approved'
      ? t('statusApproved')
      : item.status === 'rejected'
        ? t('statusRejected')
        : t('statusPending');

  // Icon for status (not color-only — a11y)
  const statusIcon =
    item.status === 'approved'
      ? 'check'
      : item.status === 'rejected'
        ? 'x'
        : 'clock';

  const typeLabel = typeDisplayLabel(item.type, t);

  // Extract a human-readable summary from the payload
  const payloadSummary = buildSummary(item);

  return (
    <div
      className="card"
      style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          className="chip"
          style={{ fontSize: 11, padding: '4px 8px' }}
        >
          {typeLabel}
        </span>
        <span className={statusChipClass} role="status" aria-label={statusLabel}>
          <Icon name={statusIcon} size={12} />
          {statusLabel}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-soft)' }}>
          {formatDate(item.created_at)}
        </span>
      </div>

      {payloadSummary ? (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>{payloadSummary}</p>
      ) : null}

      {item.status === 'rejected' && item.moderation_note ? (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--tertiary-700)',
            background: 'var(--tertiary-soft)',
            borderRadius: 'var(--r-sm)',
            padding: '8px 12px',
          }}
        >
          {t('moderationNote', { note: item.moderation_note })}
        </p>
      ) : null}

      {item.status === 'rejected' && onResubmit ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ alignSelf: 'flex-start', fontSize: 13 }}
          onClick={() => onResubmit(item)}
        >
          <Icon name="edit" size={14} />
          {t('resubmitBtn')}
        </button>
      ) : null}
    </div>
  );
}

function typeDisplayLabel(
  type: ContributionType,
  t: ReturnType<typeof useTranslations<'learn.contrib'>>,
): string {
  if (type === 'new_word') return t('typeNewWord');
  if (type === 'translation') return t('typeTranslation');
  return t('typeCorrection');
}

function buildSummary(item: Contribution): string {
  const p = item.payload as unknown as Record<string, unknown>;
  if (item.type === 'new_word' || item.type === 'translation') {
    const word = typeof p.word === 'string' ? p.word : '';
    const tr = typeof p.translation === 'string' ? p.translation : '';
    if (word && tr) return `${word} → ${tr}`;
    return word || tr;
  }
  if (item.type === 'correction') {
    const word = typeof p.word === 'string' ? p.word : '';
    const suggestion = typeof p.suggestion === 'string' ? p.suggestion : '';
    if (word && suggestion) return `${word}: "${suggestion}"`;
    return word;
  }
  return '';
}
