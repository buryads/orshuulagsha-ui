// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { CSSProperties, ReactElement } from 'react';

const ALPHABET = [
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й',
  'К', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С',
  'Т', 'У', 'Ү', 'Ф', 'Х', 'Һ', 'Ц', 'Ч', 'Ш', 'Щ',
  'Ы', 'Ь', 'Э', 'Ю', 'Я',
];

export function AlphabetPicker(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('letter') ?? '';

  function setLetter(l: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (active === l) {
      params.delete('letter');
    } else {
      params.set('letter', l);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `?${qs}` : '?');
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      {ALPHABET.map((l) => {
        const isActive = active === l;
        const style: CSSProperties = {
          width: 32,
          height: 32,
          borderRadius: 8,
          background: isActive ? 'var(--primary-50)' : 'transparent',
          color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
          fontWeight: 600,
          fontSize: 13,
          border: isActive
            ? '1px solid transparent'
            : '1px solid var(--border)',
          cursor: 'pointer',
        };
        return (
          <button
            type="button"
            key={l}
            onClick={() => setLetter(l)}
            style={style}
            aria-pressed={isActive}
            aria-label={`Слова на букву ${l}`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
