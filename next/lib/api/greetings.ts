import { apiCall } from './client';
import type { DataEnvelope } from '@/lib/api/types';

export interface GreetingItem {
  id: number;
  occasion: string;
  bur: string;
  ru: string;
  audio_url: string | null;
}

export interface GreetingList {
  occasions: string[];
  items: GreetingItem[];
}

export interface GreetingDetail {
  id: number;
  occasion: string;
  bur: string | null;
  ru: string | null;
  audio_url: string | null;
  credit: string | null;
  live: boolean;
  alternatives: GreetingItem[];
}

export async function getGreetings(occasion?: string): Promise<GreetingList> {
  const body = await apiCall<DataEnvelope<GreetingList>>('GET', '/api/greetings', {
    params: occasion ? { occasion } : undefined,
  });
  return body.data;
}

export async function getGreeting(id: string | number): Promise<GreetingDetail> {
  const body = await apiCall<DataEnvelope<GreetingDetail>>('GET', `/api/greetings/${id}`);
  return body.data;
}

export async function recordListen(id: string | number): Promise<void> {
  await apiCall<unknown>('POST', `/api/greetings/${id}/listen`);
}
