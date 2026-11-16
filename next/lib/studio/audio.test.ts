import { describe, expect, it } from 'vitest';
import { formatDuration, isTooLarge, MAX_AUDIO_BYTES, mimeExtension, pickRecorderMime } from './audio';

describe('pickRecorderMime', () => {
  it('prefers webm opus, then ogg opus, then mp4', () => {
    expect(pickRecorderMime(() => true)).toBe('audio/webm;codecs=opus');
    expect(pickRecorderMime((m) => m !== 'audio/webm;codecs=opus')).toBe('audio/ogg;codecs=opus');
    expect(pickRecorderMime((m) => m === 'audio/mp4')).toBe('audio/mp4');
  });

  it('returns undefined when nothing is supported', () => {
    expect(pickRecorderMime(() => false)).toBeUndefined();
  });
});

describe('mimeExtension', () => {
  it('maps mimes', () => {
    expect(mimeExtension('audio/webm;codecs=opus')).toBe('webm');
    expect(mimeExtension('audio/ogg;codecs=opus')).toBe('ogg');
    expect(mimeExtension('audio/mp4')).toBe('m4a');
    expect(mimeExtension('audio/mpeg')).toBe('mp3');
  });
});

describe('size and duration', () => {
  it('limits at 2 MB', () => {
    expect(isTooLarge(MAX_AUDIO_BYTES)).toBe(false);
    expect(isTooLarge(MAX_AUDIO_BYTES + 1)).toBe(true);
  });

  it('formats mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65_900)).toBe('1:05');
  });
});
