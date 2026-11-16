import { apiCall } from './client';
import type {
  TranslationLanguage,
  TranslationLog,
  TranslationLogParams,
  Paginated,
  TranslationSuggestion,
  TranslationSuggestionStatus,
  TranslationType,
  Word,
} from '@/lib/api/types';

const RESOURCE = '/api/jwt/admin';

export async function getTranslationLogs(
  params?: TranslationLogParams,
): Promise<TranslationLog[]> {
  return apiCall<TranslationLog[]>('GET', `${RESOURCE}/translations-logs`, {
    params,
  });
}

export async function ignoreTranslationLog(
  id: number,
): Promise<TranslationLog[]> {
  return apiCall<TranslationLog[]>(
    'PUT',
    `${RESOURCE}/translations-logs/${id}/ignore`,
  );
}

export async function getTranslationsCount(
  type?: TranslationType,
): Promise<number> {
  const method =
    type === 'ru2bur'
      ? 'App\\Services\\RuToBurTranslateService'
      : type === 'bur2ru'
        ? 'App\\Services\\BurToRuTranslateService'
        : null;

  const body = await apiCall<{ count: number }>(
    'GET',
    `${RESOURCE}/translations-logs/count`,
    { params: { method } },
  );
  return body.count;
}

export async function getTranslationSuggestions(
  status: TranslationSuggestionStatus,
  page: number,
): Promise<Paginated<TranslationSuggestion>> {
  return apiCall<Paginated<TranslationSuggestion>>(
    'GET',
    `${RESOURCE}/translation-suggestions`,
    { params: { status, page } },
  );
}

export async function setTranslationSuggestionStatus(
  id: number,
  status: 'approved' | 'rejected',
): Promise<TranslationSuggestion> {
  return apiCall<TranslationSuggestion>(
    'PUT',
    `${RESOURCE}/translation-suggestions/${id}/status`,
    { data: { status } },
  );
}

/**
 * The shape of these matcher endpoints isn't fully described in the legacy
 * client (uses // @ts-ignore). Returning `Word` is the best-effort guess
 * based on usage patterns.
 */
export async function getRandomRelationshipLessWord(
  source: TranslationLanguage,
  destination: TranslationLanguage,
): Promise<Word> {
  return apiCall<Word>(
    'GET',
    `${RESOURCE}/words-matcher/${source}/${destination}/random`,
  );
}

export async function getWord(
  wordId: number,
  source: TranslationLanguage,
  destination: TranslationLanguage,
): Promise<Word> {
  return apiCall<Word>(
    'GET',
    `${RESOURCE}/words-matcher/${source}/${destination}/${wordId}`,
  );
}

export async function getWords(
  word: string,
  source: TranslationLanguage,
  destination: TranslationLanguage,
  signal?: AbortSignal,
): Promise<Word[]> {
  return apiCall<Word[]>(
    'GET',
    `${RESOURCE}/words-matcher/${source}/${destination}`,
    { signal, params: { word } },
  );
}

export async function addNewWordToDatabase(
  word: string,
  source: TranslationLanguage,
  destination: TranslationLanguage,
): Promise<Word> {
  return apiCall<Word>(
    'POST',
    `${RESOURCE}/words-matcher/${source}/${destination}`,
    { params: { name: word } },
  );
}

export async function syncWord(
  word: Word,
  source: TranslationLanguage,
  destination: TranslationLanguage,
): Promise<Word> {
  return apiCall<Word>(
    'PUT',
    `${RESOURCE}/words-matcher/${source}/${destination}/${word.id}/sync`,
    { params: { ...word } },
  );
}

export type VolunteerStatus = 'new' | 'contacted' | 'rejected';

export interface VolunteerApplication {
  id: number;
  name: string;
  telegram: string;
  help_types: string[];
  about: string | null;
  locale: string | null;
  status: VolunteerStatus;
  created_at: string;
}

export async function getVolunteerApplications(
  status: VolunteerStatus | null,
  page: number,
): Promise<Paginated<VolunteerApplication>> {
  return apiCall<Paginated<VolunteerApplication>>(
    'GET',
    `${RESOURCE}/volunteer-applications`,
    { params: { status: status ?? undefined, page } },
  );
}

export async function setVolunteerApplicationStatus(
  id: number,
  status: VolunteerStatus,
): Promise<void> {
  await apiCall('PATCH', `${RESOURCE}/volunteer-applications/${id}`, {
    data: { status },
  });
}
