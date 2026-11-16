export const MAX_AUDIO_BYTES = 2 * 1024 * 1024;

const CANDIDATES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];

export function pickRecorderMime(isSupported: (mime: string) => boolean): string | undefined {
  return CANDIDATES.find((m) => isSupported(m));
}

export function mimeExtension(mime: string): string {
  const base = (mime.split(';')[0] ?? '').trim().toLowerCase();
  if (base.endsWith('webm')) return 'webm';
  if (base.endsWith('ogg')) return 'ogg';
  if (base === 'audio/mpeg') return 'mp3';
  if (base === 'audio/x-m4a') return 'm4a';
  if (base.endsWith('mp4')) return 'm4a';
  return 'bin';
}

export function isTooLarge(bytes: number): boolean {
  return bytes > MAX_AUDIO_BYTES;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
