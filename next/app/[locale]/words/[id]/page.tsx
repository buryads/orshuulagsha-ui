import type { ReactElement } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/word/breadcrumbs';
import { getOneBurWord } from '@/lib/api/words';
import { translateWord } from '@/lib/api/translate';
import type { TranslateBucketItem, Word } from '@/lib/api/types';
import { isNoTranslation, splitRemark } from '@/components/home/translation-text';

interface WordPageProps {
  params: { locale: string; id: string };
}

function firstUsefulName(item: TranslateBucketItem): string | undefined {
  for (const t of item.translations ?? []) {
    if (!isNoTranslation(t.name)) return splitRemark(t.name).main;
  }
  return undefined;
}

export default async function WordPage({
  params,
}: WordPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const t = await getTranslations('wordPage');
  const data: Word | null = await getOneBurWord(params.id).catch(() => null);

  const headWord = data?.name?.trim() || params.id;
  const translations = (data?.translations ?? [])
    .map((tr) => tr.name)
    .filter((n) => !isNoTranslation(n));
  const ruWords = data?.ru_words?.map((r) => r.name) ?? [];
  const meanings = [...ruWords, ...translations];
  const images = data?.images ?? [];
  const audioUrl = data?.speechs?.[0]?.url;

  // Pull fuzzy/match buckets from the translate API as a "similar words"
  // surface — same source as the home translator's "Похожие" tab.
  const similarResponse = data
    ? await translateWord('bur2ru', headWord).catch(() => null)
    : null;
  const similarSeen = new Set<string>();
  const similar: { id: number; slug: string | null; name: string; gloss?: string }[] = [];
  for (const bucket of [similarResponse?.match ?? [], similarResponse?.fuzzy ?? []]) {
    for (const item of bucket) {
      if (item.name === headWord) continue;
      if (similarSeen.has(item.name)) continue;
      similarSeen.add(item.name);
      similar.push({
        id: item.id,
        slug: item.slug ?? null,
        name: item.name,
        gloss: firstUsefulName(item),
      });
      if (similar.length >= 12) break;
    }
    if (similar.length >= 12) break;
  }

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Breadcrumbs word={headWord} />

      <article style={{ textAlign: 'center', padding: '24px 0 32px' }}>
        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 800,
            margin: 0,
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            textTransform: 'capitalize',
          }}
        >
          {headWord}
        </h1>
        {meanings.length > 0 && (
          <p
            style={{
              marginTop: 12,
              fontSize: 18,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            ({meanings.join(', ')})
          </p>
        )}
        {audioUrl && (
          <audio
            controls
            preload="none"
            src={audioUrl}
            style={{ marginTop: 18, width: 'min(360px, 100%)' }}
          />
        )}
      </article>

      {images.length > 0 && (
        <div
          style={{
            columnCount: 3,
            columnGap: 16,
            marginBottom: 32,
          }}
          className="word-images"
        >
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt={headWord}
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                marginBottom: 16,
                borderRadius: 12,
                display: 'block',
                breakInside: 'avoid',
              }}
            />
          ))}
        </div>
      )}

      {similar.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text)',
              margin: '0 0 14px',
              letterSpacing: '-0.01em',
            }}
          >
            {t('similar')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {similar.map((s) => (
              <Link
                key={`${s.id}-${s.name}`}
                href={`/words/${encodeURIComponent(s.slug ?? String(s.id))}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text)',
                    fontSize: 15,
                  }}
                >
                  {s.name}
                </div>
                {s.gloss && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {s.gloss}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
