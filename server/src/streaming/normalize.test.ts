import { describe, expect, it } from 'vitest';
import { detectMediaType, normalizeProviderSources, normalizeSubtitles } from './normalize.js';

describe('normalize', () => {
  it('detects HLS and MP4', () => {
    expect(detectMediaType('https://x/a.m3u8')).toBe('hls');
    expect(detectMediaType('https://x/a.mp4')).toBe('mp4');
  });

  it('normalizes provider source metadata', () => {
    const sources = normalizeProviderSources([
      { url: 'https://cdn/x.m3u8', isM3U8: true, quality: 'Auto' },
      { url: 'https://cdn/x.mp4', quality: '720p' },
    ]);
    expect(sources[0].type).toBe('hls');
    expect(sources[1].type).toBe('mp4');
  });

  it('normalizes subtitles', () => {
    const tracks = normalizeSubtitles([
      { url: 'https://x/en.vtt', language: 'en', label: 'English' },
    ]);
    expect(tracks).toHaveLength(1);
  });
});
