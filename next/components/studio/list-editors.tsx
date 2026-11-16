'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Field } from './field';
import { useFocusRequest } from './use-focus-request';

const removeBtn = { width: 28, height: 28, flexShrink: 0 } as const;

export function StringList({
  items,
  onChange,
  fid,
  bur = false,
  placeholder,
  max,
  testId,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  fid: string;
  bur?: boolean;
  placeholder: string;
  max?: number;
  testId?: string;
}): ReactElement {
  const t = useTranslations('studio.common');
  const focus = useFocusRequest();
  const rows = items.length ? items : [''];
  const set = (i: number, v: string) => onChange(rows.map((x, j) => (j === i ? v : x)));
  const add = () => {
    if (max && rows.length >= max) return;
    onChange([...rows, '']);
    focus(`${fid}-${rows.length}`);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-testid={testId}>
      {rows.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <Field
            value={v}
            onChange={(x) => set(i, x)}
            fid={`${fid}-${i}`}
            bur={bur}
            placeholder={placeholder}
            testId={testId ? `${testId}-${i}` : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (i === rows.length - 1) {
                  if (v.trim()) add();
                } else focus(`${fid}-${i + 1}`);
              } else if (e.key === 'Backspace' && v === '' && rows.length > 1) {
                e.preventDefault();
                onChange(rows.filter((_, j) => j !== i));
                focus(`${fid}-${Math.max(0, i - 1)}`);
              }
            }}
          />
          <button
            type="button"
            className="btn-icon"
            style={removeBtn}
            aria-label={t('remove')}
            tabIndex={-1}
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      {(!max || rows.length < max) && (
        <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: 13 }} onClick={add}>
          + {t('add')}
        </button>
      )}
    </div>
  );
}

export interface Pair {
  bur: string;
  ru: string;
}

export function PairList({
  items,
  onChange,
  fid,
  burPlaceholder,
  ruPlaceholder,
  testId,
}: {
  items: Pair[];
  onChange: (next: Pair[]) => void;
  fid: string;
  burPlaceholder: string;
  ruPlaceholder: string;
  testId?: string;
}): ReactElement {
  const t = useTranslations('studio.common');
  const focus = useFocusRequest();
  const rows = items.length ? items : [{ bur: '', ru: '' }];
  const set = (i: number, k: keyof Pair, v: string) => onChange(rows.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const add = () => {
    onChange([...rows, { bur: '', ru: '' }]);
    focus(`${fid}-${rows.length}-bur`);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-testid={testId}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px', minWidth: 0, display: 'flex' }}>
            <Field
              value={r.bur}
              onChange={(v) => set(i, 'bur', v)}
              fid={`${fid}-${i}-bur`}
              bur
              placeholder={burPlaceholder}
              testId={testId ? `${testId}-${i}-bur` : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  focus(`${fid}-${i}-ru`);
                }
              }}
            />
          </div>
          <div style={{ flex: '1 1 180px', minWidth: 0, display: 'flex', gap: 6 }}>
            <Field
              value={r.ru}
              onChange={(v) => set(i, 'ru', v)}
              fid={`${fid}-${i}-ru`}
              placeholder={ruPlaceholder}
              testId={testId ? `${testId}-${i}-ru` : undefined}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (i === rows.length - 1) {
                  if (r.bur.trim() || r.ru.trim()) add();
                } else focus(`${fid}-${i + 1}-bur`);
              }}
            />
            <button
              type="button"
              className="btn-icon"
              style={removeBtn}
              aria-label={t('remove')}
              tabIndex={-1}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: 13 }} onClick={add}>
        + {t('add')}
      </button>
    </div>
  );
}
