import { afterEach, describe, expect, it } from 'vitest';
import {
  getProvider,
  listProviders,
  registerProvider,
  unregisterProvider,
} from './registry';
import type { StreamingProvider } from './provider';
import { StreamingError } from './types';

const failing: StreamingProvider = {
  id: 'failing',
  name: 'Failing',
  async searchAnime() {
    return [];
  },
  async getAnimeInfo() {
    throw new StreamingError('provider_unavailable', 'down');
  },
  async getEpisodes() {
    throw new StreamingError('episode_unavailable', 'none');
  },
  async getEpisodeServers() {
    return [];
  },
  async getEpisodeSources() {
    throw new StreamingError('source_resolution_failed', 'fail');
  },
};

describe('provider registry', () => {
  afterEach(() => {
    unregisterProvider('failing');
  });

  it('registers and resolves providers', () => {
    registerProvider(failing);
    expect(getProvider('failing')?.name).toBe('Failing');
    expect(listProviders().some((p) => p.id === 'failing')).toBe(true);
  });

  it('rejects unknown provider id via getProvider', () => {
    expect(getProvider('not-real')).toBeUndefined();
  });
});
