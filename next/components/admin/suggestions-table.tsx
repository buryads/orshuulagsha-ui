'use client';

import { useCallback, useEffect, useState } from 'react';
import * as admin from '@/lib/api/admin';
import type {
  Paginated,
  TranslationSuggestion,
  TranslationSuggestionStatus,
} from '@/lib/api/types';

const STATUSES: { value: TranslationSuggestionStatus; label: string }[] = [
  { value: 'pending', label: 'Ожидают' },
  { value: 'approved', label: 'Одобрены' },
  { value: 'rejected', label: 'Отклонены' },
];

const cell = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top' as const,
};

export function SuggestionsTable() {
  const [status, setStatus] = useState<TranslationSuggestionStatus>('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<TranslationSuggestion> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(
    () =>
      admin
        .getTranslationSuggestions(status, page)
        .then((res) => {
          setData(res);
          setError(null);
        })
        .catch(() => {
          setData({ data: [], current_page: 1, last_page: 1 });
          setError('Не удалось загрузить. Нужны права администратора.');
        }),
    [status, page],
  );

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  async function decide(id: number, next: 'approved' | 'rejected') {
    if (busy !== null) return;
    setBusy(id);
    try {
      await admin.setTranslationSuggestionStatus(id, next);
      await load();
    } catch {
      setError('Не удалось сохранить решение');
    } finally {
      setBusy(null);
    }
  }

  const rows = data?.data ?? [];

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Предложения переводов
      </h1>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={s.value === status ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => {
              setStatus(s.value);
              setPage(1);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" style={{ color: 'var(--tertiary-700)', marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              <th style={cell}>Слово</th>
              <th style={cell}>Перевод</th>
              <th style={cell}>Направление</th>
              <th style={cell}>Комментарий</th>
              <th style={cell} aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {data === null ? (
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Загружаем...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Нет данных
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td style={cell}>
                    <strong>{item.word}</strong>
                  </td>
                  <td style={cell}>{item.translation}</td>
                  <td style={cell}>{item.direction === 'ru2bur' ? 'ru → bur' : 'bur → ru'}</td>
                  <td style={cell}>{item.note}</td>
                  <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                    {item.status !== 'approved' ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy !== null}
                        onClick={() => decide(item.id, 'approved')}
                      >
                        Одобрить
                      </button>
                    ) : null}{' '}
                    {item.status !== 'rejected' ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy !== null}
                        onClick={() => decide(item.id, 'rejected')}
                      >
                        Отклонить
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.last_page > 1 ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Назад
          </button>
          <span style={{ fontSize: 13 }}>
            {data.current_page} / {data.last_page}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= data.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд
          </button>
        </div>
      ) : null}
    </div>
  );
}
