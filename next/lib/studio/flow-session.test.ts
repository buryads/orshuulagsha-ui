import { describe, expect, it } from 'vitest';
import { INITIAL_SESSION, sessionReducer, type SessionState } from './flow-session';

const run = (...actions: Parameters<typeof sessionReducer>[1][]): SessionState =>
  actions.reduce(sessionReducer, INITIAL_SESSION);

describe('sessionReducer', () => {
  it('counts accepts and grows the streak', () => {
    const s = run({ type: 'accept' }, { type: 'accept' }, { type: 'accept' });
    expect(s.count).toBe(3);
    expect(s.streak).toBe(3);
    expect(s.bestStreak).toBe(3);
  });
  it('resets the streak on skip but keeps count and best', () => {
    const s = run({ type: 'accept' }, { type: 'accept' }, { type: 'skip' }, { type: 'accept' });
    expect(s.count).toBe(3);
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(2);
    expect(s.skipped).toBe(1);
  });
  it('tracks uploads from pending to done', () => {
    const s = run({ type: 'upload-start', id: 'a' }, { type: 'upload-start', id: 'b' }, { type: 'upload-ok', id: 'a' });
    expect(s.pending).toEqual(['b']);
    expect(s.uploaded).toBe(1);
  });
  it('moves failed uploads out of pending and back on retry', () => {
    let s = run({ type: 'upload-start', id: 'a' }, { type: 'upload-fail', id: 'a' });
    expect(s.pending).toEqual([]);
    expect(s.failed).toEqual(['a']);
    s = sessionReducer(s, { type: 'upload-start', id: 'a' });
    expect(s.pending).toEqual(['a']);
    expect(s.failed).toEqual([]);
    s = sessionReducer(s, { type: 'upload-ok', id: 'a' });
    expect(s.failed).toEqual([]);
    expect(s.uploaded).toBe(1);
  });
  it('does not duplicate ids', () => {
    const s = run({ type: 'upload-start', id: 'a' }, { type: 'upload-start', id: 'a' });
    expect(s.pending).toEqual(['a']);
  });
  it('ignores ok for unknown ids', () => {
    expect(run({ type: 'upload-ok', id: 'zz' }).uploaded).toBe(0);
  });
});
