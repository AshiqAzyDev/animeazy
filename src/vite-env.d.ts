/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN?: string;
  readonly VITE_AUTH0_CLIENT_ID?: string;
  readonly VITE_AUTH0_AUDIENCE?: string;
  readonly VITE_AUTH0_CALLBACK_URL?: string;
  /** Optional browser OpenSubtitles key (prefer server OPENSUBTITLES_API_KEY). */
  readonly VITE_OPENSUBTITLES_API_KEY?: string;
  /** Authorized streaming API base (no trailing slash). Required for Watch providers. */
  readonly VITE_STREAMING_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
