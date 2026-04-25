import { apiCall } from './client';
import type {
  DataEnvelope,
  PaginatedResponse,
  Word,
} from '@/lib/api/types';

const RESOURCE_BUR = '/api/words/bur';

export interface GetBurWordsParams {
  page: number;
  perPage: number;
}

export async function getBurWords(
  params: GetBurWordsParams,
): Promise<PaginatedResponse<Word>> {
  return apiCall<PaginatedResponse<Word>>('GET', RESOURCE_BUR, {
    params: { page: params.page, per_page: params.perPage },
  });
}

export async function getOneBurWord(slug: string): Promise<Word> {
  const body = await apiCall<DataEnvelope<Word>>(
    'GET',
    `${RESOURCE_BUR}/${slug}`,
  );
  return body.data;
}
