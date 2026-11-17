import { apiCall } from './client';

const BASE = '/api/studio';

export type BoardPeriod = 'week' | 'month' | 'all';
export const BOARD_PERIODS: BoardPeriod[] = ['week', 'month', 'all'];

export const KUDOS_EMOJI = ['👏', '🔥', '💪', '🌟', '❤️', '🙏', '🎉', '🏆'] as const;
export type KudosEmoji = (typeof KUDOS_EMOJI)[number];
export const KUDOS_MESSAGE_MAX = 140;

export interface BoardRow {
  user: { id: number; name: string };
  recorded: number;
  reviewed: number;
  fixed: number;
  flagged: number;
  lessons: number;
  total: number;
  all_time_total: number;
  kudos_received: number;
  streak: { current: number; best: number; done_today: boolean };
}

export interface BoardMeta {
  period: BoardPeriod;
  since: string | null;
  me: number;
}

export interface Board {
  rows: BoardRow[];
  meta: BoardMeta;
}

export interface Kudos {
  id: number;
  from: { id: number; name: string };
  emoji: string;
  message: string | null;
  created_at: string;
  seen: boolean;
}

export interface KudosList {
  items: Kudos[];
  unseen: number;
}

export async function getBoard(period: BoardPeriod): Promise<Board> {
  const body = await apiCall<{ data: BoardRow[]; meta: BoardMeta }>('GET', `${BASE}/board`, {
    params: { period },
  });
  return { rows: body.data, meta: body.meta };
}

export async function sendKudos(input: {
  to_user_id: number;
  emoji: KudosEmoji;
  message?: string;
}): Promise<void> {
  await apiCall('POST', `${BASE}/kudos`, { data: input });
}

export async function getKudos(): Promise<KudosList> {
  const body = await apiCall<{ data: Kudos[]; meta?: { unseen?: number } }>('GET', `${BASE}/kudos`);
  return { items: body.data, unseen: body.meta?.unseen ?? 0 };
}

export async function markKudosSeen(): Promise<void> {
  await apiCall('POST', `${BASE}/kudos/seen`);
}
