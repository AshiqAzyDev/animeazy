import type {
  AnimeResult,
  ProviderAnimeInfo,
  ProviderEpisode,
  ProviderServer,
  StreamingResult,
} from './types';

/**
 * Authorized streaming provider contract.
 * Implement this to connect licensed/partner/CDN sources later.
 * Do not put scraper/piracy logic behind this interface.
 */
export interface StreamingProvider {
  id: string;
  name: string;
  /** Development-only providers (e.g. mock samples) */
  developmentOnly?: boolean;

  searchAnime(query: string): Promise<AnimeResult[]>;

  getAnimeInfo(providerAnimeId: string): Promise<ProviderAnimeInfo>;

  getEpisodes(providerAnimeId: string): Promise<ProviderEpisode[]>;

  getEpisodeServers(providerEpisodeId: string): Promise<ProviderServer[]>;

  getEpisodeSources(
    providerEpisodeId: string,
    serverId?: string,
  ): Promise<StreamingResult>;

  /**
   * Map a catalog anime id (Jikan/Kitsu/etc.) to this provider's anime id.
   * Returns null when the title is not available on this provider.
   */
  resolveCatalogAnime?(catalogAnimeId: string, title?: string): Promise<string | null>;
}
