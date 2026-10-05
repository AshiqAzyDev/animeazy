import type { AnimeDetail, MediaCard } from '../types/media';
import { hashHue, kitsuQueue, queuedFetch } from './http';

const BASE = 'https://kitsu.io/api/edge';

const headers = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
};

type ImgSet = {
  tiny?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
};

type KitsuAnime = {
  id: string;
  attributes: {
    canonicalTitle: string;
    titles?: { ja_jp?: string; en_jp?: string };
    synopsis?: string;
    averageRating?: string;
    startDate?: string;
    subtype?: string;
    status?: string;
    episodeCount?: number;
    posterImage?: ImgSet;
    coverImage?: ImgSet | null;
    youtubeVideoId?: string | null;
  };
};

function bestImg(set?: ImgSet | null, preferWide = false) {
  if (!set) return undefined;
  if (preferWide) {
    return set.original || set.large || set.medium || set.small;
  }
  return set.original || set.large || set.medium || set.small;
}

function mapAnime(a: KitsuAnime): MediaCard {
  const title = a.attributes.canonicalTitle;
  const score = a.attributes.averageRating
    ? Number(a.attributes.averageRating) / 10
    : undefined;
  const poster = bestImg(a.attributes.posterImage);
  const cover = bestImg(a.attributes.coverImage, true);
  return {
    id: `kitsu-${a.id}`,
    kind: 'anime',
    title,
    titleJp: a.attributes.titles?.ja_jp || a.attributes.titles?.en_jp,
    image: poster,
    banner: cover || poster,
    score: Number.isFinite(score) ? score : undefined,
    year: a.attributes.startDate ? Number(a.attributes.startDate.slice(0, 4)) : undefined,
    type: a.attributes.subtype,
    status: a.attributes.status,
    synopsis: a.attributes.synopsis,
    episodes: a.attributes.episodeCount ?? undefined,
    hue: hashHue(title),
    trailerYoutubeId: a.attributes.youtubeVideoId || undefined,
  };
}

async function list(path: string): Promise<MediaCard[]> {
  const data = await queuedFetch<{ data: KitsuAnime[] }>(kitsuQueue, `${BASE}${path}`, {
    headers,
  });
  return (data.data ?? []).map(mapAnime);
}

export const kitsu = {
  search: (q: string) =>
    list(`/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=24`),
  popular: () => list('/anime?sort=-userCount&page[limit]=20'),
  topRated: () => list('/anime?sort=-averageRating&page[limit]=20'),
  airing: () => list('/anime?filter[status]=current&sort=-userCount&page[limit]=20'),
  upcoming: () => list('/anime?filter[status]=upcoming&sort=-userCount&page[limit]=16'),
  detail: async (id: string): Promise<AnimeDetail> => {
    const data = await queuedFetch<{ data: KitsuAnime }>(
      kitsuQueue,
      `${BASE}/anime/${id}`,
      { headers },
    );
    const base = mapAnime(data.data);
    return {
      ...base,
      studios: [],
      characters: [],
      rating: undefined,
      duration: undefined,
    };
  },
};

/** @deprecated use kitsu.search */
export const kitsuSearch = (q: string) => kitsu.search(q);
