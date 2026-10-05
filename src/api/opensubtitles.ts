import type { SubtitleItem } from '../types/media';
import { opensubQueue } from './http';

const BASE = 'https://api.opensubtitles.com/api/v1';
const KEY_STORAGE = 'animeazy.opensubtitles.apiKey';

/** Project key from `.env` (`VITE_OPENSUBTITLES_API_KEY`). */
export function getEnvOpenSubtitlesKey() {
  return (import.meta.env.VITE_OPENSUBTITLES_API_KEY as string | undefined)?.trim() || '';
}

export function hasProjectOpenSubtitlesKey() {
  return Boolean(getEnvOpenSubtitlesKey());
}

/** Prefer project `.env` key; fall back to browser-saved key. */
export function getOpenSubtitlesKey() {
  return getEnvOpenSubtitlesKey() || localStorage.getItem(KEY_STORAGE) || '';
}

export function setOpenSubtitlesKey(key: string) {
  localStorage.setItem(KEY_STORAGE, key.trim());
}

export async function searchSubtitles(
  query: string,
  apiKey = getOpenSubtitlesKey(),
): Promise<SubtitleItem[]> {
  if (!apiKey) {
    throw new Error('Add VITE_OPENSUBTITLES_API_KEY to .env or paste a key below.');
  }

  return opensubQueue.enqueue(async () => {
    const res = await fetch(
      `${BASE}/subtitles?query=${encodeURIComponent(query)}&languages=en`,
      {
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ANIMEAZY v1.0',
        },
      },
    );
    if (!res.ok) {
      const error = new Error(`OpenSubtitles failed: ${res.status}`) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }
    const data = (await res.json()) as {
      data?: {
        id: string;
        attributes?: {
          release?: string;
          language?: string;
          download_count?: number;
          hearing_impaired?: boolean;
          url?: string;
          feature_details?: { title?: string };
        };
      }[];
    };

    return (data.data ?? []).slice(0, 30).map((item) => ({
      id: item.id,
      release: item.attributes?.release || item.attributes?.feature_details?.title || 'Subtitle',
      language: item.attributes?.language || 'en',
      downloads: item.attributes?.download_count || 0,
      hearingImpaired: Boolean(item.attributes?.hearing_impaired),
      url: item.attributes?.url,
    }));
  });
}
