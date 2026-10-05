import { describe, expect, it } from 'vitest';
import { detectMediaType, normalizeSource, normalizeSubtitles, pickDefaultSubtitle } from './normalize';

describe('normalize', () => {
  it('detects HLS and MP4 from URL', () => {
    expect(detectMediaType('https://x/a.m3u8')).toBe('hls');
    expect(detectMediaType('https://x/a.mp4')).toBe('mp4');
    expect(detectMediaType('https://x/a.mpd')).toBe('dash');
  });

  it('normalizes source flags', () => {
    const s = normalizeSource({ url: 'https://cdn/x.m3u8' });
    expect(s.type).toBe('hls');
    expect(s.isM3U8).toBe(true);
  });

  it('normalizes subtitles and defaults to English', () => {
    const tracks = normalizeSubtitles([
      { url: 'es.vtt', language: 'es', label: 'Spanish' },
      { url: 'en.vtt', language: 'en', label: 'English' },
    ]);
    expect(tracks).toHaveLength(2);
    expect(pickDefaultSubtitle(tracks)?.language).toBe('en');
  });

  it('handles missing subtitles', () => {
    expect(pickDefaultSubtitle([])).toBeNull();
    expect(normalizeSubtitles([])).toEqual([]);
  });
});
