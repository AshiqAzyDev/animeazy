import { afterEach, describe, expect, it } from 'vitest';
import { getProvider, isProviderEnabled, listProviders, registerProvider, unregisterProvider } from './registry.js';
import type { StreamingProvider } from './provider.js';
import { StreamingError } from './types.js';

const failing: StreamingProvider = {
  id: 'failing-test',
  name: 'Failing',
  enabled: true,
  async searchAnime() {
    return [];
  },
  async getAnimeInfo() {
    throw new StreamingError('provider_unavailable', 'down');
  },
  async getEpisodes() {
    return [];
  },
  async getEpisodeServers() {
    return [];
  },
  async getEpisodeSources() {
    throw new StreamingError('source_resolution_failed', 'fail');
  },
};

describe('streaming registry', () => {
  afterEach(() => unregisterProvider('failing-test'));

  it('lists mock when enabled', () => {
    expect(listProviders().some((p) => p.id === 'mock')).toBe(true);
    expect(isProviderEnabled('mock')).toBe(true);
  });

  it('registers and resolves providers', () => {
    registerProvider(failing);
    expect(getProvider('failing-test')?.name).toBe('Failing');
  });

  it('rejects unknown provider', () => {
    expect(getProvider('nope')).toBeUndefined();
    expect(isProviderEnabled('nope')).toBe(false);
  });
});
