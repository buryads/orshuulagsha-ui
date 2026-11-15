'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ExplainWord } from '@/lib/api/types';

export function WordCard({ word }: { word: ExplainWord }) {
  const t = useTranslations('explain');
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? word.readings : word.readings.slice(0, 1);

  const tag = (code: string) =>
    t.has(`tags.${code}`) ? t(`tags.${code}`) : code;

  return (
    <div
      className="card"
      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, overflowWrap: 'anywhere' }}>
          {word.surface}
        </span>
        {word.check && <span className="chip chip-warm">{t('check')}</span>}
        {word.known === false && !word.check && <span className="chip chip-rose">{t('unknown')}</span>}
      </div>

      {shown.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {shown.map((r) => (
            <li key={r.analysis} style={{ overflowWrap: 'anywhere' }}>
              <b>{r.lemma}</b>
              <span style={{ color: 'var(--text-muted)' }}>
                {' — '}
                {r.tags.map(tag).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {word.readings.length > 1 ? (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ alignSelf: 'flex-start', padding: '4px 8px', fontSize: 13 }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t('hide') : t('more', { n: word.readings.length - 1 + word.more })}
        </button>
      ) : (
        word.more > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {t('more', { n: word.more })}
          </span>
        )
      )}

      {word.meanings.length > 0 && (
        <div style={{ fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>{t('meanings')}: </span>
          {word.meanings.join('; ')}
        </div>
      )}
    </div>
  );
}
