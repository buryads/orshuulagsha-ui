'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import * as admin from '@/lib/api/admin';
import type { VolunteerApplication, VolunteerStatus } from '@/lib/api/admin';
import type { Paginated } from '@/lib/api/types';

const FILTERS: { value: VolunteerStatus; label: string }[] = [
  { value: 'new', label: 'Новые' },
  { value: 'contacted', label: 'Написали' },
  { value: 'rejected', label: 'Отклонены' },
];

const HELP_LABELS: Record<string, string> = {
  voice: 'озвучка',
  review: 'проверка',
  words: 'слова',
  other: 'другое',
};

const cell = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top' as const,
};

export function VolunteersTable() {
  const [status, setStatus] = useState<VolunteerStatus>('new');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<VolunteerApplication> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    setData(null);
    admin
      .getVolunteerApplications(status, page)
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
            : 'Не удалось загрузить список.',
        );
      });
    return () => {
      ignore = true;
    };
  }, [status, page, reload]);

  async function setItemStatus(id: number, next: VolunteerStatus) {
    if (busy !== null) return;
    setBusy(id);
    try {
      await admin.setVolunteerApplicationStatus(id, next);
      setReload((n) => n + 1);
    } catch {
      setError('Не удалось сохранить статус');
    } finally {
      setBusy(null);
    }
  }

  const rows = data?.data ?? [];

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>Заявки знатоков</h1>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        {FILTERS.map((s) => (
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
              <th style={cell}>Имя</th>
              <th style={cell}>Telegram</th>
              <th style={cell}>Поможет</th>
              <th style={cell}>О себе</th>
              <th style={cell}>Дата</th>
              <th style={cell} aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {data === null ? (
              <tr>
                <td colSpan={6} style={{ ...cell, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Загружаем...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...cell, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Нет данных
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td style={cell}>
                    <strong>{item.name}</strong>
                  </td>
                  <td style={cell}>
                    <a href={`https://t.me/${item.telegram}`} target="_blank" rel="noreferrer noopener">
                      @{item.telegram}
                    </a>
                  </td>
                  <td style={cell}>{item.help_types.map((h) => HELP_LABELS[h] ?? h).join(', ')}</td>
                  <td style={{ ...cell, maxWidth: 280, whiteSpace: 'pre-wrap' }}>{item.about}</td>
                  <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                    {item.status !== 'contacted' ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy !== null}
                        onClick={() => setItemStatus(item.id, 'contacted')}
                      >
                        Написали
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy !== null}
                        onClick={() => setItemStatus(item.id, 'new')}
                      >
                        Вернуть в новые
                      </button>
                    )}{' '}
                    {item.status !== 'rejected' ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy !== null}
                        onClick={() => setItemStatus(item.id, 'rejected')}
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
          <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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
