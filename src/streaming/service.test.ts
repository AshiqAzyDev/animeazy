import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveEpisodeSources,
  resolveProviderEpisodeId,
  getProviderEpisodes,
} from './service';
import { registerProvider, unregisterProvider } from './registry';
import type { StreamingProvider } from './provider';
import { StreamingError } from './types';

const broken: StreamingProvider = {
  id: 'broken',
  name: 'Broken',
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
    throw new StreamingError('source_resolution_failed', 'broken source');
  },
  async resolveCatalogAnime() {
    return 'b1';
  },
};


describe('streaming service', () => {
  it('maps episode number to provider episode id', async () => {
    const episodeId = await resolveProviderEpisodeId('mock', 'anime-1', 3, 'Demo');
    expect(episodeId).toBe('mock-demo-ep-3');
  });

  it('lists provider episodes separately from catalog count', async () => {
    const eps = await getProviderEpisodes('mock', 'anime-1', 'Demo');
    expect(eps.length).toBe(6);
    expect(eps[0].id).not.toBe('1');
  });

  it('resolves mock sources with HLS + MP4', async () => {
    const result = await resolveEpisodeSources('anime-1', 1, 'Demo', {
      providerId: 'mock',
      allowFallback: false,
    });
    expect(result.providerId).toBe('mock');
    expect(result.sources.some((s) => s.type === 'hls')).toBe(true);
    expect(result.sources.some((s) => s.type === 'mp4')).toBe(true);
    expect(result.subtitles.length).toBeGreaterThan(0);
  });

  it('throws on invalid episode', async () => {
    await expect(resolveProviderEpisodeId('mock', 'anime-1', 99, 'Demo')).rejects.toBeInstanceOf(
      StreamingError,
    );
  });

  it('throws on invalid provider', async () => {
    await expect(
      resolveEpisodeSources('anime-1', 1, 'Demo', {
        providerId: 'nope',
        allowFallback: false,
      }),
    ).rejects.toMatchObject({ code: 'invalid_provider' });
  });

  it('falls back to another provider when allowFallback is true', async () => {
    registerProvider(broken);
    try {
      const result = await resolveEpisodeSources('anime-1', 1, 'Demo', {
        providerId: 'broken',
        allowFallback: true,
      });
      expect(result.providerId).toBe('mock');
    } finally {
      unregisterProvider('broken');
    }
  });

  afterEach(() => {
    unregisterProvider('broken');
  });
});
