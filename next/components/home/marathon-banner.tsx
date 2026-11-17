'use client';

import type { ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { MarathonEvent } from '@/lib/api/events';
import { formatDate } from '@/lib/marathon/days';

export function MarathonBanner({ event }: { event: MarathonEvent }): ReactElement {
  const t = useTranslations('marathon.banner');
  const locale = useLocale();
  const me = event.me?.joined ? event.me : null;

  let text: string;
  let button: string;
  if (event.state === 'upcoming') {
    text = t('upcoming', { date: formatDate(event.starts_on, locale) });
    button = me ? t('open') : t('remind');
  } else if (event.state === 'finished') {
    text = t('finished');
    button = t('archive');
  } else if (event.final.open) {
    text = t('final');
    button = t('finalButton');
  } else {
    const n = event.today ?? 1;
    text = me
      ? t('runningMine', { n, streak: me.streak })
      : t('running', { n, total: event.days_count });
    button = me ? t('open') : t('join');
  }

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px 10px 16px',
          border: '1px solid var(--primary-200)',
          borderRadius: 14,
          background: 'var(--primary-50)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.4, fontWeight: 600 }}>{text}</span>
        <Link className="btn btn-primary" href="/marathon" style={{ flexShrink: 0 }}>
          {button}
        </Link>
      </div>
    </div>
  );
}
