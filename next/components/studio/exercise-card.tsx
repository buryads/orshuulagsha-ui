'use client';

import { useCallback, useEffect, useRef, useState, type FocusEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import {
  createExercise,
  deleteExercise,
  updateExercise,
  type ExerciseType,
  type StudioExercise,
} from '@/lib/api/studio';
import {
  buildPayload,
  columnPrompt,
  draftFromPayload,
  MAX_OPTIONS,
  validatePayload,
  type ExerciseDraft,
  type ImagePickDraft,
  type ListenPickDraft,
  type MatchDraft,
  type PayloadError,
  type TypeDraft,
} from '@/lib/studio/payload';
import { Field } from './field';
import { PairList, StringList } from './list-editors';
import { useFocusRequest } from './use-focus-request';

export interface ExerciseItem {
  key: string;
  type: ExerciseType;
  ex: StudioExercise | null;
}

interface Props {
  lessonId: number;
  item: ExerciseItem;
  onSaved: (key: string, ex: StudioExercise) => void;
  onRemoved: (key: string) => void;
  registerFlush: (key: string, fn: (() => Promise<void>) | null) => void;
  track: (p: Promise<unknown>) => void;
}

interface State {
  prompt: string;
  draft: ExerciseDraft;
  correctIdx: number;
}

function initState(item: ExerciseItem): State {
  const ex = item.ex;
  const payload = ex?.payload ?? {};
  const draft = draftFromPayload(item.type, payload);
  let correctIdx = -1;
  if (item.type === 'listen-pick') {
    const d = draft as ListenPickDraft;
    correctIdx = d.options.indexOf(d.correct_answer);
  } else if (item.type === 'image-pick') {
    const d = draft as ImagePickDraft;
    correctIdx = d.options.findIndex((o) => o.label === d.correct_answer);
  }
  const prompt = item.type === 'type' ? (draft as TypeDraft).prompt : (ex?.prompt ?? '');
  return { prompt, draft, correctIdx };
}

function compose(type: ExerciseType, s: State, audioUuid?: string): Record<string, unknown> {
  let draft = s.draft;
  if (type === 'type') draft = { ...(draft as TypeDraft), prompt: s.prompt };
  if (type === 'listen-pick') {
    const d = draft as ListenPickDraft;
    draft = { ...d, correct_answer: d.options[s.correctIdx] ?? '', ...(audioUuid ? { audio_uuid: audioUuid } : {}) };
  }
  if (type === 'image-pick') {
    const d = draft as ImagePickDraft;
    draft = { ...d, correct_answer: d.options[s.correctIdx]?.label ?? '' };
  }
  return buildPayload(type, draft);
}

export function ExerciseCard({ lessonId, item, onSaved, onRemoved, registerFlush, track }: Props): ReactElement {
  const t = useTranslations('studio.exercise');
  const [state, setState] = useState<State>(() => initState(item));
  const [errors, setErrors] = useState<PayloadError[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);
  const focus = useFocusRequest();
  const dirty = useRef(item.ex === null);
  const timer = useRef<number | null>(null);
  const stateRef = useRef(state);
  const itemRef = useRef(item);
  const inflight = useRef<Promise<void> | null>(null);
  stateRef.current = state;
  itemRef.current = item;

  const save = useCallback(async (): Promise<void> => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (inflight.current) await inflight.current;
    if (!dirty.current) return;
    const cur = itemRef.current;
    const s = stateRef.current;
    const payload = compose(cur.type, s, (cur.ex?.payload.audio_uuid as string | undefined) ?? undefined);
    const errs = validatePayload(cur.type, payload);
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const run = (async () => {
      try {
        const prompt = columnPrompt(cur.type, s.prompt, cur.ex?.prompt);
        const ex = cur.ex
          ? await updateExercise(cur.ex.id, { prompt, payload })
          : await createExercise(lessonId, { type: cur.type, prompt, payload });
        dirty.current = false;
        setSaveFailed(false);
        onSaved(cur.key, ex);
      } catch {
        setSaveFailed(true);
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = run;
    track(run);
    await run;
  }, [lessonId, onSaved, track]);

  useEffect(() => {
    registerFlush(item.key, save);
    return () => registerFlush(item.key, null);
  }, [item.key, save, registerFlush]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const change = (patch: Partial<State>) => {
    dirty.current = true;
    setState((s) => ({ ...s, ...patch }));
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(), 1200);
  };

  const setDraft = (draft: ExerciseDraft, correctIdx?: number) =>
    change({ draft, ...(correctIdx === undefined ? {} : { correctIdx }) });

  const onCardBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    void save();
  };

  const remove = async () => {
    if (item.ex) {
      if (!window.confirm(t('confirmDelete'))) return;
      try {
        await deleteExercise(item.ex.id);
      } catch {
        setSaveFailed(true);
        return;
      }
    }
    onRemoved(item.key);
  };

  const fid = `ex-${item.key}`;
  const type = item.type;

  return (
    <div
      className="card"
      data-testid="exercise-card"
      data-type={type}
      onBlur={onCardBlur}
      style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip chip-primary">{t(`types.${type}`)}</span>
        {item.ex && !dirty.current && <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{t('saved')}</span>}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 12 }}
          onClick={() => void remove()}
          data-testid="exercise-remove"
        >
          {t('remove')}
        </button>
      </div>

      <Field
        value={state.prompt}
        onChange={(v) => change({ prompt: v })}
        fid={`${fid}-prompt`}
        placeholder={type === 'type' ? t('promptRu') : t('promptOptional')}
        testId="exercise-prompt"
      />

      {type === 'match' && (
        <PairList
          fid={`${fid}-pair`}
          testId="match-pairs"
          burPlaceholder={t('bur')}
          ruPlaceholder={t('ru')}
          items={(state.draft as MatchDraft).pairs.map(([bur, ru]) => ({ bur, ru }))}
          onChange={(rows) => setDraft({ pairs: rows.map((r): [string, string] => [r.bur, r.ru]) })}
        />
      )}

      {type === 'type' && (
        <>
          <Field
            value={(state.draft as TypeDraft).correct_answer}
            onChange={(v) => setDraft({ ...(state.draft as TypeDraft), correct_answer: v })}
            fid={`${fid}-answer`}
            bur
            placeholder={t('correctAnswer')}
            testId="type-answer"
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('accept')}</div>
          <StringList
            items={(state.draft as TypeDraft).accept}
            onChange={(accept) => setDraft({ ...(state.draft as TypeDraft), accept })}
            fid={`${fid}-accept`}
            bur
            placeholder={t('acceptPlaceholder')}
            testId="type-accept"
          />
        </>
      )}

      {type === 'listen-pick' && (
        <>
          <Field
            value={(state.draft as ListenPickDraft).audio_text}
            onChange={(v) => setDraft({ ...(state.draft as ListenPickDraft), audio_text: v })}
            fid={`${fid}-audio`}
            bur
            placeholder={t('audioText')}
            testId="listen-audio-text"
          />
          <OptionRows
            fid={`${fid}-opt`}
            testId="listen-options"
            labels={(state.draft as ListenPickDraft).options}
            correctIdx={state.correctIdx}
            onChange={(labels, correctIdx) => setDraft({ ...(state.draft as ListenPickDraft), options: labels }, correctIdx)}
            focus={focus}
          />
        </>
      )}

      {type === 'image-pick' && (
        <>
          <OptionRows
            fid={`${fid}-opt`}
            testId="image-options"
            labels={(state.draft as ImagePickDraft).options.map((o) => o.label)}
            correctIdx={state.correctIdx}
            extra={{
              placeholder: t('imageUrl'),
              values: (state.draft as ImagePickDraft).options.map((o) => o.image_url ?? ''),
              onChange: (i, v) => {
                const d = state.draft as ImagePickDraft;
                setDraft({ ...d, options: d.options.map((o, j) => (j === i ? { ...o, image_url: v || null } : o)) });
              },
            }}
            onChange={(labels, correctIdx) => {
              const d = state.draft as ImagePickDraft;
              setDraft(
                { ...d, options: labels.map((label, i) => ({ label, image_url: d.options[i]?.image_url ?? null })) },
                correctIdx,
              );
            }}
            focus={focus}
          />
          <Field
            value={(state.draft as ImagePickDraft).image_hint}
            onChange={(v) => setDraft({ ...(state.draft as ImagePickDraft), image_hint: v })}
            fid={`${fid}-hint`}
            placeholder={t('imageHint')}
          />
        </>
      )}

      {errors.length > 0 && (
        <ul role="alert" data-testid="exercise-errors" style={{ margin: 0, paddingLeft: 18, color: 'var(--tertiary-700)', fontSize: 13 }}>
          {errors.map((e) => (
            <li key={e}>{t(`errors.${e}`)}</li>
          ))}
        </ul>
      )}
      {saveFailed && (
        <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontSize: 13 }}>
          {t('saveFailed')}
        </p>
      )}
    </div>
  );
}

