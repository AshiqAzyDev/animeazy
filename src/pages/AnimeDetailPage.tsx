import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';

export function AnimeDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => animeCatalog.detail(id),
    enabled: Boolean(id),
    retry: 1,
  });
  const { toggle, has } = useMyList();
  const episodeCount = useMemo(() => {
    const n = data?.episodes && data.episodes > 0 ? data.episodes : 12;
    return Math.min(Math.max(n, 1), 24);
  }, [data?.episodes]);
  const watchBase = `/watch/${encodeURIComponent(id)}`;

  if (isLoading) {
    return (
      <div className="page container" style={{ paddingTop: 28 }}>
        <div className="skeleton" style={{ height: 360, marginBottom: 24, borderRadius: 28 }} />
        <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page empty-state" style={{ paddingTop: 80 }}>
        <h3>Couldn’t load this title</h3>
        <p>Providers may be blocked or rate-limited. Try another title from Browse.</p>
        <Link to="/anime" className="btn ghost" style={{ marginTop: 16, display: 'inline-flex' }}>
          Back to database
        </Link>
      </div>
    );
  }

  return (
    <div className="page detail">
      <div
        className="banner"
        style={{
          backgroundImage: data.image
            ? `linear-gradient(180deg, transparent, var(--bg)), url(${data.image})`
            : undefined,
        }}
      />
      <div className="container body">
        <motion.div layoutId={`poster-${data.id}`} className="poster">
          {data.image ? (
            <img src={data.image} alt="" />
          ) : (
            <div className="skeleton" style={{ height: '100%' }} />
          )}
        </motion.div>
        <div className="info">
          <div className="meta">
            {data.score != null && <span className="hot">★ {data.score.toFixed(1)}</span>}
            {data.type && <span>{data.type}</span>}
            {data.year && <span>{data.year}</span>}
            {data.episodes != null && <span>{data.episodes} eps</span>}
            {data.status && <span>{data.status}</span>}
          </div>
          <h1>{data.title}</h1>
          {data.titleJp && <p className="jp">{data.titleJp}</p>}
          <p className="syn">{data.synopsis || 'No synopsis available.'}</p>
          <div className="btns">
            <MagneticButton className="btn primary" onClick={() => nav(`${watchBase}?ep=1`)}>
              ▶ Play S1 E1
            </MagneticButton>
            {data.trailerYoutubeId && (
              <MagneticButton
                className="btn ghost"
                onClick={() => nav(`${watchBase}?ep=1`)}
              >
                Open player
              </MagneticButton>
            )}
            <MagneticButton className="btn ghost" onClick={() => toggle(data)}>
              {has(data.id) ? '✓ In My List' : '＋ My List'}
            </MagneticButton>
          </div>

          <div className="eps-block">
            <h3>Episodes</h3>
            <p className="eps-note">Player UI preview — trailer when available; no pirate streams.</p>
            <div className="eps">
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => nav(`${watchBase}?ep=${n}`)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {!!data.streaming?.length && (
            <div className="watch">
              <h3>Watch legally</h3>
              <div className="links">
                {data.streaming.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="chip">
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          {!!data.characters?.length && (
            <div className="chars">
              <h3>Characters</h3>
              <div className="grid">
                {data.characters.map((c) => (
                  <div key={c.id} className="char">
                    {c.image ? (
                      <img src={c.image} alt="" />
                    ) : (
                      <div className="skeleton" style={{ aspectRatio: '1' }} />
                    )}
                    <strong>{c.name}</strong>
                    <span>{c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .detail { padding-top: 0; }
        .banner {
          height: min(48vh, 420px);
          margin: 16px clamp(16px, 3vw, 28px) 0;
          border-radius: 28px;
          background-size: cover; background-position: center top;
          background-color: var(--bg2);
          border: 1px solid var(--line);
        }
        .body {
          display:grid; grid-template-columns: minmax(160px,220px) 1fr; gap:28px;
          margin-top:-100px; position:relative; z-index:2;
        }
        .poster {
          border-radius: 22px; overflow:hidden; aspect-ratio:2/3;
          box-shadow: 0 24px 60px #0008; background: var(--bg2);
          border: 1px solid var(--line);
        }
        .poster img { width:100%; height:100%; object-fit:cover; }
        .info h1 { font-size: clamp(1.8rem,4vw,3rem); letter-spacing:-.03em; line-height:1.05; }
        .jp { color:var(--mute); margin:6px 0 14px; font-family: var(--font-jp); }
        .syn { color: color-mix(in srgb, var(--ink) 80%, transparent); max-width: 70ch; }
        .btns { display:flex; gap:12px; flex-wrap:wrap; margin: 22px 0; }
        .eps-block, .watch, .chars { margin-top: 28px; }
        .eps-block h3, .watch h3, .chars h3 { margin-bottom: 10px; }
        .eps-note { color: var(--mute); font-size: .85rem; margin-bottom: 12px; }
        .eps {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 8px;
        }
        .eps button {
          padding: 10px 0; border-radius: 12px; background: rgba(255,255,255,.08);
          font-weight: 700; border: 1px solid transparent; transition: .2s;
        }
        .eps button:hover {
          background: var(--cyan); color: #07050f;
        }
        .links { display:flex; flex-wrap:wrap; gap:10px; }
        .chars .grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap:12px;
        }
        .char { background: #ffffff0a; border-radius: 16px; overflow:hidden; padding-bottom:10px; }
        .char img { width:100%; aspect-ratio:1; object-fit:cover; }
        .char strong, .char span { display:block; padding: 6px 10px 0; font-size:.82rem; }
        .char span { color:var(--mute); }
        @media (max-width:860px) {
          .body { grid-template-columns: 1fr; }
          .poster { max-width: 220px; }
        }
      `}</style>
    </div>
  );
}
