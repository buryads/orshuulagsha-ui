'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import * as user from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';
import { PackCard } from './pack-card';
import { Pagination } from '@/components/explore/pagination';

const PER_PAGE = 12;

function parsePage(raw: string | null): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

interface PageState {
  packs: Pack[];
  total: number;
  lastPage: number;
}

function PacksListInner() {
  const sp = useSearchParams();
  const page = parsePage(sp.get('page'));

  const [state, setState] = useState<PageState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    user
      .getPacksPaginated({ page, perPage: PER_PAGE })
      .then((res) => {
        if (cancelled) return;
        setState({ packs: res.data, total: res.total, lastPage: res.lastPage });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError('Не удалось загрузить пакеты');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Мои пакеты
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              marginTop: 6,
              fontSize: 15,
            }}
          >
            {state ? `Всего: ${state.total}` : 'Создавайте свои подборки слов для тренировки.'}
          </p>
        </div>
        <Link href="/packs/create" className="btn btn-primary">
          <Icon name="plus" size={16} />
          Создать пакет
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="card"
          style={{
            padding: 16,
            background: 'var(--tertiary-soft)',
            color: 'var(--tertiary-700)',
          }}
        >
          {error}
        </div>
      ) : state === null ? (
        <div
          className="card"
          style={{
            padding: 32,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Загружаем...
        </div>
      ) : state.packs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Icon name="book" size={36} />
          <p style={{ fontSize: 16 }}>У вас пока нет пакетов</p>
          <Link href="/packs/create" className="btn btn-primary">
            <Icon name="plus" size={16} />
            Создать первый пакет
          </Link>
        </div>
      ) : (
        <>
          <div
            className="word-grid"
            style={{
              display: 'grid',
              gap: 16,
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {state.packs.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                showEdit
                onDeleted={(id) =>
                  setState((prev) =>
                    prev
                      ? {
                          ...prev,
                          packs: prev.packs.filter((p) => p.id !== id),
                          total: Math.max(0, prev.total - 1),
                        }
                      : prev,
                  )
                }
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={state.lastPage} />
        </>
      )}
    </div>
  );
}

export function PacksList() {
  // useSearchParams must live under a Suspense boundary in the App Router so
  // the page can be statically rendered up to the search-param read.
  return (
    <Suspense fallback={null}>
      <PacksListInner />
    </Suspense>
  );
}
