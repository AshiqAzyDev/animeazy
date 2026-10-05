import type { MangaChapter, MangaDetail, MediaCard } from '../types/media';
import { hashHue, mangadexQueue, queuedFetch } from './http';

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

function mapManga(m: MDManga): MediaCard {
  const title = titleOf(m);
  return {
    id: `manga-${m.id}`,
    kind: 'manga',
    title,
    image: coverOf(m),
    year: m.attributes.year,
    status: m.attributes.status,
    genres: m.attributes.tags?.slice(0, 4).map((t) => t.attributes.name.en).filter(Boolean),
    synopsis: m.attributes.description?.en,
    hue: hashHue(title),
  };
}

export const mangadex = {
  search: async (q: string, offset = 0): Promise<MediaCard[]> => {
    const qs = new URLSearchParams({
      title: q,
      limit: '24',
      offset: String(offset),
      'order[relevance]': 'desc',
    });
    qs.append('includes[]', 'cover_art');
    qs.append('contentRating[]', 'safe');
    qs.append('contentRating[]', 'suggestive');
    const data = await queuedFetch<{ data: MDManga[] }>(mangadexQueue, `${BASE}/manga?${qs}`);
    return (data.data ?? []).map(mapManga);
  },
  popular: async (): Promise<MediaCard[]> => {
    const qs = new URLSearchParams({
      limit: '20',
      'order[followedCount]': 'desc',
    });
    qs.append('includes[]', 'cover_art');
    qs.append('contentRating[]', 'safe');
    const data = await queuedFetch<{ data: MDManga[] }>(mangadexQueue, `${BASE}/manga?${qs}`);
    return (data.data ?? []).map(mapManga);
  },
  detail: async (id: string): Promise<MangaDetail> => {
    const url = `${BASE}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const data = await queuedFetch<{ data: MDManga }>(mangadexQueue, url);
    const base = mapManga(data.data);
    const authors =
      data.data.relationships
        ?.filter((r) => r.type === 'author' || r.type === 'artist')
        .map((r) => r.attributes?.name)
        .filter(Boolean) as string[] | undefined;
    return {
      ...base,
      mangadexId: id,
      authors,
      contentRating: data.data.attributes.contentRating,
      tags: data.data.attributes.tags?.map((t) => t.attributes.name.en).filter(Boolean),
      synopsis: data.data.attributes.description?.en || base.synopsis,
    };
  },
  chapters: async (mangaId: string): Promise<MangaChapter[]> => {
    const qs = new URLSearchParams({
      limit: '40',
      'order[chapter]': 'desc',
    });
    qs.append('translatedLanguage[]', 'en');
    qs.append('includes[]', 'scanlation_group');
    const data = await queuedFetch<{
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
    }>(mangadexQueue, `${BASE}/manga/${mangaId}/feed?${qs}`);

    return (data.data ?? []).map((c) => ({
      id: c.id,
      title: c.attributes.title || `Chapter ${c.attributes.chapter ?? '?'}`,
      chapter: c.attributes.chapter,
      volume: c.attributes.volume,
      pages: c.attributes.pages,
      translatedLanguage: c.attributes.translatedLanguage,
      groupName: c.relationships?.find((r) => r.type === 'scanlation_group')?.attributes?.name,
    }));
  },
  chapterPages: async (chapterId: string): Promise<string[]> => {
    const data = await queuedFetch<{
      baseUrl: string;
      chapter: { hash: string; data: string[]; dataSaver: string[] };
    }>(mangadexQueue, `${BASE}/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = data;
    const useSaver = Boolean(chapter.dataSaver?.length);
    const files = useSaver ? chapter.dataSaver : chapter.data;
    const quality = useSaver ? 'data-saver' : 'data';
    return files.map((file) => `${baseUrl}/${quality}/${chapter.hash}/${file}`);
  },
};
