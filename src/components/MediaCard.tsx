import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { MediaCard as Media } from '../types/media';
import { isTouchDevice, prefersReducedMotion } from '../motion/reducedMotion';

type Props = {
  item: Media;
  rank?: number;
  wide?: boolean;
  progress?: number;
};

export function MediaCard({ item, rank, wide, progress }: Props) {
  const nav = useNavigate();
  const [tilt, setTilt] = useState({ x: 0, y: 0, on: false });
  const hue = item.hue ?? 280;
  const reduce = prefersReducedMotion() || isTouchDevice();
  const ranked = rank != null;

  const href =
    item.kind === 'manga'
      ? `/manga/${item.id.replace(/^manga-/, '')}`
      : item.id.startsWith('kitsu-') || item.id.startsWith('shiki-')
        ? `/anime/${item.id}`
        : item.malId
          ? `/anime/${item.malId}`
          : item.id.startsWith('anime-')
            ? `/anime/${item.id.replace(/^anime-/, '')}`
            : '/anime';

  const metaBits = [item.year, item.type || item.kind].filter(Boolean);

  return (
    <article className={`card-wrap ${ranked ? 'ranked' : ''} ${wide ? 'is-wide' : ''}`}>
      <motion.button
        type="button"
        className={`media-card ${wide ? 'wide' : ''}`}
        style={
          {
            '--h': hue,
            transform: tilt.on
              ? `perspective(700px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateY(-6px) scale(1.02)`
              : undefined,
          } as CSSProperties
        }
        onClick={() => nav(href)}
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
          const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
          setTilt({ x, y, on: true });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0, on: false })}
        whileTap={{ scale: 0.98 }}
        layoutId={`poster-${item.id}`}
        aria-label={ranked ? `Rank ${rank}: ${item.title}` : item.title}
      >
        {item.image ? (
          <img src={item.image} alt="" className="cover" loading="lazy" />
        ) : (
          <div className="cover fallback" />
        )}
        <span className="shade" aria-hidden />

        {ranked ? (
          <span className="rank-mark">{rank}</span>
        ) : (
          <span className="badge">AZ</span>
        )}

        {item.score != null && <span className="rate">★ {item.score.toFixed(1)}</span>}

        <span className="pl" aria-hidden>
          ▶
        </span>

        {progress != null && (
          <div className="prog">
            <i style={{ width: `${progress}%` }} />
          </div>
        )}
      </motion.button>

      <div className="meta-under">
        <h3 title={item.title}>{item.title}</h3>
        <p>{metaBits.join(' · ') || '—'}</p>
      </div>

      <style>{`
        .card-wrap {
          position: relative;
          flex: none;
          scroll-snap-align: start;
          width: clamp(150px, 14vw, 188px);
          display: grid;
          gap: 10px;
        }
        .card-wrap.is-wide { width: clamp(240px, 28vw, 340px); }
        .card-wrap.ranked { width: clamp(150px, 14vw, 188px); }

        .media-card {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          display: block;
          padding: 0;
          background: linear-gradient(160deg, hsl(var(--h) 70% 40%), hsl(calc(var(--h) + 40) 60% 14%));
          border: 1px solid rgba(255,255,255,.1);
          transition: box-shadow .35s var(--ease-cinema), border-color .25s, transform .25s;
          color: #fff;
        }
        .card-wrap.ranked .media-card {
          border-color: rgba(56, 232, 255, 0.22);
          box-shadow: 0 14px 30px -18px rgba(0, 0, 0, 0.75);
        }
        .media-card.wide { aspect-ratio: 16 / 9; }
        .media-card:hover {
          border-color: rgba(255,255,255,.28);
          box-shadow: 0 22px 40px -18px hsl(var(--h) 90% 50% / .5);
        }

        .cover {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .7s var(--ease-soft);
        }
        .media-card:hover .cover { transform: scale(1.05); }
        .cover.fallback {
          background: linear-gradient(160deg, hsl(var(--h) 70% 40%), hsl(calc(var(--h) + 40) 60% 14%));
        }

        .shade {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 28%),
            linear-gradient(180deg, transparent 62%, rgba(0,0,0,.7) 100%);
        }

        .badge {
          position: absolute; z-index: 2; top: 10px; left: 10px;
          font: 800 .65rem var(--font-display); letter-spacing: .04em;
          padding: 4px 7px; border-radius: 8px;
          background: rgba(0,0,0,.55); backdrop-filter: blur(8px);
        }

        .rank-mark {
          position: absolute; z-index: 2;
          top: 0; left: 0;
          min-width: 36px; height: 36px;
          padding: 0 10px;
          display: grid; place-items: center;
          font: 800 1rem var(--font-display);
          letter-spacing: -.03em;
          color: #071018;
          background: linear-gradient(135deg, var(--cyan), #7af0ff);
          border-bottom-right-radius: 14px;
          box-shadow: 0 8px 18px rgba(0,0,0,.35);
        }

        .rate {
          position: absolute; z-index: 2; top: 10px; right: 10px;
          font-size: .72rem; font-weight: 700;
          padding: 4px 8px; border-radius: 99px;
          background: rgba(0,0,0,.55); backdrop-filter: blur(8px);
        }

        .pl {
          position: absolute; z-index: 2; inset: 0; margin: auto;
          width: 44px; height: 44px; border-radius: 50%;
          background: #fff; color: #111; display: grid; place-items: center;
          opacity: 0; transform: scale(.6); transition: .3s;
          box-shadow: 0 10px 30px #0008;
        }
        .media-card:hover .pl,
        .media-card:focus-visible .pl { opacity: 1; transform: none; }

        .prog {
          position: absolute; left: 10px; right: 10px; bottom: 10px; height: 4px;
          border-radius: 99px; background: rgba(255,255,255,.2); z-index: 2;
        }
        .prog i {
          display: block; height: 100%; border-radius: 99px; background: var(--cyan);
        }

        .meta-under { min-width: 0; padding: 0 2px; }
        .meta-under h3 {
          margin: 0;
          font-size: .92rem;
          line-height: 1.28;
          letter-spacing: -.015em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .meta-under p {
          margin: 5px 0 0;
          font-size: .74rem;
          color: var(--mute);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (hover: none) {
          .pl {
            opacity: .95; transform: none;
            width: 34px; height: 34px;
            top: auto; bottom: 10px; right: 10px; left: auto; inset: auto; margin: 0;
            font-size: .8rem;
          }
        }

        @media (max-width: 1100px) {
          .card-wrap,
          .card-wrap.ranked { width: clamp(140px, 17vw, 168px); }
        }

        @media (max-width: 700px) {
          .card-wrap,
          .card-wrap.ranked { width: 132px; gap: 8px; }
          .card-wrap.is-wide { width: min(78vw, 300px); }
          .rank-mark { min-width: 32px; height: 32px; font-size: .9rem; border-bottom-right-radius: 12px; }
          .meta-under h3 { font-size: .86rem; }
          .rate { font-size: .68rem; padding: 3px 7px; }
        }
      `}</style>
    </article>
  );
}
