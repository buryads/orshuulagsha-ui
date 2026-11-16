'use client';

import { useState, type CSSProperties, type ReactElement } from 'react';
import {
  buildRows,
  keyOutput,
  type Key,
} from '@/lib/bur-keyboard-layout';

export interface BurKeyboardProps {
  id?: string;
  multiline?: boolean;
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

export function BurKeyboard({
  id,
  multiline = true,
  onInsert,
  onBackspace,
  onClose,
}: BurKeyboardProps): ReactElement {
  const [shifted, setShifted] = useState(false);
  const [caps, setCaps] = useState(false);

  const handle = (token: string) => {
    if (token === '{backspace}') {
      onBackspace();
      return;
    }
    if (token === '{tab}') {
      onInsert('\t');
      return;
    }
    if (token === '{enter}') {
      onInsert('\n');
      return;
    }
    if (token === '{space}') {
      onInsert(' ');
      return;
    }
    if (token === '{shift}') {
      setShifted((s) => !s);
      return;
    }
    if (token === '{caps}') {
      setCaps((c) => !c);
      return;
    }
    onInsert(keyOutput(token, shifted, caps));
    if (shifted) setShifted(false);
  };

  const renderLabel = (k: Key): string => {
    if (k.label) return k.label;
    return keyOutput(k.token, shifted, caps);
  };

  return (
    <div
      id={id}
      className="bur-kb"
      style={{
        marginTop: 10,
        padding: 10,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          aria-label="Закрыть клавиатуру"
          title="Закрыть"
          className="btn-icon"
          style={{ width: 26, height: 26 }}
        >
          ×
        </button>
      </div>
      {buildRows(multiline).map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6 }}>
          {row.map((k, ki) => {
            const isSpecial = k.token.startsWith('{');
            const isModifierActive =
              (k.token === '{shift}' && shifted) ||
              (k.token === '{caps}' && caps);
            const style: CSSProperties = {
              flex: k.flex ?? 1,
              minWidth: 0,
              height: 38,
              fontSize: 14,
              fontWeight: isSpecial ? 600 : 500,
              padding: '0 8px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: isModifierActive
                ? 'var(--primary-50)'
                : 'var(--surface)',
              color: isModifierActive ? 'var(--primary-700)' : 'var(--text)',
              cursor: 'pointer',
              transition: 'background 0.1s',
              fontFamily: 'var(--font-display)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'manipulation',
            };
            return (
              <button
                key={`${ri}-${ki}-${k.token}`}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handle(k.token)}
                style={style}
              >
                {renderLabel(k)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
