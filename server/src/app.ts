import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config/env.js';
import { ApiError } from './middleware/errors.js';
import { rateLimit } from './middleware/rateLimit.js';
import { animeRoutes } from './routes/anime.js';
import { healthRoutes } from './routes/health.js';
import { mangaRoutes } from './routes/manga.js';
import { streamingRoutes } from './routes/streaming.js';
import { subtitleRoutes } from './routes/subtitles.js';

export function createApp() {
  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return config.corsOrigins[0] || 'http://localhost:5173';
        return config.corsOrigins.includes(origin) ? origin : null;
      },
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Accept'],
      maxAge: 600,
    }),
  );

  app.use('*', async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'no-referrer');
    await next();
  });

  app.use('/api/*', rateLimit);

  app.route('/', healthRoutes);
  app.route('/', streamingRoutes);
  app.route('/', animeRoutes);
  app.route('/', mangaRoutes);
  app.route('/', subtitleRoutes);

  app.notFound((c) => c.json({ code: 'INVALID_REQUEST', message: 'Not found' }, 404));

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json({ code: err.code, message: err.message }, err.status as 400);
    }
    console.error(err);
    return c.json({ code: 'PROVIDER_ERROR', message: 'Internal error' }, 500);
  });

  return app;
}
