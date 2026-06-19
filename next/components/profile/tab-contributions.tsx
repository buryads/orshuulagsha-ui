'use client';

import { useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { MyContributions } from '@/components/contrib/my-contributions';
import { ContributionForm } from '@/components/contrib/contribution-form';
import type { Contribution } from '@/lib/api/types';

// Contribution type used for prefill when resubmitting a rejected entry
type ResubmitState = { item: Contribution } | null;

export function TabContributions(): ReactElement {
  const t = useTranslations('learn.contrib');
  const [resubmit, setResubmit] = useState<ResubmitState>(null);

  function handleResubmit(item: Contribution) {
    setResubmit({ item });
  }

  function handleFormCancel() {
    setResubmit(null);
  }

  if (resubmit) {
    const { item } = resubmit;
    const payload = item.payload as unknown as Record<string, unknown>;
    return (
      <div style={{ padding: '24px 0' }}>
        <ContributionForm
          prefill={{
            type: item.type,
            burword_id:
              typeof payload.burword_id === 'number' ? payload.burword_id : null,
            word: typeof payload.word === 'string' ? payload.word : undefined,
          }}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
        {t('myContribTitle')}
      </h2>
      <MyContributions onResubmit={handleResubmit} />
    </div>
  );
}
