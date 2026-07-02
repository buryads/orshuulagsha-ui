// Corpus Explorer — API types.
// Contract: GET /api/corpus/search, GET /corpus/releases, GET /corpus/download.
// Backend not yet ready → see corpus-mock.ts for mock fallback.

export type CorpusEntryType = 'mono' | 'parallel' | 'lexicon' | 'toponym';

export interface CorpusAttribution {
  name: string;
  url: string;
  note?: string;
}

export interface CorpusHit {
  id: string;
  text_bxr: string;
  text_ru: string | null;
  type: CorpusEntryType;
  source: string;
  license: string;
  attribution: CorpusAttribution;
  highlight?: {
    text_bxr?: string[];
    text_ru?: string[];
  };
}

export interface CorpusFacets {
  type: Record<string, number>;
  source: Record<string, number>;
  license: Record<string, number>;
}

export interface CorpusSearchResponse {
  total: number;
  page: number;
  per_page: number;
  facets: CorpusFacets;
  hits: CorpusHit[];
}

export interface CorpusSearchParams {
  q?: string;
  type?: CorpusEntryType[];
  source?: string[];
  license?: string[];
  lang?: string;
  has_translation?: boolean;
  page?: number;
  per_page?: number;
  sort?: 'relevance' | 'source';
}

// GET /corpus/releases response
export interface CorpusReleaseFormat {
  url: string;
  size_bytes: number;
}

export interface CorpusRelease {
  version: string;
  date: string;
  size_bytes: number;
  record_count: number;
  checksum: string;
  formats: {
    jsonl_gz: CorpusReleaseFormat;
    csv_gz?: CorpusReleaseFormat;
  };
  manifest_url?: string;
  readme_url?: string;
  license_url?: string;
}

export interface CorpusReleasesResponse {
  latest: CorpusRelease;
  releases?: CorpusRelease[];
}
