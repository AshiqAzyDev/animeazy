import { getStreamingApiBase, hasRemoteStreamingApi } from '../config/streaming';
import type { ProviderEpisode, ProviderServer, StreamingResult } from '../streaming/types';
import { StreamingError } from '../streaming/types';

export type ProviderSummary = {
  id: string;
  name: string;
  developmentOnly?: boolean;
  enabled?: boolean;
};

export type ResolveSourcesOptions = {
  providerId?: string;
  serverId?: string;
  allowFallback?: boolean;
};

function requireApiBase(): string {
  const base = getStreamingApiBase();
  if (!base) {
    throw new StreamingError(
      'network',
      'Streaming API not configured. Set VITE_STREAMING_API_BASE and start the server.',
    );
  }
  return base;
}

function mapCode(code?: string): StreamingError['code'] {
  switch (code) {
    case 'PROVIDER_NOT_FOUND':
      return 'invalid_provider';
    case 'PROVIDER_DISABLED':
      return 'provider_unavailable';
    case 'EPISODE_NOT_FOUND':
      return 'episode_unavailable';
    case 'SERVER_NOT_FOUND':
      return 'server_unavailable';
    case 'SOURCE_NOT_FOUND':
      return 'source_resolution_failed';
    case 'PROVIDER_TIMEOUT':
      return 'timeout';
    case 'UNSUPPORTED_SOURCE':
      return 'unsupported_format';
    default:
      return 'network';
  }
}

async function remoteFetch<T>(path: string): Promise<T> {
  const base = requireApiBase();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(`${base}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      let code: string | undefined;
      let message = `Streaming API ${res.status}`;
      try {
        const body = (await res.json()) as { code?: string; message?: string };
        code = body.code;
        if (body.message) message = body.message;
      } catch {
        /* ignore */
      }
      throw new StreamingError(mapCode(code), message);
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

/**
 * Frontend streaming API client.
 * Requires VITE_STREAMING_API_BASE — provider resolution runs on the server only.
 */
export const streamingClient = {
  configured: hasRemoteStreamingApi,

  listProviders() {
    return remoteFetch<ProviderSummary[]>('/api/streaming/providers');
  },

  getEpisodes(catalogAnimeId: string, providerId: string, title?: string) {
    const qs = new URLSearchParams({ provider: providerId });
    if (title) qs.set('title', title);
    return remoteFetch<ProviderEpisode[]>(
      `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episodes?${qs}`,
    );
  },

  getServers(
    catalogAnimeId: string,
    episodeNumber: number,
    providerId: string,
    title?: string,
  ) {
    const qs = new URLSearchParams({ provider: providerId });
    if (title) qs.set('title', title);
    return remoteFetch<ProviderServer[]>(
      `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episode/${episodeNumber}/servers?${qs}`,
    );
  },

  getSources(
    catalogAnimeId: string,
    episodeNumber: number,
    title: string | undefined,
    options: ResolveSourcesOptions = {},
  ) {
    const qs = new URLSearchParams();
    if (options.providerId) qs.set('provider', options.providerId);
    if (options.serverId) qs.set('server', options.serverId);
    if (title) qs.set('title', title);
    if (options.allowFallback) qs.set('fallback', 'true');
    return remoteFetch<StreamingResult>(
      `/api/streaming/anime/${encodeURIComponent(catalogAnimeId)}/episode/${episodeNumber}/sources?${qs}`,
    );
  },
};
