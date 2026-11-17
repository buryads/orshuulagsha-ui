'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  createLesson,
  createUnit,
  getLessons,
  getNextLesson,
  getOverview,
  getUnits,
  LEVELS,
  STATUSES,
  updateLesson,
  type LessonRow,
  type LessonStatus,
  type Level,
  type Missing,
  type StudioOverview,
  type StudioUnit,
} from '@/lib/api/studio';
import {
  filterLessons,
  flattenIds,
  groupByUnit,
  hasFilters,
  levelProgress,
  missingBadges,
  moveSelection,
  NO_FILTERS,
  toRow,
  type BoardFilters,
} from '@/lib/studio/board';
import { isPlainShortcut } from '@/lib/studio/shortcuts';
import { Field, inputStyle } from './field';
import { EmailPrompt } from './email-prompt';
import { FlowEntry } from './flow-entry';
import { TeachersPanel } from './teachers-panel';
import { isForbidden } from './use-studio-access';
import { VoiceStatsCard } from './voice-stats-card';

const LEVEL_KEY = 'studio.level';
export const LAST_LESSON_KEY = 'studio.lastLesson';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

type EditField = 'title' | 'title_bur';

export function StudioBoard({ isAdmin }: { isAdmin: boolean }): ReactElement {
  const t = useTranslations('studio');
  const router = useRouter();
  const [level, setLevel] = useState<Level>('A1');
  const [overview, setOverview] = useState<StudioOverview | null>(null);
  const [units, setUnits] = useState<StudioUnit[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoardFilters>(NO_FILTERS);
  const [selected, setSelected] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ id: number; field: EditField } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const globalAddRef = useRef<HTMLInputElement>(null);
  const [globalTitle, setGlobalTitle] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDrafts, setUnitDrafts] = useState<Record<number, string>>({});
  const unitInputs = useRef(new Map<number, HTMLInputElement>());

  useEffect(() => {
    const saved = readSession(LEVEL_KEY);
    if (saved && (LEVELS as string[]).includes(saved)) setLevel(saved as Level);
  }, []);

  const refreshOverview = useCallback(() => {
    getOverview()
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  useEffect(refreshOverview, [refreshOverview]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getUnits(level), getLessons({ level })])
      .then(([u, l]) => {
        if (cancelled) return;
        setUnits(u);
        setLessons(l);
        const last = Number(readSession(LAST_LESSON_KEY));
        setSelected((cur) => cur ?? (l.some((x) => x.id === last) ? last : (l[0]?.id ?? null)));
      })
      .catch((e) => {
        if (!cancelled) setError(isForbidden(e) ? t('gate.denied') : t('board.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [level, t]);

  const pickLevel = useCallback((l: Level) => {
    setLevel(l);
    setSelected(null);
    try {
      sessionStorage.setItem(LEVEL_KEY, l);
    } catch {
      // storage unavailable
    }
  }, []);

  const visible = useMemo(() => filterLessons(lessons, filters), [lessons, filters]);
  const groups = useMemo(() => groupByUnit(visible, units, !hasFilters(filters)), [visible, units, filters]);
  const ids = useMemo(() => flattenIds(groups), [groups]);

  useEffect(() => {
    if (selected === null) return;
    document
      .querySelector(`[data-lesson-id="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const open = useCallback(
    (id: number) => {
      try {
        sessionStorage.setItem(LAST_LESSON_KEY, String(id));
      } catch {
        // storage unavailable
      }
      router.push(`/studio/lessons/${id}`);
    },
    [router],
  );

  const openNext = useCallback(async () => {
    try {
      const next = await getNextLesson(selected ?? undefined, {
        level,
        missing: (filters.missing || undefined) as Missing | undefined,
      });
      if (next) open(next.id);
      else setNotice(t('board.nothingLeft'));
    } catch {
      setNotice(t('board.loadFailed'));
    }
  }, [selected, level, filters.missing, open, t]);

  const patchRow = useCallback(
    async (id: number, patch: { title?: string; title_bur?: string | null; status?: LessonStatus }) => {
      try {
        const updated = await updateLesson(id, patch);
        setLessons((list) => list.map((l) => (l.id === id ? toRow(updated) : l)));
        refreshOverview();
      } catch {
        setNotice(t('board.saveFailed'));
      }
    },
    [refreshOverview, t],
  );

  const addLesson = useCallback(
    async (title: string, unitId: number | null) => {
      const clean = title.trim();
      if (!clean) return;
      try {
        const created = await createLesson({ title: clean, unit_id: unitId, level });
        setLessons((list) => [...list, toRow(created)]);
        setSelected(created.id);
        refreshOverview();
      } catch {
        setNotice(t('board.saveFailed'));
      }
    },
    [level, refreshOverview, t],
  );

  const startEdit = useCallback((id: number, field: EditField) => {
    setSelected(id);
    setEditing({ id, field });
  }, []);
  const endEdit = useCallback(() => setEditing(null), []);

  const addUnit = useCallback(async () => {
    const title = unitTitle.trim();
    if (!title) return;
    try {
      const unit = await createUnit({ level, title_ru: title });
      setUnits((list) => [...list, unit]);
      setUnitTitle('');
      requestAnimationFrame(() => unitInputs.current.get(unit.id)?.focus());
    } catch {
      setNotice(t('board.saveFailed'));
    }
  }, [level, unitTitle, t]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false);
        return;
      }
      if (!isPlainShortcut(e)) return;
      const k = e.key;
      if (k === 'j' || k === 'ArrowDown') {
        e.preventDefault();
        setSelected((cur) => moveSelection(ids, cur, 1));
      } else if (k === 'k' || k === 'ArrowUp') {
        e.preventDefault();
        setSelected((cur) => moveSelection(ids, cur, -1));
      } else if ((k === 'Enter' || k === 'o') && selected !== null) {
        e.preventDefault();
        open(selected);
      } else if (k === 'n') {
        e.preventDefault();
        void openNext();
      } else if (k === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (k === '?') {
        e.preventDefault();
        setHelpOpen((v) => !v);
      } else if (k === 'e' && selected !== null) {
        e.preventDefault();
        setEditing({ id: selected, field: 'title' });
      } else if (k === 'b' && selected !== null) {
        e.preventDefault();
        setEditing({ id: selected, field: 'title_bur' });
      } else if (k === 'a') {
        e.preventDefault();
        globalAddRef.current?.focus();
      } else if (/^[1-5]$/.test(k)) {
        pickLevel(LEVELS[Number(k) - 1] ?? 'A1');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ids, selected, helpOpen, open, openNext, pickLevel]);

  const globalUnit = useMemo(() => {
    const sel = lessons.find((l) => l.id === selected);
    return sel?.unit_id ?? units[units.length - 1]?.id ?? null;
  }, [lessons, selected, units]);

  const onAddKey = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, run: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  };

  return (
    <div className="container fade-up" style={{ paddingTop: 24, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          {t('board.title')}
        </h1>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 13, marginLeft: 'auto' }}
          onClick={() => void openNext()}
          data-testid="next-unfilled"
        >
          {t('board.next')} <kbd style={kbdStyle}>n</kbd>
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '6px 12px', fontSize: 13 }}
          onClick={() => setHelpOpen(true)}
          data-testid="help-open"
        >
          ? {t('help.title')}
        </button>
      </div>

      <EmailPrompt />

      <FlowEntry />
      <VoiceStatsCard />

      <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} data-testid="level-tabs">
        {LEVELS.map((l, i) => {
          const p = levelProgress(overview?.levels.find((x) => x.level === l));
          const on = l === level;
          return (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={on}
              data-testid={`level-tab-${l}`}
              className={on ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '8px 14px', fontSize: 13, flexDirection: 'column', gap: 2, lineHeight: 1.2 }}
              onClick={() => pickLevel(l)}
              title={`${i + 1}`}
            >
              <strong>{l}</strong>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>
                {t('board.voiced', { done: p.done, total: p.total })}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          ref={searchRef}
          type="search"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              if (filters.q) setFilters((f) => ({ ...f, q: '' }));
              else (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={t('board.search')}
          aria-label={t('board.search')}
          data-testid="search"
          style={{ ...inputStyle, flex: '1 1 180px' }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as LessonStatus | '' }))}
          aria-label={t('board.filterStatus')}
          data-testid="filter-status"
          style={{ ...inputStyle, flex: '0 1 160px' }}
        >
          <option value="">{t('board.anyStatus')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <select
          value={filters.missing}
          onChange={(e) => setFilters((f) => ({ ...f, missing: e.target.value as Missing | '' }))}
          aria-label={t('board.filterMissing')}
          data-testid="filter-missing"
          style={{ ...inputStyle, flex: '0 1 180px' }}
        >
          <option value="">{t('board.anyMissing')}</option>
          <option value="audio">{t('board.missingAudio')}</option>
          <option value="exercises">{t('board.missingExercises')}</option>
          <option value="review">{t('board.missingReview')}</option>
        </select>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void addLesson(globalTitle, globalUnit).then(() => setGlobalTitle(''));
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          ref={globalAddRef}
          value={globalTitle}
          onChange={(e) => setGlobalTitle(e.target.value)}
          placeholder={t('board.quickAddGlobal')}
          aria-label={t('board.quickAddGlobal')}
          data-testid="quick-add-global"
          autoComplete="off"
          style={inputStyle}
        />
      </form>

      {notice && (
        <p role="status" data-testid="notice" style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }} onClick={() => setNotice(null)}>
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)' }}>
          {error}
        </p>
      )}
      {loading && <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('gate.loading')}</p>}

      {!loading &&
        groups.map((g) => {
          const uid = g.unit?.id ?? 0;
          return (
            <section key={uid} className="card" style={{ padding: 12 }} data-testid="unit-group" data-unit-id={uid}>
              <header style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{g.unit?.title_ru ?? t('board.noUnit')}</h2>
                {g.unit?.title_bur && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{g.unit.title_bur}</span>}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-soft)' }}>
                  {t('board.lessonsCount', { count: g.lessons.length })}
                </span>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {g.lessons.map((l) => (
                  <LessonRowView
                    key={l.id}
                    row={l}
                    selected={l.id === selected}
                    editField={editing?.id === l.id ? editing.field : null}
                    onSelect={setSelected}
                    onOpen={open}
                    onEdit={startEdit}
                    onEditDone={endEdit}
                    onPatch={patchRow}
                  />
                ))}
              </div>
              {g.unit && (
                <input
                  ref={(el) => {
                    if (el) unitInputs.current.set(uid, el);
                    else unitInputs.current.delete(uid);
                  }}
                  value={unitDrafts[uid] ?? ''}
                  onChange={(e) => setUnitDrafts((d) => ({ ...d, [uid]: e.target.value }))}
                  onKeyDown={(e) =>
                    onAddKey(e, () => {
                      const title = unitDrafts[uid] ?? '';
                      setUnitDrafts((d) => ({ ...d, [uid]: '' }));
                      void addLesson(title, uid);
                    })
                  }
                  placeholder={t('board.quickAdd')}
                  aria-label={t('board.quickAdd')}
                  data-testid="quick-add-unit-lesson"
                  autoComplete="off"
                  style={{ ...inputStyle, marginTop: 8 }}
                />
              )}
            </section>
          );
        })}

      {!loading && !groups.length && !error && (
        <p style={{ color: 'var(--text-muted)' }}>{t('board.empty')}</p>
      )}

      <input
        value={unitTitle}
        onChange={(e) => setUnitTitle(e.target.value)}
        onKeyDown={(e) => onAddKey(e, () => void addUnit())}
        placeholder={t('board.quickAddUnit')}
        aria-label={t('board.quickAddUnit')}
        data-testid="quick-add-unit"
        autoComplete="off"
        style={inputStyle}
      />

      {isAdmin && <TeachersPanel />}

      {helpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('help.title')}
          data-testid="help-dialog"
          onClick={() => setHelpOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: 20, maxWidth: 420, width: '100%' }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{t('help.title')}</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', margin: 0, fontSize: 14 }}>
              {(['jk', 'enter', 'n', 'slash', 'e', 'b', 'a', 'levels', 'help'] as const).map((k) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt>
                    <kbd style={kbdStyle}>{t(`help.keys.${k}`)}</kbd>
                  </dt>
                  <dd style={{ margin: 0 }}>{t(`help.desc.${k}`)}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => setHelpOpen(false)}>
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const kbdStyle = {
  padding: '1px 6px',
  fontSize: 11,
  borderRadius: 4,
  border: '1px solid var(--border-strong)',
  background: 'var(--surface)',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono, monospace)',
} as const;

interface RowProps {
  row: LessonRow;
  selected: boolean;
  editField: EditField | null;
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
  onEdit: (id: number, f: EditField) => void;
  onEditDone: () => void;
  onPatch: (id: number, p: { title?: string; title_bur?: string | null; status?: LessonStatus }) => void;
}

const LessonRowView = memo(function LessonRowView({ row, selected, editField, onSelect, onOpen, onEdit, onEditDone, onPatch }: RowProps): ReactElement {
  const t = useTranslations('studio');
  const badges = missingBadges(row);
  return (
    <div
      data-testid="lesson-row"
      data-lesson-id={row.id}
      data-selected={selected ? 'true' : 'false'}
      onClick={() => onSelect(row.id)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 10px',
        padding: '8px 10px',
        borderRadius: 10,
        border: `1.5px solid ${selected ? 'var(--primary)' : 'transparent'}`,
        background: selected ? 'var(--primary-50)' : 'transparent',
      }}
    >
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        {editField === 'title' ? (
          <InlineEdit value={row.title} onDone={onEditDone} onSave={(v) => v.trim() && onPatch(row.id, { title: v.trim() })} testId="edit-title" />
        ) : (
          <button
            type="button"
            onClick={() => onEdit(row.id, 'title')}
            style={{ all: 'unset', cursor: 'text', fontWeight: 600, fontSize: 15, overflowWrap: 'anywhere' }}
            data-testid="row-title"
          >
            {row.title}
          </button>
        )}
      </div>
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        {editField === 'title_bur' ? (
          <InlineEdit
            value={row.title_bur ?? ''}
            bur
            onDone={onEditDone}
            onSave={(v) => onPatch(row.id, { title_bur: v.trim() || null })}
            testId="edit-title-bur"
          />
        ) : (
          <button
            type="button"
            onClick={() => onEdit(row.id, 'title_bur')}
            style={{ all: 'unset', cursor: 'text', fontSize: 14, color: row.title_bur ? 'var(--text-muted)' : 'var(--text-soft)', overflowWrap: 'anywhere' }}
            data-testid="row-title-bur"
          >
            {row.title_bur || t('board.addBur')}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {badges.exercises && <span className="chip chip-warm" data-testid="badge-exercises">{t('board.badgeNoExercises')}</span>}
        {badges.audio && (
          <span className="chip chip-primary" data-testid="badge-audio">
            {t('board.badgeAudio', { done: row.audio_done, total: row.audio_total })}
          </span>
        )}
        {row.review_note && <span className="chip chip-warm" data-testid="badge-note" title={row.review_note}>!</span>}
        {badges.review && <span className="chip chip-rose" data-testid="badge-review">{t('board.badgeReview')}</span>}
        <select
          value={row.status}
          onChange={(e) => onPatch(row.id, { status: e.target.value as LessonStatus })}
          aria-label={t('board.status')}
          data-testid="row-status"
          style={{ ...inputStyle, flex: '0 0 auto', width: 'auto', padding: '4px 6px', fontSize: 12 }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <Link
          href={`/studio/lessons/${row.id}`}
          onClick={(e) => {
            e.preventDefault();
            onOpen(row.id);
          }}
          className="btn btn-secondary"
          style={{ padding: '4px 12px', fontSize: 12, textDecoration: 'none' }}
          data-testid="row-open"
        >
          {t('board.open')}
        </Link>
      </div>
    </div>
  );
});

function InlineEdit({
  value,
  bur = false,
  onSave,
  onDone,
  testId,
}: {
  value: string;
  bur?: boolean;
  onSave: (v: string) => void;
  onDone: () => void;
  testId: string;
}): ReactElement {
  const [draft, setDraft] = useState(value);
  const finished = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapRef.current?.querySelector<HTMLElement>('input')?.focus();
  }, []);

  const finish = (save: boolean) => {
    if (finished.current) return;
    finished.current = true;
    if (save && draft !== value) onSave(draft);
    onDone();
  };

  return (
    <div ref={wrapRef}>
      <Field
        value={draft}
        onChange={setDraft}
        bur={bur}
        testId={testId}
        onBlur={() => finish(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            finish(true);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            finish(false);
          }
        }}
      />
    </div>
  );
}
