import axios from 'axios';
import { apiCall } from './client';
import type { ExerciseType } from './studio';

const BASE = '/api/studio/flow';

export type FlowMode = 'voice' | 'review' | 'words';

export interface FlowLessonRef {
  id: number;
  title: string;
  title_bur: string | null;
  level: string;
}

export interface RerecordInfo {
  flag_id: number;
  old_audio_url: string;
  reason: 'misheard' | 'cant_hear';
  heard: number;
  not_recognized: number;
  confusions: string[];
}

export interface VoiceItem {
  mode: 'voice';
  item_key: string;
  text: string;
  ru: string | null;
  lessons: FlowLessonRef[];
  uses: number;
  rerecord?: RerecordInfo | null;
}

export interface ReviewExercise {
  id: number;
  type: ExerciseType;
  prompt: string;
  payload: Record<string, unknown>;
}

export interface ReviewItem {
  mode: 'review';
  item_key: string;
  kind: 'phrase' | 'vocab' | 'exercise';
  lesson: FlowLessonRef;
  source: 'ai' | 'dictionary' | null;
  bur: string | null;
  ru: string | null;
  exercise: ReviewExercise | null;
  fixable: boolean;
}

export type WordDirection = 'ru2bur' | 'bur2ru';

export interface WordSuggestion {
  id: number;
  translation: string;
  example: string | null;
  moderator_edited: boolean;
  confirmations: number;
}

export interface WordItem {
  mode: 'words';
  item_key: string;
  kind: 'word_request';
  id: number;
  query: string;
  direction: WordDirection;
  demand: number;
  contexts: string[];
  suggestion: WordSuggestion | null;
  moderator_note: string | null;
}

interface WordCardRaw extends Omit<WordItem, 'mode' | 'item_key'> {
  key: string;
}

export type FlowItem = VoiceItem | ReviewItem | WordItem;

export interface FlowNext<T extends FlowItem = FlowItem> {
  item: T | null;
  remaining: number;
  fromSkipped: boolean;
}

export type Verdict = 'ok' | 'issue' | 'fix';

export interface ReviewInput {
  item_key: string;
  verdict: Verdict;
  bur?: string;
  note?: string;
}

export interface FlowSummary {
  voice_remaining: number;
  review_remaining: number;
  words_remaining: number;
  today: {
    recorded: number;
    reviewed: number;
    fixed: number;
    flagged: number;
    lessons: number;
    words: number;
  };
  words_waited: number;
  unseen_kudos: number;
}

interface NextResponse<T> {
  data: T | null;
  meta?: { remaining?: number; from_skipped?: boolean };
}

export async function getFlowNext(mode: 'voice'): Promise<FlowNext<VoiceItem>>;
export async function getFlowNext(mode: 'review'): Promise<FlowNext<ReviewItem>>;
export async function getFlowNext(mode: 'words'): Promise<FlowNext<WordItem>>;
export async function getFlowNext(mode: FlowMode): Promise<FlowNext> {
  if (mode === 'words') {
    const res = await apiCall<NextResponse<WordCardRaw>>('GET', `${BASE}/next`, {
      params: { mode },
    });
    const card = res.data;
    return {
      item: card ? { ...card, mode: 'words', item_key: card.key } : null,
      remaining: res.meta?.remaining ?? 0,
      fromSkipped: res.meta?.from_skipped ?? false,
    };
  }
  const res = await apiCall<NextResponse<FlowItem>>('GET', `${BASE}/next`, { params: { mode } });
  return {
    item: res.data,
    remaining: res.meta?.remaining ?? 0,
    fromSkipped: res.meta?.from_skipped ?? false,
  };
}

export async function skipFlowItem(mode: FlowMode, itemKey: string): Promise<void> {
  await apiCall<unknown>('POST', `${BASE}/skip`, { data: { mode, item_key: itemKey } });
}

export async function submitReview(input: ReviewInput): Promise<void> {
  await apiCall<unknown>('POST', `${BASE}/review`, { data: input });
}

const WORDS = '/api/studio/word-requests';

export interface WordAnswerInput {
  translations: string[];
  example?: string;
}

export async function answerWordRequest(id: number, input: WordAnswerInput): Promise<void> {
  await apiCall<unknown>('POST', `${WORDS}/${id}/answer`, { data: input });
}

export async function agreeWordRequest(id: number, suggestionId: number): Promise<void> {
  await apiCall<unknown>('POST', `${WORDS}/${id}/agree`, { data: { suggestion_id: suggestionId } });
}

export type WordRejectReason = 'typo' | 'not_buryat' | 'other';

export interface WordRejectInput {
  reason: WordRejectReason;
  hint?: string;
}

export async function rejectWordRequest(id: number, input: WordRejectInput): Promise<void> {
  await apiCall<unknown>('POST', `${WORDS}/${id}/reject`, { data: input });
}

export async function undoRejectWordRequest(id: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${WORDS}/${id}/reject`);
}

export async function touchWordRequest(id: number): Promise<void> {
  await apiCall<unknown>('POST', `${WORDS}/${id}/touch`);
}

export async function getFlowSummary(): Promise<FlowSummary> {
  return (await apiCall<{ data: FlowSummary }>('GET', `${BASE}/summary`)).data;
}

export type KeepReason = 'as_is' | 'hard' | 'other';

export async function keepRecording(
  itemKey: string,
  reason: KeepReason,
  note?: string,
): Promise<number> {
  const res = await apiCall<{ data: { points: number } }>('POST', `${BASE}/keep`, {
    data: { item_key: itemKey, reason, note },
  });
  return res.data.points;
}

export interface VoiceStatRecording {
  uuid: string;
  text: string;
  audio_url: string;
  recognized: number;
  heard: number;
}

export interface FlaggedRecording {
  uuid: string;
  text: string;
  audio_url: string;
  reason: 'misheard' | 'cant_hear';
  heard: number;
  not_recognized: number;
  confusions: string[];
}

export interface VoiceStats {
  recognized: number;
  heard: number;
  rate: number | null;
  needs_rerecord: number;
  top: VoiceStatRecording[];
  flagged: FlaggedRecording[];
}

export async function getVoiceStats(): Promise<VoiceStats> {
  return (await apiCall<{ data: VoiceStats }>('GET', '/api/studio/voice-stats')).data;
}

export function isConflict(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 409;
}

export function isNotReady(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 503;
}
