import type { LineRecording, Recording, StudioExercise } from '@/lib/api/studio';

export interface VoiceItem {
  key: string;
  kind: 'line' | 'exercise';
  ownerId: number;
  lineKey?: string;
  textKey: string | null;
  text: string;
  recording: Recording | null;
  uses: number;
}

export function buildVoiceList(lessonId: number, lines: LineRecording[], exercises: StudioExercise[]): VoiceItem[] {
  const out: VoiceItem[] = [];
  const byKey = new Map<string, VoiceItem>();

  const add = (item: Omit<VoiceItem, 'key' | 'uses'>, fallbackKey: string) => {
    if (item.textKey === null) {
      out.push({ ...item, key: fallbackKey, uses: 1 });
      return;
    }
    const key = `k:${item.textKey}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.uses += 1;
      existing.recording = existing.recording ?? item.recording;
      return;
    }
    const created = { ...item, key, uses: 1 };
    byKey.set(key, created);
    out.push(created);
  };

  lines.forEach((r, i) =>
    add(
      { kind: 'line', ownerId: lessonId, lineKey: r.line_key ?? undefined, textKey: r.line_key ?? null, text: r.line, recording: r.recording },
      `l:${i}`,
    ),
  );
  exercises
    .filter((ex) => ex.type === 'listen-pick')
    .forEach((ex) =>
      add(
        { kind: 'exercise', ownerId: ex.id, textKey: ex.text_key ?? null, text: String(ex.payload.audio_text ?? ''), recording: ex.recording },
        `e:${ex.id}`,
      ),
    );
  return out;
}

export function voiceProgress(items: VoiceItem[]): { done: number; total: number } {
  return { done: items.filter((v) => v.recording).length, total: items.length };
}

export function nextUnrecorded(items: VoiceItem[], fromKey: string): VoiceItem | undefined {
  const idx = items.findIndex((v) => v.key === fromKey);
  return items.slice(idx + 1).find((v) => !v.recording) ?? items.find((v) => !v.recording);
}
