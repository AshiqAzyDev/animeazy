import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { MediaCard as Media } from '../types/media';
import { MediaCard } from './MediaCard';
import { SectionReveal } from '../motion/SectionReveal';
import { prefersReducedMotion } from '../motion/reducedMotion';

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  items: Media[];
  wide?: boolean;
  ranked?: boolean;
  loading?: boolean;
  progressMap?: Record<string, number>;
};

export function MediaRow({
  id,
  title,
  subtitle,
  items,
  wide,
  ranked,
  loading,
  progressMap,
}: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(titleRef, { once: true, margin: '-8% 0px' });
  const reduce = prefersReducedMotion();

  return (
    <SectionReveal>
      <section className={`row ${ranked ? 'top' : ''}`} id={id}>
        <h2 className="section-title" ref={titleRef}>
          <span className="left">
            <span className="title-main">
              {title}
              <motion.i
                className="draw"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: reduce ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            {subtitle && <small>{subtitle}</small>}
          </span>
        </h2>
        <div className="track">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  width: wide ? 280 : 160,
                  height: wide ? 170 : 240,
                  flex: 'none',
                  borderRadius: 20,
                }}
              />
            ))}
          {!loading &&
            items.map((item, i) => (
              <MediaCard
                key={item.id}
                item={item}
                wide={wide}
                rank={ranked ? i + 1 : undefined}
                progress={progressMap?.[item.id]}
              />
            ))}
          {!loading && !items.length && (
            <p style={{ color: 'var(--mute)', padding: '0 28px' }}>Nothing here yet.</p>
          )}
        </div>
        <style>{`
          .row { margin-top: 32px; }
          .section-title .left { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
          .section-title .title-main {
            position: relative; display: inline-block; padding-bottom: 7px;
          }
          .section-title .draw {
            position: absolute; left: 0; bottom: 0; height: 2px; width: 42%;
            max-width: 72px; border-radius: 99px; transform-origin: left;
            background: linear-gradient(90deg, var(--pink), transparent);
            display: block;
          }
          .track {
            display: flex;
            gap: 18px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-inline: clamp(16px, 3vw, 36px);
            padding: 6px clamp(16px, 3vw, 36px) 8px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .top .track {
            gap: 18px;
            padding-top: 8px;
            padding-bottom: 4px;
          }
          .track::-webkit-scrollbar { display: none; }

          @media (max-width: 700px) {
            .row { margin-top: 22px; }
            .track {
              gap: 12px;
              scroll-padding-inline: 14px;
              padding: 4px 14px 6px;
            }
            .top .track { gap: 12px; }
          }
        `}</style>
      </section>
    </SectionReveal>
  );
}
