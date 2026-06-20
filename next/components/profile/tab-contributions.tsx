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
    const p = item.payload as unknown as Record<string, unknown>;

    // Build a full prefill so every form field is pre-populated for editing.
    const prefill: Parameters<typeof ContributionForm>[0]['prefill'] = {
      type: item.type,
      burword_id: typeof p.burword_id === 'number' ? p.burword_id : null,
      // new_word / translation
      bur: typeof p.bur === 'string' ? p.bur : undefined,
      ru: typeof p.ru === 'string' ? p.ru : undefined,
      // new_word only
      example: typeof p.example === 'string' ? p.example : undefined,
      // correction only
      target:
        p.target === 'translation' || p.target === 'word' || p.target === 'example'
          ? p.target
          : undefined,
      suggested: typeof p.suggested === 'string' ? p.suggested : undefined,
      note: typeof p.note === 'string' ? p.note : undefined,
    };

    return (
      <div style={{ padding: '24px 0' }}>
        <ContributionForm
          prefill={prefill}
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
