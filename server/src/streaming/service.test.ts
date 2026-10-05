import { afterEach, describe, expect, it } from 'vitest';
import {
  getProviderEpisodes,
  resolveEpisodeSources,
  resolveProviderEpisodeId,
} from './service.js';
import { registerProvider, unregisterProvider } from './registry.js';
import type { StreamingProvider } from './provider.js';
import { StreamingError } from './types.js';

const broken: StreamingProvider = {
  id: 'broken',
  name: 'Broken',
  enabled: true,
  async searchAnime() {
    return [{ id: 'b1', title: 'x' }];
  },
  async getAnimeInfo() {
    return { id: 'b1', title: 'x' };
  },
  async getEpisodes() {
    return [{ id: 'b1-ep-1', number: 1 }];
  },
  async getEpisodeServers() {
    return [{ id: 's1', name: 'S1' }];
  },
  async getEpisodeSources() {
    throw new StreamingError('source_resolution_failed', 'broken');
  },
  async resolveCatalogAnime() {
    return 'b1';
  },
};

describe('streaming service', () => {
  afterEach(() => unregisterProvider('broken'));

  it('maps episode number to provider episode id', async () => {
    const id = await resolveProviderEpisodeId('mock', 'anime-1', 2, 'Demo');
    expect(id).toBe('mock-demo-ep-2');
  });

  it('lists episodes', async () => {
    const eps = await getProviderEpisodes('mock', 'kitsu-1', 'Demo');
    expect(eps.length).toBe(6);
  });

  it('resolves mock sources', async () => {
    const result = await resolveEpisodeSources('anime-1', 1, 'Demo', {
      providerId: 'mock',
      allowFallback: false,
    });
    expect(result.sources.some((s) => s.type === 'hls')).toBe(true);
    expect(result.subtitles.length).toBeGreaterThan(0);
  });

  it('throws on invalid episode', async () => {
    await expect(resolveProviderEpisodeId('mock', 'anime-1', 99)).rejects.toBeInstanceOf(
      StreamingError,
    );
  });

  it('throws on invalid provider', async () => {
    await expect(
      resolveEpisodeSources('anime-1', 1, 'Demo', { providerId: 'nope', allowFallback: false }),
    ).rejects.toMatchObject({ code: 'invalid_provider' });
  });

  it('falls back when allowed', async () => {
    registerProvider(broken);
    const result = await resolveEpisodeSources('anime-1', 1, 'Demo', {
      providerId: 'broken',
      allowFallback: true,
    });
    expect(result.providerId).toBe('mock');
  });
});
