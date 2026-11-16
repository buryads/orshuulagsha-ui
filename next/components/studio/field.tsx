'use client';

import { useRef, type CSSProperties, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { BurKeyboard } from '@/components/home/bur-keyboard';
import { useBurKeyboard } from '@/components/home/use-bur-keyboard';

export interface FieldProps {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fid?: string;
  bur?: boolean;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
  testId?: string;
  style?: CSSProperties;
}

export const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  width: '100%',
  padding: '8px 10px',
  fontSize: 15,
  border: '1px solid var(--border-strong)',
  borderRadius: 10,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'inherit',
};

export function Field({
  value,
  onChange,
  onBlur,
  onKeyDown,
  fid,
  bur = false,
  multiline = false,
  placeholder,
  label,
  testId,
  style,
}: FieldProps): ReactElement {
  const t = useTranslations('studio.common');
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const kb = useBurKeyboard(ref, value, onChange, { multiline });
  const common = {
    ref,
    value,
    placeholder,
    'aria-label': label ?? placeholder,
    'data-fid': fid,
    'data-testid': testId,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur,
    onKeyDown,
    style: { ...inputStyle, ...style },
    ...kb.fieldProps,
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: multiline ? 'flex-start' : 'center' }}>
        {multiline ? <textarea rows={3} {...common} /> : <input type="text" autoComplete="off" {...common} />}
        {bur && (
          <button
            {...kb.toggleProps}
            aria-label={t('burKeyboard')}
            title={t('burKeyboard')}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className="btn-icon"
            style={{ width: 32, height: 32, flexShrink: 0, fontSize: 14, fontWeight: 700 }}
            data-testid={testId ? `${testId}-kb` : undefined}
          >
            Һ
          </button>
        )}
      </div>
      {bur && kb.open && <BurKeyboard {...kb.panelProps} />}
    </div>
  );
}
