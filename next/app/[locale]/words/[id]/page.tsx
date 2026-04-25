import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/word/breadcrumbs';
import { WordHero } from '@/components/word/word-hero';
import { WordTabs } from '@/components/word/word-tabs';
import { WordSidebar } from '@/components/word/word-sidebar';
import type { MeaningItem } from '@/components/word/tab-meaning';
import { getOneBurWord } from '@/lib/api/words';
import type { Word } from '@/lib/api/types';

interface WordPageProps {
  params: { locale: string; id: string };
}

function buildMeanings(data: Word | null): MeaningItem[] {
  if (!data) return [];
  const meanings: MeaningItem[] = [];
  // Russian counterparts are the primary "meanings" displayed to the user.
  data.ru_words?.forEach((ru, idx) => {
    meanings.push({
      n: String(idx + 1),
      title: ru.name,
      tag: 'перевод',
    });
  });
  // Buryad-language synonyms / related entries — surfaced after Russian meanings.
  data.translations?.forEach((tr, idx) => {
    meanings.push({
      n: String((data.ru_words?.length ?? 0) + idx + 1),
      title: tr.name,
      tag: 'синоним',
    });
  });
  return meanings;
}

export default async function WordPage({
  params,
}: WordPageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const data: Word | null = await getOneBurWord(params.id).catch(() => null);

  const headWord = data?.name?.trim() || params.id;
  const isFallback = data === null;
  const meanings = buildMeanings(data);
  const audioUrl = data?.speechs?.[0]?.url;
  const imageUrl = data?.images?.[0]?.url;

  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
      <Breadcrumbs word={headWord} />

      {isFallback && (
        <div
          role="status"
          className="card"
          style={{
            padding: 14,
            marginBottom: 16,
            background: 'var(--accent-warm-soft)',
            color: '#8C5A1F',
            border: 'none',
            fontSize: 13,
          }}
        >
          Данные пока подгружаются — показано демо-наполнение.
        </div>
      )}

      <div className="word-grid">
        <div>
          <WordHero word={headWord} audioUrl={audioUrl} imageUrl={imageUrl} />
          <WordTabs word={headWord} meanings={meanings} />
        </div>
        <WordSidebar />
      </div>
    </div>
  );
}
