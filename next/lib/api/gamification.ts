// Gamification API module — Learn-2, Phase 2 (tmgr 8795-Ф2)
// TODO(8795-Ф2): сверить с финальным контрактом backend-tl перед релизом

import { apiCall } from './client';
import type {
  GamificationMe,
  LeaderboardResponse,
  LeaderboardRow,
  LeaderboardMe,
} from './types';

// Re-export types so callers can import from one place.
export type { GamificationMe, LeaderboardResponse, LeaderboardRow, LeaderboardMe };

interface StatsApiResponse {
  data: GamificationMe;
}

interface LeaderboardApiResponse {
  data: LeaderboardRow[];
  meta: { count: number; me: LeaderboardMe | null };
}

/** GET /api/stats/me [auth:sanctum] — XP, streak, level, daily-goal */
export async function getGamificationMe(): Promise<GamificationMe> {
  const body = await apiCall<StatsApiResponse>('GET', '/api/stats/me');
  return body.data;
}

export type LeaderboardPeriod = 'week' | 'all';
export type LeaderboardScope = 'global';

/** GET /api/leaderboard?period=&limit= [auth:sanctum] */
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
