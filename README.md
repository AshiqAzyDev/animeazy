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

GitHub Actions workflow in `.github/workflows/deploy.yml` publishes `dist` to GitHub Pages. Add secrets:

- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_CALLBACK_URL` (e.g. `https://<user>.github.io/<repo>/`)
- `VITE_AUTH0_AUDIENCE` (optional)

Enable GitHub Pages with **GitHub Actions** as the source.

## MangaDex

Credit MangaDex and scanlation groups. No ads or paid access on top of their API.
