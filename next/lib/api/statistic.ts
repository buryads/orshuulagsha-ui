import { apiCall } from './client';
import type { TranslationsAmountResponse } from '@/lib/api/types';

const RESOURCE = '/api/statistic/daily-translations-count';

// Backend returns the raw `{ count: N }` for this endpoint — no `{ data: ... }`
// envelope, unlike most other resources.
export async function getTranslationsAmount(): Promise<number> {
  const body = await apiCall<TranslationsAmountResponse>('GET', RESOURCE);
  return body.count;
}
