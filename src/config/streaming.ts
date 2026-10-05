/** Public frontend streaming config (no private credentials). */

export function getStreamingApiBase(): string {
  return (
    (import.meta.env.VITE_STREAMING_API_BASE as string | undefined)?.trim().replace(/\/$/, '') || ''
  );
}

export function hasRemoteStreamingApi(): boolean {
  return Boolean(getStreamingApiBase());
}

export function isStreamConfigured(): boolean {
  return hasRemoteStreamingApi();
}