function OptionRows({
  fid,
  testId,
  labels,
  correctIdx,
  onChange,
  extra,
  focus,
}: {
  fid: string;
  testId: string;
  labels: string[];
  correctIdx: number;
  onChange: (labels: string[], correctIdx: number) => void;
  extra?: { placeholder: string; values: string[]; onChange: (i: number, v: string) => void };
  focus: (fid: string) => void;
}): ReactElement {
  const t = useTranslations('studio.exercise');
  const rows = labels.length ? labels : [''];
  const add = () => {
    if (rows.length >= MAX_OPTIONS) return;
    onChange([...rows, ''], correctIdx);
    focus(`${fid}-${rows.length}`);
  };
  const removeAt = (i: number) => {
    const next = rows.filter((_, j) => j !== i);
    onChange(next, correctIdx === i ? -1 : correctIdx > i ? correctIdx - 1 : correctIdx);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-testid={testId}>
      {rows.map((label, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <label
            title={t('markCorrect')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, paddingTop: 8, fontSize: 12, color: 'var(--text-muted)' }}
          >
            <input
              type="radio"
              name={`${fid}-correct`}
              checked={correctIdx === i}
              onChange={() => onChange(rows, i)}
              data-testid={`option-correct-${i}`}
              aria-label={t('markCorrect')}
            />
          </label>
          <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex' }}>
            <Field
              value={label}
              onChange={(v) => onChange(rows.map((x, j) => (j === i ? v : x)), correctIdx)}
              fid={`${fid}-${i}`}
              bur
              placeholder={t('option', { n: i + 1 })}
              testId={`${testId}-${i}`}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (i === rows.length - 1) {
                  if (label.trim()) add();
                } else focus(`${fid}-${i + 1}`);
              }}
            />
          </div>
          {extra && (
            <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex' }}>
              <Field value={extra.values[i] ?? ''} onChange={(v) => extra.onChange(i, v)} placeholder={extra.placeholder} />
            </div>
          )}
          <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} tabIndex={-1} aria-label={t('remove')} onClick={() => removeAt(i)}>
            ×
          </button>
        </div>
      ))}
      {rows.length < MAX_OPTIONS && (
        <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: 13 }} onClick={add}>
          + {t('addOption')}
        </button>
      )}
    </div>
  );
}
