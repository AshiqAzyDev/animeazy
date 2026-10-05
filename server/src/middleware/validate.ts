import { ApiError } from './errors.js';

const ID_RE = /^[a-zA-Z0-9_.:@-]{1,128}$/;

export function requireId(value: string, label: string): string {
  const v = value?.trim();
  if (!v || !ID_RE.test(v)) {
    throw new ApiError('INVALID_REQUEST', `Invalid ${label}`, 400);
  }
  return v;
}

export function requireEpisode(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10_000) {
    throw new ApiError('INVALID_REQUEST', 'Invalid episode number', 400);
  }
  return n;
}

export function optionalProvider(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return requireId(value, 'provider');
}
