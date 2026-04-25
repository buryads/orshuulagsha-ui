import type { ReactElement } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { NamesHero } from '@/components/names/names-hero';
import { NamesExplorer } from '@/components/names/names-explorer';
import { CtaBanner } from '@/components/names/cta-banner';
import { NAMES } from '@/lib/data/names';

interface NamesPageProps {
  params: { locale: string };
}

export default function NamesPage({ params }: NamesPageProps): ReactElement {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <NamesHero totalCount={NAMES.length} />
      <div style={{ marginTop: -80, position: 'relative' }}>
        <NamesExplorer names={NAMES} />
        <CtaBanner />
      </div>
    </div>
  );
}
