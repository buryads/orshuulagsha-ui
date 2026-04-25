import { apiCall } from './client';
import type { TranslationsAmountResponse } from '@/lib/api/types';

const RESOURCE = '/api/statistic/daily-translations-count';

export async function getTranslationsAmount(): Promise<TranslationsAmountResponse> {
  return apiCall<TranslationsAmountResponse>('GET', RESOURCE);
}
