import { describe, expect, it } from 'vitest';
import { clampName, nameCounter, pickOccasion } from './card-text';

describe('card text limits', () => {
  it('clamps names to 40 characters', () => {
    expect(clampName('a'.repeat(55))).toHaveLength(40);
    expect(clampName('бабушке')).toBe('бабушке');
  });

  it('counts by code point, not UTF-16 unit', () => {
    const emoji = '🎉'.repeat(45);
    expect(Array.from(clampName(emoji))).toHaveLength(40);
    expect(nameCounter('🎉🎉')).toBe('2/40');
  });

  it('shows 40/40 at the limit', () => {
    expect(nameCounter('x'.repeat(40))).toBe('40/40');
    expect(nameCounter('x'.repeat(80))).toBe('40/40');
  });

  it('picks the preferred occasion only when it has phrases', () => {
    expect(pickOccasion(['birthday', 'sagaalgan'], null, 'sagaalgan')).toBe('sagaalgan');
    expect(pickOccasion(['birthday'], null, 'sagaalgan')).toBe('birthday');
    expect(pickOccasion(['birthday', 'wedding'], 'wedding', 'sagaalgan')).toBe('wedding');
    expect(pickOccasion(['birthday'], 'wedding', 'sagaalgan')).toBe('birthday');
  });
});
