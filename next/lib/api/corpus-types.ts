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

// Normalized facet bucket — what components receive after normalization.
export interface FacetBucket {
  key: string;
  count: number;
}

// Normalized facets — used everywhere in the UI layer.
export interface CorpusFacets {
  type: FacetBucket[];
  source: FacetBucket[];
  license: FacetBucket[];
}

// Wire-format facet: backend may send either a Record<string,number> OR
// an array of objects with varying field names. Both are handled by
// normalizeFacets() in corpus.ts before reaching the UI.
type RawFacetBucket = {
  key?: string;
  value?: string;
  term?: string;
  label?: string;
  doc_count?: number;
  count?: number;
  n?: number;
};
export type RawFacet = Record<string, number> | RawFacetBucket[];

export interface RawCorpusFacets {
  type?: RawFacet;
  source?: RawFacet;
  license?: RawFacet;
}

// Wire shape returned by the backend (facets still raw).
export interface RawCorpusSearchResponse {
  total: number;
  page: number;
  per_page: number;
  facets: RawCorpusFacets;
  hits: CorpusHit[];
}

// Normalized shape used by the application after normalizeFacets().
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
