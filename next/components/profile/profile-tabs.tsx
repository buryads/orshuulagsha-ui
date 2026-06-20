// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { TabAchievements } from './tab-achievements';
import { TabCollections } from './tab-collections';
import { TabHistory } from './tab-history';
import { TabOverview } from './tab-overview';
import { TabSettings } from './tab-settings';

type TabId = 'overview' | 'collections' | 'achievements' | 'history' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'collections', label: 'Коллекции · 6' },
  { id: 'achievements', label: 'Достижения' },
  { id: 'history', label: 'История' },
  { id: 'settings', label: 'Настройки' },
];

export function ProfileTabs(): ReactElement {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div style={{ padding: '0 clamp(16px, 4vw, 28px)' }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
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
              style={{
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: active
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
                marginBottom: -1,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && <TabOverview />}
      {tab === 'collections' && <TabCollections />}
      {tab === 'achievements' && <TabAchievements />}
      {tab === 'history' && <TabHistory />}
      {tab === 'settings' && <TabSettings />}
    </div>
  );
}
