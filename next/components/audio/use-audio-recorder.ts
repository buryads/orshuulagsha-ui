'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isTooLarge, pickRecorderMime } from '@/lib/studio/audio';

export type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'recorded';
export type RecorderError = 'micDenied' | 'unsupported' | 'tooLarge' | 'recordFailed' | 'uploadFailed';

export interface RecordedClip {
  blob: Blob;
  url: string;
  durationMs: number;
  mime: string;
  fromFile: boolean;
}

export function useAudioRecorder() {
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [clip, setClip] = useState<RecordedClip | null>(null);
  const [error, setError] = useState<RecorderError | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const clipUrlRef = useRef<string | null>(null);
  const phaseRef = useRef<RecorderPhase>('idle');

  const updatePhase = useCallback((p: RecorderPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const releaseMic = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    rafRef.current = null;
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    setLevel(0);
  }, []);

  const revokeClip = useCallback(() => {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    clipUrlRef.current = null;
  }, []);

  const discard = useCallback(() => {
    revokeClip();
    setClip(null);
    setElapsedMs(0);
    setError(null);
    updatePhase('idle');
  }, [revokeClip, updatePhase]);

  const acceptClip = useCallback(
    (blob: Blob, durationMs: number, mime: string, fromFile: boolean) => {
      revokeClip();
      if (isTooLarge(blob.size)) {
        setClip(null);
        setError('tooLarge');
        updatePhase('idle');
        return;
      }
      const url = URL.createObjectURL(blob);
      clipUrlRef.current = url;
      setClip({ blob, url, durationMs, mime, fromFile });
      setError(null);
      updatePhase('recorded');
    },
    [revokeClip, updatePhase],
  );

  const start = useCallback(async () => {
    if (phaseRef.current === 'recording' || phaseRef.current === 'requesting') return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      return;
    }
    revokeClip();
    setClip(null);
    setError(null);
    setElapsedMs(0);
    updatePhase('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('micDenied');
      updatePhase('idle');
      return;
    }
    try {
      streamRef.current = stream;
      const mime = pickRecorderMime((m) => MediaRecorder.isTypeSupported(m));
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const duration = Date.now() - startedAtRef.current;
        const type = recorder.mimeType || mime || 'audio/webm';
        releaseMic();
        recorderRef.current = null;
        if (!chunks.length) {
          setError('recordFailed');
          updatePhase('idle');
          return;
        }
        acceptClip(new Blob(chunks, { type }), duration, type, false);
      };
      recorder.onerror = () => {
        releaseMic();
        setError('recordFailed');
        updatePhase('idle');
      };

      const AudioCtx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let peak = 0;
          for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs((buf[i] ?? 128) - 128));
          setLevel(Math.min(1, peak / 64));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }

      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      timerRef.current = window.setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 200);
      updatePhase('recording');
    } catch {
      releaseMic();
      setError('recordFailed');
      updatePhase('idle');
    }
  }, [acceptClip, releaseMic, revokeClip, updatePhase]);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') r.stop();
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      const probe = document.createElement('audio');
      const url = URL.createObjectURL(file);
      probe.preload = 'metadata';
      probe.src = url;
      const finish = (ms: number) => {
        URL.revokeObjectURL(url);
        acceptClip(file, ms, file.type || 'audio/mpeg', true);
      };
      probe.onloadedmetadata = () => finish(Number.isFinite(probe.duration) ? probe.duration * 1000 : 0);
      probe.onerror = () => finish(0);
    },
    [acceptClip],
  );

  useEffect(
    () => () => {
      const r = recorderRef.current;
      if (r) {
        r.onstop = null;
        if (r.state !== 'inactive') r.stop();
      }
      releaseMic();
      revokeClip();
    },
    [releaseMic, revokeClip],
  );

  return { phase, elapsedMs, level, clip, error, start, stop, discard, loadFile, setError };
}
