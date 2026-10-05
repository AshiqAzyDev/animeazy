import type { QuoteItem } from '../types/media';
import { quoteQueue, queuedFetch } from './http';

const BASE = 'https://api.animechan.io/v1';

type QuoteResponse = {
  status?: string;
  data?: {
    content: string;
    anime?: { name?: string };
    character?: { name?: string };
  };
};

export async function randomQuote(): Promise<QuoteItem> {
  const data = await queuedFetch<QuoteResponse>(quoteQueue, `${BASE}/quotes/random`);
  return {
    content: data.data?.content || 'No quote found.',
    anime: data.data?.anime?.name || 'Unknown',
    character: data.data?.character?.name || 'Unknown',
  };
}

export async function quotesByAnime(anime: string): Promise<QuoteItem[]> {
  try {
    const data = await queuedFetch<{ data?: QuoteResponse['data'][] } | QuoteResponse['data'][]>(
      quoteQueue,
      `${BASE}/quotes?anime=${encodeURIComponent(anime)}`,
    );
    const list = Array.isArray(data) ? data : data.data;
    if (!list?.length) return [await randomQuote()];
    return list.map((q) => ({
      content: (q as QuoteResponse['data'])?.content || '',
      anime: (q as QuoteResponse['data'])?.anime?.name || anime,
      character: (q as QuoteResponse['data'])?.character?.name || 'Unknown',
    }));
  } catch {
    return [await randomQuote()];
  }
}
