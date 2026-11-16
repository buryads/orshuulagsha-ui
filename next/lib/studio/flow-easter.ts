export type ConfettiPalette = 'default' | 'sagaalgan';

export const RARE_GREETING_CHANCE = 1 / 150;
export const SPECIAL_ITEM = 108;

export interface AcceptEffects {
  item108: boolean;
  rareGreeting: boolean;
  palette: ConfettiPalette;
}

export function isSagaalganSeason(now: Date): boolean {
  return now.getMonth() === 1;
}

export function acceptEffects(count: number, rng: () => number, now: Date): AcceptEffects {
  return {
    item108: count === SPECIAL_ITEM,
    rareGreeting: rng() < RARE_GREETING_CHANCE,
    palette: isSagaalganSeason(now) ? 'sagaalgan' : 'default',
  };
}

const PALETTES: Record<ConfettiPalette, string[]> = {
  default: ['#0066B3', '#FFD200', '#2D8659', '#E84545', '#4A8FCF'],
  sagaalgan: ['#FFFFFF', '#E5F0F9', '#C7DEF1', '#8FBCE0', '#4A8FCF', '#0066B3'],
};

export function confettiPalette(palette: ConfettiPalette): string[] {
  return PALETTES[palette];
}
