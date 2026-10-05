import type { Context, Next } from 'hono';
import { ApiError } from './errors.js';

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX = 120;

export async function rateLimit(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    cur.count += 1;
    if (cur.count > MAX) {
      throw new ApiError('RATE_LIMITED', 'Too many requests', 429);
    }
  }
  await next();
}
