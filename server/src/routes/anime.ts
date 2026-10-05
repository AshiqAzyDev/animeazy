import { Hono } from 'hono';
import { requireId } from '../middleware/validate.js';
import { shikimoriService } from '../services/shikimoriService.js';

export const animeRoutes = new Hono();

animeRoutes.get('/api/anime/search', async (c) => {
  const q = (c.req.query('q') || c.req.query('query') || '').trim();
  if (!q) return c.json([]);
  return c.json(await shikimoriService.searchAnime(q));
});

animeRoutes.get('/api/anime', async (c) => {
  const order = c.req.query('order') || 'popularity';
  const status = c.req.query('status') || undefined;
  const limit = Number(c.req.query('limit') || 20);
  return c.json(await shikimoriService.getAnimeList({ order, status, limit }));
});

animeRoutes.get('/api/anime/:id', async (c) => {
  const id = requireId(c.req.param('id'), 'id').replace(/^shiki-/, '');
  return c.json(await shikimoriService.getAnime(id));
});

animeRoutes.get('/api/anime/:id/related', async (c) => {
  const id = requireId(c.req.param('id'), 'id').replace(/^shiki-/, '');
  // Endpoint reserved; returns [] until Shikimori related contract is verified
  return c.json(await shikimoriService.getRelatedAnime(id));
});
