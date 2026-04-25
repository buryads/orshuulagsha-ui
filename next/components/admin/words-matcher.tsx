// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as admin from '@/lib/api/admin';
import type { RuWord, Word } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

const SOURCE = 'bur' as const;
const DESTINATION = 'ru' as const;

// `Word` and `RuWord` overlap on { id, name } — that's all the matcher needs.
type AttachableWord = Pick<Word, 'id' | 'name'>;

export function WordsMatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [main, setMain] = useState<Word | null>(null);
  const [selected, setSelected] = useState<AttachableWord[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIds = useMemo(
    () => new Set(selected.map((w) => w.id)),
    [selected],
  );

  const initialIdsKey = useMemo(
    () => (main?.ru_words ?? []).map((w) => w.id).join(','),
    [main],
  );
  const selectedIdsKey = useMemo(
    () => selected.map((w) => w.id).join(','),
    [selected],
  );
  const hasUnsaved = initialIdsKey !== selectedIdsKey;

  const loadById = useCallback(async (id: number) => {
    try {
      const word = await admin.getWord(id, SOURCE, DESTINATION);
      setMain(word);
      setSelected(word.ru_words ? [...word.ru_words] : []);
      return word;
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить слово');
      return null;
    }
  }, []);

  const loadRandom = useCallback(async () => {
    setLoadingNext(true);
    setInput('');
    setResults([]);
    try {
      const word = await admin.getRandomRelationshipLessWord(
        SOURCE,
        DESTINATION,
      );
      setMain(word);
      setSelected(word.ru_words ? [...word.ru_words] : []);
      const params = new URLSearchParams(window.location.search);
      params.set('id', String(word.id));
      router.replace(`?${params.toString()}`);
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить случайное слово');
    } finally {
      setLoadingNext(false);
    }
  }, [router]);

  useEffect(() => {
    const idStr = searchParams.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (Number.isFinite(id)) {
      void loadById(id);
    } else {
      void loadRandom();
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    debounceRef.current = setTimeout(async () => {
      try {
        const found = await admin.getWords(
          input.trim(),
          SOURCE,
          DESTINATION,
          signal,
        );
        if (!signal.aborted) setResults(found);
      } catch (e) {
        if (!signal.aborted) {
          console.error(e);
        }
      } finally {
        if (!signal.aborted) setSearching(false);
      }
    }, 300);
  }, [input]);

  function pickWord(word: AttachableWord) {
    if (selectedIds.has(word.id)) return;
    setSelected((prev) => [...prev, { id: word.id, name: word.name }]);
  }

  function removeWord(id: number) {
    setSelected((prev) => prev.filter((w) => w.id !== id));
  }

  async function addNew() {
    if (!input.trim()) return;
    try {
      const created = await admin.addNewWordToDatabase(
        input.trim().toLowerCase(),
        SOURCE,
        DESTINATION,
      );
      pickWord(created);
      setToast('Слово добавлено в базу');
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error(e);
      setError('Не удалось добавить слово');
    }
  }

  async function save() {
    if (saving || !main || !hasUnsaved) return;
    setSaving(true);
    try {
      const ru_words: RuWord[] = selected.map((w) => ({
        id: w.id,
        name: w.name,
      }));
      const payload: Word = { ...main, ru_words };
      const updated = await admin.syncWord(payload, SOURCE, DESTINATION);
      setMain(updated);
      setSelected(updated.ru_words ? [...updated.ru_words] : selected);
      setToast('Сохранено');
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error(e);
      setError('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void save();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        void loadRandom();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, selected, hasUnsaved]);

  const inputLower = input.trim().toLowerCase();
  const inputAlreadyExists = results.some(
    (r) => r.name.toLowerCase() === inputLower,
  );
  const showEmptyState =
    !!input.trim() && !searching && results.length === 0;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Сопоставление слов
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Найдите перевод и привяжите его к исходному слову. Cmd/Ctrl+S —
          сохранить, Cmd/Ctrl+M — следующее слово.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="card"
          style={{
            padding: 12,
            marginBottom: 16,
            background: 'var(--tertiary-soft)',
            color: 'var(--tertiary-700)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="card"
          style={{
            padding: 12,
            marginBottom: 16,
            background: 'var(--accent-green-soft)',
            color: 'var(--accent-green)',
            fontSize: 13,
          }}
        >
          {toast}
        </div>
      ) : null}

      <section
        className="card"
        style={{
          padding: 24,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Слово без перевода
        </span>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {main?.name ?? '—'}
        </h2>
        {main?.translations && main.translations.length > 0 ? (
          <p
            style={{
              marginTop: 10,
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              Возможные переводы:
            </span>{' '}
            {main.translations.map((t) => t.name).join(', ')}
          </p>
        ) : null}
      </section>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={loadRandom}
          className="btn btn-secondary"
          disabled={loadingNext}
        >
          <Icon name="arrow-right" size={16} />
          {loadingNext ? 'Загружаем...' : 'Другое слово'}
        </button>
        <button
          type="button"
          onClick={save}
          className="btn btn-primary"
          disabled={!hasUnsaved || saving}
        >
          <Icon name="check" size={16} />
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 24,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            Поиск перевода
          </h3>
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Начните вводить русское слово..."
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

          {showEmptyState ? (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ marginBottom: 12 }}>
                В базе нет такого слова
              </p>
              <button
                type="button"
                onClick={addNew}
                className="btn btn-primary"
              >
                <Icon name="plus" size={14} />
                Добавить в базу
              </button>
            </div>
          ) : null}

          {results.length > 0 ? (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '12px 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 360,
                overflowY: 'auto',
              }}
            >
              {results.map((word) => {
                const taken = selectedIds.has(word.id);
                return (
                  <li key={word.id}>
                    <button
                      type="button"
                      onClick={() => pickWord(word)}
                      disabled={taken}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 'var(--r-sm)',
                        background: taken
                          ? 'var(--surface-2)'
                          : 'transparent',
                        opacity: taken ? 0.4 : 1,
                        color: 'var(--text)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 14,
                        cursor: taken ? 'default' : 'pointer',
                      }}
                    >
                      <span>{word.name}</span>
                      {!taken ? (
                        <Icon name="plus" size={14} />
                      ) : (
                        <Icon name="check" size={14} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {input.trim() && !showEmptyState && !inputAlreadyExists ? (
            <button
              type="button"
              onClick={addNew}
              className="btn btn-secondary"
              style={{ marginTop: 12 }}
            >
              <Icon name="plus" size={14} />
              Добавить «{input.trim()}» в базу
            </button>
          ) : null}
        </div>

        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            Прикреплённые
          </h3>
          {selected.length === 0 ? (
            <p
              style={{
                color: 'var(--text-soft)',
                fontSize: 13,
              }}
            >
              Пока ничего не прикреплено.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {selected.map((word) => (
                <li key={word.id}>
                  <button
                    type="button"
                    onClick={() => removeWord(word.id)}
                    title="Удалить"
                    className="chip"
                    style={{
                      cursor: 'pointer',
                      paddingRight: 8,
                    }}
                  >
                    {word.name}
                    <Icon name="x" size={12} />
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
