function env(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

function bool(key: string, fallback: boolean): boolean {
  const raw = env(key);
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

function num(key: string, fallback: number): number {
  const n = Number(env(key));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  port: num('PORT', 3000),
  corsOrigins: env('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mockEnabled: bool('MOCK_ENABLED', true),
  autoFallback: bool('AUTO_FALLBACK', false),
  authorizedProviderEnabled: bool('AUTHORIZED_PROVIDER_ENABLED', false),
  metaTimeoutMs: num('META_TIMEOUT_MS', 10_000),
  sourceTimeoutMs: num('SOURCE_TIMEOUT_MS', 15_000),
  openSubtitlesApiKey: env('OPENSUBTITLES_API_KEY'),
  openSubtitlesUserAgent: env('OPENSUBTITLES_USER_AGENT', 'ANIMEAZY v1.0'),
  shikimoriUserAgent: env('SHIKIMORI_USER_AGENT', 'ANIMEAZY Discovery Hub'),
  shikimoriClientId: env('SHIKIMORI_CLIENT_ID'),
  shikimoriClientSecret: env('SHIKIMORI_CLIENT_SECRET'),
};
