import { describe, expect, it } from 'vitest';
import {
  KONAMI_START,
  feedKonami,
  konamiInput,
  swallowsArrow,
  type KonamiInput,
} from './flow-konami';

const press = (...inputs: (KonamiInput | null)[]) => {
  let s = KONAMI_START;
  const trail: boolean[] = [];
  for (const i of inputs) {
    const r = feedKonami(s, i);
    s = r.progress;
    trail.push(r.done);
  }
  return { s, trail };
};

const SEQ: KonamiInput[] = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

describe('feedKonami', () => {
  it('completes on the full sequence and resets', () => {
    const { s, trail } = press(...SEQ);
    expect(trail.at(-1)).toBe(true);
    expect(trail.slice(0, -1).every((d) => !d)).toBe(true);
    expect(s).toBe(0);
  });
  it('resets on a wrong key', () => {
    const { s } = press('up', 'up', 'down', 'left');
    expect(s).toBe(0);
  });
  it('restarts when the wrong key is the first key of the sequence', () => {
    const { s } = press('up', 'up', 'up');
    expect(s).toBe(2);
  });
  it('ignores non-sequence keys by resetting', () => {
    expect(press('up', null).s).toBe(0);
  });
});

describe('konamiInput', () => {
  it('maps arrows by key', () => {
    expect(konamiInput({ key: 'ArrowUp' })).toBe('up');
    expect(konamiInput({ key: 'ArrowLeft' })).toBe('left');
  });
  it('maps B and A by physical code or latin or cyrillic key', () => {
    expect(konamiInput({ key: 'и', code: 'KeyB' })).toBe('b');
    expect(konamiInput({ key: 'ф', code: 'KeyA' })).toBe('a');
    expect(konamiInput({ key: 'B' })).toBe('b');
    expect(konamiInput({ key: 'a' })).toBe('a');
  });
  it('returns null for other keys', () => {
    expect(konamiInput({ key: 'x', code: 'KeyX' })).toBeNull();
  });
});

describe('swallowsArrow', () => {
  it('swallows arrows only once the match is past the unbound up-up prefix', () => {
    expect(swallowsArrow(1, 'up')).toBe(false);
    expect(swallowsArrow(2, 'up')).toBe(false);
    expect(swallowsArrow(3, 'down')).toBe(true);
    expect(swallowsArrow(8, 'right')).toBe(true);
  });
  it('never swallows letters', () => {
    expect(swallowsArrow(9, 'b')).toBe(false);
  });
  it('does not swallow after a reset', () => {
    expect(swallowsArrow(0, 'left')).toBe(false);
  });
});
