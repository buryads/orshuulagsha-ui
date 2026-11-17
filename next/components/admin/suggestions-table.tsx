'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import * as admin from '@/lib/api/admin';
import type {
  CreatedWord,
  Paginated,
  TranslationSuggestion,
  TranslationSuggestionStatus,
} from '@/lib/api/types';
import {
  approveConflictFromError,
  canApproveCreate,
  confirmationsLabel,
} from '@/lib/admin/word-request-suggestions';

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

type Created =
  | { kind: 'created'; word: CreatedWord; indexed: boolean }
  | { kind: 'linked'; word: CreatedWord };

function createdMessage(created: Created): string {
  if (created.kind === 'linked') return 'Запрос привязан к слову';
  return created.indexed ? 'Слово создано' : 'Слово создано, но поиск обновится позже';
}

function useNarrowScreen(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return narrow;
}

interface WordRequestRowProps {
  row: TranslationSuggestion;
  onChange: (row: TranslationSuggestion) => void;
  onRemove: (id: number) => void;
  onCreated: (created: Created) => void;
}

type RowMode = 'idle' | 'editing' | 'rejecting';

function WordRequestRow({ row, onChange, onRemove, onCreated }: WordRequestRowProps) {
  const [mode, setMode] = useState<RowMode>('idle');
  const [translation, setTranslation] = useState(row.translation);
  const [example, setExample] = useState(row.example ?? '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ id: number; slug: string } | null>(
    null,
  );

  const confirmations = row.confirmations ?? 0;
  const approvable = canApproveCreate(confirmations);
  const isPending = row.status === 'pending';
  const query = row.word_request?.query ?? row.word;

  function startEdit() {
    setTranslation(row.translation);
    setExample(row.example ?? '');
    setRowError(null);
    setMode('editing');
  }

  async function approve() {
    setBusy(true);
    setRowError(null);
    setDuplicate(null);
    try {
      const result = await admin.approveWordRequestSuggestion(row.id);
      onRemove(row.id);
      onCreated({ kind: 'created', word: result.word, indexed: result.indexed });
    } catch (e) {
      const conflict = approveConflictFromError(e);
      if (conflict?.kind === 'duplicate') {
        setDuplicate(conflict.existing);
      } else if (conflict?.kind === 'needs_confirmations') {
        setRowError('Нужен второй знаток');
      } else {
        setRowError('Не удалось создать слово. Попробуйте ещё раз.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function linkExisting(burwordId: number) {
    setBusy(true);
    setRowError(null);
    try {
      const word = await admin.linkWordRequestSuggestion(row.id, burwordId);
      onRemove(row.id);
      onCreated({ kind: 'linked', word });
    } catch {
      setRowError('Не удалось привязать слово.');
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    setBusy(true);
    setRowError(null);
    try {
      const updated = await admin.editWordRequestSuggestion(row.id, {
        translation: translation.trim(),
        example: example.trim() || null,
      });
      onChange({ ...row, ...updated, confirmations: 0, moderator_edited: true });
      setMode('idle');
    } catch {
      setRowError('Не удалось сохранить правку.');
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    setRowError(null);
    try {
      await admin.rejectWordRequestSuggestion(row.id, reason.trim());
      onRemove(row.id);
    } catch {
      setRowError('Не удалось отклонить ответ.');
    } finally {
      setBusy(false);
    }
  }

  const hint = { fontSize: 12, color: 'var(--text-muted)' };

  return (
    <tr>
      <td style={cell}>
        <strong>{query}</strong>
        <div style={hint}>{row.direction === 'ru2bur' ? 'ru → bur' : 'bur → ru'}</div>
      </td>
      <td style={cell}>{row.word_request?.demand ?? 0}</td>
      <td style={cell}>
        {mode === 'editing' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              aria-label="Перевод"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              style={{ padding: 8, fontSize: 13 }}
            />
            <textarea
              aria-label="Пример"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              style={{ padding: 8, fontSize: 13 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || translation.trim() === ''}
                onClick={saveEdit}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setMode('idle')}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>{row.translation}</div>
            {row.example ? <div style={{ fontSize: 12, marginTop: 4 }}>пример: «{row.example}»</div> : null}
            <div style={{ ...hint, marginTop: 4 }}>{confirmationsLabel(confirmations)}</div>
            {row.moderator_edited ? (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '2px 8px',
                  fontSize: 12,
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                }}
              >
                Модератор предложил правку
              </span>
            ) : null}
          </>
        )}
      </td>
      <td style={{ ...cell, minWidth: 220 }}>
        {isPending && mode === 'rejecting' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <textarea
              aria-label="Причина отклонения"
              placeholder="Причина, которую увидит знаток"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              style={{ padding: 8, fontSize: 13 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || reason.trim() === ''}
                onClick={reject}
              >
                Отклонить
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setMode('idle')}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : isPending && mode === 'idle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !approvable}
              onClick={approve}
            >
              Одобрить и создать слово
            </button>
            {approvable ? null : <span style={hint}>Нужен второй знаток</span>}
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={startEdit}>
              Изменить
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => {
                setReason('');
                setMode('rejecting');
              }}
            >
              Отклонить
            </button>
            {duplicate ? (
              <div role="alert" style={{ fontSize: 13 }}>
                Такое слово уже есть: {duplicate.slug}{' '}
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => linkExisting(duplicate.id)}
                >
                  Привязать к существующему
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {rowError ? (
          <div role="alert" style={{ fontSize: 13, marginTop: 8, color: 'var(--tertiary-700)' }}>
            {rowError}
          </div>
        ) : null}
      </td>
    </tr>
  );
}

interface WordRequestsListProps {
  rows: TranslationSuggestion[] | null;
  narrow: boolean;
  onChange: (row: TranslationSuggestion) => void;
  onRemove: (id: number) => void;
  onCreated: (created: Created) => void;
}

function WordRequestsList({ rows, narrow, onChange, onRemove, onCreated }: WordRequestsListProps) {
  if (narrow) {
    return (
      <div className="card" style={{ padding: 24, color: 'var(--text-muted)' }}>
        Откройте на компьютере
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
      <table
        aria-busy={rows === null}
        style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
            <th style={cell}>Слово</th>
            <th style={cell}>Спрос</th>
            <th style={cell}>Ответ знатока</th>
            <th style={cell}>Действие</th>
          </tr>
        </thead>
        <tbody>
          {rows === null ? (
            [0, 1, 2].map((i) => (
              <tr key={i} aria-hidden="true">
                <td colSpan={4} style={cell}>
                  <div style={{ height: 36, borderRadius: 6, background: 'var(--surface-2)' }} />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ ...cell, textAlign: 'center', color: 'var(--text-muted)' }}>
                Нет ответов на проверке
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <WordRequestRow
                key={row.id}
                row={row}
                onChange={onChange}
                onRemove={onRemove}
                onCreated={onCreated}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SuggestionsTable() {
  const [status, setStatus] = useState<TranslationSuggestionStatus>('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<TranslationSuggestion> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [wordRequests, setWordRequests] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const narrow = useNarrowScreen();

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    setData(null);
    admin
      .getTranslationSuggestions(
        status,
        page,
        wordRequests ? 'word_request' : undefined,
      )
      .then((res) => {
        if (ignore) return;
        if (res.data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setData(res);
        setError(null);
      })
      .catch((e) => {
        if (ignore) return;
        setData({ data: [], current_page: page, last_page: page });
        setError(
          axios.isAxiosError(e) && e.response?.status === 403
            ? 'Нужны права администратора.'
            : wordRequests
              ? 'Не удалось загрузить предложения.'
              : 'Не удалось загрузить список.',
        );
      });
    return () => {
      ignore = true;
    };
  }, [status, page, reload, wordRequests]);

  function updateRow(row: TranslationSuggestion) {
    setData((d) => (d ? { ...d, data: d.data.map((r) => (r.id === row.id ? row : r)) } : d));
  }

  function removeRow(id: number) {
    setData((d) => (d ? { ...d, data: d.data.filter((r) => r.id !== id) } : d));
  }

  async function decide(id: number, next: 'approved' | 'rejected') {
    if (busy !== null) return;
    setBusy(id);
    try {
      await admin.setTranslationSuggestionStatus(id, next);
      setReload((n) => n + 1);
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
        <button
          type="button"
          aria-pressed={wordRequests}
          className={wordRequests ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => {
            setWordRequests((v) => !v);
            setPage(1);
          }}
        >
          Из запросов учеников
        </button>
      </div>

      {error ? (
        <div role="alert" style={{ color: 'var(--tertiary-700)', marginBottom: 12 }}>
          {error}
          {wordRequests ? (
            <>
              {' '}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReload((n) => n + 1)}
              >
                Обновить
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {created ? (
        <div
          role="status"
          style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}
        >
          <span>{createdMessage(created)}</span>
          <a href={`/words/${encodeURIComponent(created.word.slug)}`}>{created.word.name}</a>
          <button type="button" className="btn btn-secondary" onClick={() => setCreated(null)}>
            Закрыть
          </button>
        </div>
      ) : null}

      {wordRequests ? (
        error ? null : (
          <WordRequestsList
            rows={data ? data.data : null}
            narrow={narrow}
            onChange={updateRow}
            onRemove={removeRow}
            onCreated={setCreated}
          />
        )
      ) : (
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
      )}

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
