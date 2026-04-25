import { apiCall } from './client';
import type {
  DataEnvelope,
  FoundWord,
  IUser,
  Pack,
  PackInput,
  TrainingPackQuiz,
} from '@/lib/api/types';

const RESOURCE = '/api/jwt/user';
const PUBLIC_RESOURCE = '/api/user';

export async function getUser(): Promise<IUser> {
  const body = await apiCall<DataEnvelope<IUser>>('GET', RESOURCE);
  return body.data;
}

export async function createPack(data: PackInput): Promise<void> {
  await apiCall<unknown>('POST', `${RESOURCE}/packs`, { data });
}

export async function updatePack(
  id: number,
  data: PackInput,
): Promise<Pack> {
  const body = await apiCall<DataEnvelope<Pack>>(
    'PUT',
    `${RESOURCE}/packs/${id}`,
    { data },
  );
  return body.data;
}

export async function deletePack(id: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${RESOURCE}/packs/${id}`);
}

export interface PublicPacksOptions {
  per_page?: number;
  rand?: number;
}

export async function getPublicPacks(
  opts: PublicPacksOptions = {},
): Promise<Pack[]> {
  const { per_page = 4, rand } = opts;
  const body = await apiCall<DataEnvelope<Pack[]>>(
    'GET',
    `${PUBLIC_RESOURCE}/packs`,
    { params: { per_page, rand } },
  );
  return body.data;
}

export async function getPacks(): Promise<Pack[]> {
  const body = await apiCall<DataEnvelope<Pack[]>>(
    'GET',
    `${RESOURCE}/packs`,
  );
  return body.data;
}

export async function getPublicPack(slug: string): Promise<Pack> {
  const body = await apiCall<DataEnvelope<Pack>>(
    'GET',
    `${PUBLIC_RESOURCE}/packs/${slug}/by-slug`,
  );
  return body.data;
}

export async function getPack(slug: string): Promise<Pack> {
  const body = await apiCall<DataEnvelope<Pack>>(
    'GET',
    `${RESOURCE}/packs/${slug}/by-slug`,
  );
  return body.data;
}

export async function getPackQuizQuestionsBySlug(
  packSlug: string,
): Promise<TrainingPackQuiz[]> {
  const body = await apiCall<DataEnvelope<TrainingPackQuiz[]>>(
    'GET',
    `/api/jwt/user/packs/${packSlug}/by-slug/questions`,
  );
  return body.data;
}

/**
 * NOTE: the URL pairing is intentionally inverted (preserved from the legacy
 * Nuxt client): wordType==='bur' queries the `/ru/bur` matcher, ru queries
 * `/bur/ru`. Response is a bare array, not enveloped.
 */
export async function findWordsByInput(
  str: string,
  wordType: 'ru' | 'bur' = 'bur',
): Promise<FoundWord[]> {
  const url =
    wordType === 'bur'
      ? `${RESOURCE}/words-matcher/ru/bur`
      : `${RESOURCE}/words-matcher/bur/ru`;

  return apiCall<FoundWord[]>('GET', url, {
    params: { word: str, limit: 1000 },
  });
}

export async function attachWordToPack(
  packId: number,
  wordId: number,
): Promise<void> {
  await apiCall<unknown>('POST', `${RESOURCE}/packs/${packId}/${wordId}`);
}

export async function deleteAttachedWordFromPack(
  packId: number,
  wordId: number,
): Promise<void> {
  await apiCall<unknown>(
    'DELETE',
    `${RESOURCE}/packs/${packId}/${wordId}`,
  );
}

export async function attachImageToBurWord(
  packId: number,
  wordId: number,
  imageId: number,
): Promise<void> {
  await apiCall<unknown>(
    'POST',
    `${RESOURCE}/packs/${packId}/burwords/${wordId}`,
    { data: { bur_word_image_id: imageId } },
  );
}
