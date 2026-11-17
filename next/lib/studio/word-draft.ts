export interface WordDraft {
  translations: string[];
  example: string;
}

export const EMPTY_DRAFT: WordDraft = { translations: [''], example: '' };

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function draftKey(itemKey: string): string {
  return `flow-words-draft:${itemKey}`;
}

export function readDraft(storage: DraftStorage | null, itemKey: string): WordDraft {
  if (!storage) return EMPTY_DRAFT;
  try {
    const raw = storage.getItem(draftKey(itemKey));
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<WordDraft>;
    const translations = Array.isArray(parsed.translations)
      ? parsed.translations.filter((x): x is string => typeof x === 'string').slice(0, 3)
      : [];
    return {
      translations: translations.length > 0 ? translations : [''],
      example: typeof parsed.example === 'string' ? parsed.example : '',
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function writeDraft(storage: DraftStorage | null, itemKey: string, draft: WordDraft): void {
  if (!storage) return;
  try {
    storage.setItem(draftKey(itemKey), JSON.stringify(draft));
  } catch {
    /* storage unavailable or full */
  }
}

export function clearDraft(storage: DraftStorage | null, itemKey: string): void {
  if (!storage) return;
  try {
    storage.removeItem(draftKey(itemKey));
  } catch {
    /* storage unavailable */
  }
}

export function cleanTranslations(values: readonly string[]): string[] {
  return values
    .map((v) => v.trim().replace(/\s+/g, ' '))
    .filter((v) => v.length > 0)
    .slice(0, 3);
}

export function sessionStorageOrNull(): DraftStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}
