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

  return (
    <div className={`card-wrap ${rank ? 'ranked' : ''} ${wide ? 'is-wide' : ''}`}>
      {rank != null && <span className="rank-num">{rank}</span>}
      <motion.button
        type="button"
        className={`media-card ${wide ? 'wide' : ''}`}
        style={
          {
            '--h': hue,
            transform: tilt.on
              ? `perspective(700px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateY(-6px) scale(1.03)`
              : undefined,
          } as CSSProperties
        }
        onClick={() => nav(href)}
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
          const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
          setTilt({ x, y, on: true });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0, on: false })}
        whileTap={{ scale: 0.98 }}
        layoutId={`poster-${item.id}`}
      >
        {item.image ? (
          <img src={item.image} alt="" className="cover" loading="lazy" />
        ) : (
          <div className="cover fallback" />
        )}
        <span className="badge">AZ</span>
        {item.score != null && <span className="rate">★ {item.score.toFixed(1)}</span>}
        <span className="pl">▶</span>
        {progress != null && (
          <div className="prog">
            <i style={{ width: `${progress}%` }} />
          </div>
        )}
      </motion.button>
      <div className="meta-under">
        <h3>{item.title}</h3>
        <p>
          {[item.year, item.type || item.kind].filter(Boolean).join(' · ')}
          {item.score != null ? ` · ★ ${item.score.toFixed(1)}` : ''}
        </p>
      </div>
      <style>{`
        .card-wrap {
          position: relative; flex: none; scroll-snap-align: start;
          width: clamp(140px, 15vw, 190px);
        }
        .card-wrap.is-wide { width: clamp(240px, 28vw, 340px); }
        .card-wrap.ranked { margin-left: 38px; width: clamp(120px, 13vw, 160px); }
        .rank-num {
          position: absolute; left: -18px; bottom: 42px;
          font: 800 clamp(4.5rem, 8vw, 7rem)/.8 var(--font-display);
          color: transparent; -webkit-text-stroke: 2px rgba(56,232,255,.75);
          z-index: 0; pointer-events: none; letter-spacing: -.08em;
        }
        .media-card {
          width: 100%; aspect-ratio: 2/3; border-radius: 20px;
          position: relative; overflow: hidden; cursor: pointer; display: block; padding: 0;
          background: linear-gradient(160deg, hsl(var(--h) 70% 40%), hsl(calc(var(--h) + 40) 60% 14%));
          border: 1px solid rgba(255,255,255,.08);
          transition: box-shadow .35s var(--ease-cinema);
          transform-style: preserve-3d; will-change: transform; color: #fff;
        }
        .media-card.wide { aspect-ratio: 16/9; border-radius: 18px; }
        .media-card:hover { box-shadow: 0 22px 40px -18px hsl(var(--h) 90% 50% / .55); }
        .cover {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          transition: transform .7s var(--ease-soft);
        }
        .media-card:hover .cover { transform: scale(1.06); }
        .cover.fallback {
          background: linear-gradient(160deg, hsl(var(--h) 70% 40%), hsl(calc(var(--h) + 40) 60% 14%));
        }
        .badge {
          position: absolute; z-index: 2; top: 10px; left: 10px;
          font: 800 .65rem var(--font-display); letter-spacing: .04em;
          padding: 4px 7px; border-radius: 8px;
          background: rgba(0,0,0,.55); backdrop-filter: blur(8px); color: #fff;
        }
        .rate {
          position: absolute; z-index: 2; top: 10px; right: 10px;
          font-size: .72rem; font-weight: 700; padding: 4px 8px; border-radius: 99px;
          background: rgba(0,0,0,.55); backdrop-filter: blur(8px);
        }
        .pl {
          position: absolute; z-index: 2; inset: 0; margin: auto;
          width: 42px; height: 42px; border-radius: 50%;
          background: #fff; color: #111; display: grid; place-items: center;
          opacity: 0; transform: scale(.6); transition: .3s;
          box-shadow: 0 10px 30px #0008;
        }
        .media-card:hover .pl, .media-card:focus-visible .pl { opacity: 1; transform: none; }
        .prog {
          position: absolute; left: 10px; right: 10px; bottom: 10px; height: 4px;
          border-radius: 99px; background: rgba(255,255,255,.2); z-index: 2;
        }
        .prog i { display: block; height: 100%; border-radius: 99px; background: var(--cyan); }
        .meta-under { padding: 10px 4px 0; }
        .meta-under h3 {
          font-size: .92rem; line-height: 1.25; letter-spacing: -.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .meta-under p {
          margin-top: 3px; font-size: .75rem; color: var(--mute);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        @media (hover: none) {
          .pl { opacity: .9; transform: none; width: 34px; height: 34px; top: 12px; right: 12px; inset: auto; margin: 0; }
        }
        @media (max-width: 860px) {
          .card-wrap { width: 132px; }
          .card-wrap.is-wide { width: 78vw; }
          .card-wrap.ranked { width: 112px; }
        }
      `}</style>
    </div>
  );
}
