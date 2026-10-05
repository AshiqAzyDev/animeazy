import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';

function cleanSynopsis(raw?: string): string {
  if (!raw?.trim()) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

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
  const [synOpen, setSynOpen] = useState(false);

  const episodeCount = useMemo(() => {
    const n = data?.episodes && data.episodes > 0 ? data.episodes : 12;
    return Math.min(Math.max(n, 1), 24);
  }, [data?.episodes]);

  const synopsis = useMemo(() => cleanSynopsis(data?.synopsis), [data?.synopsis]);
  const synLong = synopsis.length > 420;
  const synShown = synLong && !synOpen ? `${synopsis.slice(0, 400).trim()}…` : synopsis;
  const watchBase = `/watch/${encodeURIComponent(id)}`;
  const heroImage = data?.banner || data?.image;

  if (isLoading) {
    return (
      <div className="page container" style={{ paddingTop: 28 }}>
        <div className="skeleton" style={{ height: 280, marginBottom: 24, borderRadius: 28 }} />
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
        className="hero-banner"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(180deg, rgba(10,10,15,.25) 0%, rgba(10,10,15,.92) 78%, var(--bg) 100%), url(${heroImage})`
            : undefined,
        }}
      >
        <div className="hero-inner container">
          <motion.div layoutId={`poster-${data.id}`} className="poster">
            {data.image ? (
              <img src={data.image} alt="" />
            ) : (
              <div className="skeleton" style={{ height: '100%' }} />
            )}
          </motion.div>
          <div className="hero-copy">
            <div className="chips">
              {data.score != null && <span className="chip-hot">★ {data.score.toFixed(1)}</span>}
              {data.type && <span>{data.type}</span>}
              {data.year && <span>{data.year}</span>}
              {data.episodes != null && <span>{data.episodes} eps</span>}
              {data.status && <span>{data.status}</span>}
            </div>
            <h1>{data.title}</h1>
            {data.titleJp && <p className="jp">{data.titleJp}</p>}
            <div className="btns">
              <MagneticButton className="btn primary" onClick={() => nav(`${watchBase}?ep=1`)}>
                ▶ Play
              </MagneticButton>
              <MagneticButton className="btn ghost" onClick={() => toggle(data)}>
                {has(data.id) ? '✓ In My List' : '＋ My List'}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container panel">
        {!!data.genres?.length && (
          <div className="genres">
            {data.genres.slice(0, 8).map((g) => (
              <span key={g} className="chip">
                {g}
              </span>
            ))}
          </div>
        )}

        <section className="block">
          <h2>Synopsis</h2>
          <p className="syn">{synShown || 'No synopsis available.'}</p>
          {synLong && (
            <button type="button" className="more" onClick={() => setSynOpen((v) => !v)}>
              {synOpen ? 'Show less' : 'Read more'}
            </button>
          )}
        </section>

        {(data.studios?.length || data.rating || data.duration) && (
          <section className="block facts">
            {!!data.studios?.length && (
              <div>
                <span>Studios</span>
                <strong>{data.studios.join(', ')}</strong>
              </div>
            )}
            {data.rating && (
              <div>
                <span>Rating</span>
                <strong>{data.rating}</strong>
              </div>
            )}
            {data.duration && (
              <div>
                <span>Duration</span>
                <strong>{data.duration}</strong>
              </div>
            )}
          </section>
        )}

        <section className="block">
          <h2>Episodes</h2>
          <p className="note">Open the player for trailers and configured stream sources.</p>
          <div className="eps">
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => nav(`${watchBase}?ep=${n}`)}>
                {n}
              </button>
            ))}
          </div>
        </section>

        {!!data.streaming?.length && (
          <section className="block">
            <h2>Watch legally</h2>
            <div className="links">
              {data.streaming.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="chip">
                  {s.name}
                </a>
              ))}
            </div>
          </section>
        )}

        {!!data.characters?.length && (
          <section className="block">
            <h2>Characters</h2>
            <div className="chars">
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
          </section>
        )}
      </div>

      <style>{`
        .detail { padding-top: 0; }
        .hero-banner {
          min-height: min(52vh, 460px);
          background-color: var(--bg2);
          background-size: cover;
          background-position: center top;
          border-bottom: 1px solid var(--line);
          padding: calc(24px + var(--safe-t)) 0 28px;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: minmax(120px, 200px) minmax(0, 1fr);
          gap: clamp(16px, 3vw, 28px);
          align-items: end;
        }
        .poster {
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 2/3;
          box-shadow: 0 24px 60px #0008;
          background: var(--bg2);
          border: 1px solid var(--line);
          width: 100%;
        }
        .poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-copy { min-width: 0; padding-bottom: 4px; }
        .chips {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;
        }
        .chips span {
          padding: 6px 12px; border-radius: 99px; font-size: .78rem; font-weight: 700;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.1);
        }
        .chip-hot {
          background: color-mix(in srgb, var(--pink) 35%, transparent) !important;
          border-color: color-mix(in srgb, var(--pink) 50%, transparent) !important;
        }
        .hero-copy h1 {
          font-size: clamp(1.6rem, 5vw, 3rem);
          letter-spacing: -.03em;
          line-height: 1.08;
          word-break: break-word;
          margin: 0;
        }
        .jp {
          color: var(--mute);
          margin: 8px 0 0;
          font-family: var(--font-jp);
          font-size: .95rem;
        }
        .btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }

        .panel {
          padding-top: 8px;
          padding-bottom: calc(40px + var(--safe-b));
          max-width: 920px;
        }
        .genres { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 8px; }
        .block { margin-top: 28px; }
        .block h2 {
          font-size: 1.05rem;
          letter-spacing: -.01em;
          margin-bottom: 10px;
        }
        .syn {
          color: color-mix(in srgb, var(--ink) 82%, transparent);
          white-space: pre-wrap;
          line-height: 1.65;
          max-width: 70ch;
          font-size: .95rem;
        }
        .more {
          margin-top: 10px;
          color: var(--cyan);
          font-weight: 700;
          font-size: .88rem;
          padding: 0;
        }
        .note { color: var(--mute); font-size: .85rem; margin-bottom: 12px; }
        .facts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        .facts > div {
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,.04);
          border: 1px solid var(--line);
        }
        .facts span {
          display: block;
          color: var(--mute);
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .facts strong { font-size: .92rem; font-weight: 700; }
        .eps {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
          gap: 8px;
        }
        .eps button {
          padding: 10px 0;
          border-radius: 12px;
          background: rgba(255,255,255,.08);
          font-weight: 700;
          border: 1px solid transparent;
          transition: .2s;
        }
        .eps button:hover {
          background: var(--cyan);
          color: #07050f;
        }
        .links { display: flex; flex-wrap: wrap; gap: 10px; }
        .chars {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }
        .char {
          background: #ffffff0a;
          border-radius: 16px;
          overflow: hidden;
          padding-bottom: 10px;
          border: 1px solid var(--line);
        }
        .char img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
        .char strong, .char span {
          display: block; padding: 6px 10px 0; font-size: .8rem;
        }
        .char span { color: var(--mute); }

        @media (max-width: 860px) {
          .hero-banner {
            min-height: auto;
            padding: calc(12px + var(--safe-t)) 0 20px;
          }
          .hero-inner {
            grid-template-columns: 110px minmax(0, 1fr);
            gap: 14px;
            align-items: center;
          }
          .poster { border-radius: 16px; }
          .hero-copy h1 { font-size: clamp(1.35rem, 6vw, 1.9rem); }
          .btns .btn { padding: 11px 16px; font-size: .9rem; }
          .panel { padding-top: 4px; }
          .block { margin-top: 22px; }
          .syn { font-size: .9rem; }
        }

        @media (max-width: 480px) {
          .hero-inner {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }
          .poster { max-width: 160px; }
          .chips, .btns, .genres { justify-content: center; }
          .hero-copy { width: 100%; }
        }
      `}</style>
    </div>
  );
}
