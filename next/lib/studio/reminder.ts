export type ReminderPreset = 'hour' | 'tomorrow';

export const REMINDER_STORAGE_KEY = 'studio.reminder';
export const OVERDUE_GRACE_MS = 3_600_000;

export type RestoreResult = { kind: 'none' } | { kind: 'fire' } | { kind: 'wait'; ms: number };

export function presetTime(preset: ReminderPreset, now: Date): Date {
  if (preset === 'hour') return new Date(now.getTime() + 3_600_000);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0, 0);
}

export function parseCustom(value: string, now: Date): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y = 0, mo = 1, d = 1, h = 0, mi = 0] = m.slice(1).map(Number);
  const at = new Date(y, mo - 1, d, h, mi, 0);
  return at.getTime() > now.getTime() ? at : null;
}

export function serializeReminder(at: Date): string {
  return JSON.stringify({ at: at.toISOString() });
}

export function restoreReminder(raw: string | null, now: Date): RestoreResult {
  if (!raw) return { kind: 'none' };
  let at: number;
  try {
    at = new Date((JSON.parse(raw) as { at?: unknown }).at as string).getTime();
  } catch {
    return { kind: 'none' };
  }
  if (Number.isNaN(at)) return { kind: 'none' };
  const diff = at - now.getTime();
  if (diff > 0) return { kind: 'wait', ms: diff };
  return diff >= -OVERDUE_GRACE_MS ? { kind: 'fire' } : { kind: 'none' };
}
