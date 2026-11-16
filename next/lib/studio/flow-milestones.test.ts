import { describe, expect, it } from 'vitest';
import { isMilestone, milestoneOrdinal, praiseIndex } from './flow-milestones';

describe('isMilestone', () => {
  it('fires at 10, 25, 50 and then every 50', () => {
    const hits = Array.from({ length: 201 }, (_, i) => i).filter(isMilestone);
    expect(hits).toEqual([10, 25, 50, 100, 150, 200]);
  });
  it('ignores zero and negatives', () => {
    expect(isMilestone(0)).toBe(false);
    expect(isMilestone(-50)).toBe(false);
  });
});

describe('milestoneOrdinal', () => {
  it('numbers milestones in order', () => {
    expect([10, 25, 50, 100, 150].map(milestoneOrdinal)).toEqual([0, 1, 2, 3, 4]);
  });
  it('is -1 for non-milestones', () => {
    expect(milestoneOrdinal(11)).toBe(-1);
  });
});

describe('praiseIndex', () => {
  it('rotates through the praise list', () => {
    expect([10, 25, 50, 100, 150, 200].map((n) => praiseIndex(n, 4))).toEqual([0, 1, 2, 3, 0, 1]);
  });
  it('is 0 for empty lists and non-milestones', () => {
    expect(praiseIndex(10, 0)).toBe(0);
    expect(praiseIndex(11, 4)).toBe(0);
  });
});
