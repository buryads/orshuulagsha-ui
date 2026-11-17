'use client';

import type { ReactElement, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { SessionState } from '@/lib/studio/flow-session';
import { enForm, ruForm } from '@/lib/studio/word-plural';

export function RestScreen({
  session,
  wordsWaited,
  reminderSlot,
  onResume,
}: {
  session: SessionState;
  wordsWaited: number;
  reminderSlot?: ReactNode;
  onResume: () => void;
}): ReactElement {
  const t = useTranslations('studio.flow');
  const locale = useLocale();
  const stat = (text: string) => (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: 12,
        background: 'var(--surface-2)',
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      className="card fade-up"
      style={{
        padding: 'clamp(22px, 5vw, 36px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'center',
      }}
      data-testid="rest-screen"
    >
      <div
        style={{
          fontSize: 'clamp(26px, 6vw, 36px)',
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
        }}
      >
        {t('rest.title')}
      </div>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('rest.body')}</p>
      {wordsWaited > 0 && (
        <p style={{ margin: 0, fontWeight: 700 }} data-testid="rest-words-waited">
          {t(`rest.wordsWaited.${locale === 'en' ? enForm(wordsWaited) : ruForm(wordsWaited)}`, {
            n: wordsWaited,
          })}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stat(t('rest.count', { n: session.count }))}
        {stat(t('rest.best', { n: session.bestStreak }))}
        {session.uploaded > 0 && stat(t('rest.uploaded', { n: session.uploaded }))}
      </div>
      {reminderSlot}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ minHeight: 52 }}
          onClick={onResume}
          data-testid="rest-resume"
        >
          {t('rest.resume')}
        </button>
        <Link
          href="/studio"
          className="btn btn-ghost"
          style={{
            minHeight: 52,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {t('state.back')}
        </Link>
      </div>
    </div>
  );
}
