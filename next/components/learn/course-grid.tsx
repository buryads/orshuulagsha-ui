// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import type { ReactElement } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';

interface Course {
  title: string;
  level: string;
  progress: number;
  total: number;
  color: string;
  icon: IconName;
}

const COURSES: readonly Course[] = [
  {
    title: 'Семья и родственники',
    level: 'A1',
    progress: 100,
    total: 12,
    color: 'var(--accent-warm)',
    icon: 'users',
  },
  {
    title: 'Природа и степь',
    level: 'A2',
    progress: 75,
    total: 16,
    color: 'var(--accent-green)',
    icon: 'mountain',
  },
  {
    title: 'Эпос «Гэсэр»',
    level: 'B1',
    progress: 30,
    total: 24,
    color: 'var(--primary)',
    icon: 'book',
  },
  {
    title: 'Кухня и еда',
    level: 'A1',
    progress: 60,
    total: 10,
    color: 'var(--tertiary)',
    icon: 'leaf',
  },
  {
    title: 'Бытовые диалоги',
    level: 'A2',
    progress: 45,
    total: 20,
    color: 'var(--accent-warm)',
    icon: 'comment',
  },
  {
    title: 'Шаманизм и духи',
    level: 'B2',
    progress: 0,
    total: 18,
    color: 'var(--neutral-700)',
    icon: 'sparkles',
  },
];

export function CourseGrid(): ReactElement {
  return (
    <>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Тематические курсы
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {COURSES.map((c) => {
          const completed = Math.round((c.progress * c.total) / 100);
          return (
            <div
              key={c.title}
              className="card"
              style={{
                padding: 22,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                    color: c.color,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={c.icon} size={20} />
                </div>
                <span className="chip" style={{ fontSize: 10 }}>
                  {c.level}
                </span>
              </div>
              <h4
                style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}
              >
                {c.title}
              </h4>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                <span>
                  {completed} / {c.total} уроков
                </span>
                <span style={{ fontWeight: 700, color: c.color }}>
                  {c.progress}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: 'var(--surface-2)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${c.progress}%`,
                    height: '100%',
                    background: c.color,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
