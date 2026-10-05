import { listProviderSummaries, isMockEnabled } from '../streaming/registry';

/** Public frontend streaming config (no private credentials / scraper endpoints). */

export function getStreamingApiBase(): string {
  return (import.meta.env.VITE_STREAMING_API_BASE as string | undefined)?.trim().replace(/\/$/, '') || '';
}

export function hasRemoteStreamingApi(): boolean {
  return Boolean(getStreamingApiBase());
}

export function getWatchServerOptions(): {
  id: string;
  label: string;
  mode: 'trailer' | 'provider';
  developmentOnly?: boolean;
}[] {
  const providers = listProviderSummaries().map((p) => ({
    id: p.id,
    label: p.name,
    mode: 'provider' as const,
    developmentOnly: p.developmentOnly,
  }));

  return [{ id: 'trailer', label: 'Trailer', mode: 'trailer' as const }, ...providers];
}

export function isStreamConfigured(): boolean {
  return hasRemoteStreamingApi() || isMockEnabled() || listProviderSummaries().length > 0;
}
