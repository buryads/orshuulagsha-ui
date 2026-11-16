import { describe, expect, it } from 'vitest';
import { isLetterKey, isSpaceKey } from './flow-keys';

describe('isLetterKey', () => {
  it('matches by physical code on any layout', () => {
    expect(isLetterKey({ key: 'к', code: 'KeyR' }, 'r')).toBe(true);
    expect(isLetterKey({ key: 'ы', code: 'KeyS' }, 's')).toBe(true);
  });
  it('matches latin and cyrillic keys without a code', () => {
    expect(isLetterKey({ key: 'R' }, 'r')).toBe(true);
    expect(isLetterKey({ key: 'к' }, 'r')).toBe(true);
    expect(isLetterKey({ key: 'ы' }, 's')).toBe(true);
  });
  it('rejects other letters', () => {
    expect(isLetterKey({ key: 's', code: 'KeyS' }, 'r')).toBe(false);
  });
});

describe('isSpaceKey', () => {
  it('matches space by code or key', () => {
    expect(isSpaceKey({ key: ' ', code: 'Space' })).toBe(true);
    expect(isSpaceKey({ key: ' ' })).toBe(true);
    expect(isSpaceKey({ key: 'Enter', code: 'Enter' })).toBe(false);
  });
});
