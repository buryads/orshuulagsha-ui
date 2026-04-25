// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import * as userApi from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';
import { Breadcrumb } from '@/components/breadcrumb';
import { Icon } from '@/components/ui/icon';
import { PackWordsList } from './pack-words-list';
import { AddWordModal } from './add-word-modal';

interface PackDetailProps {
  slug: string;
  /** When true, fetches from public endpoint and disables editing UI. */
  publicView?: boolean;
}

export function PackDetail({ slug, publicView = false }: PackDetailProps) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const load = useCallback(
    (isCancelled?: () => boolean) => {
      const fetcher = publicView ? userApi.getPublicPack : userApi.getPack;
      return fetcher(slug)
        .then((data) => {
          if (isCancelled?.()) return;
          setPack(data);
        })
        .catch((e) => {
          if (isCancelled?.()) return;
          console.error(e);
          setError('Не удалось загрузить пакет');
        });
    },
    [slug, publicView],
  );

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    void load(isCancelled);
    if (!publicView) {
      userApi
        .getUser()
        .then((u) => {
          if (!cancelled) setCurrentUserId(u.id);
        })
        .catch(() => {
          /* no-op — leave currentUserId null */
        });
    }
    return () => {
      cancelled = true;
    };
  }, [load, publicView]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
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
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
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
      </div>
    );
  }

  const isOwner = !publicView && currentUserId === pack.user_id;
  const isPrivate = Boolean(pack.is_private);
  const wordsCount = pack.burWords?.length ?? 0;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Breadcrumb
        items={
          publicView
            ? [
                { label: 'Главная', href: '/' },
                { label: pack.name },
              ]
            : [
                { label: 'Главная', href: '/' },
                { label: 'Мои пакеты', href: '/packs' },
                { label: pack.name },
              ]
        }
      />

      <header
        style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {pack.name}
            </h1>
            <span className={isPrivate ? 'chip chip-rose' : 'chip chip-green'}>
              {isPrivate ? 'Приватный' : 'Публичный'}
            </span>
            <span className="chip">
              <Icon name="book" size={14} />
              {wordsCount}
            </span>
          </div>
          {pack.description ? (
            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: 8,
                fontSize: 15,
                maxWidth: 720,
              }}
            >
              {pack.description}
            </p>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isOwner ? (
            <Link
              href={`/packs/edit/${pack.slug}`}
              className="btn btn-secondary"
            >
              <Icon name="edit" size={16} />
              Изменить
            </Link>
          ) : null}
          {wordsCount > 0 ? (
            <Link
              href={
                publicView
                  ? `/packs/training/${pack.slug}`
                  : `/packs/training/${pack.slug}`
              }
              className="btn btn-primary"
            >
              <Icon name="zap" size={16} />
              Начать тренировку
            </Link>
          ) : null}
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        <PackWordsList
          packId={pack.id}
          words={pack.burWords ?? []}
          canEdit={isOwner}
          onChange={load}
        />

        {isOwner ? (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            <Icon name="plus" size={16} />
            Добавить слово
          </button>
        ) : null}
      </section>

      {isOwner ? (
        <AddWordModal
          packId={pack.id}
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAttached={load}
        />
      ) : null}
    </div>
  );
}
