import { describe, expect, it } from 'vitest';
import {
  clearDraft,
  cleanTranslations,
  draftKey,
  EMPTY_DRAFT,
  readDraft,
  writeDraft,
} from './word-draft';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

describe('word draft', () => {
  it('keeps drafts per card key', () => {
    const s = memoryStorage();
    writeDraft(s, 'wr:1', { translations: ['а'], example: 'пример' });
    writeDraft(s, 'wr:2', { translations: ['б'], example: '' });
    expect(readDraft(s, 'wr:1')).toEqual({ translations: ['а'], example: 'пример' });
    expect(readDraft(s, 'wr:2')).toEqual({ translations: ['б'], example: '' });
    expect(readDraft(s, 'wr:3')).toEqual(EMPTY_DRAFT);
  });

  it('clears a draft after success', () => {
    const s = memoryStorage();
    writeDraft(s, 'wr:1', { translations: ['а'], example: '' });
    clearDraft(s, 'wr:1');
    expect(s.getItem(draftKey('wr:1'))).toBeNull();
  });

  it('falls back to an empty draft on corrupt json or missing storage', () => {
    const s = memoryStorage();
    s.setItem(draftKey('wr:1'), '{broken');
    expect(readDraft(s, 'wr:1')).toEqual(EMPTY_DRAFT);
    expect(readDraft(null, 'wr:1')).toEqual(EMPTY_DRAFT);
    expect(() => writeDraft(null, 'wr:1', EMPTY_DRAFT)).not.toThrow();
  });
});

describe('cleanTranslations', () => {
  it('trims, collapses spaces, drops empty and keeps at most three', () => {
    expect(cleanTranslations(['  а  б ', '', '   ', 'в', 'г', 'д'])).toEqual(['а б', 'в', 'г']);
  });
});
