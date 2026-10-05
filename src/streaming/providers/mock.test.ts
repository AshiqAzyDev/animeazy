import { describe, expect, it } from 'vitest';
import { mockStreamingProvider } from './mock';

describe('MockStreamingProvider', () => {
  it('is marked development-only', () => {
    expect(mockStreamingProvider.developmentOnly).toBe(true);
  });

  it('returns sample servers and sources', async () => {
    const id = await mockStreamingProvider.resolveCatalogAnime!('kitsu-1', 'Any');
    expect(id).toBe('mock-demo');
    const eps = await mockStreamingProvider.getEpisodes(id!);
    const servers = await mockStreamingProvider.getEpisodeServers(eps[0].id);
    expect(servers.map((s) => s.id)).toContain('primary');
    const sources = await mockStreamingProvider.getEpisodeSources(eps[0].id, 'primary');
    expect(sources.sources.length).toBeGreaterThan(0);
  });
});
