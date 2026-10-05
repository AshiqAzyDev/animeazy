import { getStreamingApiBase, hasRemoteStreamingApi } from '../config/streaming';
import {
  getEpisodeServersForCatalog,
  getProviderEpisodes,
  resolveEpisodeSources,
  type ResolveSourcesOptions,
} from '../streaming/service';
import { listProviderSummaries } from '../streaming/registry';
import type { ProviderEpisode, ProviderServer, StreamingResult } from '../streaming/types';
import { StreamingError } from '../streaming/types';

/**
 * Frontend streaming API contract.
 *
 * When `VITE_STREAMING_API_BASE` is set, calls a future authorized backend:
 *   GET /api/streaming/providers
 *   GET /api/streaming/anime/:animeId/episodes?provider=
 *   GET /api/streaming/anime/:animeId/episode/:episodeNumber/servers?provider=
 *   GET /api/streaming/anime/:animeId/episode/:episodeNumber/sources?provider=&server=
 *
 * GitHub Pages cannot host that API. Without a base URL, resolution uses the
 * local provider registry (mock/demo only) — never pirate scrapers.
 */

async function remoteFetch<T>(path: string): Promise<T> {
  const base = getStreamingApiBase();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`${base}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new StreamingError(
        res.status === 404 ? 'episode_unavailable' : 'network',
        text || `Streaming API ${res.status}`,
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof StreamingError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new StreamingError('timeout', 'Streaming API timed out');
    }
    throw new StreamingError(
      'network',
      err instanceof Error ? err.message : 'Streaming API network error',
    );
  } finally {
    clearTimeout(timer);
  }
}

export const streamingClient = {
  listProviders() {
    if (hasRemoteStreamingApi()) {
      return remoteFetch<{ id: string; name: string; developmentOnly?: boolean }[]>(
        '/api/streaming/providers',
      );
    }
    return Promise.resolve(listProviderSummaries());
  },

  getEpisodes(catalogAnimeId: string, providerId: string, title?: string) {
    if (hasRemoteStreamingApi()) {
      const qs = new URLSearchParams({ provider: providerId });
      if (title) qs.set('title', title);
      return remoteFetch<ProviderEpisode[]>(
        `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episodes?${qs}`,
      );
    }
    return getProviderEpisodes(providerId, catalogAnimeId, title);
  },

  getServers(
    catalogAnimeId: string,
    episodeNumber: number,
    providerId: string,
    title?: string,
  ) {
    if (hasRemoteStreamingApi()) {
      const qs = new URLSearchParams({ provider: providerId });
      if (title) qs.set('title', title);
      return remoteFetch<ProviderServer[]>(
        `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episode/${episodeNumber}/servers?${qs}`,
      );
    }
    return getEpisodeServersForCatalog(providerId, catalogAnimeId, episodeNumber, title);
  },

  getSources(
    catalogAnimeId: string,
    episodeNumber: number,
    title: string | undefined,
    options: ResolveSourcesOptions = {},
  ) {
    if (hasRemoteStreamingApi()) {
      const qs = new URLSearchParams();
      if (options.providerId) qs.set('provider', options.providerId);
      if (options.serverId) qs.set('server', options.serverId);
      if (title) qs.set('title', title);
      return remoteFetch<StreamingResult>(
        `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episode/${episodeNumber}/sources?${qs}`,
      );
    }
    return resolveEpisodeSources(catalogAnimeId, episodeNumber, title, options);
  },
};
