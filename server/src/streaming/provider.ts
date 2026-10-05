import type {
  AnimeResult,
  ProviderAnimeInfo,
  ProviderEpisode,
  ProviderServer,
  StreamingResult,
} from './types.js';

export interface StreamingProvider {
  id: string;
  name: string;
  developmentOnly?: boolean;
  enabled?: boolean;

  searchAnime(query: string): Promise<AnimeResult[]>;
  getAnimeInfo(providerAnimeId: string): Promise<ProviderAnimeInfo>;
  getEpisodes(providerAnimeId: string): Promise<ProviderEpisode[]>;
  getEpisodeServers(providerEpisodeId: string): Promise<ProviderServer[]>;
  getEpisodeSources(providerEpisodeId: string, serverId?: string): Promise<StreamingResult>;
  resolveCatalogAnime?(catalogAnimeId: string, title?: string): Promise<string | null>;
}
