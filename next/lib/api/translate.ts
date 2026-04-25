import { apiCall } from './client';
import type {
  DataEnvelope,
  TranslationApiPayload,
  TranslationResult,
  TranslationType,
} from '@/lib/api/types';

const RESOURCE = '/api/translate';

export async function translateWord(
  type: TranslationType,
  value: string,
): Promise<TranslationResult> {
  const body = await apiCall<DataEnvelope<TranslationApiPayload>>(
    'GET',
    `${RESOURCE}/${type}`,
    { params: { word: value.toLowerCase() } },
  );

  return {
    exactTranslations: body.data.result,
    occurrences: body.data.include,
    possibleTranslations: body.data.fuzzy,
  };
}
