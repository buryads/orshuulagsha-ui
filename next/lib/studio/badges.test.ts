import { describe, expect, it } from 'vitest';
import { earnedBadges, nextBadge } from './badges';

const ids = (stats: Parameters<typeof earnedBadges>[0]) => earnedBadges(stats).map((b) => b.id);

describe('earnedBadges', () => {
  it('has nothing without actions', () => {
    expect(ids({ allTimeTotal: 0 })).toEqual([]);
  });

  it('awards the first step for one action', () => {
    expect(ids({ allTimeTotal: 1 })).toEqual(['first']);
  });

  it('awards action milestones cumulatively', () => {
    expect(ids({ allTimeTotal: 10 })).toEqual(['first', 'actions10']);
    expect(ids({ allTimeTotal: 1000 })).toEqual([
      'first',
      'actions10',
      'actions100',
      'actions1000',
    ]);
  });

  it('awards per-type badges from counts', () => {
    const got = ids({ allTimeTotal: 400, recorded: 100, reviewed: 10, fixed: 10 });
    expect(got).toContain('voice10');
    expect(got).toContain('voice100');
    expect(got).not.toContain('voice1000');
    expect(got).toContain('review10');
    expect(got).not.toContain('review100');
    expect(got).toContain('fix10');
  });

  it('skips type badges when counts are unknown', () => {
    expect(ids({ allTimeTotal: 5000 })).toEqual([
      'first',
      'actions10',
      'actions100',
      'actions1000',
    ]);
  });

  it('returns i18n key and icon', () => {
    const badge = earnedBadges({ allTimeTotal: 1 })[0];
    expect(badge?.key).toBe('studio.honor.badges.first');
    expect(badge?.icon).toBeTruthy();
  });
});

describe('nextBadge', () => {
  it('points at the first step from zero', () => {
    expect(nextBadge(0)).toMatchObject({ id: 'first', current: 0, target: 1 });
  });

  it('points at the next action milestone', () => {
    expect(nextBadge(58)).toMatchObject({
      id: 'actions100',
      current: 58,
      target: 100,
      key: 'studio.honor.badges.actions100',
    });
  });

  it('is null after the last milestone', () => {
    expect(nextBadge(1000)).toBeNull();
  });
});
