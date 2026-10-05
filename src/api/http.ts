type QueueOptions = {
  minIntervalMs?: number;
  maxRetries?: number;
};

class RateLimitedQueue {
  private chain: Promise<unknown> = Promise.resolve();
  private lastAt = 0;
  private minIntervalMs: number;
  private maxRetries: number;

  constructor(opts: QueueOptions = {}) {
    this.minIntervalMs = opts.minIntervalMs ?? 1200;
    this.maxRetries = opts.maxRetries ?? 3;
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = async () => {
      const wait = Math.max(0, this.minIntervalMs - (Date.now() - this.lastAt));
      if (wait) await sleep(wait);
      this.lastAt = Date.now();
      return this.withRetry(fn);
    };
    const result = this.chain.then(run, run);
    this.chain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 429 && attempt < this.maxRetries) {
        const backoff = Math.min(8000, 800 * 2 ** attempt) + Math.random() * 400;
        await sleep(backoff);
        return this.withRetry(fn, attempt + 1);
      }
      throw err;
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const jikanQueue = new RateLimitedQueue({ minIntervalMs: 400 });
export const kitsuQueue = new RateLimitedQueue({ minIntervalMs: 400 });
export const shikiQueue = new RateLimitedQueue({ minIntervalMs: 250 });
export const mangadexQueue = new RateLimitedQueue({ minIntervalMs: 350 });
export const quoteQueue = new RateLimitedQueue({ minIntervalMs: 1500 });
export const traceQueue = new RateLimitedQueue({ minIntervalMs: 1000 });
export const opensubQueue = new RateLimitedQueue({ minIntervalMs: 500 });

export async function queuedFetch<T>(
  queue: RateLimitedQueue,
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  return queue.enqueue(async () => {
    const timeoutMs = init?.timeoutMs ?? 8000;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { timeoutMs: _t, ...rest } = init ?? {};
      const res = await fetch(url, { ...rest, signal: controller.signal });
      if (!res.ok) {
        const error = new Error(`Request failed: ${res.status} ${url}`) as Error & {
          status?: number;
        };
        error.status = res.status;
        throw error;
      }
      return res.json() as Promise<T>;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        const error = new Error(`Request timed out: ${url}`) as Error & { status?: number };
        error.status = 408;
        throw error;
      }
      throw err;
    } finally {
      window.clearTimeout(timer);
    }
  });
}

export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}
