import type { AnimeDetail, MediaCard } from '../types/media';
import { hashHue, queuedFetch, shikiQueue } from './http';

const BASE = 'https://shikimori.one/api';

const headers = {
  'User-Agent': 'ANIMEAZY Discovery Hub',
};

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

function img(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://shikimori.one${path}`;
}

function mapAnime(a: ShikiAnime): MediaCard {
  return {
    id: `shiki-${a.id}`,
    kind: 'anime',
    title: a.name,
    titleJp: a.russian,
    image: img(a.image?.original) || img(a.image?.preview),
    banner: img(a.image?.original) || img(a.image?.preview),
    score: a.score ? Number(a.score) : undefined,
    year: a.aired_on ? Number(a.aired_on.slice(0, 4)) : undefined,
    type: a.kind,
    status: a.status,
    episodes: a.episodes || a.episodes_aired || undefined,
    hue: hashHue(a.name),
  };
}

async function list(path: string): Promise<MediaCard[]> {
  const data = await queuedFetch<ShikiAnime[]>(shikiQueue, `${BASE}${path}`, { headers });
  return (data ?? []).map(mapAnime);
}

export const shikimori = {
  search: (q: string) => list(`/animes?search=${encodeURIComponent(q)}&limit=24`),
  popular: () => list('/animes?order=popularity&limit=20'),
  topRated: () => list('/animes?order=ranked&limit=20'),
  airing: () => list('/animes?status=ongoing&order=popularity&limit=20'),
  upcoming: () => list('/animes?status=anons&order=popularity&limit=16'),
  byGenre: async (genreName: string) => {
    // Shikimori uses genre ids; text search is a practical fallback
    return list(`/animes?search=${encodeURIComponent(genreName)}&order=ranked&limit=20`);
  },
  detail: async (id: string | number): Promise<AnimeDetail> => {
    const data = await queuedFetch<ShikiFull>(shikiQueue, `${BASE}/animes/${id}`, { headers });
    const base = mapAnime(data);
    return {
      ...base,
      synopsis: data.description?.replace(/\[.*?\]/g, '') || undefined,
      genres: data.genres?.map((g) => g.name) ?? [],
      studios: data.studios?.map((s) => s.name) ?? [],
      rating: data.rating,
      duration: data.duration ? `${data.duration} min` : undefined,
      characters: [],
    };
  },
};

/** @deprecated use shikimori.search */
export async function shikimoriSearch(q: string): Promise<MediaCard[]> {
  return shikimori.search(q);
}
