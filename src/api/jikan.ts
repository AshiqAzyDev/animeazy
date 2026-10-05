import type { AnimeDetail, MediaCard } from '../types/media';
import { hashHue, jikanQueue, queuedFetch } from './http';

const BASE = 'https://api.jikan.moe/v4';

type JikanAnime = {
  mal_id: number;
  title: string;
  title_japanese?: string;
  synopsis?: string;
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  episodes?: number;
  rating?: string;
  duration?: string;
  images?: {
    jpg?: { large_image_url?: string; image_url?: string };
    webp?: { large_image_url?: string; image_url?: string };
  };
  genres?: { name: string }[];
  studios?: { name: string }[];
  trailer?: { youtube_id?: string; url?: string };
  streaming?: { name: string; url: string }[];
};

type Page<T> = { data: T[]; pagination?: { has_next_page?: boolean; last_visible_page?: number } };

function mapAnime(a: JikanAnime): MediaCard {
  return {
    id: `anime-${a.mal_id}`,
    malId: a.mal_id,
    kind: 'anime',
    title: a.title,
    titleJp: a.title_japanese,
    image:
      a.images?.webp?.large_image_url ||
      a.images?.jpg?.large_image_url ||
      a.images?.webp?.image_url ||
      a.images?.jpg?.image_url,
    banner:
      a.images?.webp?.large_image_url ||
      a.images?.jpg?.large_image_url ||
      a.images?.jpg?.image_url,
    score: a.score ?? undefined,
    year: a.year ?? undefined,
    type: a.type,
    status: a.status,
    genres: a.genres?.map((g) => g.name) ?? [],
    synopsis: a.synopsis ?? undefined,
    episodes: a.episodes ?? undefined,
    hue: hashHue(a.title),
    trailerYoutubeId: a.trailer?.youtube_id ?? undefined,
    streaming: a.streaming?.map((s) => ({ name: s.name, url: s.url })),
  };
}

async function getList(path: string): Promise<MediaCard[]> {
  const data = await queuedFetch<Page<JikanAnime>>(jikanQueue, `${BASE}${path}`, {
    timeoutMs: 5000,
  });
  return (data.data ?? []).map(mapAnime);
}

export const jikan = {
  top: (limit = 20) => getList(`/top/anime?limit=${limit}`),
  seasonal: () => getList('/seasons/now?limit=20'),
  upcoming: () => getList('/seasons/upcoming?limit=16'),
  search: (q: string, page = 1) =>
    getList(`/anime?q=${encodeURIComponent(q)}&page=${page}&limit=24&sfw=true`),
  byGenre: (genreId: number) => getList(`/anime?genres=${genreId}&order_by=score&sort=desc&limit=20&sfw=true`),
  schedule: async (day?: string) => {
    const path = day ? `/schedules/${day}` : '/schedules';
    return getList(`${path}?limit=25&sfw=true`);
  },
  genres: async () => {
    const data = await queuedFetch<{ data: { mal_id: number; name: string }[] }>(
      jikanQueue,
      `${BASE}/genres/anime`,
    );
    return data.data ?? [];
  },
  detail: async (malId: number): Promise<AnimeDetail> => {
    const [full, chars] = await Promise.all([
      queuedFetch<{ data: JikanAnime }>(jikanQueue, `${BASE}/anime/${malId}/full`, {
        timeoutMs: 5000,
      }),
      queuedFetch<{
        data: {
          character: { mal_id: number; name: string; images?: { jpg?: { image_url?: string } } };
          role: string;
        }[];
      }>(jikanQueue, `${BASE}/anime/${malId}/characters`, { timeoutMs: 5000 }).catch(() => ({
        data: [],
      })),
    ]);
    const base = mapAnime(full.data);
    return {
      ...base,
      rating: full.data.rating,
      duration: full.data.duration,
      studios: full.data.studios?.map((s) => s.name) ?? [],
      streaming: full.data.streaming?.map((s) => ({ name: s.name, url: s.url })),
      characters: (chars.data ?? []).slice(0, 12).map((c) => ({
        id: c.character.mal_id,
        name: c.character.name,
        image: c.character.images?.jpg?.image_url,
        role: c.role,
      })),
    };
  },
  animeDb: async (params: Record<string, string | number | undefined>, page = 1) => {
    const qs = new URLSearchParams({ page: String(page), limit: '24', sfw: 'true' });
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const data = await queuedFetch<Page<JikanAnime>>(jikanQueue, `${BASE}/anime?${qs}`, {
      timeoutMs: 5000,
    });
    return {
      items: (data.data ?? []).map(mapAnime),
      hasNext: Boolean(data.pagination?.has_next_page),
      lastPage: data.pagination?.last_visible_page ?? page,
    };
  },
};
