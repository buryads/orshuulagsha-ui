// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import type { ReactElement } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import type { LearnMode } from './learn-hub';

interface QuickActivitiesProps {
  onSelect: (mode: LearnMode) => void;
}

interface Activity {
  label: string;
  color: string;
  icon: IconName;
  action?: LearnMode;
}

const ACTIVITIES: readonly Activity[] = [
  {
    label: 'Флешкарты · 5 мин',
    color: 'var(--primary)',
    icon: 'library',
    action: 'flashcards',
  },
  {
    label: 'Мини-квиз · 3 мин',
    color: 'var(--accent-warm)',
    icon: 'target',
    action: 'quiz',
  },
  {
    label: 'Слово в литературе · 4 мин',
    color: 'var(--accent-green)',
    icon: 'book',
  },
  {
    label: 'Игра «Угадай слово» · 7 мин',
    color: 'var(--tertiary)',
    icon: 'sparkles',
  },
];

export function QuickActivities({
  onSelect,
}: QuickActivitiesProps): ReactElement {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h4
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-soft)',
          marginBottom: 12,
        }}
      >
        Быстрые активности
      </h4>
      {ACTIVITIES.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            if (a.action) onSelect(a.action);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 10,
            width: '100%',
            background: 'transparent',
            textAlign: 'left',
            marginBottom: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `color-mix(in srgb, ${a.color} 12%, transparent)`,
              color: a.color,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name={a.icon} size={15} />
          </div>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
            {a.label}
          </span>
          <Icon
            name="arrow-right"
            size={14}
            style={{ color: 'var(--text-soft)' }}
          />
        </button>
      ))}
    </div>
  );
}
