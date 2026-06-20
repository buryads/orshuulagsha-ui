'use client';

// Reusable Buryat-text input with toggleable on-screen keyboard.
// Mirrors the pattern used in translator-panel.tsx.

import { useRef, useState, type ReactElement, type ChangeEvent } from 'react';
import { BurKeyboard } from '@/components/home/bur-keyboard';
import { Icon } from '@/components/ui/icon';

export interface BurFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
}

export function BurField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
}: BurFieldProps): ReactElement {
  const [kbOpen, setKbOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Insert text at the current caret position.
  function handleInsert(text: string) {
    const el = inputRef.current;
    if (!el) {
      onChange(value + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    // Restore focus + caret after React re-render.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  }

  function handleBackspace() {
    const el = inputRef.current;
    if (!el) {
      onChange(value.slice(0, -1));
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    let next: string;
    if (start !== end) {
      next = value.slice(0, start) + value.slice(end);
    } else if (start > 0) {
      next = value.slice(0, start - 1) + value.slice(start);
    } else {
      next = value;
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.max(0, start - (start === end ? 1 : 0));
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label
          htmlFor={id}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          {label}
          {required ? (
            <span aria-hidden="true" style={{ color: 'var(--tertiary)', marginLeft: 2 }}>
              *
            </span>
          ) : null}
        </label>
        <button
          type="button"
          title="Бурятская клавиатура"
          aria-label="Открыть бурятскую клавиатуру"
          aria-expanded={kbOpen}
          aria-controls={`${id}-keyboard`}
          onClick={() => setKbOpen((v) => !v)}
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 'var(--r-pill)',
            background: kbOpen ? 'var(--primary-50)' : 'var(--surface-2)',
            color: kbOpen ? 'var(--primary-700)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name="keyboard" size={12} />
          <span>Бур</span>
        </button>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          border: `1px solid ${error ? 'var(--tertiary)' : 'var(--border)'}`,
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'var(--font-bur)',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--tertiary)'
            : 'var(--primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--tertiary)'
            : 'var(--border)';
        }}
      />

      {error ? (
        <span
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: 12, color: 'var(--tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Icon name="x" size={12} />
          {error}
        </span>
      ) : null}

      {kbOpen ? (
        <div id={`${id}-keyboard`}>
          <BurKeyboard
            onInsert={handleInsert}
            onBackspace={handleBackspace}
            onClose={() => setKbOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
