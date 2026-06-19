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
      word: typeof p.word === 'string' ? p.word : undefined,
      // new_word / translation
      translation: typeof p.translation === 'string' ? p.translation : undefined,
      lang:
        p.lang === 'ru' || p.lang === 'en' ? p.lang : undefined,
      // new_word only
      example: typeof p.example === 'string' ? p.example : undefined,
      // correction only
      field:
        p.field === 'translation' || p.field === 'example' || p.field === 'other'
          ? p.field
          : undefined,
      suggestion: typeof p.suggestion === 'string' ? p.suggestion : undefined,
      comment: typeof p.comment === 'string' ? p.comment : undefined,
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
