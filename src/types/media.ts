export type MediaKind = 'anime' | 'manga';

export interface MediaCard {
  id: string;
  malId?: number;
  kind: MediaKind;
  title: string;
  titleJp?: string;
  /** Poster / card art */
  image?: string;
  /** Wide high-res banner for hero backgrounds */
  banner?: string;
  score?: number;
  year?: number;
  type?: string;
  status?: string;
  genres?: string[];
  synopsis?: string;
  episodes?: number;
  chapters?: number;
  hue?: number;
  trailerYoutubeId?: string;
  streaming?: { name: string; url: string }[];
}

export interface AnimeDetail extends MediaCard {
  rating?: string;
  duration?: string;
  studios?: string[];
  characters?: {
    id: number;
    name: string;
    image?: string;
    role?: string;
  }[];
}

export interface MangaDetail extends MediaCard {
  mangadexId: string;
  authors?: string[];
  contentRating?: string;
  tags?: string[];
}

export interface MangaChapter {
  id: string;
  title: string;
  chapter?: string;
  volume?: string;
  pages?: number;
  groupName?: string;
  translatedLanguage?: string;
  /** Official/external host (e.g. MangaPlus) — not readable via MangaDex at-home */
  externalUrl?: string;
  /** True when MangaDex hosts image pages for this chapter */
  readable?: boolean;
}

export interface QuoteItem {
  content: string;
  anime: string;
  character: string;
}

export interface TraceResult {
  anilist: number;
  filename: string;
  episode: number | null;
  similarity: number;
  from: number;
  to: number;
  video: string;
  image: string;
}

export interface SubtitleItem {
  id: string;
  release: string;
  language: string;
  downloads: number;
  hearingImpaired: boolean;
  url?: string;
}

export interface MyListItem {
  id: string;
  kind: MediaKind;
  title: string;
  image?: string;
  score?: number;
  addedAt: number;
  progress?: number;
}
