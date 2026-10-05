import { config } from '../config/env.js';
import { metaCache } from '../streaming/cache.js';
import { ApiError } from '../middleware/errors.js';

const BASE = 'https://api.mangadex.org';

type MDManga = {
  id: string;
  attributes: {
    title: Record<string, string>;
    description?: Record<string, string>;
    status?: string;
    year?: number;
    contentRating?: string;
    tags?: { attributes: { name: Record<string, string> } }[];
  };
  relationships?: {
    id: string;
    type: string;
    attributes?: { fileName?: string; name?: string };
  }[];
};

function titleOf(m: MDManga) {
  const t = m.attributes.title;
  return t.en || t.ja || Object.values(t)[0] || 'Untitled';
}

function coverOf(m: MDManga) {
  const rel = m.relationships?.find((r) => r.type === 'cover_art');
  const file = rel?.attributes?.fileName;
  if (!file) return undefined;
  return `https://uploads.mangadex.org/covers/${m.id}/${file}.256.jpg`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.metaTimeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new ApiError('UPSTREAM_ERROR', `MangaDex ${res.status}`, res.status === 404 ? 404 : 502);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('PROVIDER_TIMEOUT', 'MangaDex timed out', 504);
    }
    throw new ApiError('UPSTREAM_ERROR', err instanceof Error ? err.message : 'MangaDex error', 502);
  } finally {
    clearTimeout(timer);
  }
}

export const mangaDexService = {
  async searchManga(query: string, offset = 0) {
    const key = `md:search:${query}:${offset}`;
    const cached = metaCache.get<unknown[]>(key);
    if (cached) return cached;
    const qs = new URLSearchParams({
      title: query,
      limit: '24',
      offset: String(offset),
      'order[relevance]': 'desc',
    });
    qs.append('includes[]', 'cover_art');
    qs.append('contentRating[]', 'safe');
    qs.append('contentRating[]', 'suggestive');
    const data = await fetchJson<{ data: MDManga[] }>(`/manga?${qs}`);
    const mapped = (data.data ?? []).map((m) => ({
      id: m.id,
      title: titleOf(m),
      image: coverOf(m),
      year: m.attributes.year,
      status: m.attributes.status,
      synopsis: m.attributes.description?.en,
      credit: 'MangaDex',
    }));
    metaCache.set(key, mapped);
    return mapped;
  },

  async getManga(id: string) {
    const key = `md:detail:${id}`;
    const cached = metaCache.get<unknown>(key);
    if (cached) return cached;
    const data = await fetchJson<{ data: MDManga }>(
      `/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`,
    );
    const m = data.data;
    const authors =
      m.relationships
        ?.filter((r) => r.type === 'author' || r.type === 'artist')
        .map((r) => r.attributes?.name)
        .filter(Boolean) ?? [];
    const mapped = {
      id: m.id,
      title: titleOf(m),
      image: coverOf(m),
      year: m.attributes.year,
      status: m.attributes.status,
      contentRating: m.attributes.contentRating,
      authors,
      tags: m.attributes.tags?.map((t) => t.attributes.name.en).filter(Boolean),
      synopsis: m.attributes.description?.en,
      credit: 'MangaDex',
    };
    metaCache.set(key, mapped);
    return mapped;
  },

  async getMangaFeed(mangaId: string) {
    const key = `md:feed:${mangaId}`;
    const cached = metaCache.get<unknown[]>(key);
    if (cached) return cached;
    const qs = new URLSearchParams({
      limit: '40',
      'order[chapter]': 'desc',
    });
    qs.append('translatedLanguage[]', 'en');
    qs.append('includes[]', 'scanlation_group');
    const data = await fetchJson<{
      data: {
        id: string;
        attributes: {
          title?: string;
          chapter?: string;
          volume?: string;
          pages?: number;
          translatedLanguage?: string;
        };
        relationships?: { type: string; attributes?: { name?: string } }[];
      }[];
    }>(`/manga/${mangaId}/feed?${qs}`);

    const mapped = (data.data ?? []).map((c) => ({
      id: c.id,
      title: c.attributes.title || `Chapter ${c.attributes.chapter ?? '?'}`,
      chapter: c.attributes.chapter,
      volume: c.attributes.volume,
      pages: c.attributes.pages,
      translatedLanguage: c.attributes.translatedLanguage,
      groupName: c.relationships?.find((r) => r.type === 'scanlation_group')?.attributes?.name,
      credit: 'MangaDex / scanlation group',
    }));
    metaCache.set(key, mapped);
    return mapped;
  },

  async getCover(mangaId: string) {
    const manga = (await this.getManga(mangaId)) as { image?: string };
    return { url: manga.image };
  },
};
