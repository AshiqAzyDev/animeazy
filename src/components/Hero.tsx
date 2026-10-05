import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MediaCard } from '../types/media';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';
import { prefersReducedMotion } from '../motion/reducedMotion';

const SLIDE_MS = 8000;

function detailPath(d: MediaCard) {
  if (d.id.startsWith('kitsu-') || d.id.startsWith('shiki-')) return `/anime/${d.id}`;
  return `/anime/${d.malId || d.id.replace(/^anime-/, '')}`;
}

function watchPath(d: MediaCard) {
  if (d.id.startsWith('kitsu-') || d.id.startsWith('shiki-')) return `/watch/${d.id}?ep=1`;
  return `/watch/${d.malId || d.id.replace(/^anime-/, '')}?ep=1`;
}

function blurbText(synopsis?: string) {
  if (!synopsis) return 'Trailers, details, and legal watch links — discover without the clutter.';
  const clean = synopsis.replace(/\s+/g, ' ').trim();
  return clean.length > 140 ? `${clean.slice(0, 140).trimEnd()}…` : clean;
}

export function Hero({
  items,
  loading = false,
}: {
  items: MediaCard[];
  loading?: boolean;
}) {
  const slides = items.slice(0, 6);
  const [cur, setCur] = useState(0);
  const nav = useNavigate();
  const { toggle, has } = useMyList();
  const reduce = prefersReducedMotion();

  useEffect(() => {
    if (!slides.length || reduce) return;
    const t = window.setTimeout(() => setCur((c) => (c + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [cur, slides.length, reduce]);

  useEffect(() => {
    setCur(0);
  }, [slides[0]?.id]);

  if (loading || !slides.length) {
    return (
      <section className="hero-shell" aria-busy={loading}>
        <div className="hero-frame is-loading">
          <div className="skeleton hero-skel" />
        </div>
        <div className="hero-thumbs is-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton thumb-skel" />
          ))}
        </div>
      </section>
    );
  }

  const d = slides[cur];
  const bannerSrc = d.banner || d.image;
  const posterSrc = d.image || d.banner;

  return (
    <section className="hero-shell" id="top" aria-roledescription="carousel">
      <div className="hero-frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={d.id}
            className="hero-art"
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {bannerSrc ? (
              <img src={bannerSrc} alt="" className="hero-bg" />
            ) : (
              <div className="art-fallback" style={{ ['--h' as string]: d.hue ?? 300 }} />
            )}
            <div className="hero-wash" />
          </motion.div>
        </AnimatePresence>

        <div className="hero-grid">
          <div className="hero-copy">
            <AnimatePresence mode="wait">
              <motion.div
                key={`c-${d.id}`}
                className="copy-inner"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="eyebrow">ANIMEAZY · Spotlight</p>
                <div className="meta">
                  {d.year && <span>{d.year}</span>}
                  {d.type && <span>{d.type}</span>}
                  {d.genres?.[0] && <span>{d.genres[0]}</span>}
                  {d.score != null && <span className="hot">★ {d.score.toFixed(1)}</span>}
                </div>
                <h1>{d.title}</h1>
                {d.titleJp && <p className="jp">{d.titleJp}</p>}
                <p className="blurb">{blurbText(d.synopsis)}</p>
                <div className="btns">
                  <MagneticButton className="btn primary" onClick={() => nav(watchPath(d))}>
                    ▶ Play
                  </MagneticButton>
                  <MagneticButton className="btn ghost" onClick={() => nav(detailPath(d))}>
                    More info
                  </MagneticButton>
                  <MagneticButton
                    className={`btn ghost icon ${has(d.id) ? 'liked' : ''}`}
                    onClick={() => toggle(d)}
                    aria-label="Toggle My List"
                  >
                    {has(d.id) ? '♥' : '＋'}
                  </MagneticButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`p-${d.id}`}
              className="hero-poster"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {posterSrc ? (
                <img src={posterSrc} alt={d.title} />
              ) : (
                <div className="art-fallback" style={{ ['--h' as string]: d.hue ?? 300 }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="hero-thumbs" role="tablist" aria-label="Featured titles">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === cur}
            className={i === cur ? 'on' : ''}
            onClick={() => setCur(i)}
            title={s.title}
          >
            {s.image ? <img src={s.image} alt="" /> : <span className="thumb-ph" />}
            {i === cur && !reduce && <i className="prog" />}
          </button>
        ))}
      </div>

      <style>{`
        .hero-shell {
          padding: 16px clamp(16px, 3vw, 28px) 8px;
          display: grid;
          gap: 14px;
        }
        .hero-frame {
          position: relative;
          min-height: clamp(380px, 58vh, 560px);
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--bg2);
          box-shadow: var(--shadow);
        }
        .hero-frame.is-loading { min-height: clamp(380px, 58vh, 560px); }
        .hero-skel { position: absolute; inset: 0; border-radius: 0; }

        .hero-art { position: absolute; inset: 0; z-index: 0; }
        .hero-bg {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transform: scale(1.06);
          filter: blur(2px) saturate(1.05);
        }
        .art-fallback {
          width: 100%; height: 100%;
          background: linear-gradient(145deg, hsl(var(--h) 70% 36%), #0a0a0f 70%);
        }
        .hero-wash {
          position: absolute; inset: 0;
          background:
            linear-gradient(90deg, rgba(8,8,12,.96) 0%, rgba(8,8,12,.82) 38%, rgba(8,8,12,.35) 68%, rgba(8,8,12,.55) 100%),
            linear-gradient(180deg, rgba(8,8,12,.55) 0%, transparent 35%, rgba(8,8,12,.75) 100%);
        }

        .hero-grid {
          position: relative;
          z-index: 2;
          min-height: clamp(380px, 58vh, 560px);
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(180px, 280px);
          gap: clamp(16px, 3vw, 36px);
          align-items: center;
          padding: clamp(24px, 4vw, 44px);
        }

        .hero-copy { min-width: 0; }
        .copy-inner { max-width: 560px; }
        .eyebrow {
          font-size: .72rem; letter-spacing: .22em; text-transform: uppercase;
          color: var(--cyan); font-weight: 700; margin-bottom: 12px;
        }
        .hero-copy h1 {
          font-size: clamp(2rem, 5vw, 3.8rem);
          line-height: 1; letter-spacing: -.04em; font-weight: 800;
          text-shadow: 0 12px 40px rgba(0,0,0,.55);
          overflow-wrap: anywhere;
        }
        .jp {
          margin-top: 8px; font-family: var(--font-jp); color: rgba(255,255,255,.72);
          letter-spacing: .08em; font-size: .92rem;
        }
        .blurb {
          margin: 14px 0 22px;
          color: rgba(255,255,255,.82);
          max-width: 48ch;
          font-size: .95rem;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .btns { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .btn.icon.liked {
          background: color-mix(in srgb, var(--pink) 35%, transparent);
          border-color: var(--pink); color: #fff;
        }

        .hero-poster {
          width: min(100%, 280px);
          justify-self: end;
          aspect-ratio: 2/3;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 24px 50px -18px rgba(0,0,0,.75);
          background: #111;
        }
        .hero-poster img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .hero-thumbs {
          display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none;
          padding: 0 2px 2px;
        }
        .hero-thumbs::-webkit-scrollbar { display: none; }
        .hero-thumbs.is-loading .thumb-skel {
          flex: none; width: 64px; height: 64px; border-radius: 16px;
        }
        .hero-thumbs button {
          position: relative; flex: none; width: 64px; height: 64px; border-radius: 16px;
          overflow: hidden; border: 2px solid transparent; opacity: .7;
          transition: .25s var(--ease-cinema); background: #222;
        }
        .hero-thumbs button img, .thumb-ph {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .thumb-ph { background: #333; }
        .hero-thumbs button.on {
          opacity: 1; border-color: #fff;
          box-shadow: 0 8px 20px -10px #000;
        }
        .hero-thumbs .prog {
          position: absolute; left: 8px; right: 8px; bottom: 6px; height: 3px;
          border-radius: 99px; background: rgba(255,255,255,.25); overflow: hidden;
        }
        .hero-thumbs .prog::after {
          content: ''; display: block; height: 100%; width: 0;
          background: #fff; animation: thumbfill ${SLIDE_MS}ms linear forwards;
        }
        @keyframes thumbfill { to { width: 100%; } }

        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr;
            padding: 22px 18px 24px;
            min-height: auto;
          }
          .hero-frame { min-height: 0; }
          .hero-poster {
            width: 150px;
            justify-self: start;
            order: -1;
          }
          .hero-copy h1 { font-size: clamp(1.9rem, 9vw, 2.8rem); }
          .blurb { -webkit-line-clamp: 4; margin-bottom: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-bg { filter: none; transform: none; }
          .hero-thumbs .prog::after { animation: none; width: 100%; }
        }
      `}</style>
    </section>
  );
}
