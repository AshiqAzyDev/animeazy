# ANIMEAZY

Premium anime & manga **discovery** hub for GitHub Pages.

Explore. Track. Read. — trailers, schedules, MangaDex reading, quotes, trace.moe, and OpenSubtitles. **No unauthorized episode streaming.**

## Stack

- Vite + React + TypeScript (frontend)
- Node + Hono + TypeScript (`server/`) for streaming/data API
- Framer Motion, GSAP helpers, Lenis, TanStack Query, Auth0 (optional)
- Jikan, Kitsu, Shikimori, MangaDex, Animechan, trace.moe
- HTML5 / `hls.js` player via authorized/mock providers

See [docs/STREAMING.md](docs/STREAMING.md) for the full streaming architecture.

## Develop

```bash
# API (terminal 1)
cd server
cp .env.example .env
npm install
npm run dev

# Frontend (terminal 2)
cd ..
cp .env.example .env
# set VITE_STREAMING_API_BASE=http://localhost:3000
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3000/health  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite frontend |
| `npm run dev:server` | Streaming API |
| `npm run build` / `npm run lint` / `npm test` | Frontend |
| `npm run build:server` / `npm run test:server` | Backend |

## Build / deploy

**Frontend (GitHub Pages)**

```bash
npm run build
```

Site: **https://ashiqazydev.github.io/animeazy/**

Set Actions secret `VITE_STREAMING_API_BASE` to your deployed API URL.

**Backend**

Deploy the `server/` package separately (Railway, Render, Fly, etc.). Configure `CORS_ORIGINS` to include your Pages origin. See [server/README.md](server/README.md).

## MangaDex

Credit MangaDex and scanlation groups. No ads or paid access on top of their API.
