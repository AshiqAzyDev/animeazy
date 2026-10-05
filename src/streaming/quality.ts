import type { QualityPreference, StreamingSource } from './types';

const ORDER = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'];

function qualityRank(q?: string): number {
  if (!q) return ORDER.length + 1;
  const norm = q.toLowerCase().replace(/\s/g, '');
  if (norm === 'auto' || norm === 'default') return -1;
  const idx = ORDER.findIndex((o) => norm.includes(o));
  return idx === -1 ? ORDER.length : idx;
}

export function sortSourcesByQuality(sources: StreamingSource[]): StreamingSource[] {
  return [...sources].sort((a, b) => qualityRank(a.quality) - qualityRank(b.quality));
}

/**
 * Select a source for the requested quality preference.
 * Never fabricates qualities — falls back to closest available.
 */
export function selectSource(
  sources: StreamingSource[],
  preference: QualityPreference = 'Auto',
): StreamingSource | null {
  if (!sources.length) return null;
  const sorted = sortSourcesByQuality(sources);

  if (preference === 'Auto') {
    const hls = sorted.find((s) => s.type === 'hls' || s.isM3U8);
    if (hls) return hls;
    return sorted[0];
  }

  const want = preference.toLowerCase();
  const exact = sorted.find((s) => (s.quality || '').toLowerCase().includes(want.replace('p', '') + 'p') || (s.quality || '').toLowerCase() === want);
  if (exact) return exact;

  const wantRank = qualityRank(preference);
  let best = sorted[0];
  let bestDist = Math.abs(qualityRank(best.quality) - wantRank);
  for (const s of sorted) {
    const dist = Math.abs(qualityRank(s.quality) - wantRank);
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
}

export function availableQualities(sources: StreamingSource[]): string[] {
  const set = new Set<string>();
  for (const s of sources) {
    if (s.quality) set.add(s.quality);
  }
  return ['Auto', ...ORDER.filter((q) => set.has(q))];
}
