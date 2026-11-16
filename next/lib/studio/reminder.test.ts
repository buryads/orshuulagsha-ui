import { describe, expect, it } from 'vitest';
import { parseCustom, presetTime, restoreReminder, serializeReminder } from './reminder';

describe('presetTime', () => {
  const now = new Date(2026, 10, 16, 10, 30, 0);

  it('adds one hour', () => {
    expect(presetTime('hour', now)).toEqual(new Date(2026, 10, 16, 11, 30, 0));
  });

  it('picks tomorrow at 19:00 local', () => {
    expect(presetTime('tomorrow', now)).toEqual(new Date(2026, 10, 17, 19, 0, 0));
  });

  it('picks tomorrow even late in the evening', () => {
    expect(presetTime('tomorrow', new Date(2026, 10, 16, 22, 0, 0))).toEqual(
      new Date(2026, 10, 17, 19, 0, 0),
    );
  });

  it('rolls over the month end', () => {
    expect(presetTime('tomorrow', new Date(2026, 10, 30, 12, 0, 0))).toEqual(
      new Date(2026, 11, 1, 19, 0, 0),
    );
  });
});

describe('parseCustom', () => {
  const now = new Date(2026, 10, 16, 10, 30, 0);

  it('parses a datetime-local value', () => {
    expect(parseCustom('2026-11-16T18:45', now)).toEqual(new Date(2026, 10, 16, 18, 45, 0));
  });

  it('rejects the past and garbage', () => {
    expect(parseCustom('2026-11-16T10:30', now)).toBeNull();
    expect(parseCustom('2026-11-15T10:30', now)).toBeNull();
    expect(parseCustom('', now)).toBeNull();
    expect(parseCustom('nope', now)).toBeNull();
  });
});

describe('restoreReminder', () => {
  const now = new Date('2026-11-16T10:00:00Z');
  const at = (ms: number) => serializeReminder(new Date(now.getTime() + ms));

  it('has nothing for empty or broken storage', () => {
    expect(restoreReminder(null, now)).toEqual({ kind: 'none' });
    expect(restoreReminder('x', now)).toEqual({ kind: 'none' });
    expect(restoreReminder('{"at":"no"}', now)).toEqual({ kind: 'none' });
  });

  it('waits for a future reminder', () => {
    expect(restoreReminder(at(60_000), now)).toEqual({ kind: 'wait', ms: 60_000 });
  });

  it('fires a reminder that just came due', () => {
    expect(restoreReminder(at(-5 * 60_000), now)).toEqual({ kind: 'fire' });
  });

  it('drops a reminder that is long overdue', () => {
    expect(restoreReminder(at(-3 * 3_600_000), now)).toEqual({ kind: 'none' });
  });
});
