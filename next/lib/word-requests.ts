export type WordRequestDirection = 'ru2bur' | 'bur2ru';
export type WordRequestStatus = 'open' | 'answered' | 'added' | 'rejected';
export type WordRejectReason = 'typo' | 'not_buryat' | 'other';

export const WORD_MAX_LENGTH = 60;
export const CONTEXT_MAX_LENGTH = 140;
export const WORD_REQUESTS_SEEN_EVENT = 'word-requests:seen';

export interface WordRequestDraft {
  query: string;
  direction: WordRequestDirection;
  context: string;
  notify: boolean;
}

export function pluralPeople(count: number, locale: string): string {
  if (locale === 'en') return `${count} ${count === 1 ? 'person' : 'people'}`;
  return `${count} ${ruPeopleWord(count)}`;
}

function ruPeopleWord(count: number): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (last >= 2 && last <= 4 && !(n >= 12 && n <= 14)) return 'человека';
  return 'человек';
}

export function statusTextKey(status: WordRequestStatus, reason: WordRejectReason | null): string {
  if (status === 'rejected') return rejectTextKey(reason);
  return `status.${status}`;
}

export function rejectTextKey(reason: WordRejectReason | string | null): string {
  if (reason === 'typo') return 'reject.typo';
  if (reason === 'not_buryat') return 'reject.notBuryat';
  return 'reject.other';
}

export function isWordLengthValid(word: string): boolean {
  const length = word.trim().length;
  return length >= 1 && length <= WORD_MAX_LENGTH;
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const DRAFT_KEY = 'ask-word-request-draft';
const REOPEN_KEY = 'ask-word-request-reopen';

function browserStorage(kind: 'localStorage' | 'sessionStorage'): DraftStorage | null {
  try {
    return typeof window === 'undefined' ? null : window[kind];
  } catch {
    return null;
  }
}

function defaultStorage(): DraftStorage | null {
  return browserStorage('localStorage');
}

export function markReopen(query: string, storage: DraftStorage | null = browserStorage('sessionStorage')): void {
  try {
    storage?.setItem(REOPEN_KEY, query);
  } catch {
    // ignore — the sheet then simply stays closed after sign-in
  }
}

export function takeReopen(query: string, storage: DraftStorage | null = browserStorage('sessionStorage')): boolean {
  try {
    if (!storage || storage.getItem(REOPEN_KEY) !== query) return false;
    storage.removeItem(REOPEN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function saveDraft(draft: WordRequestDraft, storage: DraftStorage | null = defaultStorage()): void {
  try {
    storage?.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable or full — the draft is a convenience only
  }
}

export function loadDraft(storage: DraftStorage | null = defaultStorage()): WordRequestDraft | null {
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isDraft(value)) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearDraft(storage: DraftStorage | null = defaultStorage()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // ignore — see saveDraft
  }
}

function isDraft(value: unknown): value is WordRequestDraft {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.query === 'string' &&
    (v.direction === 'ru2bur' || v.direction === 'bur2ru') &&
    typeof v.context === 'string' &&
    typeof v.notify === 'boolean'
  );
}
