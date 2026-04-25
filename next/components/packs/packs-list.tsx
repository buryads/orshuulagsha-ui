// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import * as user from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';
import { PackCard } from './pack-card';

export function PacksList() {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    user
      .getPacks()
      .then((data) => {
        if (!cancelled) setPacks(data);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError('Не удалось загрузить пакеты');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
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
            Создавайте свои подборки слов для тренировки.
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
      ) : packs === null ? (
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
      ) : packs.length === 0 ? (
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} showEdit />
          ))}
        </div>
      )}
    </div>
  );
}
