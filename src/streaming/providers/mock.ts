import type { StreamingProvider } from '../provider';
import { normalizeSource, normalizeSubtitles } from '../normalize';
import type {
  AnimeResult,
  ProviderAnimeInfo,
  ProviderEpisode,
  ProviderServer,
  StreamingResult,
} from '../types';
import { StreamingError } from '../types';

/**
 * Development-only mock provider.
 * Uses publicly documented sample media (Mux HLS test stream + Google sample MP4).
 * Not a real anime catalogue — exists so the player/provider pipeline can be tested.
 */
const SAMPLE_HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const SAMPLE_MP4_1080 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_MP4_720 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const SAMPLE_MP4_480 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
/** Public domain sample VTT (W3C) */
const SAMPLE_VTT_EN =
  'https://raw.githubusercontent.com/mozilla/vtt.js/master/tests/kind/captions.vtt';
const SAMPLE_VTT_ES =
  'https://raw.githubusercontent.com/mozilla/vtt.js/master/tests/kind/subtitles.vtt';

const MOCK_ANIME_ID = 'mock-demo';

function episodeId(n: number): string {
  return `${MOCK_ANIME_ID}-ep-${n}`;
}

function parseEpisodeNumber(providerEpisodeId: string): number {
  const m = providerEpisodeId.match(/-ep-(\d+)$/);
  if (!m) throw new StreamingError('invalid_episode', `Invalid mock episode id: ${providerEpisodeId}`);
  return Number(m[1]);
}

export const mockStreamingProvider: StreamingProvider = {
  id: 'mock',
  name: 'Demo (Mock)',
  developmentOnly: true,

  async searchAnime(query: string): Promise<AnimeResult[]> {
    const q = query.trim().toLowerCase();
    if (q && !'demo sample mock big buck'.includes(q) && !q.includes('demo')) {
      return [];
    }
    return [
      {
        id: MOCK_ANIME_ID,
        title: 'ANIMEAZY Demo Stream',
        image: undefined,
        year: 2024,
        episodes: 6,
      },
    ];
  },

  async getAnimeInfo(providerAnimeId: string): Promise<ProviderAnimeInfo> {
    if (providerAnimeId !== MOCK_ANIME_ID) {
      throw new StreamingError('provider_unavailable', 'Mock anime not found');
    }
    return {
      id: MOCK_ANIME_ID,
      title: 'ANIMEAZY Demo Stream',
      synopsis:
        'Development-only mock provider using publicly licensed sample HLS/MP4 media. Replace with an authorized partner provider for production.',
      episodeCount: 6,
    };
  },

  async getEpisodes(providerAnimeId: string): Promise<ProviderEpisode[]> {
    if (providerAnimeId !== MOCK_ANIME_ID) {
      throw new StreamingError('episode_unavailable', 'Mock anime not found');
    }
    return Array.from({ length: 6 }, (_, i) => ({
      id: episodeId(i + 1),
      number: i + 1,
      title: `Demo Episode ${i + 1}`,
    }));
  },

  async getEpisodeServers(providerEpisodeId: string): Promise<ProviderServer[]> {
    parseEpisodeNumber(providerEpisodeId);
    return [
      { id: 'primary', name: 'Primary' },
      { id: 'backup', name: 'Backup' },
    ];
  },

  async getEpisodeSources(
    providerEpisodeId: string,
    serverId = 'primary',
  ): Promise<StreamingResult> {
    const ep = parseEpisodeNumber(providerEpisodeId);
    if (ep < 1 || ep > 6) {
      throw new StreamingError('episode_unavailable', `Episode ${ep} not in mock catalog`);
    }
    if (serverId !== 'primary' && serverId !== 'backup') {
      throw new StreamingError('server_unavailable', `Unknown mock server: ${serverId}`);
    }

    const sources =
      serverId === 'backup'
        ? [
            normalizeSource({ url: SAMPLE_MP4_720, type: 'mp4', quality: '720p' }),
            normalizeSource({ url: SAMPLE_MP4_480, type: 'mp4', quality: '480p' }),
          ]
        : [
            normalizeSource({ url: SAMPLE_HLS, type: 'hls', quality: 'Auto', isM3U8: true }),
            normalizeSource({ url: SAMPLE_MP4_1080, type: 'mp4', quality: '1080p' }),
            normalizeSource({ url: SAMPLE_MP4_720, type: 'mp4', quality: '720p' }),
            normalizeSource({ url: SAMPLE_MP4_480, type: 'mp4', quality: '480p' }),
          ];

    return {
      providerId: 'mock',
      providerName: 'Demo (Mock)',
      sources,
      subtitles: normalizeSubtitles([
        { url: SAMPLE_VTT_EN, language: 'en', label: 'English', kind: 'captions' },
        { url: SAMPLE_VTT_ES, language: 'es', label: 'Spanish', kind: 'subtitles' },
      ]),
      intro: { start: 0, end: 5 },
      outro: { start: 0, end: 0 },
    };
  },

  async resolveCatalogAnime(catalogAnimeId: string): Promise<string | null> {
    // Map any catalog title to the demo stream so the UI can be exercised end-to-end.
    if (!catalogAnimeId?.trim()) return null;
    return MOCK_ANIME_ID;
  },
};
