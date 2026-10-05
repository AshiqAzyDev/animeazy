import { getStreamingApiBase, hasRemoteStreamingApi } from '../config/streaming';
import type { SubtitleTrack } from '../streaming/types';
import { StreamingError } from '../streaming/types';

async function remoteFetch<T>(path: string): Promise<T> {
  const base = getStreamingApiBase();
  if (!base) {
    throw new StreamingError(
      'network',
      'Set VITE_STREAMING_API_BASE to use server-side OpenSubtitles',
    );
  }
  const res = await fetch(`${base}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new StreamingError('network', body.message || `Subtitles API ${res.status}`);
  }
  return (await res.json()) as T;
}

export const subtitleClient = {
  configured: hasRemoteStreamingApi,

  search(params: { query: string; languages?: string; episode?: number }) {
    const qs = new URLSearchParams({ query: params.query });
    if (params.languages) qs.set('languages', params.languages);
    if (params.episode) qs.set('episode', String(params.episode));
    return remoteFetch<SubtitleTrack[]>(`/api/subtitles/search?${qs}`);
  },
};
