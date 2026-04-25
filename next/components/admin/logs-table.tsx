// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useCallback, useEffect, useState } from 'react';
import * as admin from '@/lib/api/admin';
import type {
  TranslationLog,
  TranslationLogParams,
  TranslationType,
} from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

const PER_PAGE = 100;

interface Filters {
  type: TranslationType | null;
  status: '1' | '0' | null;
  ignored: '1' | null;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function methodLabel(method: string): string {
  return method
    .replace('App\\Services\\', '')
    .replace('TranslateService', '')
    .replace('RuToBur', 'ru → bur')
    .replace('BurToRu', 'bur → ru');
}

export function LogsTable() {
  const [logs, setLogs] = useState<TranslationLog[] | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    ru2bur: 0,
    bur2ru: 0,
  });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    status: null,
    ignored: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pendingIgnore, setPendingIgnore] = useState<Set<number>>(new Set());

  const fetchLogs = useCallback(
    (currentPage: number, currentFilters: Filters) => {
      const params: TranslationLogParams = {
        limit: PER_PAGE,
        offset: currentPage * PER_PAGE - PER_PAGE,
        ignored: currentFilters.ignored,
        status: currentFilters.status,
        type: currentFilters.type,
      };
      return admin.getTranslationLogs(params);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    fetchLogs(page, filters)
      .then((data) => {
        if (!cancelled) setLogs(data);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setLogs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [page, filters, fetchLogs]);

  useEffect(() => {
    Promise.all([
      admin.getTranslationsCount(),
      admin.getTranslationsCount('ru2bur'),
      admin.getTranslationsCount('bur2ru'),
    ])
      .then(([total, ru2bur, bur2ru]) => {
        setCounts({ total, ru2bur, bur2ru });
      })
      .catch((e) => console.error(e));
  }, []);

  async function handleIgnore(id: number) {
    if (pendingIgnore.has(id)) return;
    setPendingIgnore((prev) => new Set(prev).add(id));
    try {
      await admin.ignoreTranslationLog(id);
      const fresh = await fetchLogs(page, filters);
      setLogs(fresh);
    } catch (e) {
      console.error(e);
    } finally {
      setPendingIgnore((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const lastPage = Math.max(1, Math.ceil(counts.total / PER_PAGE));
  const hasFilters = Boolean(filters.type || filters.status || filters.ignored);

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Логи переводов
          </h1>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              marginTop: 12,
              fontSize: 13,
              color: 'var(--text-muted)',
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <li>
              Всего: <strong>{counts.total.toLocaleString('ru-RU')}</strong>
            </li>
            <li>
              ru → bur:{' '}
              <strong>{counts.ru2bur.toLocaleString('ru-RU')}</strong>
            </li>
            <li>
              bur → ru:{' '}
              <strong>{counts.bur2ru.toLocaleString('ru-RU')}</strong>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="btn btn-secondary"
          style={
            hasFilters ? { borderColor: 'var(--primary)' } : undefined
          }
        >
          <Icon name="filter" size={16} />
          Фильтры
        </button>
      </header>

      {showFilters ? (
        <div
          className="card"
          style={{
            padding: 20,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <FilterGroup
            label="Тип перевода"
            value={filters.type}
            options={[
              { label: 'Все', value: null },
              { label: 'bur → ru', value: 'bur2ru' },
              { label: 'ru → bur', value: 'ru2bur' },
            ]}
            onChange={(value) =>
              setFilters((f) => ({ ...f, type: value as TranslationType | null }))
            }
          />
          <FilterGroup
            label="Статус"
            value={filters.status}
            options={[
              { label: 'Все', value: null },
              { label: 'Успешные', value: '1' },
              { label: 'Без результатов', value: '0' },
            ]}
            onChange={(value) =>
              setFilters((f) => ({
                ...f,
                status: value as '1' | '0' | null,
                ignored: value ? null : f.ignored,
              }))
            }
          />
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={filters.ignored === '1'}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  ignored: e.target.checked ? '1' : null,
                  status: e.target.checked ? null : f.status,
                }))
              }
              style={{
                width: 16,
                height: 16,
                accentColor: 'var(--primary)',
              }}
            />
            Показать игнорированные
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setShowFilters(false);
              }}
              className="btn btn-primary"
            >
              Применить
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="card"
        style={{ padding: 0, overflowX: 'auto' }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <Th>Слово / фраза</Th>
              <Th>Результаты</Th>
              <Th>Тип</Th>
              <Th>Дата и место</Th>
              <Th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {logs === null ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Загружаем...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Нет данных
                </td>
              </tr>
            ) : (
              logs.map((item, idx) => {
                const noResults = !item.results_count;
                return (
                  <tr
                    key={item.id}
                    style={{
                      background: noResults
                        ? 'var(--tertiary-soft)'
                        : idx % 2
                          ? 'var(--surface-2)'
                          : 'transparent',
                      opacity: item.ignore ? 0.4 : 1,
                    }}
                  >
                    <Td>
                      <strong>{item.translation_source}</strong>
                    </Td>
                    <Td>{item.results_count}</Td>
                    <Td>{methodLabel(item.method)}</Td>
                    <Td>
                      <div>{formatDate(item.created_at)}</div>
                      {item.location_name ? (
                        <small style={{ color: 'var(--text-soft)' }}>
                          {item.location_name}
                        </small>
                      ) : null}
                    </Td>
                    <Td style={{ textAlign: 'right' }}>
                      {item.results_count === 0 && !item.ignore ? (
                        <button
                          type="button"
                          onClick={() => handleIgnore(item.id)}
                          disabled={pendingIgnore.has(item.id)}
                          className="btn-icon"
                          title="Игнорировать"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      ) : null}
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 ? (
        <nav
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-secondary"
          >
            <Icon name="arrow-left" size={14} />
            Назад
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {page} / {lastPage}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="btn btn-secondary"
          >
            Далее
            <Icon name="arrow-right" size={14} />
          </button>
        </nav>
      ) : null}
    </div>
  );
}

function Th({
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...rest}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        verticalAlign: 'top',
        ...style,
      }}
    >
      {children}
    </td>
  );
}

interface FilterGroupProps<T extends string | null> {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}

function FilterGroup<T extends string | null>({
  label,
  value,
  options,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <fieldset
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <legend
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
      >
        {label}
      </legend>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <label
              key={String(opt.value)}
              className={checked ? 'chip chip-primary' : 'chip'}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="radio"
                checked={checked}
                onChange={() => onChange(opt.value)}
                style={{ display: 'none' }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
