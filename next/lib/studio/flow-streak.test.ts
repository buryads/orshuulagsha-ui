import { describe, expect, it } from 'vitest';
import { irkutskDate, isStreakMilestone } from './flow-streak';

describe('flow-streak', () => {
  it('flags 3/7/30/100 as milestones', () => {
    expect([1, 3, 7, 10, 30, 100, 101].map(isStreakMilestone)).toEqual([
      false, true, true, false, true, true, false,
    ]);
  });

  it('uses UTC+8 for the day boundary', () => {
    expect(irkutskDate(Date.UTC(2026, 0, 1, 15, 59))).toBe('2026-01-01');
    expect(irkutskDate(Date.UTC(2026, 0, 1, 16, 0))).toBe('2026-01-02');
  });
});
