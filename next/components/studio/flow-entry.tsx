'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getFlowSummary, type FlowSummary } from '@/lib/api/studio-flow';

export function FlowEntry(): ReactElement {
  const t = useTranslations('studio.flow');
  const [summary, setSummary] = useState<FlowSummary | null>(null);
  useEffect(() => {
    getFlowSummary()
      .then(setSummary)
      .catch(() => undefined);
  }, []);
  const today = summary ? summary.today.recorded + summary.today.reviewed + summary.today.fixed + summary.today.flagged : 0;
  const chip = (text: string, id: string): ReactElement => (
    <span key={id} data-testid={id} style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
      {text}
    </span>
  );
  return (
    <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }} data-testid="flow-entry">
      <Link href="/studio/flow" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: 16, padding: '10px 22px' }} data-testid="flow-open">
        {t('entry.open')}
      </Link>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('entry.hint')}</span>
      {summary && (
        <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {chip(t('entry.voiceLeft', { n: summary.voice_remaining }), 'flow-voice-left')}
          {chip(t('entry.reviewLeft', { n: summary.review_remaining }), 'flow-review-left')}
          {chip(t('entry.today', { n: today }), 'flow-today')}
        </span>
      )}
    </div>
  );
}
