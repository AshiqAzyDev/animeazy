import { config } from '../config/env.js';
import { subtitleCache } from '../streaming/cache.js';
import { normalizeSubtitles } from '../streaming/normalize.js';
import type { SubtitleTrack } from '../streaming/types.js';
import { ApiError } from '../middleware/errors.js';

const BASE = 'https://api.opensubtitles.com/api/v1';

/**
 * OpenSubtitles REST API (documented consumer API).
 * Search: GET /api/v1/subtitles with Api-Key + User-Agent.
 * Download link resolution (POST /api/v1/download) requires verified request body —
 * left as TODO until confirmed against Stoplight docs in this environment.
 */
export const openSubtitlesService = {
  configured(): boolean {
    return Boolean(config.openSubtitlesApiKey);
  },

  async searchSubtitles(params: {
    query: string;
    languages?: string;
    episode?: number;
  }): Promise<SubtitleTrack[]> {
    if (!config.openSubtitlesApiKey) {
      throw new ApiError(
        'NOT_CONFIGURED',
        'Set OPENSUBTITLES_API_KEY on the server',
        503,
      );
    }

    const languages = params.languages || 'en';
    const cacheKey = `os:${params.query}:${languages}:${params.episode ?? ''}`;
    const cached = subtitleCache.get<SubtitleTrack[]>(cacheKey);
    if (cached) return cached;

    const qs = new URLSearchParams({
      query: params.query,
      languages,
    });
    if (params.episode && Number.isFinite(params.episode)) {
      qs.set('episode_number', String(params.episode));
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), config.metaTimeoutMs);
    try {
      const res = await fetch(`${BASE}/subtitles?${qs}`, {
        signal: ctrl.signal,
        headers: {
          'Api-Key': config.openSubtitlesApiKey,
          'Content-Type': 'application/json',
          'User-Agent': config.openSubtitlesUserAgent,
        },
      });
      if (!res.ok) {
        throw new ApiError('UPSTREAM_ERROR', `OpenSubtitles ${res.status}`, 502);
      }
      const data = (await res.json()) as {
        data?: {
          id: string;
          attributes?: {
            language?: string;
            hearing_impaired?: boolean;
            url?: string;
            feature_details?: { title?: string };
            files?: { file_id?: number }[];
          };
        }[];
      };

      // Prefer attribute.url when present (public page/link). Do not invent download URLs.
      const tracks = normalizeSubtitles(
        (data.data ?? [])
          .map((item) => {
            const lang = item.attributes?.language || 'en';
            const url = item.attributes?.url;
            if (!url) return null;
            return {
              url,
              language: lang,
              label: item.attributes?.hearing_impaired
                ? `${lang.toUpperCase()} CC`
                : lang.toUpperCase() === 'EN'
                  ? 'English'
                  : lang,
              kind: item.attributes?.hearing_impaired ? ('captions' as const) : ('subtitles' as const),
            };
          })
          .filter(Boolean) as Array<{
          url: string;
          language: string;
          label?: string;
          kind?: 'subtitles' | 'captions';
        }>,
      );

      subtitleCache.set(cacheKey, tracks);
      return tracks;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError('PROVIDER_TIMEOUT', 'OpenSubtitles timed out', 504);
      }
      throw new ApiError(
        'UPSTREAM_ERROR',
        err instanceof Error ? err.message : 'OpenSubtitles error',
        502,
      );
    } finally {
      clearTimeout(timer);
    }
  },

  /**
   * TODO: verify POST /api/v1/download body/response against OpenSubtitles Stoplight docs
   * before implementing file-id → temporary download link resolution.
   */
  async resolveSubtitle(_fileId: number): Promise<never> {
    throw new ApiError(
      'NOT_CONFIGURED',
      'Subtitle download-link resolution requires verified OpenSubtitles download contract',
      501,
    );
  },
};
