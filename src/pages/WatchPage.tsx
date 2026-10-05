import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { streamingClient } from '../api/streamingClient';
import { getWatchServerOptions, isStreamConfigured } from '../config/streaming';
import { QualitySelector } from '../components/video/QualitySelector';
import { ServerSelector } from '../components/video/ServerSelector';
import { SubtitleSelector } from '../components/video/SubtitleSelector';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';
import { availableQualities } from '../streaming/quality';
import { pickDefaultSubtitle } from '../streaming/normalize';
import type { StreamingResult, SubtitleTrack } from '../streaming/types';
import { StreamingError } from '../streaming/types';
import { myListStore } from '../storage/myList';

const DEFAULT_QUALITIES = ['Auto', '1080p', '720p', '480p'];

export function WatchPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { toggle, has } = useMyList();

  const ep = Math.max(1, Number(params.get('ep') || 1) || 1);
  const servers = useMemo(() => getWatchServerOptions(), []);
  const [serverId, setServerId] = useState(() =>
    servers.some((s) => s.mode === 'provider') ? servers.find((s) => s.mode === 'provider')!.id : 'trailer',
  );
  const [quality, setQuality] = useState('Auto');
  const [subtitleLanguage, setSubtitleLanguage] = useState('');
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => animeCatalog.detail(id),
    enabled: Boolean(id),
    retry: 1,
  });

  const episodeCount = useMemo(() => {
    const n = data?.episodes && data.episodes > 0 ? data.episodes : 12;
    return Math.min(Math.max(n, 1), 48);
  }, [data?.episodes]);

  const server = servers.find((s) => s.id === serverId) || servers[0];
  const isTrailer = server?.mode === 'trailer';
  const canPlayTrailer = Boolean(data?.trailerYoutubeId) && isTrailer;

  const streamQuery = useQuery({
    queryKey: ['stream-sources', id, ep, serverId, data?.title],
    queryFn: async (): Promise<StreamingResult> => {
      try {
        return await streamingClient.getSources(id, ep, data?.title, {
          providerId: serverId,
          allowFallback: false,
        });
      } catch (err) {
        if (err instanceof StreamingError) throw err;
        throw new StreamingError(
          'source_resolution_failed',
          err instanceof Error ? err.message : 'Source resolution failed',
        );
      }
    },
    enabled: Boolean(data && !isTrailer && server?.mode === 'provider'),
    retry: 0,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (streamQuery.data?.subtitles?.length) {
      const def = pickDefaultSubtitle(streamQuery.data.subtitles);
      setSubtitleLanguage(def?.language || '');
      setSubtitleTracks(streamQuery.data.subtitles);
    } else if (!streamQuery.isFetching) {
      setSubtitleTracks([]);
      setSubtitleLanguage('');
    }
  }, [streamQuery.data, streamQuery.isFetching]);

  useEffect(() => {
    if (streamQuery.error) {
      setStreamError(
        streamQuery.error instanceof Error
          ? streamQuery.error.message
          : 'Failed to resolve stream',
      );
    } else {
      setStreamError(null);
    }
  }, [streamQuery.error]);

  const qualities = useMemo(() => {
    if (streamQuery.data?.sources?.length) {
      const fromSources = availableQualities(streamQuery.data.sources);
      return fromSources.length > 1 ? fromSources : DEFAULT_QUALITIES;
    }
    return DEFAULT_QUALITIES;
  }, [streamQuery.data]);

  const setEpisode = (next: number) => {
    const clamped = Math.min(Math.max(1, next), episodeCount);
    setParams({ ep: String(clamped) });
    if (data && has(data.id)) {
      const progress = Math.min(98, Math.round((clamped / episodeCount) * 100));
      myListStore.setProgress(data.id, progress);
    }
  };

  if (isLoading) {
    return (
      <div className="page watch-page">
        <div className="skeleton player-skel" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page empty-state" style={{ paddingTop: 80 }}>
        <h3>Couldn’t open player</h3>
        <Link to="/anime" className="btn ghost" style={{ marginTop: 16, display: 'inline-flex' }}>
          Back to browse
        </Link>
      </div>
    );
  }

  const showProviderPlayer = !isTrailer && server?.mode === 'provider';
  const streamLoading = showProviderPlayer && streamQuery.isFetching;
  const streamReady = showProviderPlayer && Boolean(streamQuery.data) && !streamQuery.isError;

  return (
    <div className="page watch-page">
      <div className="watch-top">
        <button type="button" className="btn ghost back" onClick={() => nav(-1)}>
          ← Back
        </button>
        <div className="watch-title">
          <strong>{data.title}</strong>
          <span>
            Episode {ep}
            {data.type ? ` · ${data.type}` : ''}
          </span>
        </div>
        <div className="watch-actions">
          <MagneticButton className="btn ghost" onClick={() => toggle(data)}>
            {has(data.id) ? '✓ In My List' : '＋ My List'}
          </MagneticButton>
          <MagneticButton className="btn ghost" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? 'Hide list' : 'Episodes'}
          </MagneticButton>
        </div>
      </div>

      <div className={`watch-layout ${sidebarOpen ? '' : 'wide'}`}>
        <section className="player-stage">
          <div className="player-frame">
            {canPlayTrailer ? (
              <iframe
                title={`${data.title} trailer`}
                src={`https://www.youtube.com/embed/${data.trailerYoutubeId}?autoplay=0&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : streamReady ? (
              <VideoPlayer
                result={streamQuery.data!}
                quality={quality}
                subtitleLanguage={subtitleLanguage}
                poster={data.image}
                onSubtitleTracks={setSubtitleTracks}
                onError={setStreamError}
              />
            ) : (
              <div
                className="player-empty"
                style={
                  data.image
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.82)), url(${data.image})`,
                      }
                    : undefined
                }
              >
                <div className="empty-card">
                  <span className="play-mark">{streamLoading ? '…' : '▶'}</span>
                  <h2>
                    {isTrailer
                      ? 'No trailer available'
                      : streamLoading
                        ? 'Resolving stream…'
                        : streamError
                          ? 'Stream unavailable'
                          : 'No provider connected'}
                  </h2>
                  <p>
                    Episode {ep} · {server?.label || 'Server'} · {quality}.
                    {isTrailer
                      ? ' Switch to a provider server when available, or open legal links below.'
                      : streamError
                        ? ` ${streamError}`
                        : ' Enable the demo mock provider or connect an authorized streaming API.'}
                  </p>
                  {data.trailerYoutubeId && !isTrailer && (
                    <MagneticButton className="btn primary" onClick={() => setServerId('trailer')}>
                      Play trailer instead
                    </MagneticButton>
                  )}
                  {streamError && showProviderPlayer && (
                    <MagneticButton className="btn ghost" onClick={() => streamQuery.refetch()}>
                      Retry
                    </MagneticButton>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="player-controls">
            <ServerSelector
              servers={servers.map((s) => ({
                id: s.id,
                label: s.label,
                developmentOnly: s.developmentOnly,
              }))}
              value={serverId}
              onChange={setServerId}
            />
            <QualitySelector
              qualities={qualities}
              value={quality}
              onChange={setQuality}
              disabled={!streamReady}
            />
            <SubtitleSelector
              tracks={subtitleTracks}
              value={subtitleLanguage}
              onChange={setSubtitleLanguage}
            />
            <div className="ep-nav">
              <MagneticButton
                className="btn ghost"
                disabled={ep <= 1}
                onClick={() => setEpisode(ep - 1)}
              >
                ← Prev
              </MagneticButton>
              <MagneticButton
                className="btn primary"
                disabled={ep >= episodeCount}
                onClick={() => setEpisode(ep + 1)}
              >
                Next episode →
              </MagneticButton>
            </div>
          </div>

          <div className="watch-meta">
            <h1>
              {data.title} <small>E{ep}</small>
            </h1>
            <p>{data.synopsis || 'No synopsis available.'}</p>
            {!!data.streaming?.length && (
              <div className="legal">
                <span>Watch legally:</span>
                {data.streaming.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="chip">
                    {s.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {sidebarOpen && (
          <aside className="ep-side">
            <div className="ep-head">
              <h3>Episodes</h3>
              <span>{episodeCount} total</span>
            </div>
            <div className="ep-grid">
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === ep ? 'on' : ''}
                  onClick={() => setEpisode(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="hint">
              {isStreamConfigured()
                ? 'Provider architecture active. Trailer uses YouTube; demo streams use public sample media only.'
                : 'No providers enabled. Set VITE_STREAM_MOCK_ENABLED=true for the demo player, or VITE_STREAMING_API_BASE for an authorized backend.'}
            </p>
          </aside>
        )}
      </div>

      <style>{`
        .watch-page {
          padding: 16px clamp(16px, 3vw, 28px) calc(40px + var(--safe-b));
        }
        .player-skel {
          height: min(70vh, 640px); border-radius: 24px;
        }
        .watch-top {
          display: flex; align-items: center; gap: 14px; margin-bottom: 14px; flex-wrap: wrap;
        }
        .watch-top .back { padding: 10px 14px; }
        .watch-title { flex: 1; min-width: 180px; display: grid; }
        .watch-title strong { font-size: 1.05rem; }
        .watch-title span { color: var(--mute); font-size: .85rem; }
        .watch-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .watch-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 16px;
          align-items: start;
        }
        .watch-layout.wide { grid-template-columns: 1fr; }

        .player-frame {
          position: relative;
          aspect-ratio: 16/9;
          border-radius: 22px;
          overflow: hidden;
          background: #050508;
          border: 1px solid var(--line);
          box-shadow: var(--shadow);
        }
        .player-frame iframe {
          width: 100%; height: 100%; border: 0; display: block;
        }
        .player-empty {
          width: 100%; height: 100%;
          display: grid; place-items: center;
          background: radial-gradient(60% 60% at 70% 30%, #2a1548, #0a0a10 70%);
          background-size: cover; background-position: center;
          padding: 24px;
        }
        .empty-card {
          max-width: 420px; text-align: center;
          background: rgba(10,10,16,.72); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 22px; padding: 28px 22px;
        }
        .play-mark {
          width: 64px; height: 64px; border-radius: 50%;
          display: grid; place-items: center; margin: 0 auto 14px;
          background: #fff; color: #111; font-size: 1.4rem;
        }
        .empty-card h2 { font-size: 1.25rem; margin-bottom: 8px; }
        .empty-card p { color: var(--mute); margin-bottom: 16px; font-size: .92rem; }

        .player-controls {
          margin-top: 14px; display: grid; gap: 12px;
          padding: 16px; border-radius: 18px;
          background: rgba(255,255,255,.04); border: 1px solid var(--line);
        }
        .ctrl-group { display: grid; gap: 8px; }
        .label {
          font-size: .72rem; letter-spacing: .16em; text-transform: uppercase;
          color: var(--mute); font-weight: 700;
        }
        .pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .ep-nav { display: flex; gap: 10px; flex-wrap: wrap; }

        .watch-meta { margin-top: 18px; max-width: 70ch; }
        .watch-meta h1 { font-size: clamp(1.4rem, 3vw, 2rem); letter-spacing: -.02em; }
        .watch-meta h1 small { color: var(--mute); font-size: .7em; margin-left: 8px; }
        .watch-meta p {
          margin-top: 10px; color: var(--mute);
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
        }
        .legal {
          margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        }
        .legal > span { color: var(--mute); font-size: .85rem; font-weight: 700; }

        .ep-side {
          border-radius: 20px; border: 1px solid var(--line);
          background: rgba(255,255,255,.04); padding: 14px;
          position: sticky; top: calc(var(--header-h) + 12px);
        }
        .ep-head {
          display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;
        }
        .ep-head span { color: var(--mute); font-size: .8rem; }
        .ep-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
          max-height: min(58vh, 520px); overflow: auto; padding-right: 2px;
        }
        .ep-grid button {
          padding: 10px 0; border-radius: 12px;
          background: rgba(255,255,255,.06); font-weight: 700;
          border: 1px solid transparent; transition: .2s;
        }
        .ep-grid button:hover { border-color: rgba(255,255,255,.2); }
        .ep-grid button.on {
          background: #fff; color: #111;
        }
        .hint {
          margin-top: 12px; color: var(--mute); font-size: .78rem; line-height: 1.4;
        }

        @media (max-width: 960px) {
          .watch-layout { grid-template-columns: 1fr; }
          .ep-side { position: static; }
          .ep-grid { max-height: none; }
        }
      `}</style>
    </div>
  );
}
