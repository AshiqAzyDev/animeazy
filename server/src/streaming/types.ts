export type StreamMediaType = 'hls' | 'mp4' | 'dash' | 'unknown';

export type StreamingSource = {
  url: string;
  type: StreamMediaType;
  quality?: string;
  isM3U8?: boolean;
};

export type SubtitleTrack = {
  url: string;
  language: string;
  label?: string;
  kind?: 'subtitles' | 'captions';
};

export type StreamingResult = {
  providerId: string;
  providerName: string;
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  headers?: Record<string, string>;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
};

export type AnimeResult = {
  id: string;
  title: string;
  image?: string;
  year?: number;
  episodes?: number;
};

export type ProviderAnimeInfo = {
  id: string;
  title: string;
  synopsis?: string;
  image?: string;
  episodeCount?: number;
};

export type ProviderEpisode = {
  id: string;
  number: number;
  title?: string;
};

export type ProviderServer = {
  id: string;
  name: string;
};

export type CatalogAnimeIdentity = {
  catalogId: string;
  shikimoriId?: string;
  malId?: string;
  kitsuId?: string;
  providerIds: Record<string, string>;
};

export class StreamingError extends Error {
  code:
    | 'provider_unavailable'
    | 'timeout'
    | 'episode_unavailable'
    | 'server_unavailable'
    | 'source_resolution_failed'
    | 'expired_source'
    | 'unsupported_format'
    | 'invalid_provider'
    | 'invalid_episode'
    | 'network'
    | 'unknown';

  constructor(code: StreamingError['code'], message: string) {
    super(message);
    this.name = 'StreamingError';
    this.code = code;
  }
}

export function parseCatalogIdentity(catalogId: string): CatalogAnimeIdentity {
  const id = catalogId.trim();
  const out: CatalogAnimeIdentity = { catalogId: id, providerIds: {} };
  if (id.startsWith('shiki-')) out.shikimoriId = id.slice(6);
  else if (id.startsWith('kitsu-')) out.kitsuId = id.slice(6);
  else if (id.startsWith('anime-')) out.malId = id.replace(/^anime-/, '');
  else if (/^\d+$/.test(id)) out.malId = id;
  return out;
}
