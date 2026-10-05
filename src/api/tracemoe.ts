import type { TraceResult } from '../types/media';
import { traceQueue } from './http';

const BASE = 'https://api.trace.moe';

export async function searchByImageFile(file: File): Promise<TraceResult[]> {
  return traceQueue.enqueue(async () => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/search?anilistInfo=1`, { method: 'POST', body: form });
    if (!res.ok) {
      const error = new Error(`trace.moe failed: ${res.status}`) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }
    const data = (await res.json()) as { result?: TraceResult[] };
    return data.result ?? [];
  });
}

export async function searchByUrl(url: string): Promise<TraceResult[]> {
  return traceQueue.enqueue(async () => {
    const res = await fetch(`${BASE}/search?anilistInfo=1&url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      const error = new Error(`trace.moe failed: ${res.status}`) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }
    const data = (await res.json()) as { result?: TraceResult[] };
    return data.result ?? [];
  });
}
