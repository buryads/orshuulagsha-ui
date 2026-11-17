type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type GuestAnswers = Record<string, string>;
export type GuestProgress = Record<string, Record<string, GuestAnswers>>;

export const GUEST_PROGRESS_KEY = 'marathon-guest-progress';

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isAnswers(value: unknown): value is GuestAnswers {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((v) => typeof v === 'string')
  );
}

export function readGuestProgress(store: StorageLike | null = defaultStorage()): GuestProgress {
  try {
    const raw = store?.getItem(GUEST_PROGRESS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const out: GuestProgress = {};
    for (const [slug, days] of Object.entries(parsed)) {
      if (typeof days !== 'object' || days === null) continue;
      const clean: Record<string, GuestAnswers> = {};
      for (const [n, answers] of Object.entries(days)) {
        if (/^\d+$/.test(n) && isAnswers(answers)) clean[n] = answers;
      }
      if (Object.keys(clean).length) out[slug] = clean;
    }
    return out;
  } catch {
    return {};
  }
}

function write(progress: GuestProgress, store: StorageLike | null): void {
  try {
    if (Object.keys(progress).length === 0) store?.removeItem(GUEST_PROGRESS_KEY);
    else store?.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    return;
  }
}

export function saveGuestDay(
  slug: string,
  day: number,
  answers: GuestAnswers,
  store: StorageLike | null = defaultStorage(),
): void {
  const progress = readGuestProgress(store);
  progress[slug] = { ...progress[slug], [String(day)]: answers };
  write(progress, store);
}

export function pendingGuestDays(
  slug: string,
  store: StorageLike | null = defaultStorage(),
): { day: number; answers: GuestAnswers }[] {
  const days = readGuestProgress(store)[slug] ?? {};
  return Object.entries(days)
    .map(([n, answers]) => ({ day: Number(n), answers }))
    .sort((a, b) => a.day - b.day);
}

export function removeGuestDay(
  slug: string,
  day: number,
  store: StorageLike | null = defaultStorage(),
): void {
  const progress = readGuestProgress(store);
  if (!progress[slug]) return;
  const { [String(day)]: _removed, ...rest } = progress[slug];
  if (Object.keys(rest).length) progress[slug] = rest;
  else delete progress[slug];
  write(progress, store);
}

export async function replayGuestDays(
  slug: string,
  send: (day: number, answers: GuestAnswers) => Promise<{ saved: boolean }>,
  store: StorageLike | null = defaultStorage(),
): Promise<number> {
  let replayed = 0;
  for (const { day, answers } of pendingGuestDays(slug, store)) {
    try {
      const res = await send(day, answers);
      if (res.saved) {
        removeGuestDay(slug, day, store);
        replayed += 1;
      }
    } catch {
      continue;
    }
  }
  return replayed;
}
