import { describe, expect, it } from 'vitest';
import { availableQualities, selectSource, sortSourcesByQuality } from './quality';
import type { StreamingSource } from './types';

const sources: StreamingSource[] = [
  { url: 'a.mp4', type: 'mp4', quality: '480p' },
  { url: 'b.mp4', type: 'mp4', quality: '1080p' },
  { url: 'c.m3u8', type: 'hls', quality: 'Auto', isM3U8: true },
  { url: 'd.mp4', type: 'mp4', quality: '720p' },
];

describe('quality selection', () => {
  it('Auto prefers HLS when available', () => {
    const picked = selectSource(sources, 'Auto');
    expect(picked?.type).toBe('hls');
  });

  it('selects exact quality when present', () => {
    expect(selectSource(sources, '720p')?.quality).toBe('720p');
    expect(selectSource(sources, '1080p')?.quality).toBe('1080p');
  });

  it('falls back to closest quality without fabricating', () => {
    const only = [
      { url: 'x.mp4', type: 'mp4' as const, quality: '720p' },
      { url: 'y.mp4', type: 'mp4' as const, quality: '480p' },
    ];
    expect(selectSource(only, '1080p')?.quality).toBe('720p');
  });

  it('returns null for empty sources', () => {
    expect(selectSource([], 'Auto')).toBeNull();
  });

  it('lists available qualities with Auto first', () => {
    expect(availableQualities(sources)[0]).toBe('Auto');
    expect(availableQualities(sources)).toContain('1080p');
  });

  it('sorts higher quality first', () => {
    const sorted = sortSourcesByQuality(sources.filter((s) => s.quality !== 'Auto'));
    expect(sorted[0].quality).toBe('1080p');
  });
});
