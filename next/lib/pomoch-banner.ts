export const POMOCH_BANNER_KEY = 'pomoch-banner-dismissed';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function isBannerDismissed(store: StorageLike | null = storage()): boolean {
  try {
    return store?.getItem(POMOCH_BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissBanner(store: StorageLike | null = storage()): void {
  try {
    store?.setItem(POMOCH_BANNER_KEY, '1');
  } catch {
    return;
  }
}
