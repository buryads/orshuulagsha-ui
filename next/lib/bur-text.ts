const WORD = /[\p{L}\p{M}]+/gu;
const HAS_CYRILLIC = /\p{Script=Cyrillic}/u;

export function normalizeBuryatH(text: string): string {
  return text.replace(WORD, (word) =>
    HAS_CYRILLIC.test(word)
      ? word.replace(/h/g, 'һ').replace(/H/g, 'Һ')
      : word,
  );
}
