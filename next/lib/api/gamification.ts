import { apiCall } from './client';
import type {
  GamificationMe,
  LeaderboardResponse,
  LeaderboardRow,
  LeaderboardMe,
} from './types';

export type { GamificationMe, LeaderboardResponse, LeaderboardRow, LeaderboardMe };

interface StatsApiResponse {
  data: GamificationMe;
}

interface LeaderboardApiResponse {
  data: LeaderboardRow[];
  meta: { count: number; me: LeaderboardMe | null };
}

export async function getGamificationMe(): Promise<GamificationMe> {
  const body = await apiCall<StatsApiResponse>('GET', '/api/stats/me');
  return body.data;
}

export type LeaderboardPeriod = 'week' | 'all';
export type LeaderboardScope = 'global';

export async function getLeaderboard(params?: {
  period?: LeaderboardPeriod;
  scope?: LeaderboardScope;
  limit?: number;
}): Promise<LeaderboardResponse> {
  const period = params?.period ?? 'week';
  const limit = params?.limit ?? 20;
  const body = await apiCall<LeaderboardApiResponse>(
    'GET',
    `/api/leaderboard?period=${period}&limit=${limit}`,
  );
  return {
    rows: body.data,
    me: body.meta.me,
  };
}
