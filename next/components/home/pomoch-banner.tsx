'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { dismissBanner, isBannerDismissed } from '@/lib/pomoch-banner';

type State = 'pending' | 'shown' | 'hidden';

export function PomochBanner() {
  const t = useTranslations('pomoch');
  const [state, setState] = useState<State>('pending');

  useEffect(() => {
    setState(isBannerDismissed() ? 'hidden' : 'shown');
  }, []);

  if (state === 'hidden') return null;

  return (
    <div
      className="container"
      style={{ paddingTop: 12, visibility: state === 'shown' ? 'visible' : 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px 10px 16px',
          border: '1px solid var(--border)',
          borderRadius: 14,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.4 }}>{t('bannerText')}</span>
        <Link className="btn btn-primary" href="/pomoch" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {t('bannerButton')}
        </Link>
        <button
          type="button"
          className="btn btn-ghost"
          aria-label={t('bannerClose')}
          style={{ flexShrink: 0, padding: '6px 10px', fontSize: 18, lineHeight: 1 }}
          onClick={() => {
            dismissBanner();
            setState('hidden');
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
