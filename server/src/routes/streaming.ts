import { Hono } from 'hono';
import { logError, logInfo } from '../logging.js';
import { mapStreamingError } from '../middleware/errors.js';
import { optionalProvider, requireEpisode, requireId } from '../middleware/validate.js';
import { listProviderSummaries } from '../streaming/registry.js';
import {
  getEpisodeServersForCatalog,
  getProviderEpisodes,
  resolveEpisodeSources,
} from '../streaming/service.js';

export const streamingRoutes = new Hono();

streamingRoutes.get('/api/streaming/providers', (c) => {
  return c.json(listProviderSummaries());
});

streamingRoutes.get('/api/streaming/anime/:animeId/episodes', async (c) => {
  const animeId = requireId(c.req.param('animeId'), 'animeId');
  const provider = optionalProvider(c.req.query('provider'));
  const title = c.req.query('title') || undefined;
  if (!provider) {
    throw mapStreamingError({ code: 'invalid_provider', message: 'provider query is required' });
  }
  const started = Date.now();
  try {
    const episodes = await getProviderEpisodes(provider, animeId, title);
    logInfo('streaming.episodes', {
      provider,
      animeId,
      count: episodes.length,
      ms: Date.now() - started,
      ok: true,
    });
    return c.json(episodes);
  } catch (err) {
    logError('streaming.episodes', {
      provider,
      animeId,
      ms: Date.now() - started,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw mapStreamingError(err);
  }
});

streamingRoutes.get('/api/streaming/anime/:animeId/episode/:episodeNumber/servers', async (c) => {
  const animeId = requireId(c.req.param('animeId'), 'animeId');
  const episodeNumber = requireEpisode(c.req.param('episodeNumber'));
  const provider = optionalProvider(c.req.query('provider'));
  const title = c.req.query('title') || undefined;
  if (!provider) {
    throw mapStreamingError({ code: 'invalid_provider', message: 'provider query is required' });
  }
  const started = Date.now();
  try {
    const servers = await getEpisodeServersForCatalog(provider, animeId, episodeNumber, title);
    logInfo('streaming.servers', {
      provider,
      animeId,
      episodeNumber,
      count: servers.length,
      ms: Date.now() - started,
      ok: true,
    });
    return c.json(servers);
  } catch (err) {
    logError('streaming.servers', {
      provider,
      animeId,
      episodeNumber,
      ms: Date.now() - started,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw mapStreamingError(err);
  }
});

streamingRoutes.get('/api/streaming/anime/:animeId/episode/:episodeNumber/sources', async (c) => {
  const animeId = requireId(c.req.param('animeId'), 'animeId');
  const episodeNumber = requireEpisode(c.req.param('episodeNumber'));
  const provider = optionalProvider(c.req.query('provider'));
  const server = c.req.query('server') ? requireId(c.req.query('server')!, 'server') : undefined;
  const title = c.req.query('title') || undefined;
  const fallback = ['1', 'true', 'yes'].includes((c.req.query('fallback') || '').toLowerCase());
  const started = Date.now();
  try {
    const result = await resolveEpisodeSources(animeId, episodeNumber, title, {
      providerId: provider,
      serverId: server,
      allowFallback: fallback,
    });
    logInfo('streaming.sources', {
      provider: result.providerId,
      animeId,
      episodeNumber,
      server: server || '',
      fallback,
      sources: result.sources.length,
      ms: Date.now() - started,
      ok: true,
    });
    return c.json(result);
  } catch (err) {
    logError('streaming.sources', {
      provider: provider || '',
      animeId,
      episodeNumber,
      server: server || '',
      fallback,
      ms: Date.now() - started,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw mapStreamingError(err);
  }
});
