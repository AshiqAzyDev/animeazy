import { episodeListCache, mappingCache, serverListCache, sourceCache } from './cache';
import { getProvider, isAutoFallbackEnabled, listProviders } from './registry';
import type { ProviderEpisode, ProviderServer, StreamingResult } from './types';
import { StreamingError } from './types';

const REQUEST_TIMEOUT_MS = 12_000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new StreamingError('timeout', `${label} timed out`)),
          REQUEST_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function resolveProviderAnimeId(
  providerId: string,
  catalogAnimeId: string,
  title?: string,
): Promise<string> {
  const cacheKey = `map:${providerId}:${catalogAnimeId}`;
  const cached = mappingCache.get<string>(cacheKey);
  if (cached) return cached;

  const provider = getProvider(providerId);
  if (!provider) throw new StreamingError('invalid_provider', `Unknown provider: ${providerId}`);

  let providerAnimeId: string | null = null;
  if (provider.resolveCatalogAnime) {
    providerAnimeId = await withTimeout(
      provider.resolveCatalogAnime(catalogAnimeId, title),
      `${provider.name} mapping`,
    );
  } else {
    const results = await withTimeout(
      provider.searchAnime(title || catalogAnimeId),
      `${provider.name} search`,
    );
    providerAnimeId = results[0]?.id ?? null;
  }

  if (!providerAnimeId) {
    throw new StreamingError(
      'provider_unavailable',
      `${provider.name} has no mapping for this title`,
    );
  }

  mappingCache.set(cacheKey, providerAnimeId);
  return providerAnimeId;
}

export async function getProviderEpisodes(
  providerId: string,
  catalogAnimeId: string,
  title?: string,
): Promise<ProviderEpisode[]> {
  const providerAnimeId = await resolveProviderAnimeId(providerId, catalogAnimeId, title);
  const cacheKey = `eps:${providerId}:${providerAnimeId}`;
  const cached = episodeListCache.get<ProviderEpisode[]>(cacheKey);
  if (cached) return cached;

  const provider = getProvider(providerId)!;
  const episodes = await withTimeout(
    provider.getEpisodes(providerAnimeId),
    `${provider.name} episodes`,
  );
  episodeListCache.set(cacheKey, episodes);
  return episodes;
}

export async function resolveProviderEpisodeId(
  providerId: string,
  catalogAnimeId: string,
  episodeNumber: number,
  title?: string,
): Promise<string> {
  if (!Number.isFinite(episodeNumber) || episodeNumber < 1) {
    throw new StreamingError('invalid_episode', 'Episode number must be >= 1');
  }
  const episodes = await getProviderEpisodes(providerId, catalogAnimeId, title);
  const match = episodes.find((e) => e.number === episodeNumber);
  if (!match) {
    throw new StreamingError(
      'episode_unavailable',
      `Episode ${episodeNumber} not found on provider`,
    );
  }
  return match.id;
}

export async function getEpisodeServersForCatalog(
  providerId: string,
  catalogAnimeId: string,
  episodeNumber: number,
  title?: string,
): Promise<ProviderServer[]> {
  const episodeId = await resolveProviderEpisodeId(
    providerId,
    catalogAnimeId,
    episodeNumber,
    title,
  );
  const cacheKey = `servers:${providerId}:${episodeId}`;
  const cached = serverListCache.get<ProviderServer[]>(cacheKey);
  if (cached) return cached;

  const provider = getProvider(providerId)!;
  const servers = await withTimeout(
    provider.getEpisodeServers(episodeId),
    `${provider.name} servers`,
  );
  serverListCache.set(cacheKey, servers);
  return servers;
}

export type ResolveSourcesOptions = {
  providerId?: string;
  serverId?: string;
  /** When true (or env auto-fallback), try other providers if the selected one fails */
  allowFallback?: boolean;
};

export async function resolveEpisodeSources(
  catalogAnimeId: string,
  episodeNumber: number,
  title: string | undefined,
  options: ResolveSourcesOptions = {},
): Promise<StreamingResult> {
  const providers = listProviders();
  if (!providers.length) {
    throw new StreamingError(
      'provider_unavailable',
      'No streaming providers enabled. Enable the mock provider or connect an authorized API.',
    );
  }

  const preferred = options.providerId
    ? providers.filter((p) => p.id === options.providerId)
    : providers;

  if (options.providerId && !preferred.length) {
    throw new StreamingError('invalid_provider', `Unknown provider: ${options.providerId}`);
  }

  const allowFallback =
    options.allowFallback ?? (isAutoFallbackEnabled() && !options.providerId);
  const queue = allowFallback
    ? [
        ...preferred,
        ...providers.filter((p) => !preferred.some((x) => x.id === p.id)),
      ]
    : preferred;

  const errors: string[] = [];

  for (const provider of queue) {
    try {
      const episodeId = await resolveProviderEpisodeId(
        provider.id,
        catalogAnimeId,
        episodeNumber,
        title,
      );
      const cacheKey = `src:${provider.id}:${episodeId}:${options.serverId || ''}`;
      const cached = sourceCache.get<StreamingResult>(cacheKey);
      if (cached) return cached;

      let serverId = options.serverId;
      if (!serverId) {
        const servers = await withTimeout(
          provider.getEpisodeServers(episodeId),
          `${provider.name} servers`,
        );
        serverId = servers[0]?.id;
      }

      const result = await withTimeout(
        provider.getEpisodeSources(episodeId, serverId),
        `${provider.name} sources`,
      );

      if (!result.sources?.length) {
        throw new StreamingError('source_resolution_failed', `${provider.name} returned no sources`);
      }

      sourceCache.set(cacheKey, result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${msg}`);
      if (!allowFallback) {
        if (err instanceof StreamingError) throw err;
        throw new StreamingError('source_resolution_failed', msg);
      }
    }
  }

  throw new StreamingError(
    'source_resolution_failed',
    `All providers failed. ${errors.join(' | ')}`,
  );
}
