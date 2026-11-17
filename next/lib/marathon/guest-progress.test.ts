import { describe, expect, it } from 'vitest';
import {
  GUEST_PROGRESS_KEY,
  pendingGuestDays,
  readGuestProgress,
  removeGuestDay,
  replayGuestDays,
  saveGuestDay,
} from './guest-progress';

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('guest marathon progress', () => {
  it('stores days per event and lists them in day order', () => {
    const store = memoryStore();
    saveGuestDay('ny', 3, { q1: 'a' }, store);
    saveGuestDay('ny', 1, { q1: 'b' }, store);
    saveGuestDay('other', 2, { q1: 'c' }, store);
    expect(pendingGuestDays('ny', store).map((d) => d.day)).toEqual([1, 3]);
    expect(pendingGuestDays('other', store)).toHaveLength(1);
  });

  it('overwrites a retaken day', () => {
    const store = memoryStore();
    saveGuestDay('ny', 1, { q1: 'a' }, store);
    saveGuestDay('ny', 1, { q1: 'z' }, store);
    expect(pendingGuestDays('ny', store)).toEqual([{ day: 1, answers: { q1: 'z' } }]);
  });

  it('removing the last day clears the key', () => {
    const store = memoryStore();
    saveGuestDay('ny', 1, { q1: 'a' }, store);
    removeGuestDay('ny', 1, store);
    expect(store.getItem(GUEST_PROGRESS_KEY)).toBeNull();
  });

  it('ignores corrupt storage and works without storage', () => {
    const store = memoryStore();
    store.setItem(GUEST_PROGRESS_KEY, '{oops');
    expect(readGuestProgress(store)).toEqual({});
    store.setItem(GUEST_PROGRESS_KEY, JSON.stringify({ ny: { x: { q1: 'a' }, '2': { q1: 5 }, '3': { q1: 'ok' } } }));
    expect(pendingGuestDays('ny', store)).toEqual([{ day: 3, answers: { q1: 'ok' } }]);
    expect(() => saveGuestDay('ny', 1, { q1: 'a' }, null)).not.toThrow();
    expect(pendingGuestDays('ny', null)).toEqual([]);
  });

  it('replay removes only saved days and keeps failures', async () => {
    const store = memoryStore();
    saveGuestDay('ny', 1, { q1: 'a' }, store);
    saveGuestDay('ny', 2, { q1: 'b' }, store);
    saveGuestDay('ny', 3, { q1: 'c' }, store);
    const sent: number[] = [];
    const count = await replayGuestDays(
      'ny',
      async (day) => {
        sent.push(day);
        if (day === 2) throw new Error('network');
        return { saved: day !== 3 };
      },
      store,
    );
    expect(sent).toEqual([1, 2, 3]);
    expect(count).toBe(1);
    expect(pendingGuestDays('ny', store).map((d) => d.day)).toEqual([2, 3]);
  });
});
