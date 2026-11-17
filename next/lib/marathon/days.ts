import type { DayStatus, EventDayInfo, EventState, MarathonEvent } from '@/lib/api/events';

export type StripCell = 'done' | 'missed' | 'open' | 'locked';

export function formatDate(iso: string | null | undefined, locale: string, withYear = false): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const lang = locale === 'en' ? 'en' : 'ru';
  return new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'long',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function cellFor(day: EventDayInfo, completed: number[]): StripCell {
  if (completed.includes(day.n) || day.status === 'done') return 'done';
  const status: DayStatus = day.status;
  return status === 'missed' ? 'missed' : status === 'open' ? 'open' : 'locked';
}

export function selectableDay(day: EventDayInfo): boolean {
  return day.status !== 'locked' && day.phrase !== null;
}

export function defaultDay(event: MarathonEvent): number | null {
  if (event.state === 'upcoming') return null;
  if (event.state === 'finished') return event.days[0]?.n ?? null;
  const today = event.today;
  if (today !== null && event.days.some((d) => d.n === today && selectableDay(d))) return today;
  const open = event.days.filter(selectableDay);
  return open[open.length - 1]?.n ?? null;
}

export function bannerVariant(event: MarathonEvent): EventState {
  return event.state;
}

export function isFinalDay(event: MarathonEvent): boolean {
  return event.final.open;
}

export function sortedTeams<T extends { avg: number }>(teams: T[]): T[] {
  return [...teams].sort((a, b) => b.avg - a.avg);
}
