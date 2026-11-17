import axios from 'axios';
import { apiCall } from './client';
import type { DataEnvelope } from '@/lib/api/types';

export type EventState = 'upcoming' | 'running' | 'finished';
export type DayStatus = 'locked' | 'open' | 'done' | 'missed';
export type Goal = 'daily' | 'final';

export interface DayPhrase {
  bur: string;
  ru: string;
  custom_ru: string | null;
  audio_url: string | null;
}

export interface EventDayInfo {
  n: number;
  date: string;
  status: DayStatus;
  phrase: DayPhrase | null;
}

export interface EventMe {
  joined: boolean;
  goal: Goal | null;
  timezone: string | null;
  district: string | null;
  streak: number;
  forgiveness_used_this_week: boolean;
  notice: 'forgiven' | 'broken' | null;
  completed: number[];
  final_best: number | null;
  final_total: number | null;
  email_product_news: boolean;
}

export interface MarathonEvent {
  slug: string;
  title: string;
  starts_on: string;
  ends_on: string;
  days_count: number;
  state: EventState;
  today: number | null;
  team_min_size: number;
  total_days_completed: number;
  greetings_available: boolean;
  days: EventDayInfo[];
  final: { open: boolean; opens_on: string | null };
  me: EventMe | null;
}

export interface QuizQuestion {
  id: string;
  type: 'bur_ru' | 'ru_bur' | 'audio_ru';
  prompt: string;
  audio_url?: string | null;
  options: string[];
}

export interface AnswerResult {
  correct: number;
  total: number;
  passed: boolean;
  results: Record<string, { correct: boolean; answer: string }>;
  saved: boolean;
  in_streak: boolean | null;
  streak: number | null;
}

export interface JoinInput {
  goal: Goal;
  timezone: string;
  district?: string;
  product_news?: boolean;
}

export interface TeamRow {
  code: string;
  name: string;
  participants: number;
  days: number;
  avg: number;
}

export interface TeamsData {
  min_size: number;
  teams: TeamRow[];
  other: { participants: number; days: number; avg: number } | null;
  mine: string | null;
  mine_hidden: boolean;
}

export interface FinalQuestion {
  id: string;
  audio_url: string | null;
  options: string[];
}

export interface FinalData {
  seed?: string | number;
  questions: FinalQuestion[];
}

export interface FinalResult {
  correct: number;
  total: number;
  ready: boolean;
  best: number | null;
  saved: boolean;
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Irkutsk';
  } catch {
    return 'Asia/Irkutsk';
  }
}

export async function getCurrentEvent(tz: string = browserTimezone()): Promise<MarathonEvent | null> {
  const body = await apiCall<DataEnvelope<MarathonEvent | null>>('GET', '/api/events/current', {
    params: { tz },
  });
  return body.data ?? null;
}

export async function getQuiz(slug: string, day: number, tz: string = browserTimezone()): Promise<QuizQuestion[]> {
  const body = await apiCall<DataEnvelope<{ questions: QuizQuestion[] }>>(
    'GET',
    `/api/events/${slug}/days/${day}/quiz`,
    { params: { tz } },
  );
  return body.data.questions;
}

export async function postAnswers(
  slug: string,
  day: number,
  answers: Record<string, string>,
  tz: string = browserTimezone(),
): Promise<AnswerResult> {
  const body = await apiCall<DataEnvelope<AnswerResult>>('POST', `/api/events/${slug}/days/${day}/answers`, {
    data: { answers, tz },
  });
  return body.data;
}

export async function joinEvent(slug: string, input: JoinInput): Promise<EventMe> {
  const body = await apiCall<DataEnvelope<EventMe>>('POST', `/api/events/${slug}/join`, { data: input });
  return body.data;
}

export async function getTeams(slug: string): Promise<TeamsData> {
  const body = await apiCall<DataEnvelope<TeamsData>>('GET', `/api/events/${slug}/teams`);
  return body.data;
}

export async function getFinal(slug: string, tz: string = browserTimezone()): Promise<FinalData> {
  const body = await apiCall<DataEnvelope<FinalData>>('GET', `/api/events/${slug}/final`, { params: { tz } });
  return body.data;
}

export async function postFinalAnswers(
  slug: string,
  answers: Record<string, string | null>,
  seed?: string | number,
  tz: string = browserTimezone(),
): Promise<FinalResult> {
  const body = await apiCall<DataEnvelope<FinalResult>>('POST', `/api/events/${slug}/final/answers`, {
    data: seed === undefined ? { answers, tz } : { answers, seed, tz },
  });
  return body.data;
}

export function finalOpensOn(err: unknown): string | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 403) return null;
  const body: unknown = err.response.data;
  const date = body && typeof body === 'object' ? (body as Record<string, unknown>).opens_on : null;
  return typeof date === 'string' ? date : null;
}
