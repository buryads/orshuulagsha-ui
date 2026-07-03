import { apiCall } from './client';
import type {
  CorpusSearchParams,
  CorpusSearchResponse,
  CorpusReleasesResponse,
  RawCorpusFacets,
  RawFacet,
  FacetBucket,
  CorpusFacets,
  RawCorpusSearchResponse,
} from './corpus-types';
import { getMockSearchResponse, MOCK_RELEASES_RESPONSE } from './corpus-mock';

const MOCK_ENABLED = process.env.NEXT_PUBLIC_CORPUS_MOCK === '1';

// ---------------------------------------------------------------------------
// Facet normalizer — tolerates Record<string,number> and array-of-objects with
// varying field names (key/value/term/label, doc_count/count/n).
// ---------------------------------------------------------------------------

function normalizeFacet(raw: RawFacet | undefined): FacetBucket[] {
  if (!raw) return [];
  let buckets: FacetBucket[];
  if (Array.isArray(raw)) {
    buckets = raw.map((o) => ({
      key: String(o.key ?? o.value ?? o.term ?? o.label ?? ''),
      count: Number(o.doc_count ?? o.count ?? o.n ?? 0),
    }));
  } else {
    buckets = Object.entries(raw).map(([key, count]) => ({
      key,
      count: Number(count),
    }));
  }
  return buckets.filter((b) => b.key !== '');
}

export function normalizeFacets(raw: RawCorpusFacets | undefined): CorpusFacets {
  return {
    type: normalizeFacet(raw?.type),
    source: normalizeFacet(raw?.source),
    license: normalizeFacet(raw?.license),
  };
}

// ---------------------------------------------------------------------------

function buildSearchQuery(params: CorpusSearchParams): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (params.q) query.q = params.q;
  if (params.type && params.type.length > 0) query['type[]'] = params.type;
  if (params.source && params.source.length > 0) query['source[]'] = params.source;
  if (params.license && params.license.length > 0) query['license[]'] = params.license;
  if (params.lang) query.lang = params.lang;
  if (params.has_translation !== undefined) query.has_translation = params.has_translation;
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.sort) query.sort = params.sort;
  return query;
}

export async function searchCorpus(
  params: CorpusSearchParams,
): Promise<CorpusSearchResponse> {
  try {
    const raw = await apiCall<RawCorpusSearchResponse>('GET', '/api/corpus/search', {
      params: buildSearchQuery(params),
    });
    return { ...raw, facets: normalizeFacets(raw.facets) };
  } catch (err) {
    if (MOCK_ENABLED) {
      // Mock already returns the right shape; run through normalizer for
      // consistency (mock uses array-of-objects form to match prod wire format).
      const mock = getMockSearchResponse(params);
      return { ...mock, facets: normalizeFacets(mock.facets as RawCorpusFacets) };
    }
    throw err;
  }
}

export async function getCorpusReleases(): Promise<CorpusReleasesResponse> {
  try {
    return await apiCall<CorpusReleasesResponse>('GET', '/corpus/releases');
  } catch (err) {
    if (MOCK_ENABLED) {
      return MOCK_RELEASES_RESPONSE;
    }
    throw err;
  }
}
