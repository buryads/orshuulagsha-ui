import { Suspense, type ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AlphabetPicker } from '@/components/explore/alphabet-picker';
import { ExploreHead } from '@/components/explore/explore-head';
import { FilterChips } from '@/components/explore/filter-chips';
import { Pagination } from '@/components/explore/pagination';
import { SearchBar } from '@/components/explore/search-bar';
import { WordGrid } from '@/components/explore/word-grid';
import { getBurWords } from '@/lib/api/words';
import type { BurWord, PaginatedResponse } from '@/lib/api/types';

interface ExplorePageProps {
  params: { locale: string };
  searchParams: {
    page?: string;
    q?: string;
    filter?: string;
    letter?: string;
  };
}

export default async function ExplorePage({
  params,
  searchParams,
}: ExplorePageProps): Promise<ReactElement> {
  setRequestLocale(params.locale);
  const rawPage = Number(searchParams.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const perPage = 12;

  const data: PaginatedResponse<BurWord> | null = await getBurWords({
    page,
    perPage,
  }).catch(() => null);

  const list: BurWord[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const lastPage = data?.meta?.last_page ?? 1;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <ExploreHead totalCount={total} />
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <Suspense fallback={null}>
        <FilterChips />
      </Suspense>
      <Suspense fallback={null}>
        <AlphabetPicker />
      </Suspense>
      <WordGrid words={list} />
      <Suspense fallback={null}>
        <Pagination currentPage={page} totalPages={lastPage} />
      </Suspense>
    </div>
  );
}
