import type { ReactElement } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { getPublicPacks } from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';

function getPackImage(pack: Pack): string | null {
  const first = pack.burWords?.[0];
  if (!first) return null;
  const pivotImageId = first.pivot?.bur_word_image_id ?? null;
  const matched = pivotImageId
    ? first.images?.find((img) => img.id === pivotImageId)
    : undefined;
  return matched?.url ?? first.images?.[0]?.url ?? null;
}

export async function PublicPacks(): Promise<ReactElement | null> {
  const t = await getTranslations('home.publicPacks');
  const packs = await getPublicPacks({ per_page: 4, rand: 1 }).catch(() => [] as Pack[]);

  if (packs.length === 0) return null;

  return (
    <section style={{ padding: '40px clamp(16px, 4vw, 28px) 0' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              margin: 0,
            }}
          >
            {t('title')}
          </h3>
          <Link
            href="/packs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            {t('more')} <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className="word-grid">
          {packs.map((pack) => {
            const image = getPackImage(pack);
            return (
              <Link
                key={pack.id}
                href={`/public-packs/${pack.slug}`}
                style={{
                  display: 'block',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '10 / 7',
                    background:
                      'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-warm-soft) 100%)',
                  }}
                >
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={pack.name}
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
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {pack.name}
                  </div>
                  {pack.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginTop: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {pack.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
