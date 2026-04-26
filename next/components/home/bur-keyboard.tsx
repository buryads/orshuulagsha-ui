'use client';

import { useState, type CSSProperties, type ReactElement } from 'react';

// Token-based layout: tokens wrapped in {} are special keys, plain strings
// are characters that get inserted at the caret. Mirrors the legacy
// burlang-keyboard layout used in the old Nuxt site.
type Key = { token: string; flex?: number; label?: string };

const ROWS_DEFAULT: Key[][] = [
  toRow(['ё', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='])
    .concat([{ token: '{backspace}', flex: 2, label: '⌫' }]),
  [{ token: '{tab}', flex: 1.4, label: '↹' }, ...toRow(['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\'])],
  [{ token: '{caps}', flex: 1.6, label: '⇪' }, ...toRow(['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э']), { token: '{enter}', flex: 1.8, label: '⏎' }],
  [{ token: '{shift}', flex: 1.6, label: '⇧' }, ...toRow(['/', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']), { token: '{shift}', flex: 1.8, label: '⇧' }],
  [
    ...toRow(['@', 'ү']),
    { token: '{space}', flex: 8, label: ' ' },
    ...toRow(['h', 'ө']),
  ],
];

function toRow(chars: string[]): Key[] {
  return chars.map((c) => ({ token: c }));
}

const SHIFT_SYMBOLS: Record<string, string> = {
  '1': '!',
  '2': '"',
  '3': '№',
  '4': ';',
  '5': '%',
  '6': ':',
  '7': '?',
  '8': '*',
  '9': '(',
  '0': ')',
  '-': '_',
  '=': '+',
  '/': '|',
  '.': ',',
  '@': '#',
  '\\': '/',
};

export interface BurKeyboardProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

export function BurKeyboard({
  onInsert,
  onBackspace,
  onClose,
}: BurKeyboardProps): ReactElement {
  const [shifted, setShifted] = useState(false);
  const [caps, setCaps] = useState(false);
  const upper = shifted !== caps; // XOR: caps inverts shift

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
    // Plain character — apply shift symbol map first, then case for letters.
    let out = token;
    const sym = SHIFT_SYMBOLS[token];
    if (shifted && sym) {
      out = sym;
    } else if (upper) {
      out = token.toLocaleUpperCase('ru-RU');
    }
    onInsert(out);
    // Auto-release shift after a single character (sticky shift, not caps).
    if (shifted) setShifted(false);
  };

  const renderLabel = (k: Key): string => {
    if (k.label) return k.label;
    const sym = SHIFT_SYMBOLS[k.token];
    if (shifted && sym) return sym;
    if (upper) return k.token.toLocaleUpperCase('ru-RU');
    return k.token;
  };

  return (
    <div
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
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть клавиатуру"
        title="Закрыть"
        className="btn-icon"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 26,
          height: 26,
          zIndex: 1,
        }}
      >
        ×
      </button>
      {ROWS_DEFAULT.map((row, ri) => (
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
            };
            return (
              <button
                key={`${ri}-${ki}-${k.token}`}
                type="button"
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
