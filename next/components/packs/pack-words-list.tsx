// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState } from 'react';
import * as user from '@/lib/api/user';
import type { Word } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

interface PackWordsListProps {
  packId: number;
  words: Word[];
  canEdit: boolean;
  onChange?: () => void;
}

export function PackWordsList({
  packId,
  words,
  canEdit,
  onChange,
}: PackWordsListProps) {
  const [pending, setPending] = useState<Set<number>>(new Set());

  async function handleDelete(wordId: number) {
    if (pending.has(wordId)) return;
    if (!window.confirm('Удалить слово из пакета?')) return;

    setPending((prev) => new Set(prev).add(wordId));
    try {
      await user.deleteAttachedWordFromPack(packId, wordId);
      onChange?.();
    } catch (e) {
      console.error(e);
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(wordId);
        return next;
      });
    }
  }

  if (!words.length) {
    return (
      <div
        className="card"
        style={{
          padding: 32,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        В пакете пока нет слов.
      </div>
    );
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {words.map((word) => {
        const ru = word.ru_words?.map((w) => w.name).join(', ') || '—';
        const isPending = pending.has(word.id);
        const image = word.images?.[0];

        return (
          <li
            key={word.id}
            className="card"
            style={{
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: '64px 1fr 1fr auto',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-soft)',
              }}
            >
              {image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt={word.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Icon name="book" size={20} />
              )}
            </div>

            <div
              style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}
            >
              {word.name}
            </div>

            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {ru}
            </div>

            {canEdit ? (
              <button
                type="button"
                aria-label="Удалить слово"
                onClick={() => handleDelete(word.id)}
                className="btn-icon"
                disabled={isPending}
                title="Удалить"
              >
                <Icon name="x" size={16} />
              </button>
            ) : (
              <span />
            )}
          </li>
        );
      })}
    </ul>
  );
}
