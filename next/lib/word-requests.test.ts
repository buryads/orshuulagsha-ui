import { describe, expect, it } from 'vitest';
import {
  clearDraft,
  isWordLengthValid,
  loadDraft,
  pluralPeople,
  rejectTextKey,
  saveDraft,
  statusTextKey,
} from './word-requests';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe('pluralPeople (ru)', () => {
  it.each([
    [1, '1 человек'],
    [2, '2 человека'],
    [4, '4 человека'],
    [5, '5 человек'],
    [11, '11 человек'],
    [12, '12 человек'],
    [14, '14 человек'],
    [21, '21 человек'],
    [22, '22 человека'],
    [101, '101 человек'],
    [0, '0 человек'],
  ])('%i -> %s', (count, expected) => {
    expect(pluralPeople(count, 'ru')).toBe(expected);
  });

  it('uses the same Russian forms for bur', () => {
    expect(pluralPeople(3, 'bur')).toBe('3 человека');
  });
});

describe('pluralPeople (en)', () => {
  it('singular and plural', () => {
    expect(pluralPeople(1, 'en')).toBe('1 person');
    expect(pluralPeople(14, 'en')).toBe('14 people');
  });
});

describe('status and reject keys', () => {
  it('maps open, answered and added to status keys', () => {
    expect(statusTextKey('open', null)).toBe('status.open');
    expect(statusTextKey('answered', null)).toBe('status.answered');
    expect(statusTextKey('added', null)).toBe('status.added');
  });

  it('maps rejected rows to the reason text', () => {
    expect(statusTextKey('rejected', 'typo')).toBe('reject.typo');
    expect(statusTextKey('rejected', 'not_buryat')).toBe('reject.notBuryat');
    expect(statusTextKey('rejected', 'other')).toBe('reject.other');
    expect(statusTextKey('rejected', null)).toBe('reject.other');
  });

  it('falls back to other for unknown reasons', () => {
    expect(rejectTextKey(null)).toBe('reject.other');
    expect(rejectTextKey('spam')).toBe('reject.other');
  });
});

describe('isWordLengthValid', () => {
  it('accepts 1..60 characters after trimming', () => {
    expect(isWordLengthValid('а')).toBe(true);
    expect(isWordLengthValid('а'.repeat(60))).toBe(true);
    expect(isWordLengthValid('  ')).toBe(false);
    expect(isWordLengthValid('а'.repeat(61))).toBe(false);
  });
});

describe('draft storage', () => {
  const draft = { query: 'сайн', direction: 'ru2bur' as const, context: 'на рынке', notify: true };

  it('round-trips a draft', () => {
    const storage = memoryStorage();
    saveDraft(draft, storage);
    expect(loadDraft(storage)).toEqual(draft);
    clearDraft(storage);
    expect(loadDraft(storage)).toBeNull();
  });

  it('ignores malformed stored values', () => {
    const storage = memoryStorage();
    storage.setItem('ask-word-request-draft', '{"query":1}');
    expect(loadDraft(storage)).toBeNull();
    storage.setItem('ask-word-request-draft', 'not json');
    expect(loadDraft(storage)).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(() => saveDraft(draft, broken)).not.toThrow();
    expect(loadDraft(broken)).toBeNull();
    expect(() => clearDraft(broken)).not.toThrow();
    expect(() => saveDraft(draft, null)).not.toThrow();
    expect(loadDraft(null)).toBeNull();
  });
});
