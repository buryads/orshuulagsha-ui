'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type ReactElement, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { AudioRecorder } from '@/components/audio/audio-recorder';
import {
  EXERCISE_TYPES,
  getLesson,
  getLessons,
  getNextLesson,
  STATUSES,
  updateLesson,
  type ExerciseType,
  type LessonDetail,
  type LessonPatch,
  type LessonStatus,
  type Recording,
  type StudioExercise,
} from '@/lib/api/studio';
import { neighbourId } from '@/lib/studio/board';
import { isPlainShortcut } from '@/lib/studio/shortcuts';
import { buildVoiceList, nextUnrecorded, voiceProgress, type VoiceItem } from '@/lib/studio/voice';
import { ExerciseCard, type ExerciseItem } from './exercise-card';
import { Field } from './field';
import { PairList, StringList } from './list-editors';
import { StatusPill } from './status-pill';
import { LAST_LESSON_KEY } from './studio-board';
import { isForbidden } from './use-studio-access';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function Section({ title, children, testId }: { title: string; children: ReactNode; testId?: string }): ReactElement {
  return (
    <section className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }} data-testid={testId}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h2>
      {children}
    </section>
  );
}

const groupBlur = (commit: () => void) => (e: FocusEvent<HTMLElement>) => {
  if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
  commit();
};

