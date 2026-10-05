type Entry<T> = { value: T; expiresAt: number };

/** Short-lived in-memory cache for mappings / episode lists / servers — not long-lived stream URLs. */
export class TtlCache {
  private store = new Map<string, Entry<unknown>>();

  constructor(private defaultTtlMs: number) {}

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const mappingCache = new TtlCache(5 * 60_000);
export const episodeListCache = new TtlCache(2 * 60_000);
export const serverListCache = new TtlCache(60_000);
/** Stream URLs expire quickly — keep TTL short */
export const sourceCache = new TtlCache(20_000);
