export const STREAK_MILESTONES = [3, 7, 30, 100] as const;

const STORAGE_KEY = 'studio.streak.celebrated';
const IRKUTSK_OFFSET_MS = 8 * 3600 * 1000;

export function isStreakMilestone(days: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(days);
}

export function irkutskDate(now: number = Date.now()): string {
  return new Date(now + IRKUTSK_OFFSET_MS).toISOString().slice(0, 10);
}

export function wasCelebratedToday(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === irkutskDate();
  } catch {
    return false;
  }
}

export function markCelebratedToday(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, irkutskDate());
  } catch {}
}
