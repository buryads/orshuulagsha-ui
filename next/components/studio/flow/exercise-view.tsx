'use client';

import type { CSSProperties, ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { ExerciseType } from '@/lib/api/studio';
import {
  draftFromPayload,
  type ImagePickDraft,
  type ListenPickDraft,
  type MatchDraft,
  type TypeDraft,
} from '@/lib/studio/payload';

const chip = (correct: boolean): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  border: `1px solid ${correct ? 'var(--accent-green)' : 'var(--border-strong)'}`,
  background: correct ? 'var(--accent-green-soft)' : 'var(--surface-2)',
});

export function ExerciseView({
  type,
  prompt,
  payload,
}: {
  type: ExerciseType;
  prompt: string;
  payload: Record<string, unknown>;
}): ReactElement {
  const t = useTranslations('studio.flow.review');
  const draft = draftFromPayload(type, payload);
  const title = <div style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 800, fontFamily: 'var(--font-display)', overflowWrap: 'anywhere' }}>{prompt}</div>;
  if (type === 'match') {
    const d = draft as MatchDraft;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {title}
        {d.pairs.map(([a, b], i) => (
          <div key={i} style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: 18 }}>
            <span style={{ fontWeight: 700 }}>{a}</span>
            <span style={{ color: 'var(--text-soft)' }}>↔</span>
            <span style={{ color: 'var(--text-muted)' }}>{b}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'type') {
    const d = draft as TypeDraft;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {title}
        <div style={{ fontSize: 18 }}>
          {t('correct')}: <b>{d.correct_answer}</b>
        </div>
        {d.accept.length > 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {t('accepted')}: {d.accept.join(', ')}
          </div>
        )}
      </div>
    );
  }
  const options = type === 'listen-pick' ? (draft as ListenPickDraft).options : (draft as ImagePickDraft).options.map((o) => o.label);
  const correct = type === 'listen-pick' ? (draft as ListenPickDraft).correct_answer : (draft as ImagePickDraft).correct_answer;
  const hint = type === 'listen-pick' ? (draft as ListenPickDraft).audio_text : (draft as ImagePickDraft).image_hint;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {title}
      {hint && (
        <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>
          {t('hint')}: <b>{hint}</b>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {options.map((o, i) => (
          <span key={i} style={chip(o === correct)}>
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}
