# ANIMEAZY Streaming API

Node + TypeScript + Hono backend for authorized streaming resolution, Shikimori helpers, MangaDex wrappers, and OpenSubtitles search.

## Local

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:3000`

Health: `GET /health`

## Scripts

- `npm run dev` — tsx watch
- `npm run build` — compile to `dist/`
- `npm start` — run compiled server
- `npm test` — vitest
- `npm run lint` — `tsc --noEmit`

## Production

Deploy this package separately from GitHub Pages (Railway, Render, Fly, etc.).

Set:

- `PORT`
- `CORS_ORIGINS` (include your Pages origin, e.g. `https://ashiqazydev.github.io`)
- `MOCK_ENABLED` (usually `false` in production unless demo streams are intentional)
- `OPENSUBTITLES_API_KEY` (server-only)

Point the frontend secret `VITE_STREAMING_API_BASE` at this service.
