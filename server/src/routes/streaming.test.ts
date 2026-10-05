import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';

describe('streaming HTTP routes', () => {
  const app = createApp();

  it('health ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('lists providers', async () => {
    const res = await app.request('/api/streaming/providers');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string }>;
    expect(body.some((p) => p.id === 'mock')).toBe(true);
  });

  it('returns mock sources', async () => {
    const res = await app.request(
      '/api/streaming/anime/anime-1/episode/1/sources?provider=mock&title=Demo',
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sources: unknown[]; providerId: string };
    expect(body.providerId).toBe('mock');
    expect(body.sources.length).toBeGreaterThan(0);
  });

  it('rejects invalid provider', async () => {
    const res = await app.request(
      '/api/streaming/anime/anime-1/episode/1/sources?provider=nope',
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('PROVIDER_NOT_FOUND');
  });
});
