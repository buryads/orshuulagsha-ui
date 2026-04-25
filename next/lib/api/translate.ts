import { apiCall } from './client';
import type {
  DataEnvelope,
  TranslateResponse,
  TranslationType,
} from '@/lib/api/types';

const RESOURCE = '/api/translate';

/**
 * Calls the backend translate endpoint and returns the unwrapped payload
 * (`result`, `include`, `match`, `fuzzy` buckets), each holding raw word
 * entries as documented in `TranslateBucketItem`.
 */
export async function translateWord(
  type: TranslationType,
  value: string,
): Promise<TranslateResponse> {
  const body = await apiCall<DataEnvelope<TranslateResponse>>(
    'GET',
    `${RESOURCE}/${type}`,
    { params: { word: value.toLowerCase() } },
  );
  return body.data;
}
