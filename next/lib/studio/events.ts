import type { Missing, PhraseReadiness } from '@/lib/api/studio-events';

export const UNDO_WINDOW_MS = 5000;

export function undoLeftMs(approvedAt: number, now: number): number {
  return Math.max(0, UNDO_WINDOW_MS - (now - approvedAt));
}

export function missingKey(
  p: Pick<PhraseReadiness, 'ready' | 'missing' | 'issue'>,
): Missing | null {
  if (p.ready) return null;
  if (p.issue) return 'issue';
  return p.missing ?? null;
}

export function formatDayRanges(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === (sorted[j] ?? 0) + 1) j++;
    parts.push(j > i ? `${sorted[i]}–${sorted[j]}` : String(sorted[i]));
    i = j + 1;
  }
  return parts.join(', ');
}

export function bannerDate(startsOn: string, daysBefore: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(startsOn);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) - daysBefore));
  return d.toISOString().slice(0, 10);
}

export function dayChoices(
  phrases: PhraseReadiness[],
  usedKeys: ReadonlySet<string>,
  current: string | null,
): PhraseReadiness[] {
  return phrases.filter((p) => p.item_key === current || !usedKeys.has(p.item_key));
}
