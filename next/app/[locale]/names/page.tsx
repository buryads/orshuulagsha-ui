import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { NamesHero } from '@/components/names/names-hero';
import { NamesSearch } from '@/components/names/names-search';
import { NamesGrid } from '@/components/names/names-grid';
import { CtaBanner } from '@/components/names/cta-banner';
import { NAMES } from '@/components/names/data';

interface NamesPageProps {
  params: { locale: string };
}

export default function NamesPage({ params }: NamesPageProps): ReactElement {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
      <NamesHero totalCount={NAMES.length} />
      <div style={{ marginTop: -80, position: 'relative' }}>
        <NamesSearch />
        <NamesGrid names={NAMES} />
        <CtaBanner />
      </div>
    </div>
  );
}
