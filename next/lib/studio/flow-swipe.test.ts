import { describe, expect, it } from 'vitest';
import { classifySwipe, swipeVisual } from './flow-swipe';

describe('classifySwipe', () => {
  it('detects horizontal swipes past the threshold', () => {
    expect(classifySwipe(120, 10)).toBe('right');
    expect(classifySwipe(-120, -10)).toBe('left');
  });
  it('detects an upward swipe', () => {
    expect(classifySwipe(10, -130)).toBe('up');
  });
  it('ignores downward and short moves', () => {
    expect(classifySwipe(10, 200)).toBeNull();
    expect(classifySwipe(40, -30)).toBeNull();
    expect(classifySwipe(0, 0)).toBeNull();
  });
  it('picks the dominant axis', () => {
    expect(classifySwipe(100, -140)).toBe('up');
    expect(classifySwipe(150, -100)).toBe('right');
    expect(classifySwipe(100, -100)).toBeNull();
  });
  it('honours a custom threshold', () => {
    expect(classifySwipe(60, 0, 50)).toBe('right');
    expect(classifySwipe(60, 0, 80)).toBeNull();
  });
});

describe('swipeVisual', () => {
  it('rotates with dx and hints the direction once past half the threshold', () => {
    const v = swipeVisual(100, 0);
    expect(v.transform).toContain('translate(100px, 0px)');
    expect(v.transform).toContain('rotate(');
    expect(v.hint).toBe('right');
    expect(v.strength).toBeGreaterThan(0.5);
  });
  it('has no hint near the origin', () => {
    expect(swipeVisual(5, -5).hint).toBeNull();
  });
  it('hints up and left', () => {
    expect(swipeVisual(0, -90).hint).toBe('up');
    expect(swipeVisual(-90, 0).hint).toBe('left');
  });
});
