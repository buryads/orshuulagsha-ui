import { apiCall } from './client';
import type {
  CorpusSearchParams,
  CorpusSearchResponse,
  CorpusReleasesResponse,
} from './corpus-types';
import { getMockSearchResponse, MOCK_RELEASES_RESPONSE } from './corpus-mock';

const MOCK_ENABLED =
  process.env.NEXT_PUBLIC_CORPUS_MOCK === '1';

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
    return await apiCall<CorpusSearchResponse>('GET', '/api/corpus/search', {
      params: buildSearchQuery(params),
    });
  } catch (err) {
    if (MOCK_ENABLED) {
      return getMockSearchResponse(params);
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
