import { describe, expect, it } from 'vitest';
import type { LineRecording, Recording, StudioExercise } from '@/lib/api/studio';
import { buildVoiceList, nextUnrecorded, voiceProgress } from './voice';

const rec = (uuid: string): Recording => ({
  uuid,
  url: `/${uuid}`,
  mime: 'audio/webm',
  size: 1,
  duration_ms: 1,
  text: null,
  source: 'user',
  updated_at: '2026-01-01',
});

const line = (text: string, key: string | null, recording: Recording | null = null): LineRecording => ({
  line: text,
  line_key: key as string,
  recording,
});

const listen = (id: number, text: string, key: string | null, recording: Recording | null = null): StudioExercise => ({
  id,
  type: 'listen-pick',
  prompt: '',
  payload: { audio_text: text },
  position: id,
  recording,
  text_key: key,
});

describe('buildVoiceList', () => {
  it('keeps lines then listen-pick exercises', () => {
    const list = buildVoiceList(1, [line('a', 'ka')], [listen(7, 'b', 'kb')]);
    expect(list.map((v) => [v.key, v.kind, v.ownerId, v.text])).toEqual([
      ['k:ka', 'line', 1, 'a'],
      ['k:kb', 'exercise', 7, 'b'],
    ]);
  });

  it('dedupes equal keys across lines and exercises keeping first occurrence', () => {
    const list = buildVoiceList(1, [line('a', 'k1'), line('a', 'k1')], [listen(7, 'a', 'k1')]);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ kind: 'line', ownerId: 1, lineKey: 'k1', uses: 3 });
  });

  it('counts uses per item', () => {
    const list = buildVoiceList(1, [line('a', 'k1'), line('b', 'k2')], [listen(7, 'a', 'k1')]);
    expect(list.map((v) => v.uses)).toEqual([2, 1]);
  });

  it('keeps null keys separate', () => {
    const list = buildVoiceList(1, [line('a', null), line('a', null)], [listen(7, 'a', null), listen(8, 'a', null)]);
    expect(list).toHaveLength(4);
    expect(new Set(list.map((v) => v.key)).size).toBe(4);
    expect(list.every((v) => v.uses === 1)).toBe(true);
  });

  it('uses the shared recording from any occurrence', () => {
    const r = rec('x');
    const list = buildVoiceList(1, [line('a', 'k1')], [listen(7, 'a', 'k1', r)]);
    expect(list[0]?.recording).toBe(r);
  });

  it('ignores non listen-pick exercises', () => {
    const ex: StudioExercise = { ...listen(9, 'a', 'k1'), type: 'type' };
    expect(buildVoiceList(1, [], [ex])).toEqual([]);
  });
});

describe('voiceProgress', () => {
  it('counts unique items', () => {
    const r = rec('x');
    const list = buildVoiceList(1, [line('a', 'k1', r), line('b', 'k2')], [listen(7, 'a', 'k1', r)]);
    expect(voiceProgress(list)).toEqual({ done: 1, total: 2 });
  });

  it('handles an empty list', () => {
    expect(voiceProgress([])).toEqual({ done: 0, total: 0 });
  });
});

describe('nextUnrecorded', () => {
  const list = buildVoiceList(1, [line('a', 'k1', rec('1')), line('b', 'k2'), line('c', 'k3', rec('3')), line('d', 'k4')], []);

  it('returns the next unrecorded after the given key', () => {
    expect(nextUnrecorded(list, 'k:k1')?.key).toBe('k:k2');
    expect(nextUnrecorded(list, 'k:k2')?.key).toBe('k:k4');
  });

  it('wraps to earlier unrecorded items', () => {
    expect(nextUnrecorded(list, 'k:k4')?.key).toBe('k:k2');
  });

  it('returns undefined when everything is recorded', () => {
    const all = buildVoiceList(1, [line('a', 'k1', rec('1'))], []);
    expect(nextUnrecorded(all, 'k:k1')).toBeUndefined();
  });
});