export function LessonEditor({ id }: { id: number }): ReactElement {
  const t = useTranslations('studio');
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lessonRef = useRef<LessonDetail | null>(null);
  const savedRef = useRef<Record<string, string>>({});
  const pending = useRef(new Set<Promise<unknown>>());
  const flushers = useRef(new Map<string, () => Promise<void>>());
  const newKey = useRef(0);
  lessonRef.current = lesson;

  const track = useCallback((p: Promise<unknown>) => {
    pending.current.add(p);
    void p.finally(() => pending.current.delete(p)).catch(() => undefined);
  }, []);

  const snapshot = (l: LessonDetail) => {
    savedRef.current = {
      review_note: JSON.stringify(l.review_note ?? ''),
      title: JSON.stringify(l.title),
      title_bur: JSON.stringify(l.title_bur ?? ''),
      description: JSON.stringify(l.description ?? ''),
      goal_ru: JSON.stringify(l.goal_ru ?? ''),
      grammar: JSON.stringify(l.grammar ?? []),
      vocab: JSON.stringify(l.vocab ?? []),
      phrases: JSON.stringify(l.phrases ?? []),
      audio_lines: JSON.stringify(l.audio_lines ?? []),
    };
  };

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setError(null);
    getLesson(id)
      .then((l) => {
        if (cancelled) return;
        const norm: LessonDetail = {
          ...l,
          review_note: l.review_note ?? null,
          grammar: l.grammar ?? [],
          vocab: l.vocab ?? [],
          phrases: l.phrases ?? [],
          audio_lines: l.audio_lines ?? [],
          line_recordings: l.line_recordings ?? [],
          exercises: l.exercises ?? [],
        };
        snapshot(norm);
        setLesson(norm);
        setItems(norm.exercises.map((ex) => ({ key: `s${ex.id}`, type: ex.type, ex })));
        try {
          sessionStorage.setItem(LAST_LESSON_KEY, String(id));
          if (norm.level) sessionStorage.setItem('studio.level', norm.level);
        } catch {
          // storage unavailable
        }
        getLessons(norm.level ? { level: norm.level } : {})
          .then((rows) => !cancelled && setOrderIds(rows.map((r) => r.id)))
          .catch(() => undefined);
      })
      .catch((e) => !cancelled && setError(isForbidden(e) ? t('gate.denied') : t('editor.loadFailed')));
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const mergeServer = useCallback((d: LessonDetail) => {
    setLesson((cur) =>
      cur
        ? {
            ...cur,
            status: d.status,
            is_published: d.is_published,
            bur_reviewed: d.bur_reviewed,
            exercise_count: d.exercise_count,
            audio_total: d.audio_total,
            audio_done: d.audio_done,
            line_recordings: d.line_recordings ?? cur.line_recordings,
          }
        : cur,
    );
    if (d.exercises) {
      setItems((list) =>
        list.map((it) => {
          const fresh = d.exercises.find((x) => x.id === it.ex?.id);
          return fresh && it.ex ? { ...it, ex: { ...it.ex, recording: fresh.recording, payload: { ...it.ex.payload, ...(fresh.payload.audio_uuid ? { audio_uuid: fresh.payload.audio_uuid } : {}) } } } : it;
        }),
      );
    }
  }, []);

  const send = useCallback(
    (patch: LessonPatch): Promise<void> => {
      setSaveState('saving');
      const run = updateLesson(id, patch)
        .then((d) => {
          mergeServer(d);
          setSaveState('saved');
        })
        .catch(() => setSaveState('error'));
      track(run);
      return run;
    },
    [id, mergeServer, track],
  );

  const commitField = useCallback(
    (key: 'title' | 'title_bur' | 'description' | 'goal_ru' | 'review_note') => {
      const l = lessonRef.current;
      if (!l) return;
      const raw = (l[key] ?? '') as string;
      const value = raw.trim();
      const sig = JSON.stringify(value);
      if (savedRef.current[key] === sig) return;
      if (key === 'title' && !value) return;
      savedRef.current[key] = sig;
      void send({ [key]: key === 'title' ? value : value || null } as LessonPatch);
    },
    [send],
  );

  const commitList = useCallback(
    (key: 'grammar' | 'vocab' | 'phrases' | 'audio_lines') => {
      const l = lessonRef.current;
      if (!l) return;
      let value: unknown;
      if (key === 'grammar' || key === 'audio_lines') {
        value = (l[key] as string[]).map((x) => x.trim()).filter(Boolean);
      } else {
        value = l[key]
          .map((x) => ({ ...x, bur: x.bur.trim(), ru: x.ru.trim() }))
          .filter((x) => x.bur && x.ru);
      }
      const sig = JSON.stringify(value);
      if (savedRef.current[key] === sig) return;
      savedRef.current[key] = sig;
      void send({ [key]: value } as LessonPatch);
    },
    [send],
  );

  const edit = (patch: Partial<LessonDetail>) => setLesson((l) => (l ? { ...l, ...patch } : l));

  const flushAll = useCallback(async () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    await Promise.all([...flushers.current.values()].map((f) => f()));
    await Promise.allSettled([...pending.current]);
  }, []);

  const go = useCallback(
    async (target: number | null) => {
      if (target === null) return;
      await flushAll();
      router.push(`/studio/lessons/${target}`);
    },
    [flushAll, router],
  );

  const goNextUnfilled = useCallback(async () => {
    await flushAll();
    try {
      const next = await getNextLesson(id, { level: lessonRef.current?.level ?? undefined });
      if (next) router.push(`/studio/lessons/${next.id}`);
      else setNotice(t('board.nothingLeft'));
    } catch {
      setNotice(t('board.loadFailed'));
    }
  }, [flushAll, id, router, t]);

  const voice = useMemo<VoiceItem[]>(
    () =>
      lesson
        ? buildVoiceList(
            lesson.id,
            lesson.line_recordings,
            items.flatMap((it) => (it.ex ? [it.ex] : [])),
          )
        : [],
    [lesson, items],
  );
  const progress = useMemo(() => voiceProgress(voice), [voice]);
  const activeKeyRef = useRef<string | null>(null);
  activeKeyRef.current = activeKey;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  const refreshMeta = useCallback(() => {
    getLesson(id)
      .then(mergeServer)
      .catch(() => undefined);
  }, [id, mergeServer]);

  const advance = useCallback((fromKey: string, rec: Recording) => {
    const list = voiceRef.current.map((x) => (x.key === fromKey ? { ...x, recording: rec } : x));
    setActiveKey(nextUnrecorded(list, fromKey)?.key ?? fromKey);
  }, []);

  const applyVoice = (v: VoiceItem, key: string | null, rec: Recording | null) => {
    setLesson((l) =>
      l && key !== null
        ? { ...l, line_recordings: l.line_recordings.map((r) => (r.line_key === key ? { ...r, recording: rec } : r)) }
        : l,
    );
    setItems((list) =>
      list.map((it) => {
        if (!it.ex || it.type !== 'listen-pick') return it;
        if (!(it.ex.id === v.ownerId && v.kind === 'exercise') && !(key !== null && it.ex.text_key === key)) return it;
        const payload = { ...it.ex.payload };
        if (rec) payload.audio_uuid = rec.uuid;
        else delete payload.audio_uuid;
        return { ...it, ex: { ...it.ex, recording: rec, payload } };
      }),
    );
  };

  const onVoiceSaved = (v: VoiceItem, rec: Recording) => {
    applyVoice(v, rec.text_key ?? v.textKey, rec);
    advance(v.key, rec);
    refreshMeta();
  };

  const onVoiceDeleted = (v: VoiceItem) => {
    applyVoice(v, v.textKey, null);
    refreshMeta();
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void goNextUnfilled();
        return;
      }
      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        void go(neighbourId(orderIds, id, e.key === 'ArrowRight' ? 1 : -1));
        return;
      }
      if (!isPlainShortcut(e)) return;
      if (e.key === ']') void go(neighbourId(orderIds, id, 1));
      else if (e.key === '[') void go(neighbourId(orderIds, id, -1));
      else if (e.key === 'v') {
        const list = voiceRef.current;
        const first = list.find((x) => !x.recording) ?? list[0];
        if (first) {
          e.preventDefault();
          setActiveKey(first.key);
          document.querySelector(`[data-voice-key="${first.key}"]`)?.scrollIntoView({ block: 'center' });
        }
      } else if (e.key === 'Escape') setActiveKey(null);
      else if (activeKeyRef.current && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const list = voiceRef.current;
        const idx = list.findIndex((x) => x.key === activeKeyRef.current);
        const next = list[Math.min(list.length - 1, Math.max(0, idx + (e.key === 'ArrowDown' ? 1 : -1)))];
        if (next) {
          setActiveKey(next.key);
          document.querySelector(`[data-voice-key="${next.key}"]`)?.scrollIntoView({ block: 'nearest' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, goNextUnfilled, id, orderIds]);

  useEffect(() => {
    const w = (e: BeforeUnloadEvent) => {
      if (pending.current.size) e.preventDefault();
    };
    window.addEventListener('beforeunload', w);
    return () => window.removeEventListener('beforeunload', w);
  }, []);

  const registerFlush = useCallback((key: string, fn: (() => Promise<void>) | null) => {
    if (fn) flushers.current.set(key, fn);
    else flushers.current.delete(key);
  }, []);

  const onExerciseSaved = useCallback(
    (key: string, ex: StudioExercise) => {
      setItems((list) => list.map((it) => (it.key === key ? { ...it, ex: { ...ex, recording: ex.recording ?? it.ex?.recording ?? null } } : it)));
      refreshMeta();
    },
    [refreshMeta],
  );

  const onExerciseRemoved = useCallback(
    (key: string) => {
      setItems((list) => list.filter((it) => it.key !== key));
      refreshMeta();
    },
    [refreshMeta],
  );

  const addExercise = (type: ExerciseType) => {
    const key = `n${newKey.current++}`;
    setItems((list) => [...list, { key, type, ex: null }]);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-fid="ex-${key}-prompt"]`)?.focus());
  };

  const setStatus = (status: LessonStatus) => {
    edit({ status });
    void send({ status });
  };

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <p role="alert" style={{ color: 'var(--tertiary-700)' }}>
          {error}
        </p>
        <Link href="/studio">{t('editor.back')}</Link>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="container" style={{ paddingTop: 32, color: 'var(--text-muted)' }}>
        {t('gate.loading')}
      </div>
    );
  }

  const prev = neighbourId(orderIds, id, -1);
  const next = neighbourId(orderIds, id, 1);
  const published = lesson.status === 'published';

  return (
    <div className="container fade-up" style={{ paddingTop: 20, paddingBottom: 64, display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="lesson-editor">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/studio" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 13, textDecoration: 'none' }} data-testid="back">
          ← {t('editor.back')}
        </Link>
        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} disabled={prev === null} onClick={() => void go(prev)} data-testid="prev-lesson">
          ← <kbd>[</kbd>
        </button>
        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} disabled={next === null} onClick={() => void go(next)} data-testid="next-lesson">
          <kbd>]</kbd> →
        </button>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => void goNextUnfilled()} data-testid="save-next">
          {t('editor.saveNext')} <kbd>Ctrl+Enter</kbd>
        </button>
        {lesson.is_published ? (
          <Link href={`/learn/lesson/${lesson.slug}`} onClick={(e) => { e.preventDefault(); void flushAll().then(() => router.push(`/learn/lesson/${lesson.slug}`)); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13, textDecoration: 'none' }} data-testid="play-lesson">
            ▶ {t('editor.play')}
          </Link>
        ) : (
          <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} disabled title={t('editor.playUnpublished')} data-testid="play-lesson">
            ▶ {t('editor.play')}
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: saveState === 'error' ? 'var(--tertiary-700)' : 'var(--text-soft)' }} role="status" data-testid="save-state">
          {saveState === 'idle' ? '' : t(`editor.save.${saveState}`)}
        </span>
      </div>

      {notice && (
        <p role="status" style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          {notice}
        </p>
      )}

      {(lesson.review_note ?? '') !== '' && (
        <div data-testid="review-note-box" style={{ padding: 12, borderRadius: 12, background: 'var(--accent-warm-soft)', border: '1px solid var(--accent-warm)', color: '#5A3E10' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{t('editor.reviewNote')}</div>
          <Field value={lesson.review_note ?? ''} onChange={(v) => edit({ review_note: v })} onBlur={() => commitField('review_note')} multiline placeholder={t('editor.reviewNote')} testId="field-review-note" />
        </div>
      )}

      <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusPill status={lesson.status} label={t(`status.${lesson.status}`)} />
          <select
            value={lesson.status}
            onChange={(e) => setStatus(e.target.value as LessonStatus)}
            aria-label={t('board.status')}
            data-testid="status-select"
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={lesson.bur_reviewed}
              data-testid="reviewed-toggle"
              onChange={(e) => {
                edit({ bur_reviewed: e.target.checked });
                void send({ bur_reviewed: e.target.checked });
              }}
            />
            {t('editor.markReviewed')}
          </label>
          <button
            type="button"
            className={published ? 'btn btn-secondary' : 'btn btn-primary'}
            style={{ padding: '6px 14px', fontSize: 13, marginLeft: 'auto' }}
            onClick={() => setStatus(published ? 'review' : 'published')}
            data-testid="publish"
          >
            {published ? t('editor.unpublish') : t('editor.publish')}
          </button>
        </div>
        <Field value={lesson.title} onChange={(v) => edit({ title: v })} onBlur={() => commitField('title')} placeholder={t('editor.title')} testId="field-title" style={{ fontSize: 18, fontWeight: 700 }} />
        <Field value={lesson.title_bur ?? ''} onChange={(v) => edit({ title_bur: v })} onBlur={() => commitField('title_bur')} bur placeholder={t('editor.titleBur')} testId="field-title-bur" />
        <Field value={lesson.goal_ru ?? ''} onChange={(v) => edit({ goal_ru: v })} onBlur={() => commitField('goal_ru')} placeholder={t('editor.goal')} testId="field-goal" />
        <Field value={lesson.description ?? ''} onChange={(v) => edit({ description: v })} onBlur={() => commitField('description')} multiline placeholder={t('editor.description')} testId="field-description" />
      </div>

      <Section title={t('editor.audioLines')} testId="section-audio-lines">
        <div onBlur={groupBlur(() => commitList('audio_lines'))}>
          <StringList items={lesson.audio_lines} onChange={(audio_lines) => edit({ audio_lines })} fid="audio-line" bur placeholder={t('editor.audioLine')} testId="audio-lines" />
        </div>
      </Section>

      <Section title={t('editor.vocab')} testId="section-vocab">
        <div onBlur={groupBlur(() => commitList('vocab'))}>
          <PairList items={lesson.vocab} onChange={(vocab) => edit({ vocab })} fid="vocab" burPlaceholder={t('editor.bur')} ruPlaceholder={t('editor.ru')} testId="vocab" />
        </div>
      </Section>

      <Section title={t('editor.phrases')} testId="section-phrases">
        <div onBlur={groupBlur(() => commitList('phrases'))}>
          <PairList items={lesson.phrases} onChange={(phrases) => edit({ phrases })} fid="phrase" burPlaceholder={t('editor.bur')} ruPlaceholder={t('editor.ru')} testId="phrases" />
        </div>
      </Section>

      <Section title={t('editor.grammar')} testId="section-grammar">
        <div onBlur={groupBlur(() => commitList('grammar'))}>
          <StringList items={lesson.grammar} onChange={(grammar) => edit({ grammar })} fid="grammar" placeholder={t('editor.grammarItem')} testId="grammar" />
        </div>
      </Section>

      <Section title={t('editor.exercises')} testId="section-exercises">
        {items.map((it) => (
          <ExerciseCard key={it.key} lessonId={id} item={it} onSaved={onExerciseSaved} onRemoved={onExerciseRemoved} registerFlush={registerFlush} track={track} />
        ))}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXERCISE_TYPES.map((type) => (
            <button key={type} type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => addExercise(type)} data-testid={`add-exercise-${type}`}>
              + {t(`exercise.types.${type}`)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('editor.voicing')} testId="section-voicing">
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{t('editor.voicingHint')}</p>
        {progress.total > 0 && (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }} data-testid="voice-progress">
            {t('editor.voiceProgress', { done: progress.done, total: progress.total })}
          </p>
        )}
        {voice.length === 0 && <p style={{ margin: 0, color: 'var(--text-soft)' }}>{t('editor.nothingToVoice')}</p>}
        {voice.map((v) => (
          <div key={v.key} data-voice-key={v.key} data-testid="voice-item" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {v.kind === 'exercise' && <span className="chip" style={{ marginRight: 8 }}>{t('exercise.types.listen-pick')}</span>}
              {v.text || '—'}
            </div>
            {(v.recording || v.uses > 1) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)' }}>
                {v.recording && (
                  <span className="chip chip-green" data-testid="voice-recorded">
                    ✓ {t('editor.alreadyRecorded')}
                  </span>
                )}
                {v.uses > 1 && <span data-testid="voice-uses">{t('editor.usedTimes', { count: v.uses })}</span>}
              </div>
            )}
            <AudioRecorder
              ownerType={v.kind === 'line' ? 'lesson' : 'exercise'}
              ownerId={v.ownerId}
              lineKey={v.lineKey}
              text={v.text}
              recording={v.recording}
              active={activeKey === v.key}
              onActivate={() => setActiveKey(v.key)}
              onSaved={(rec) => onVoiceSaved(v, rec)}
              onDeleted={() => onVoiceDeleted(v)}
            />
          </div>
        ))}
      </Section>
    </div>
  );
}
