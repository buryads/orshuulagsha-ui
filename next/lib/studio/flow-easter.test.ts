import { describe, expect, it } from 'vitest';
import { acceptEffects, confettiPalette, isSagaalganSeason } from './flow-easter';

const feb = new Date(2026, 1, 10);
const nov = new Date(2026, 10, 10);

describe('isSagaalganSeason', () => {
  it('is true only in February', () => {
    expect(isSagaalganSeason(feb)).toBe(true);
    expect(isSagaalganSeason(nov)).toBe(false);
  });
});

describe('acceptEffects', () => {
  it('flags item 108', () => {
    expect(acceptEffects(108, () => 0.9, nov).item108).toBe(true);
    expect(acceptEffects(107, () => 0.9, nov).item108).toBe(false);
  });
  it('shows the rare greeting only below 1/150', () => {
    expect(acceptEffects(5, () => 0.0066, nov).rareGreeting).toBe(true);
    expect(acceptEffects(5, () => 0.0067, nov).rareGreeting).toBe(false);
  });
  it('picks the sagaalgan palette in February', () => {
    expect(acceptEffects(5, () => 0.9, feb).palette).toBe('sagaalgan');
    expect(acceptEffects(5, () => 0.9, nov).palette).toBe('default');
  });
});

describe('confettiPalette', () => {
  it('returns white and blue shades for sagaalgan', () => {
    const colors = confettiPalette('sagaalgan');
    expect(colors).toContain('#FFFFFF');
    expect(colors.length).toBeGreaterThan(2);
  });
  it('returns a distinct default palette', () => {
    expect(confettiPalette('default')).not.toEqual(confettiPalette('sagaalgan'));
  });
});
