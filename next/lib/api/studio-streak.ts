import { apiCall } from './client';

export interface StudioStreak {
  current: number;
  best: number;
  today_points: number;
  goal: number;
  done_today: boolean;
  at_risk: boolean;
}

export async function getStudioStreak(): Promise<StudioStreak> {
  return (await apiCall<{ data: StudioStreak }>('GET', '/api/studio/streak')).data;
}
