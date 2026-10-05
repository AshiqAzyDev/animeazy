import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Particles } from '../motion/Particles';
import { prefersReducedMotion } from '../motion/reducedMotion';
import { useGsapKanji } from '../motion/useGsapKanji';

export function Intro({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  const reduce = prefersReducedMotion();
  const kanjiRef = useRef<HTMLDivElement>(null);
  useGsapKanji(kanjiRef, !done && !reduce);

  useEffect(() => {
    const t = window.setTimeout(() => finish(), reduce ? 400 : 3200);
    return () => clearTimeout(t);
  }, [reduce]);

  const finish = () => {
    setDone(true);
    window.setTimeout(onDone, reduce ? 100 : 900);
  };

  return (
    <div className={`intro ${done ? 'done' : ''}`} aria-label="ANIMEAZY intro">
      <Particles active={!done && !reduce} />
      <div className="kanji" ref={kanjiRef}>アニメ</div>
      <div className="slash" />
      <div className="flash" />
      <div className="logo" aria-label="ANIMEAZY">
        {'ANIMEAZY'.split('').map((c, i) => (
          <motion.span
            key={i}
            style={{ ['--i' as string]: i }}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: '60%', skewY: 10 }}
            animate={{ opacity: 1, y: 0, skewY: 0 }}
            transition={{ delay: 0.7 + i * 0.07, duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {c}
          </motion.span>
        ))}
      </div>
      <div className="tag">EXPLORE. TRACK. READ.</div>
      <div className="bar">
        <i />
      </div>
      <button type="button" id="skip" onClick={finish}>
        Skip intro
      </button>
      <style>{`
        .intro {
          position:fixed; inset:0; z-index:100; background:#07050f;
          display:grid; place-items:center; overflow:hidden;
          transition: clip-path 1s cubic-bezier(.77,0,.18,1);
          clip-path: inset(0 0 0 0);
        }
        .intro.done { clip-path: inset(0 0 100% 0); pointer-events:none; }
        .kanji {
          position:absolute; font:900 min(70vw,60vh) var(--font-jp);
          color:transparent; -webkit-text-stroke:1px #ffffff14;
        }
        .slash {
          position:absolute; left:-10%; width:120%; height:3px; top:50%;
          background: linear-gradient(90deg,transparent,var(--pink),var(--cyan),transparent);
          transform: rotate(-14deg) scaleX(0);
          animation: slash .7s .3s cubic-bezier(.2,.9,.2,1) forwards;
          box-shadow: 0 0 40px var(--pink);
        }
        @keyframes slash { to { transform: rotate(-14deg) scaleX(1); } }
        .flash {
          position:absolute; inset:0; background: #fff;
          opacity:0; animation: flash .35s .55s ease-out forwards; pointer-events:none;
        }
        @keyframes flash { 0%{opacity:.18} 100%{opacity:0} }
        .logo {
          position:relative; font-weight:800; font-size:clamp(2.4rem,11vw,7rem);
          letter-spacing:-.03em; display:flex; color:#fff; z-index:2;
        }
        .logo span:nth-child(n+6) { color: var(--pink); }
        .tag {
          position:absolute; bottom:22vh; color:var(--mute); letter-spacing:.3em;
          font-size:.8rem; opacity:0; animation: fadein .8s 1.6s forwards; z-index:2;
        }
        @keyframes fadein { to { opacity:1; } }
        .bar {
          position:absolute; bottom:calc(10vh + var(--safe-b));
          width:min(260px,60vw); height:3px; background:#ffffff1c; border-radius:9px; overflow:hidden; z-index:2;
        }
        .bar i {
          display:block; height:100%; width:0;
          background: linear-gradient(90deg,var(--pink),var(--cyan));
          animation: load 2.1s .4s ease-in-out forwards;
        }
        @keyframes load { to { width:100%; } }
        #skip {
          position:absolute; top:calc(16px + var(--safe-t)); right:16px;
          color:var(--mute); font-size:.85rem; padding:8px 12px; z-index:3;
        }
      `}</style>
    </div>
  );
}
