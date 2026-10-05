import type { StreamingProvider } from '../provider.js';
import { StreamingError } from '../types.js';
import { normalizeProviderSources, normalizeSubtitles } from '../normalize.js';

/**
 * Integration boundary for a future *authorized* streaming partner.
 *
 * Consumet REST / @consumet/extensions document scraped “publicly-available”
 * streams — those are NOT enabled here. To add a licensed provider:
 * 1. Implement StreamingProvider against your authorized API
 * 2. Map source metadata with normalizeProviderSources()
 * 3. Register in providers/index.ts
 * 4. Set AUTHORIZED_PROVIDER_ENABLED=true
 *
 * This stub stays disabled and never calls third-party scrapers.
 */
export const authorizedStreamingStub: StreamingProvider = {
  id: 'authorized',
  name: 'Authorized Provider (stub)',
  developmentOnly: false,
  enabled: false,

  async searchAnime() {
    throw new StreamingError('provider_unavailable', 'Authorized provider not configured');
  },
  async getAnimeInfo() {
    throw new StreamingError('provider_unavailable', 'Authorized provider not configured');
  },
  async getEpisodes() {
    throw new StreamingError('provider_unavailable', 'Authorized provider not configured');
  },
  async getEpisodeServers() {
    throw new StreamingError('provider_unavailable', 'Authorized provider not configured');
  },
  async getEpisodeSources() {
    throw new StreamingError('provider_unavailable', 'Authorized provider not configured');
  },
  async resolveCatalogAnime() {
    return null;
  },
};

/** Helper for adapters: normalize raw partner source JSON into StreamingResult pieces. */
export function adaptAuthorizedSources(input: {
  providerId: string;
  providerName: string;
  sources: Array<{ url?: string; quality?: string; isM3U8?: boolean; type?: string }>;
  subtitles?: Array<{ url: string; language: string; label?: string }>;
}) {
  return {
    providerId: input.providerId,
    providerName: input.providerName,
    sources: normalizeProviderSources(input.sources),
    subtitles: normalizeSubtitles(input.subtitles ?? []),
  };
}
