// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { GenderFilterChips, type GenderFilter } from './gender-filter';
import { NameCard } from './name-card';
import type { Name } from './data';

export interface NamesGridProps {
  names: Name[];
}

export function NamesGrid({ names }: NamesGridProps): ReactElement {
  const [gender, setGender] = useState<GenderFilter>('all');

  const { maleCount, femaleCount } = useMemo(
    () => ({
      maleCount: names.filter((n) => n.gender === 'male').length,
      femaleCount: names.filter((n) => n.gender === 'female').length,
    }),
    [names],
  );

  const filtered = useMemo(
    () => (gender === 'all' ? names : names.filter((n) => n.gender === gender)),
    [names, gender],
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <GenderFilterChips
          value={gender}
          onChange={setGender}
          total={names.length}
          maleCount={maleCount}
          femaleCount={femaleCount}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((n) => (
          <NameCard key={n.id} name={n} />
        ))}
      </div>
    </div>
  );
}
