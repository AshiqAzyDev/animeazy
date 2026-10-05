/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN?: string;
  readonly VITE_AUTH0_CLIENT_ID?: string;
  readonly VITE_AUTH0_AUDIENCE?: string;
  readonly VITE_AUTH0_CALLBACK_URL?: string;
  readonly VITE_OPENSUBTITLES_API_KEY?: string;
  /** Optional authorized streaming API base (no trailing slash). Empty = local registry/mock only. */
  readonly VITE_STREAMING_API_BASE?: string;
  /** Enable development mock provider (public sample HLS/MP4). Default: on in DEV. */
  readonly VITE_STREAM_MOCK_ENABLED?: string;
  /** Auto-try other providers when none selected / when fallback allowed. */
  readonly VITE_STREAM_AUTO_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
