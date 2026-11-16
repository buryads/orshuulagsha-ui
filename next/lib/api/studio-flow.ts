import axios from 'axios';
import { apiCall } from './client';
import type { ExerciseType } from './studio';

const BASE = '/api/studio/flow';

export type FlowMode = 'voice' | 'review';

export interface FlowLessonRef {
  id: number;
  title: string;
  title_bur: string | null;
  level: string;
}

export interface VoiceItem {
  mode: 'voice';
  item_key: string;
  text: string;
  ru: string | null;
  lessons: FlowLessonRef[];
  uses: number;
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

export type FlowItem = VoiceItem | ReviewItem;

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
  today: { recorded: number; reviewed: number; fixed: number; flagged: number; lessons: number };
  unseen_kudos: number;
}

interface NextResponse<T> {
  data: T | null;
  meta?: { remaining?: number; from_skipped?: boolean };
}

export async function getFlowNext(mode: 'voice'): Promise<FlowNext<VoiceItem>>;
export async function getFlowNext(mode: 'review'): Promise<FlowNext<ReviewItem>>;
export async function getFlowNext(mode: FlowMode): Promise<FlowNext> {
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

export async function getFlowSummary(): Promise<FlowSummary> {
  return (await apiCall<{ data: FlowSummary }>('GET', `${BASE}/summary`)).data;
}

export function isConflict(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 409;
}

export function isNotReady(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 503;
}
