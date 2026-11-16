// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import { Icon } from '@/components/ui/icon';
import { BurKeyboard } from '@/components/home/bur-keyboard';
import { useBurKeyboard } from '@/components/home/use-bur-keyboard';
import { normalizeBuryatH } from '@/lib/bur-text';

export function SearchBar(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState<string>(initialQ);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const kb = useBurKeyboard(inputRef, q, setQ);

  function pushQuery(value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim().length === 0) {
      params.delete('q');
    } else {
      params.set('q', value.trim());
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `?${qs}` : '?');
  }

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setSubmitting(true);
    const normalized = normalizeBuryatH(q);
    setQ(normalized);
    pushQuery(normalized);
    // Reset after micro-task — visual only.
    setTimeout(() => setSubmitting(false), 150);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>): void {
    setQ(e.target.value);
  }

  return (
    <>
    <form
      onSubmit={onSubmit}
      className="card"
      style={{
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <Icon
        name="search"
        size={20}
        style={{ margin: '0 18px', color: 'var(--text-soft)' }}
      />
      <input
        ref={inputRef}
        {...kb.fieldProps}
        value={q}
        onChange={onChange}
        placeholder="Поиск на бурятском, русском или транслитерацией…"
        aria-label="Поиск по словарю"
        readOnly={submitting}
        style={{
          flex: 1,
          padding: '18px 0',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 16,
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          minWidth: 0,
        }}
      />
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 12px',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <button
          className="btn-icon"
          {...kb.toggleProps}
          style={{ color: kb.open ? 'var(--primary)' : undefined }}
        >
          <Icon name="keyboard" size={16} />
        </button>
        <button type="button" className="btn-icon" aria-label="Голосовой ввод">
          <Icon name="mic" size={16} />
        </button>
        <button type="button" className="btn-icon" aria-label="AI-помощник">
          <Icon name="ai" size={16} />
        </button>
      </div>
    </form>
    {kb.open && (
      <div style={{ marginTop: -10, marginBottom: 20 }}>
        <BurKeyboard {...kb.panelProps} />
      </div>
    )}
    </>
  );
}
