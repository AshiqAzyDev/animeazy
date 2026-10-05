import { Hono } from 'hono';
import { ApiError } from '../middleware/errors.js';
import { openSubtitlesService } from '../services/openSubtitlesService.js';

export const subtitleRoutes = new Hono();

subtitleRoutes.get('/api/subtitles/search', async (c) => {
  const query = (c.req.query('query') || c.req.query('q') || '').trim();
  if (!query) {
    throw new ApiError('INVALID_REQUEST', 'query is required', 400);
  }
  const languages = c.req.query('languages') || 'en';
  const episodeRaw = c.req.query('episode');
  const episode = episodeRaw ? Number(episodeRaw) : undefined;
  const tracks = await openSubtitlesService.searchSubtitles({
    query,
    languages,
    episode: Number.isFinite(episode) ? episode : undefined,
  });
  return c.json(tracks);
});
