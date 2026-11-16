export type Key = { token: string; flex?: number; label?: string };

function toRow(chars: string[]): Key[] {
  return chars.map((c) => ({ token: c }));
}

const ROWS: Key[][] = [
  toRow(['ё', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=']).concat([
    { token: '{backspace}', flex: 2, label: '⌫' },
  ]),
  [
    { token: '{tab}', flex: 1.4, label: '↹' },
    ...toRow(['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\']),
  ],
  [
    { token: '{caps}', flex: 1.6, label: '⇪' },
    ...toRow(['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э']),
    { token: '{enter}', flex: 1.8, label: '⏎' },
  ],
  [
    { token: '{shift}', flex: 1.6, label: '⇧' },
    ...toRow(['/', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']),
    { token: '{shift}', flex: 1.8, label: '⇧' },
  ],
  [
    ...toRow(['@', 'ү']),
    { token: '{space}', flex: 8, label: ' ' },
    ...toRow(['һ', 'ө']),
  ],
];

const MULTILINE_ONLY = new Set(['{tab}', '{enter}']);

export function buildRows(multiline: boolean): Key[][] {
  if (multiline) return ROWS;
  return ROWS.map((row) => row.filter((k) => !MULTILINE_ONLY.has(k.token)));
}

export const SHIFT_SYMBOLS: Record<string, string> = {
  '1': '!',
  '2': '"',
  '3': '№',
  '4': ';',
  '5': '%',
  '6': ':',
  '7': '?',
  '8': '*',
  '9': '(',
  '0': ')',
  '-': '_',
  '=': '+',
  '/': '|',
  '.': ',',
  '@': '#',
  '\\': '/',
};

export function keyOutput(token: string, shifted: boolean, caps: boolean): string {
  const sym = SHIFT_SYMBOLS[token];
  if (shifted && sym) return sym;
  if (shifted !== caps) return token.toLocaleUpperCase('ru-RU');
  return token;
}
