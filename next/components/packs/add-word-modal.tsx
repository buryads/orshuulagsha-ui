// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useEffect, useRef, useState } from 'react';
import * as user from '@/lib/api/user';
import type { FoundWord } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

interface AddWordModalProps {
  packId: number;
  open: boolean;
  onClose: () => void;
  onAttached: () => void;
}

export function AddWordModal({
  packId,
  open,
  onClose,
  onAttached,
}: AddWordModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoundWord[]>([]);
  const [searching, setSearching] = useState(false);
  const [attaching, setAttaching] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await user.findWordsByInput(query.trim(), 'bur');
        setResults(found);
      } catch (e) {
        console.error(e);
        setError('Не удалось найти слова');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function attach(wordId: number) {
    if (attaching) return;
    setAttaching(wordId);
    try {
      await user.attachWordToPack(packId, wordId);
      onAttached();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Не удалось добавить слово');
    } finally {
      setAttaching(null);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 100,
        padding: '10vh 16px 16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%',
          maxWidth: 560,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxHeight: '80vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Добавить слово</h2>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="btn-icon"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите бурятское слово..."
          autoFocus
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontSize: 15,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />

        {error ? (
          <div
            role="alert"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              background: 'var(--tertiary-soft)',
              color: 'var(--tertiary-700)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {searching ? (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                textAlign: 'center',
                padding: '12px 0',
              }}
            >
              Ищем...
            </p>
          ) : results.length === 0 && query.trim() ? (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                textAlign: 'center',
                padding: '12px 0',
              }}
            >
              Ничего не найдено
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {results.map((word) => (
                <li key={word.id}>
                  <button
                    type="button"
                    onClick={() => attach(word.id)}
                    disabled={attaching === word.id}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: 'var(--r-sm)',
                      background:
                        attaching === word.id
                          ? 'var(--surface-2)'
                          : 'transparent',
                      color: 'var(--text)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 14,
                    }}
                    className="hover:bg-[var(--surface-2)]"
                  >
                    <span>{word.name}</span>
                    <Icon name="plus" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
