import { describe, expect, it } from 'vitest';
import {
  bannerDate,
  dayChoices,
  formatDayRanges,
  missingKey,
  undoLeftMs,
  UNDO_WINDOW_MS,
} from './events';
import type { PhraseReadiness } from '@/lib/api/studio-events';

const phrase = (item_key: string, over: Partial<PhraseReadiness> = {}): PhraseReadiness => ({
  item_key,
  bur: 'x',
  ru: null,
  source: null,
  signoffs: 0,
  issue: false,
  audio_uuid: null,
  voice_user_id: null,
  ready: false,
  missing: 'review',
  ...over,
});

describe('undoLeftMs', () => {
  it('counts down from the window and never goes negative', () => {
    expect(undoLeftMs(1000, 1000)).toBe(UNDO_WINDOW_MS);
    expect(undoLeftMs(1000, 3000)).toBe(UNDO_WINDOW_MS - 2000);
    expect(undoLeftMs(1000, 99999)).toBe(0);
  });
});

describe('missingKey', () => {
  it('is null for ready phrases', () => {
    expect(missingKey({ ready: true, missing: null, issue: false })).toBeNull();
  });
  it('prefers issue over the stored reason', () => {
    expect(missingKey({ ready: false, missing: 'voice', issue: true })).toBe('issue');
  });
  it('passes through the missing reason', () => {
    expect(missingKey({ ready: false, missing: 'second_review', issue: false })).toBe(
      'second_review',
    );
  });
});

describe('formatDayRanges', () => {
  it('collapses consecutive days', () => {
    expect(formatDayRanges([15, 16, 17, 18, 19, 20, 21])).toBe('15–21');
    expect(formatDayRanges([3, 1, 2, 7, 9, 10])).toBe('1–3, 7, 9–10');
    expect(formatDayRanges([])).toBe('');
  });
});

describe('bannerDate', () => {
  it('subtracts banner days across month borders', () => {
    expect(bannerDate('2027-01-18', 14)).toBe('2027-01-04');
    expect(bannerDate('2027-01-05', 14)).toBe('2026-12-22');
    expect(bannerDate('bad', 14)).toBeNull();
  });
});

describe('dayChoices', () => {
  it('hides phrases used by other days but keeps the current one', () => {
    const list = [phrase('a'), phrase('b'), phrase('c')];
    const keys = dayChoices(list, new Set(['a', 'b']), 'b').map((p) => p.item_key);
    expect(keys).toEqual(['b', 'c']);
  });
});
