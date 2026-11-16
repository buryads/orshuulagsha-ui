import { describe, expect, it } from 'vitest';
import { buildIcs, escapeIcsText, formatIcsUtc } from './ics';

const base = {
  uid: 'reminder-1@example.com',
  start: new Date('2026-11-17T19:00:00Z'),
  now: new Date('2026-11-16T10:30:05Z'),
  title: 'Студия: запись и проверка',
  description: 'Пора в студию',
  url: 'https://example.com/ru/studio/flow',
};

describe('formatIcsUtc', () => {
  it('formats as YYYYMMDDTHHMMSSZ', () => {
    expect(formatIcsUtc(new Date('2026-01-02T03:04:05Z'))).toBe('20260102T030405Z');
  });
});

describe('escapeIcsText', () => {
  it('escapes backslash, comma, semicolon and newlines', () => {
    expect(escapeIcsText('a\\b,c;d\ne\r\nf')).toBe('a\\\\b\\,c\;d\\ne\\nf');
  });
});

describe('buildIcs', () => {
  const ics = buildIcs(base);
  const lines = ics.split('\r\n');

  it('uses CRLF everywhere and ends with a CRLF', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('wraps a single event in a calendar', () => {
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines).toContain('VERSION:2.0');
    expect(lines).toContain('BEGIN:VEVENT');
    expect(lines).toContain('END:VEVENT');
    expect(lines[lines.length - 2]).toBe('END:VCALENDAR');
  });

  it('writes UTC start, end, stamp and uid', () => {
    expect(lines).toContain('DTSTART:20261117T190000Z');
    expect(lines).toContain('DTEND:20261117T191500Z');
    expect(lines).toContain('DTSTAMP:20261116T103005Z');
    expect(lines).toContain('UID:reminder-1@example.com');
  });

  it('honours a custom duration', () => {
    expect(buildIcs({ ...base, durationMinutes: 30 }).split('\r\n')).toContain('DTEND:20261117T193000Z');
  });

  it('includes the flow url and an alarm at start', () => {
    expect(ics).toContain('URL:https://example.com/ru/studio/flow');
    const joined = ics.replace(/\r\n /g, '');
    expect(joined).toContain('https://example.com/ru/studio/flow');
    expect(lines).toContain('BEGIN:VALARM');
    expect(lines).toContain('TRIGGER:PT0S');
    expect(lines).toContain('ACTION:DISPLAY');
  });

  it('escapes the description', () => {
    const out = buildIcs({ ...base, description: 'a,b;c\nd' }).replace(/\r\n /g, '');
    expect(out).toContain('DESCRIPTION:a\\,b\;c\\nd');
  });

  it('folds long lines to at most 75 octets', () => {
    const out = buildIcs({ ...base, description: 'Я'.repeat(200) });
    for (const line of out.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(out.replace(/\r\n /g, '')).toContain('Я'.repeat(200));
  });
});
