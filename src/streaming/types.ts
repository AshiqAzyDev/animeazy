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
  /** Provider-specific episode token/id — not the same as episode number */
  id: string;
  number: number;
  title?: string;
};

export type ProviderServer = {
  id: string;
  name: string;
};

export type ProviderAnimeMapping = {
  catalogAnimeId: string;
  providerId: string;
  providerAnimeId: string;
};

export type QualityPreference = 'Auto' | '1080p' | '720p' | '480p' | string;

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
