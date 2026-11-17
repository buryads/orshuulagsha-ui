import axios from 'axios';

import { apiCall } from './client';
import type { DataEnvelope } from '@/lib/api/types';
import type {
  WordRejectReason,
  WordRequestDirection,
  WordRequestStatus,
} from '@/lib/word-requests';

const RESOURCE = '/api/word-requests';
const ME_RESOURCE = '/api/me/word-requests';

export interface WordRequestLookup {
  normalized: string;
  in_dictionary: { id: number; slug: string; name: string } | null;
  request: {
    id: number;
    status: WordRequestStatus;
    demand: number;
    reject_reason: WordRejectReason | null;
    reject_hint: string | null;
    hint_slug: string | null;
    word_slug: string | null;
    following: boolean;
  } | null;
}

export interface WordRequestCreateInput {
  direction: WordRequestDirection;
  query: string;
  context?: string;
  notify?: boolean;
}

export interface WordRequestCreated {
  id: number;
  status: WordRequestStatus;
  demand: number;
  joined: boolean;
  notify: boolean;
}

export interface MyWordRequest {
  id: number;
  query: string;
  direction: WordRequestDirection;
  status: WordRequestStatus;
  demand: number;
  notify: boolean;
  reject_reason: WordRejectReason | null;
  reject_hint: string | null;
  hint_slug: string | null;
  word_slug: string | null;
  unseen: boolean;
  created_at: string;
}

export async function lookupWordRequest(
  direction: WordRequestDirection,
  query: string,
): Promise<WordRequestLookup> {
  const body = await apiCall<DataEnvelope<WordRequestLookup>>('GET', `${RESOURCE}/lookup`, {
    params: { direction, query },
  });
  return body.data;
}

export async function createWordRequest(
  input: WordRequestCreateInput,
): Promise<WordRequestCreated> {
  const body = await apiCall<DataEnvelope<WordRequestCreated>>('POST', RESOURCE, { data: input });
  return body.data;
}

export async function unfollowWordRequest(id: number): Promise<void> {
  await apiCall<void>('DELETE', `${RESOURCE}/${id}/follow`);
}

export async function listMyWordRequests(): Promise<MyWordRequest[]> {
  const body = await apiCall<DataEnvelope<MyWordRequest[]>>('GET', ME_RESOURCE);
  return body.data;
}

export async function markWordRequestsSeen(): Promise<void> {
  await apiCall<void>('POST', `${ME_RESOURCE}/seen`);
}

export async function getUnseenWordRequestCount(): Promise<number> {
  const body = await apiCall<DataEnvelope<{ count: number }>>('GET', `${ME_RESOURCE}/unseen-count`);
  return body.data.count;
}

export interface WordRequestApiError {
  status?: number;
  code?: string;
  slug?: string;
}

export function readWordRequestError(error: unknown): WordRequestApiError {
  if (!axios.isAxiosError(error)) return {};
  const body = error.response?.data as { code?: unknown; data?: { slug?: unknown } } | undefined;
  return {
    status: error.response?.status,
    code: typeof body?.code === 'string' ? body.code : undefined,
    slug: typeof body?.data?.slug === 'string' ? body.data.slug : undefined,
  };
}
