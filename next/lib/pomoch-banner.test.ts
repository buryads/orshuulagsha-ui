import { describe, expect, it } from 'vitest';
import { dismissBanner, isBannerDismissed } from './pomoch-banner';

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

describe('pomoch banner dismissal', () => {
  it('is visible until dismissed, then stays dismissed', () => {
    const store = memoryStore();
    expect(isBannerDismissed(store)).toBe(false);
    dismissBanner(store);
    expect(isBannerDismissed(store)).toBe(true);
  });

  it('works without storage', () => {
    expect(isBannerDismissed(null)).toBe(false);
    expect(() => dismissBanner(null)).not.toThrow();
  });

  it('survives a throwing storage', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(isBannerDismissed(broken)).toBe(false);
    expect(() => dismissBanner(broken)).not.toThrow();
  });
});
