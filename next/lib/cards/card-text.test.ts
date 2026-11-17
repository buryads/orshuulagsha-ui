import { describe, expect, it } from 'vitest';
import { pickOccasion } from './card-text';

describe('card text', () => {
  it('picks the preferred occasion only when it has phrases', () => {
    expect(pickOccasion(['birthday', 'sagaalgan'], null, 'sagaalgan')).toBe('sagaalgan');
    expect(pickOccasion(['birthday'], null, 'sagaalgan')).toBe('birthday');
    expect(pickOccasion(['birthday', 'wedding'], 'wedding', 'sagaalgan')).toBe('wedding');
    expect(pickOccasion(['birthday'], 'wedding', 'sagaalgan')).toBe('birthday');
  });
});
