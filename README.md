# ANIMEAZY

Premium anime & manga **discovery** hub for GitHub Pages.

Explore. Track. Read. — trailers, schedules, MangaDex reading, quotes, trace.moe, and OpenSubtitles (your API key). **No unauthorized episode streaming.**

## Stack

- Vite + React + TypeScript
- Framer Motion, GSAP-ready motion helpers, Lenis
- TanStack Query
- Auth0 (optional)
- Jikan, Kitsu, Shikimori, MangaDex, Animechan, trace.moe, OpenSubtitles
- Authorized streaming provider architecture (`src/streaming/`) + HTML5/`hls.js` player

## Develop

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill Auth0 values if you want login.

Streaming (authorized only):

- `VITE_STREAM_MOCK_ENABLED=true` — demo provider with public sample HLS/MP4 (local testing)
- `VITE_STREAMING_API_BASE=` — optional future authorized backend base URL
- `npm test` — unit tests for providers/quality/normalization

GitHub Pages cannot host the streaming API. Point `VITE_STREAMING_API_BASE` at your own authorized backend when ready.

## Build / deploy

```bash
npm run build
```

Site: **https://ashiqazydev.github.io/animeazy/**

GitHub Actions (`.github/workflows/deploy.yml`) builds and publishes `dist` to Pages. Source must be **GitHub Actions**.

Optional secrets (Settings → Secrets and variables → Actions):

| Secret | Notes |
|--------|--------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA client |
| `VITE_AUTH0_AUDIENCE` | Optional |
| `VITE_AUTH0_CALLBACK_URL` | Defaults to `https://ashiqazydev.github.io/animeazy/` |
| `VITE_OPENSUBTITLES_API_KEY` | Subtitles page |
| `VITE_STREAMING_API_BASE` | Authorized backend (leave empty for demo) |
| `VITE_STREAM_MOCK_ENABLED` | Defaults to `true` on Pages |
| `VITE_STREAM_AUTO_FALLBACK` | Defaults to `false` |

In Auth0, add Allowed Callback / Logout URLs: `https://ashiqazydev.github.io/animeazy/`

## MangaDex

Credit MangaDex and scanlation groups. No ads or paid access on top of their API.
