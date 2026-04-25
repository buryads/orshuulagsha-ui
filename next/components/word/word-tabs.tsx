// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import { TabMeaning, type MeaningItem } from './tab-meaning';
import { TabEtymology, type EtymologyStep } from './tab-etymology';
import { TabExamples, type ExampleItem } from './tab-examples';
import { TabForms, type FormItem } from './tab-forms';

type TabId = 'meaning' | 'etym' | 'examples' | 'forms';

interface TabDef {
  id: TabId;
  label: string;
  icon: IconName;
}

const TABS: readonly TabDef[] = [
  { id: 'meaning', label: 'Значение', icon: 'book' },
  { id: 'etym', label: 'Этимология', icon: 'compass' },
  { id: 'examples', label: 'Примеры', icon: 'library' },
  { id: 'forms', label: 'Формы', icon: 'sparkles' },
] as const;

export interface WordTabsProps {
  word: string;
  meanings?: MeaningItem[];
  context?: string;
  etymology?: EtymologyStep[];
  examples?: ExampleItem[];
  forms?: FormItem[];
}

export function WordTabs({
  word,
  meanings,
  context,
  etymology,
  examples,
  forms,
}: WordTabsProps): ReactElement {
  const [tab, setTab] = useState<TabId>('meaning');

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginTop: 20,
          padding: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          width: 'fit-content',
          maxWidth: '100%',
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="btn"
              style={{
                background: active ? 'var(--primary-50)' : 'transparent',
                color: active ? 'var(--primary-700)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 600,
                fontSize: 13,
                padding: '8px 14px',
              }}
              aria-pressed={active}
            >
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'meaning' && <TabMeaning items={meanings} context={context} />}
      {tab === 'etym' && (
        <>
          <DemoNotice />
          <TabEtymology steps={etymology} />
        </>
      )}
      {tab === 'examples' && (
        <>
          <DemoNotice />
          <TabExamples items={examples} highlight={word} />
        </>
      )}
      {tab === 'forms' && (
        <>
          <DemoNotice />
          <TabForms forms={forms} />
        </>
      )}
    </>
  );
}

function DemoNotice(): ReactElement {
  return (
    <div
      role="status"
      className="card"
      style={{
        padding: 10,
        marginTop: 16,
        background: 'var(--accent-warm-soft)',
        color: '#8C5A1F',
        border: 'none',
        fontSize: 12,
      }}
    >
      Демо-наполнение — данные пока подгружаются.
    </div>
  );
}
