'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { deleteAudio, uploadAudio, type Recording } from '@/lib/api/studio';
import { formatDuration, mimeExtension } from '@/lib/studio/audio';
import { isTypingTarget } from '@/lib/studio/shortcuts';
import { useAudioRecorder } from './use-audio-recorder';

export interface UploadArgs {
  file: Blob;
  filename: string;
  ownerType: string;
  ownerId: number;
  lineKey?: string;
  text?: string;
  durationMs?: number;
}

export interface AudioRecorderProps {
  ownerType: string;
  ownerId: number;
  lineKey?: string;
  text?: string;
  recording?: Recording | null;
  onSaved: (rec: Recording) => void;
  onDeleted?: () => void;
  active?: boolean;
  onActivate?: () => void;
  upload?: (args: UploadArgs) => Promise<Recording>;
}

const defaultUpload = (a: UploadArgs): Promise<Recording> =>
  uploadAudio({
    file: a.file,
    filename: a.filename,
    ownerType: a.ownerType,
    ownerId: a.ownerId,
    lineKey: a.lineKey,
    text: a.text,
    durationMs: a.durationMs,
  });

export function AudioRecorder({
  ownerType,
  ownerId,
  lineKey,
  text,
  recording,
  onSaved,
  onDeleted,
  active = false,
  onActivate,
  upload = defaultUpload,
}: AudioRecorderProps): ReactElement {
  const t = useTranslations('studio.audio');
  const rec = useAudioRecorder();
  const { phase, clip, error, start, stop, discard, loadFile, setError } = rec;
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      stopPlayback();
      return;
    }
    const src = clip?.url ?? recording?.url;
    if (!src) return;
    const a = new Audio(src);
    a.onended = () => {
      audioRef.current = null;
      setPlaying(false);
    };
    audioRef.current = a;
    setPlaying(true);
    void a.play().catch(() => {
      audioRef.current = null;
      setPlaying(false);
    });
  }, [clip, recording, stopPlayback]);

  const save = useCallback(async () => {
    if (!clip || saving) return;
    stopPlayback();
    setSaving(true);
    try {
      const saved = await upload({
        file: clip.blob,
        filename: `recording.${mimeExtension(clip.mime)}`,
        ownerType,
        ownerId,
        lineKey,
        text,
        durationMs: clip.durationMs || undefined,
      });
      discard();
      onSaved(saved);
    } catch {
      setError('uploadFailed');
    } finally {
      setSaving(false);
    }
  }, [clip, saving, upload, ownerType, ownerId, lineKey, text, discard, onSaved, setError, stopPlayback]);

  const remove = useCallback(async () => {
    if (!recording || !window.confirm(t('confirmDelete'))) return;
    stopPlayback();
    try {
      await deleteAudio(recording.uuid);
      onDeleted?.();
    } catch {
      setError('uploadFailed');
    }
  }, [recording, onDeleted, setError, stopPlayback, t]);

  const toggleRecord = useCallback(() => {
    stopPlayback();
    if (phase === 'recording') stop();
    else {
      discard();
      void start();
    }
  }, [phase, stop, discard, start, stopPlayback]);

  const rerecord = useCallback(() => {
    stopPlayback();
    discard();
    void start();
  }, [discard, start, stopPlayback]);

  const handlers = useRef({ toggleRecord, play, save, rerecord, phase, hasClip: false });
  handlers.current = { toggleRecord, play, save, rerecord, phase, hasClip: Boolean(clip) };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target as HTMLElement | null)) return;
      const h = handlers.current;
      const k = e.key;
      let handled = true;
      if (k === 'r' || k === 'R' || k === 'к' || k === 'К') h.toggleRecord();
      else if (k === ' ' || k === 'p' || k === 'P' || k === 'з' || k === 'З') {
        if (h.phase !== 'recording') h.play();
      } else if (k === 'Enter') {
        if (h.hasClip) void h.save();
        else handled = false;
      } else if (k === 'x' || k === 'X' || k === 'Backspace' || k === 'ч' || k === 'Ч') {
        if (h.phase === 'recorded' || h.phase === 'idle') h.rerecord();
        else handled = false;
      } else handled = false;
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isTypingTarget(e.target as HTMLElement | null)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      stopPlayback();
      if (phase === 'recording') stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const canPlay = Boolean(clip?.url ?? recording?.url);
  const recording_ = phase === 'recording';

  return (
    <div
      data-testid="audio-recorder"
      data-active={active ? 'true' : 'false'}
      data-phase={phase}
      onClick={onActivate}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 12,
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        background: active ? 'var(--primary-50)' : 'var(--surface)',
      }}
    >
      <button
        type="button"
        data-testid={recording_ ? 'audio-stop' : 'audio-record'}
        className={`btn ${recording_ ? 'btn-primary' : 'btn-secondary'}`}
        style={{ padding: '8px 12px', fontSize: 13 }}
        disabled={phase === 'requesting' || saving}
        onClick={toggleRecord}
      >
        {recording_ ? `■ ${t('stop')}` : `● ${recording || clip ? t('rerecord') : t('record')}`}
        {active && <kbd style={kbd}>R</kbd>}
      </button>

      {recording_ && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }} aria-live="polite">
          <span data-testid="audio-timer">{formatDuration(rec.elapsedMs)}</span>
          <span style={{ width: 80, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <span
              data-testid="audio-level"
              style={{
                display: 'block',
                height: '100%',
                width: `${Math.round(rec.level * 100)}%`,
                background: 'var(--tertiary)',
                transition: 'width 0.08s',
              }}
            />
          </span>
        </span>
      )}

      {canPlay && !recording_ && (
        <button
          type="button"
          data-testid="audio-play"
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: 13 }}
          onClick={play}
        >
          {playing ? `❚❚ ${t('pause')}` : `▶ ${t('play')}`}
          {active && <kbd style={kbd}>P</kbd>}
        </button>
      )}

      {clip && (
        <>
          <button
            type="button"
            data-testid="audio-save"
            className="btn btn-primary"
            style={{ padding: '8px 12px', fontSize: 13 }}
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? t('saving') : t('save')}
            {active && <kbd style={kbd}>Enter</kbd>}
          </button>
          <button
            type="button"
            data-testid="audio-discard"
            className="btn btn-ghost"
            style={{ padding: '8px 10px', fontSize: 13 }}
            onClick={rerecord}
          >
            {t('discard')}
            {active && <kbd style={kbd}>X</kbd>}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('pending')} · {formatDuration(clip.durationMs)}
          </span>
        </>
      )}

      {!clip && !recording_ && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            hidden
            data-testid="audio-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadFile(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '8px 10px', fontSize: 12 }}
            onClick={() => fileRef.current?.click()}
          >
            {t('uploadFile')}
          </button>
        </>
      )}

      {recording && !clip && !recording_ && (
        <>
          {recording.source === 'user' && (
            <span className="chip chip-green" data-testid="audio-source">
              {t('sourceUser')}
            </span>
          )}
          {recording.source === 'tts' && (
            <span className="chip" data-testid="audio-source">
              {t('sourceTts')}
            </span>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '8px 10px', fontSize: 12 }}
            onClick={() => void remove()}
          >
            {t('delete')}
          </button>
        </>
      )}

      {error && (
        <span role="alert" style={{ color: 'var(--tertiary-700)', fontSize: 13, flexBasis: '100%' }}>
          {t(`errors.${error}`)}
        </span>
      )}
    </div>
  );
}

const kbd: React.CSSProperties = {
  marginLeft: 6,
  padding: '1px 5px',
  fontSize: 11,
  borderRadius: 4,
  border: '1px solid var(--border-strong)',
  background: 'var(--surface)',
  color: 'var(--text-muted)',
};
