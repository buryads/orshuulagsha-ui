'use client';

import { type ReactElement, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, onSubmit, loading }: SearchBarProps): ReactElement {
  const t = useTranslations('corpus');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSubmit();
  }

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        className="card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1.5px solid var(--border)',
        }}
      >
        <Icon
          name="search"
          size={18}
          style={{ color: 'var(--text-soft)', flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchAriaLabel')}
          autoComplete="off"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 15,
            padding: '6px 0',
            color: 'var(--text)',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('clearSearch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              minWidth: 28,
              border: 'none',
              background: 'var(--surface-2)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-soft)',
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          aria-label={t('searchButton')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            minHeight: 40,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <Icon name="loader" size={14} />
          ) : (
            <Icon name="search" size={14} />
          )}
          <span className="hide-sm">{t('searchButton')}</span>
        </button>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: 'var(--text-soft)',
          paddingLeft: 4,
        }}
      >
        {t('searchHint')}
      </p>
    </div>
  );
}
