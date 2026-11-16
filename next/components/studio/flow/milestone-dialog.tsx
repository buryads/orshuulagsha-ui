'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { praiseIndex } from '@/lib/studio/flow-milestones';

const PRAISE_COUNT = 6;

export function MilestoneDialog({
  count,
  onRest,
  onMore,
}: {
  count: number;
  onRest: () => void;
  onMore: () => void;
}): ReactElement {
  const t = useTranslations('studio.flow');
  const more = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    more.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMore();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onMore]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flow-milestone-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(14,16,19,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      data-testid="milestone-dialog"
    >
      <div
        className="card fade-up"
        style={{
          padding: 'clamp(22px, 5vw, 36px)',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          id="flow-milestone-title"
          style={{
            fontSize: 'clamp(28px, 7vw, 40px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--primary-700)',
          }}
        >
          {t('milestone.title', { n: count })}
        </div>
        <div style={{ fontSize: 20 }} data-testid="milestone-praise">
          {t(`praise.p${praiseIndex(count, PRAISE_COUNT)}`)}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: '1 1 120px', minHeight: 52 }}
            onClick={onRest}
            data-testid="milestone-rest"
          >
            {t('milestone.rest')}
          </button>
          <button
            ref={more}
            type="button"
            className="btn btn-primary"
            style={{ flex: '1 1 120px', minHeight: 52 }}
            onClick={onMore}
            data-testid="milestone-more"
          >
            {t('milestone.more')}
          </button>
        </div>
      </div>
    </div>
  );
}
