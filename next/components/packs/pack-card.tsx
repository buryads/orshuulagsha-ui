'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Pack, Word } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';
import * as user from '@/lib/api/user';

interface PackCardProps {
  pack: Pack;
  hrefBase?: string;
  showEdit?: boolean;
  onDeleted?: (id: number) => void;
}

function getPackImage(pack: Pack): string | null {
  const first = pack.burWords?.[0] as Word | undefined;
  if (!first) return null;
  const pivotImageId = first.pivot?.bur_word_image_id ?? null;
  const matched = pivotImageId
    ? first.images?.find((img) => img.id === pivotImageId)
    : undefined;
  return matched?.url ?? first.images?.[0]?.url ?? null;
}

export function PackCard({
  pack,
  hrefBase = '/packs',
  showEdit = true,
  onDeleted,
}: PackCardProps) {
  const t = useTranslations('packCard');
  const wordCount = pack.burWords?.length ?? 0;
  const isPrivate = Boolean(pack.is_private);
  const image = getPackImage(pack);
  const detailHref = `${hrefBase}/${pack.slug}`;
  const trainHref = `/packs/training/${pack.slug}`;
  const editHref = `/packs/edit/${pack.slug}`;

  const [deleting, setDeleting] = useState(false);

  function pluralWord(n: number): string {
    const abs = Math.abs(n) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return t('wordsMany');
    if (last === 1) return t('wordsOne');
    if (last > 1 && last < 5) return t('wordsFew');
    return t('wordsMany');
  }

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(t('deleteConfirm', { name: pack.name }))) return;
    setDeleting(true);
    try {
      await user.deletePack(pack.id);
      onDeleted?.(pack.id);
    } catch (e) {
      console.error(e);
      window.alert(t('deleteFailed'));
      setDeleting(false);
    }
  }

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Link
        href={detailHref}
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '10 / 6',
            background:
              'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-warm-soft) 100%)',
          }}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
          <span
            className={isPrivate ? 'chip chip-rose' : 'chip chip-green'}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              backdropFilter: 'blur(6px)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            {isPrivate ? t('private') : t('public')}
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: 0,
              color: 'var(--text)',
              lineHeight: 1.25,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {pack.name}
          </h3>
          {pack.description && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                margin: 0,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {pack.description}
            </p>
          )}
          <span
            style={{
              marginTop: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <Icon name="book" size={13} />
            {wordCount} {pluralWord(wordCount)}
          </span>
        </div>
      </Link>

      <div
        style={{
          padding: '10px 12px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <Link
          href={trainHref}
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '8px 12px',
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="play" size={14} />
          {t('train')}
        </Link>
        {showEdit && (
          <>
            <Link
              href={editHref}
              className="btn-icon"
              aria-label={t('edit')}
              title={t('edit')}
              style={{ width: 34, height: 34, flexShrink: 0 }}
            >
              <Icon name="edit" size={14} />
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-icon"
              aria-label={t('delete')}
              title={t('delete')}
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                color: 'var(--tertiary)',
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

