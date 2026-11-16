'use client';

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

type TextField = HTMLInputElement | HTMLTextAreaElement;

export interface UseBurKeyboardOptions {
  multiline?: boolean;
}

export function useBurKeyboard<E extends TextField>(
  ref: RefObject<E>,
  value: string,
  onChange: (next: string) => void,
  { multiline = false }: UseBurKeyboardOptions = {},
) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const pos = pendingCaret.current;
    if (!el || pos === null) return;
    pendingCaret.current = null;
    el.focus();
    el.setSelectionRange(pos, pos);
  }, [value, ref]);

  const insert = useCallback(
    (text: string) => {
      const el = ref.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      pendingCaret.current = start + text.length;
      onChange(value.slice(0, start) + text + value.slice(end));
    },
    [ref, value, onChange],
  );

  const backspace = useCallback(() => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    if (start !== end) {
      pendingCaret.current = start;
      onChange(value.slice(0, start) + value.slice(end));
    } else if (start > 0) {
      pendingCaret.current = start - 1;
      onChange(value.slice(0, start - 1) + value.slice(start));
    }
  }, [ref, value, onChange]);

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    requestAnimationFrame(() => ref.current?.focus());
  }, [ref]);

  const close = useCallback(() => setOpen(false), []);

  return {
    open,
    toggle,
    close,
    fieldProps: open ? ({ inputMode: 'none' } as const) : {},
    toggleProps: {
      type: 'button' as const,
      onClick: toggle,
      'aria-label': 'Бурятская клавиатура',
      'aria-expanded': open,
      'aria-controls': panelId,
    },
    panelProps: {
      id: panelId,
      multiline,
      onInsert: insert,
      onBackspace: backspace,
      onClose: close,
    },
  };
}
