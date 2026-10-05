import type { AnimeDetail, MediaCard } from '../types/media';
import { jikan } from './jikan';
import { kitsu } from './kitsu';
import { shikimori } from './shikimori';

async function firstOk<T>(fns: Array<() => Promise<T>>, empty: T): Promise<T> {
  let lastError: unknown;
  for (const fn of fns) {
    try {
      const value = await fn();
      if (Array.isArray(value) && value.length === 0) continue;
      return value;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) console.warn('[animeCatalog] all providers failed', lastError);
  return empty;
}

export const animeCatalog = {
  /** Hero / trending seasonal-style list */
  seasonal: () =>
    firstOk<MediaCard[]>(
      [() => jikan.seasonal(), () => kitsu.airing(), () => shikimori.airing(), () => kitsu.popular()],
      [],
    ),

  top: (limit = 12) =>
    firstOk<MediaCard[]>(
      [
        () => jikan.top(limit),
        () => kitsu.topRated(),
        () => shikimori.topRated(),
        () => kitsu.popular(),
      ],
      [],
    ),

  upcoming: () =>
    firstOk<MediaCard[]>(
      [() => jikan.upcoming(), () => kitsu.upcoming(), () => shikimori.upcoming(), () => kitsu.popular()],
      [],
    ),

  byGenre: (genreId: number, genreLabel?: string) =>
    firstOk<MediaCard[]>(
      [
        () => jikan.byGenre(genreId),
        () => (genreLabel ? shikimori.byGenre(genreLabel) : shikimori.popular()),
        () => kitsu.popular(),
      ],
      [],
    ),

  search: (q: string, page = 1) =>
    firstOk<MediaCard[]>(
      [() => jikan.search(q, page), () => kitsu.search(q), () => shikimori.search(q)],
      [],
    ),

  schedule: (day?: string) =>
    firstOk<MediaCard[]>(
      [() => jikan.schedule(day), () => kitsu.airing(), () => shikimori.airing()],
      [],
    ),

  animeDb: async (
    params: Record<string, string | number | undefined>,
    page = 1,
  ): Promise<{ items: MediaCard[]; hasNext: boolean; lastPage: number }> => {
    try {
      return await jikan.animeDb(params, page);
    } catch {
      const q = String(params.q || params.order_by || 'anime');
      const items = await firstOk<MediaCard[]>(
        [
          () => (params.q ? kitsu.search(String(params.q)) : kitsu.popular()),
          () => (params.q ? shikimori.search(String(params.q)) : shikimori.popular()),
        ],
        [],
      );
      return { items, hasNext: false, lastPage: page };
    }
  },

  detail: async (rawId: string): Promise<AnimeDetail> => {
    if (rawId.startsWith('kitsu-')) {
      return kitsu.detail(rawId.replace(/^kitsu-/, ''));
    }
    if (rawId.startsWith('shiki-')) {
      return shikimori.detail(rawId.replace(/^shiki-/, ''));
    }

    const malId = Number(rawId.replace(/^anime-/, ''));
    if (Number.isFinite(malId) && malId > 0) {
      try {
        return await jikan.detail(malId);
      } catch {
        // fall through to search by trying shiki/kitsu with numeric id guess then popular lookup
      }
    }

    // Last resort: treat as shiki id
    if (Number.isFinite(malId) && malId > 0) {
      try {
        return await shikimori.detail(malId);
      } catch {
        /* continue */
      }
    }

    throw new Error('Could not load anime details from any provider');
  },
};
