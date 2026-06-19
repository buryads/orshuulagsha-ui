'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { getLessons } from '@/lib/api/lessons';
import type { LessonListItem } from '@/lib/api/types';

type LoadState = 'loading' | 'error' | 'done';

export function SkillTree(): ReactElement {
  const t = useTranslations('learn.tree');

  const [state, setState] = useState<LoadState>('loading');
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [lockedId, setLockedId] = useState<number | null>(null);
  const availableRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const data = await getLessons();
      const sorted = [...data].sort((a, b) => a.position - b.position);
      setLessons(sorted);
      setState('done');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-scroll to the first available lesson once loaded.
  useEffect(() => {
    if (state === 'done' && availableRef.current) {
      availableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state]);

  // ── loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--surface-2)',
              animation: 'pulse-soft 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // ── error ────────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ color: 'var(--tertiary)', marginBottom: 14 }}>{t('error')}</p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  // ── empty ────────────────────────────────────────────────────────────────────
  if (lessons.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('empty')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, paddingBottom: 60 }}>
      {lessons.map((lesson, idx) => {
        const isLeft = idx % 2 === 0;
        const offset = 80;

        return (
          <div
            key={lesson.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              width: '100%',
            }}
          >
            {/* Connector line above (skip for first) */}
            {idx > 0 && (
              <div
                aria-hidden="true"
                style={{
                  width: 3,
                  height: 40,
                  background: 'var(--border)',
                  borderRadius: 2,
                  transform: `translateX(${isLeft ? offset : -offset}px)`,
                }}
              />
            )}

            {/* Lesson node */}
            <div
              ref={lesson.status === 'available' ? availableRef : undefined}
              style={{
                transform: `translateX(${isLeft ? offset : -offset}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
              }}
            >
              {lesson.status === 'locked' ? (
                <button
                  type="button"
                  aria-disabled="true"
                  onClick={() => setLockedId(lockedId === lesson.id ? null : lesson.id)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '2px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                    flexShrink: 0,
                  }}
                  aria-label={lesson.title}
                >
                  <Icon name="lock" size={22} />
                </button>
              ) : lesson.status === 'available' ? (
                <Link
                  href={`/learn/lesson/${lesson.slug}`}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    animation: 'pulse-soft 2s ease-in-out infinite',
                    boxShadow: '0 0 0 4px var(--primary-50)',
                    flexShrink: 0,
                    transition: 'transform 0.1s',
                  }}
                  aria-label={`${lesson.title} — ${t('start')}`}
                >
                  <Icon name="play" size={22} />
                </Link>
              ) : (
                /* completed */
                <Link
                  href={`/learn/lesson/${lesson.slug}`}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    flexShrink: 0,
                    transition: 'transform 0.1s',
                  }}
                  aria-label={`${lesson.title} — ${t('completed')}`}
                >
                  <Icon name="check" size={22} stroke={2.5} />
                </Link>
              )}

              {/* Label below node */}
              <div style={{ textAlign: 'center', maxWidth: 120 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: lesson.status === 'locked' ? 'var(--text-muted)' : 'var(--text)',
                    lineHeight: 1.3,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {lesson.title}
                </div>
                {lesson.status === 'completed' && lesson.score !== null && (
                  <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, marginTop: 2 }}>
                    {t('score', { score: lesson.score })}
                  </div>
                )}
                {lesson.status === 'available' && (
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--primary)',
                      fontWeight: 700,
                      marginTop: 2,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t('start')}
                  </div>
                )}
                {lesson.status === 'locked' && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t('xpReward', { xp: lesson.xp_reward })}
                  </div>
                )}
              </div>

              {/* Locked tooltip */}
              {lesson.status === 'locked' && lockedId === lesson.id && (
                <div
                  role="tooltip"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  {t('locked')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
