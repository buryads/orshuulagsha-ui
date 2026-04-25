'use client';

import { useDeferredValue, useMemo, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import type { Name } from '@/lib/data/names';

export interface NamesExplorerProps {
  names: Name[];
}

export function NamesExplorer({ names }: NamesExplorerProps): ReactElement {
  const t = useTranslations('names');
  const [query, setQuery] = useState('');
  // Defer the value so typing stays responsive on the 700-entry list.
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLocaleLowerCase('ru-RU');
    if (!q) return names;
    return names.filter(
      (n) =>
        n.name.toLocaleLowerCase('ru-RU').includes(q) ||
        (n.description ?? '').toLocaleLowerCase('ru-RU').includes(q),
    );
  }, [names, deferred]);

  return (
    <div>
      <div
        className="card"
        style={{
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 24,
          gap: 8,
        }}
      >
        <Icon name="search" size={18} style={{ margin: '0 8px', color: 'var(--text-soft)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          style={{
            flex: 1,
            minWidth: 180,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 15,
            padding: '8px 0',
            color: 'var(--text)',
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-soft)',
            paddingRight: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {filtered.length} / {names.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 28,
            textAlign: 'center',
            color: 'var(--text-muted)',
            borderStyle: 'dashed',
          }}
        >
          {t('empty')}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((n) => (
            <article
              key={n.name}
              id={n.name}
              className="card"
              style={{ padding: 18 }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {n.name}
              </h3>
              {n.description && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {n.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
