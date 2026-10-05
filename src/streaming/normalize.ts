import type { StreamingSource, StreamMediaType, SubtitleTrack } from './types';

export function detectMediaType(url: string, hint?: string): StreamMediaType {
  const u = (url || '').toLowerCase();
  const h = (hint || '').toLowerCase();
  if (h.includes('hls') || h.includes('m3u8') || u.includes('.m3u8')) return 'hls';
  if (h.includes('dash') || u.includes('.mpd')) return 'dash';
  if (h.includes('mp4') || u.includes('.mp4')) return 'mp4';
  return 'unknown';
}

export function normalizeSource(partial: {
  url: string;
  type?: string;
  quality?: string;
  isM3U8?: boolean;
}): StreamingSource {
  const type = detectMediaType(partial.url, partial.type);
  return {
    url: partial.url,
    type,
    quality: partial.quality,
    isM3U8: partial.isM3U8 ?? type === 'hls',
  };
}

export function normalizeSubtitles(
  tracks: Array<{
    url: string;
    language: string;
    label?: string;
    kind?: 'subtitles' | 'captions';
  }> = [],
): SubtitleTrack[] {
  return tracks
    .filter((t) => t.url && t.language)
    .map((t) => ({
      url: t.url,
      language: t.language,
      label: t.label || t.language,
      kind: t.kind || 'subtitles',
    }));
}

export function pickDefaultSubtitle(tracks: SubtitleTrack[]): SubtitleTrack | null {
  if (!tracks.length) return null;
  const en = tracks.find((t) => /^en/i.test(t.language) || /english/i.test(t.label || ''));
  return en || tracks[0];
}
