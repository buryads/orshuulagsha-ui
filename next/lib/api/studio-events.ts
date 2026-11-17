import axios from 'axios';
import { apiCall } from './client';

export type Missing = 'review' | 'second_review' | 'voice' | 'issue';
export type EventStatus = 'draft' | 'published';

export interface PhraseReadiness {
  item_key: string;
  bur: string;
  ru: string | null;
  source: string | null;
  signoffs: number;
  signed_by?: number[];
  issue: boolean;
  audio_uuid: string | null;
  voice_user_id: number | null;
  ready: boolean;
  missing: Missing | null;
}

export interface EventDay {
  day_number: number;
  item_key: string | null;
  custom_ru: string | null;
}

export interface EventCheck {
  ready_days: number;
  empty_days: number[];
  changed_days: number[];
}

export interface StudioEvent {
  id: number;
  slug: string;
  title: string;
  lesson_id: number;
  starts_on: string;
  days_count: number;
  team_min_size: number;
  banner_days_before: number;
  status: EventStatus;
  published_at: string | null;
}

export interface StudioEventDetail extends StudioEvent {
  days: EventDay[];
  phrases: PhraseReadiness[];
  check: EventCheck;
}

export interface EventInput {
  title: string;
  slug: string;
  lesson_id: number;
  starts_on: string;
  days_count?: number;
  team_min_size?: number;
}

export interface PublishProblem {
  empty_days: number[];
  changed_days: number[];
  message: string | null;
}

interface Envelope<T> {
  data: T;
}

const EVENTS = '/api/studio/events';
const GREETINGS = '/api/studio/greetings';
const CREDIT = '/api/studio/voice-credit';

export async function getEvents(): Promise<StudioEvent[]> {
  return (await apiCall<Envelope<StudioEvent[]>>('GET', EVENTS)).data;
}

export async function createEvent(input: EventInput): Promise<StudioEvent> {
  return (await apiCall<Envelope<StudioEvent>>('POST', EVENTS, { data: input })).data;
}

export async function getEvent(id: number): Promise<StudioEventDetail> {
  return (await apiCall<Envelope<StudioEventDetail>>('GET', `${EVENTS}/${id}`)).data;
}

export async function updateEvent(id: number, patch: Partial<EventInput>): Promise<void> {
  await apiCall<unknown>('PATCH', `${EVENTS}/${id}`, { data: patch });
}

export async function setEventDay(
  id: number,
  day: number,
  body: { item_key: string | null; custom_ru?: string | null },
): Promise<void> {
  await apiCall<unknown>('PUT', `${EVENTS}/${id}/days/${day}`, { data: body });
}

export async function autofillEvent(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${EVENTS}/${id}/autofill`);
}

export async function publishEvent(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${EVENTS}/${id}/publish`);
}

export async function unpublishEvent(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${EVENTS}/${id}/unpublish`);
}

export type GreetingStatus = 'published' | 'unpublished';

export interface GreetingRow {
  id: number;
  occasion: string;
  lesson_id: number;
  item_key: string;
  bur: string;
  ru: string | null;
  status: GreetingStatus;
  stale: boolean;
  opens: number;
}

export interface GreetingCandidate extends PhraseReadiness {
  voice_consent: boolean;
}

export interface GreetingsList {
  published: GreetingRow[];
  candidates: GreetingCandidate[];
}

export async function getGreetings(lessonId?: number): Promise<GreetingsList> {
  const res = await apiCall<Envelope<{ items?: GreetingRow[]; candidates?: GreetingCandidate[] }>>('GET', GREETINGS, {
    params: lessonId ? { lesson_id: lessonId } : {},
  });
  return { published: res.data.items ?? [], candidates: res.data.candidates ?? [] };
}

export async function publishGreeting(input: {
  occasion: string;
  lesson_id: number;
  item_key: string;
}): Promise<void> {
  await apiCall<unknown>('POST', GREETINGS, { data: input });
}

export async function unpublishGreeting(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${GREETINGS}/${id}/unpublish`);
}

export async function republishGreeting(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${GREETINGS}/${id}/republish`);
}

export interface VoiceCredit {
  consented_at: string | null;
  display_name: string | null;
  credit_enabled: boolean;
  default_name: string;
}

export async function getVoiceCredit(): Promise<VoiceCredit> {
  return (await apiCall<Envelope<VoiceCredit>>('GET', CREDIT)).data;
}

export async function consentVoiceCredit(displayName: string): Promise<VoiceCredit> {
  return (
    await apiCall<Envelope<VoiceCredit>>('PUT', CREDIT, {
      data: { display_name: displayName, consent: true },
    })
  ).data;
}

export async function patchVoiceCredit(
  patch: Partial<{ credit_enabled: boolean; display_name: string }>,
): Promise<VoiceCredit> {
  return (await apiCall<Envelope<VoiceCredit>>('PATCH', CREDIT, { data: patch })).data;
}

function responseData(err: unknown): Record<string, unknown> | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 422) return null;
  const body = err.response.data;
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

export function errorCode(err: unknown): string | null {
  const body = responseData(err);
  if (!body) return null;
  const code = body.error ?? body.code ?? body.reason ?? body.message;
  return typeof code === 'string' ? code : null;
}

function numberList(v: unknown): number[] {
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [];
}

export function publishProblem(err: unknown): PublishProblem | null {
  const body = responseData(err);
  if (!body) return null;
  const nested = (body.errors && typeof body.errors === 'object' ? body.errors : {}) as Record<
    string,
    unknown
  >;
  const pick = (key: string) => numberList(body[key] ?? nested[key]);
  return {
    empty_days: pick('empty_days'),
    changed_days: pick('changed_days'),
    message: typeof body.message === 'string' ? body.message : null,
  };
}
