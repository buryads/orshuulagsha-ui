export type RuForm = 'one' | 'few' | 'many';
export type EnForm = 'one' | 'other';

export function ruForm(n: number): RuForm {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
}

export function enForm(n: number): EnForm {
  return n === 1 ? 'one' : 'other';
}
