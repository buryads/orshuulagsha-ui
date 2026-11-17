import { describe, expect, it } from 'vitest';
import type { EventDayInfo, MarathonEvent } from '@/lib/api/events';
import { cellFor, defaultDay, formatDate, sortedTeams } from './days';

const phrase = { bur: 'b', ru: 'r', custom_ru: null, audio_url: null };

function day(n: number, status: EventDayInfo['status'], withPhrase = true): EventDayInfo {
  return { n, date: `2027-01-${String(17 + n).padStart(2, '0')}`, status, phrase: withPhrase ? phrase : null };
}

function event(over: Partial<MarathonEvent>): MarathonEvent {
  return {
    slug: 'ny',
    title: 't',
    starts_on: '2027-01-18',
    ends_on: '2027-02-07',
    days_count: 3,
    state: 'running',
    today: 2,
    team_min_size: 10,
    total_days_completed: 0,
    greetings_available: false,
    days: [day(1, 'missed'), day(2, 'open'), day(3, 'locked', false)],
    final: { open: false, opens_on: '2027-02-07' },
    me: null,
    ...over,
  };
}

describe('marathon day helpers', () => {
  it('formats a date-only string without timezone shift', () => {
    expect(formatDate('2027-01-18', 'ru')).toBe('18 января');
    expect(formatDate('2027-01-18', 'en')).toBe('January 18');
    expect(formatDate('', 'ru')).toBe('');
  });

  it('marks completed days done regardless of status', () => {
    expect(cellFor(day(1, 'missed'), [1])).toBe('done');
    expect(cellFor(day(1, 'missed'), [])).toBe('missed');
    expect(cellFor(day(3, 'locked', false), [])).toBe('locked');
    expect(cellFor(day(2, 'open'), [])).toBe('open');
  });

  it('opens on today, falls back to the latest open day, none before start', () => {
    expect(defaultDay(event({}))).toBe(2);
    expect(defaultDay(event({ today: 5 }))).toBe(2);
    expect(defaultDay(event({ state: 'upcoming', today: null, days: [day(1, 'locked', false)] }))).toBeNull();
    expect(defaultDay(event({ state: 'finished', today: null }))).toBe(1);
  });

  it('orders teams by average descending', () => {
    expect(sortedTeams([{ avg: 1 }, { avg: 5 }, { avg: 3 }]).map((t) => t.avg)).toEqual([5, 3, 1]);
  });
});
