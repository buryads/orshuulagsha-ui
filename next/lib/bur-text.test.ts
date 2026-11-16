import { describe, expect, it } from 'vitest';
import { buildRows, keyOutput } from './bur-keyboard-layout';
import { normalizeBuryatH } from './bur-text';

const cp = (s: string) => [...s].map((c) => c.codePointAt(0));

describe('keyboard layout', () => {
  const tokens = buildRows(true).flat().map((k) => k.token);

  it('types Cyrillic һ/Һ (U+04BB/U+04BA) and has no Latin h', () => {
    expect(tokens).toContain('һ');
    expect(tokens).not.toContain('h');
    expect(cp(keyOutput('һ', false, false))).toEqual([0x04bb]);
    expect(cp(keyOutput('һ', true, false))).toEqual([0x04ba]);
    expect(cp(keyOutput('һ', false, true))).toEqual([0x04ba]);
  });

  it('keeps ү and ө correct in both cases', () => {
    expect(cp(keyOutput('ү', false, false))).toEqual([0x04af]);
    expect(cp(keyOutput('ү', true, false))).toEqual([0x04ae]);
    expect(cp(keyOutput('ө', false, false))).toEqual([0x04e9]);
    expect(cp(keyOutput('ө', true, false))).toEqual([0x04e8]);
  });

  it('uses no Latin letters on any key', () => {
    expect(tokens.filter((t) => /[A-Za-z]/.test(t.replace(/\{.*\}/, '')))).toEqual([]);
  });

  it('drops tab and enter in single-line mode', () => {
    const single = buildRows(false).flat().map((k) => k.token);
    expect(single).not.toContain('{enter}');
    expect(single).not.toContain('{tab}');
  });
});

describe('normalizeBuryatH', () => {
  it('maps Latin h inside Cyrillic words', () => {
    expect(normalizeBuryatH('hайн')).toBe('һайн');
    expect(normalizeBuryatH('Hайн')).toBe('Һайн');
    expect(normalizeBuryatH('сайhан')).toBe('сайһан');
    expect(normalizeBuryatH('hhайн')).toBe('һһайн');
  });

  it('leaves Latin-only words and Cyrillic һ untouched', () => {
    expect(normalizeBuryatH('hello')).toBe('hello');
    expect(normalizeBuryatH('ah')).toBe('ah');
    expect(normalizeBuryatH('һайн')).toBe('һайн');
  });

  it('handles each word independently', () => {
    expect(normalizeBuryatH('hello hайн')).toBe('hello һайн');
  });
});
