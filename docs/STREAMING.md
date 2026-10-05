# ANIMEAZY Streaming & Data Architecture

## 1. Architecture

```
Frontend (GitHub Pages / Vite)
  → VITE_STREAMING_API_BASE
  → ANIMEAZY server (Hono)
       ├── streaming registry (mock + authorized stub)
       ├── Shikimori service (metadata)
       ├── MangaDex service (manga)
       └── OpenSubtitles service (subtitles)
```

WatchPage never builds provider iframe URLs. Sources are normalized to `StreamingResult` and played with HTML5 + `hls.js`.

## 2. Shikimori

- Base: `https://shikimori.one/api`
- Used: `GET /animes?search=`, `GET /animes?order=`, `GET /animes/:id`
- Headers: `User-Agent` (required)
- Rate limits: 5 rps / 90 rpm
- Server routes: `/api/anime/search`, `/api/anime`, `/api/anime/:id`
- Related/similar: reserved; returns `[]` until a documented endpoint is verified
- Not a video source

## 3. MangaDex

- Base: `https://api.mangadex.org`
- Used: `GET /manga`, `GET /manga/:id?includes[]=…`, `GET /manga/:id/feed`
- Covers: `https://uploads.mangadex.org/covers/{id}/{file}.256.jpg`
- Server routes: `/api/manga/search`, `/api/manga/:id`, `/api/manga/:id/feed`
- Frontend manga pages may still call MangaDex directly; credit MangaDex + groups

## 4. OpenSubtitles

- Base: `https://api.opensubtitles.com/api/v1`
- Used: `GET /subtitles?query=&languages=` with `Api-Key` + `User-Agent`
- Server env: `OPENSUBTITLES_API_KEY` (never `VITE_*` for production)
- Route: `GET /api/subtitles/search`
- Download link (`POST /api/v1/download`): **TODO — verify Stoplight contract before enabling**

## 5. Consumet / authorized streaming

Consumet documents scraped public stream sources. ANIMEAZY does **not** enable live Consumet anime providers.

- Mock provider: public sample HLS/MP4 for E2E testing
- `authorizedStub`: integration boundary; enable only with a licensed partner API
- Adapter helper: `normalizeProviderSources()` / `adaptAuthorizedSources()`

## 6. Streaming API

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/api/streaming/providers` |
| GET | `/api/streaming/anime/:animeId/episodes?provider=&title=` |
| GET | `/api/streaming/anime/:animeId/episode/:n/servers?provider=` |
| GET | `/api/streaming/anime/:animeId/episode/:n/sources?provider=&server=&fallback=` |

## 7. Environment

**Frontend**

- `VITE_STREAMING_API_BASE=http://localhost:3000`

**Backend** (`server/.env`)

- `PORT`, `CORS_ORIGINS`, `MOCK_ENABLED`, `AUTO_FALLBACK`
- `OPENSUBTITLES_API_KEY`, `OPENSUBTITLES_USER_AGENT`
- `SHIKIMORI_USER_AGENT` (+ optional OAuth placeholders)

## 8. Local development

```bash
# terminal 1
cd server && npm install && npm run dev

# terminal 2
npm install && npm run dev
```

Open `http://localhost:5173/#/watch/<animeId>?ep=1` and select **Demo (Mock)**.

## 9. Production

- Frontend: GitHub Pages (`npm run build`)
- Backend: deploy `server/` separately; set CORS to Pages origin
- Set Actions secret `VITE_STREAMING_API_BASE` to the API URL

## 10. Register an authorized provider

1. Implement `StreamingProvider` in `server/src/streaming/providers/myProvider.ts`
2. Map sources with `normalizeProviderSources`
3. Export from `providers/index.ts`
4. Gate with env flag
5. Never put credentials in `VITE_*`

## 11. Troubleshooting

| Symptom | Check |
|---------|--------|
| No providers on Watch | API base + server running + CORS |
| OpenSubtitles 503 | `OPENSUBTITLES_API_KEY` on server |
| Blank stream | Mock enabled; quality fallback; browser HLS support |
| Shikimori 403 | `User-Agent` header |
