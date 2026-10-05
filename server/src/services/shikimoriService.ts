import { config } from '../config/env.js';
import { metaCache } from '../streaming/cache.js';
import { ApiError } from '../middleware/errors.js';

const BASE = 'https://shikimori.one/api';

type ShikiAnime = {
  id: number;
  name: string;
  russian?: string;
  image?: { original?: string; preview?: string };
  score?: string;
  aired_on?: string;
  kind?: string;
  status?: string;
  episodes?: number;
  episodes_aired?: number;
};

type ShikiFull = ShikiAnime & {
  description?: string | null;
  genres?: { name: string }[];
  studios?: { name: string }[];
  duration?: number;
  rating?: string;
};

export type NormalizedAnime = {
  id: string;
  shikimoriId: number;
  title: string;
  titleJp?: string;
  image?: string;
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  episodes?: number;
  synopsis?: string;
  genres?: string[];
  studios?: string[];
  rating?: string;
  duration?: string;
};

function img(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://shikimori.one${path}`;
}

function mapAnime(a: ShikiAnime): NormalizedAnime {
  return {
    id: `shiki-${a.id}`,
    shikimoriId: a.id,
    title: a.name,
    titleJp: a.russian,
    image: img(a.image?.original) || img(a.image?.preview),
    score: a.score ? Number(a.score) : undefined,
    year: a.aired_on ? Number(a.aired_on.slice(0, 4)) : undefined,
    type: a.kind,
    status: a.status,
    episodes: a.episodes || a.episodes_aired || undefined,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.metaTimeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': config.shikimoriUserAgent, Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new ApiError('UPSTREAM_ERROR', `Shikimori ${res.status}`, res.status === 404 ? 404 : 502);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('PROVIDER_TIMEOUT', 'Shikimori timed out', 504);
    }
    throw new ApiError('UPSTREAM_ERROR', err instanceof Error ? err.message : 'Shikimori error', 502);
  } finally {
    clearTimeout(timer);
  }
}

/** Documented v1-style paths already used by ANIMEAZY frontend. */
export const shikimoriService = {
  async searchAnime(query: string): Promise<NormalizedAnime[]> {
    const key = `shiki:search:${query}`;
    const cached = metaCache.get<NormalizedAnime[]>(key);
    if (cached) return cached;
    const data = await fetchJson<ShikiAnime[]>(
      `/animes?search=${encodeURIComponent(query)}&limit=24`,
    );
    const mapped = (data ?? []).map(mapAnime);
    metaCache.set(key, mapped);
    return mapped;
  },

  async getAnimeList(params: { order?: string; status?: string; limit?: number } = {}) {
    const order = params.order || 'popularity';
    const limit = params.limit ?? 20;
    const status = params.status ? `&status=${encodeURIComponent(params.status)}` : '';
    const key = `shiki:list:${order}:${status}:${limit}`;
    const cached = metaCache.get<NormalizedAnime[]>(key);
    if (cached) return cached;
    const data = await fetchJson<ShikiAnime[]>(`/animes?order=${order}${status}&limit=${limit}`);
    const mapped = (data ?? []).map(mapAnime);
    metaCache.set(key, mapped);
    return mapped;
  },

  async getAnime(id: string | number): Promise<NormalizedAnime> {
    const key = `shiki:detail:${id}`;
    const cached = metaCache.get<NormalizedAnime>(key);
    if (cached) return cached;
    const data = await fetchJson<ShikiFull>(`/animes/${id}`);
    const base = mapAnime(data);
    const full: NormalizedAnime = {
      ...base,
      synopsis: data.description?.replace(/\[.*?\]/g, '') || undefined,
      genres: data.genres?.map((g) => g.name) ?? [],
      studios: data.studios?.map((s) => s.name) ?? [],
      rating: data.rating,
      duration: data.duration ? `${data.duration} min` : undefined,
    };
    metaCache.set(key, full);
    return full;
  },

  /**
   * Related/similar anime: not verified as a stable dedicated endpoint in this environment.
   * TODO: confirm GraphQL or documented related endpoint before enabling.
   */
  async getRelatedAnime(_id: string | number): Promise<NormalizedAnime[]> {
    return [];
  },

  async getSimilarAnime(_id: string | number): Promise<NormalizedAnime[]> {
    return [];
  },
};
