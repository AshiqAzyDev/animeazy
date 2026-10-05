import { Hono } from 'hono';
import { requireId } from '../middleware/validate.js';
import { mangaDexService } from '../services/mangaDexService.js';

export const mangaRoutes = new Hono();

mangaRoutes.get('/api/manga/search', async (c) => {
  const q = (c.req.query('q') || c.req.query('query') || '').trim();
  if (!q) return c.json([]);
  const offset = Number(c.req.query('offset') || 0);
  return c.json(await mangaDexService.searchManga(q, offset));
});

mangaRoutes.get('/api/manga/:id', async (c) => {
  const id = requireId(c.req.param('id'), 'id').replace(/^manga-/, '');
  return c.json(await mangaDexService.getManga(id));
});

mangaRoutes.get('/api/manga/:id/feed', async (c) => {
  const id = requireId(c.req.param('id'), 'id').replace(/^manga-/, '');
  return c.json(await mangaDexService.getMangaFeed(id));
});
