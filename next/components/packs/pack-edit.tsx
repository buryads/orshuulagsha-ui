// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useEffect, useState } from 'react';
import * as user from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';
import { Breadcrumb } from '@/components/breadcrumb';
import { PackForm } from './pack-form';

interface PackEditProps {
  slug: string;
}

export function PackEdit({ slug }: PackEditProps) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    user
      .getPack(slug)
      .then((data) => {
        if (!cancelled) setPack(data);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError('Не удалось загрузить пакет');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Мои пакеты', href: '/packs' },
          { label: pack?.name ?? 'Редактирование' },
        ]}
      />

      <h1
        style={{
          marginTop: 16,
          marginBottom: 24,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Редактирование пакета
      </h1>

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
      ) : pack ? (
        <PackForm mode="edit" initial={pack} />
      ) : (
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
      )}
    </div>
  );
}
