import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { randomQuote } from '../api/animechan';
import { Hero } from '../components/Hero';
import { MediaRow } from '../components/MediaRow';
import { MagneticButton } from '../motion/MagneticButton';
import { SectionReveal } from '../motion/SectionReveal';
import { useMyList } from '../context/MyListContext';
import type { MediaCard } from '../types/media';

const GENRE_CHIPS = [
  { label: 'Trending', id: 0 },
  { label: 'Action', id: 1 },
  { label: 'Adventure', id: 2 },
  { label: 'Comedy', id: 4 },
  { label: 'Drama', id: 8 },
  { label: 'Fantasy', id: 10 },
  { label: 'Romance', id: 22 },
  { label: 'Sci-Fi', id: 24 },
  { label: 'Sports', id: 30 },
];

export function HomePage() {
  const [genre, setGenre] = useState(0);
  const { items: myList } = useMyList();

  const seasonal = useQuery({
    queryKey: ['seasonal'],
    queryFn: animeCatalog.seasonal,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
  const top = useQuery({
    queryKey: ['top'],
    queryFn: () => animeCatalog.top(12),
    staleTime: 1000 * 60 * 10,
    retry: 1,
    // Avoid blasting providers at once — wait until seasonal settles
    enabled: !seasonal.isFetching,
  });
  const upcoming = useQuery({
    queryKey: ['upcoming'],
    queryFn: animeCatalog.upcoming,
    staleTime: 1000 * 60 * 10,
    retry: 1,
    enabled: !top.isFetching && !seasonal.isFetching,
  });
  const genreQ = useQuery({
    queryKey: ['genre', genre],
    queryFn: () =>
      animeCatalog.byGenre(genre, GENRE_CHIPS.find((c) => c.id === genre)?.label),
    enabled: genre > 0,
    retry: 1,
  });
  const quote = useQuery({
    queryKey: ['home-quote'],
    queryFn: randomQuote,
    staleTime: 1000 * 60 * 30,
    retry: 0,
  });

  const heroItems = useMemo(() => {
    const season = seasonal.data ?? [];
    if (season.length) return season.slice(0, 6);
    return (top.data ?? []).slice(0, 6);
  }, [seasonal.data, top.data]);

  const heroLoading = (seasonal.isPending || seasonal.isFetching) && !heroItems.length;
  const trending = genre > 0 ? genreQ.data ?? [] : seasonal.data ?? top.data ?? [];
  const trendingLoading =
    genre > 0
      ? genreQ.isPending || genreQ.isFetching
      : (seasonal.isPending || seasonal.isFetching || top.isPending || top.isFetching) &&
        !trending.length;

  const continueItems = useMemo(() => {
    if (!myList.length) return [] as MediaCard[];
    return myList.slice(0, 8).map((m) => ({
      id: m.id,
      kind: m.kind,
      title: m.title,
      image: m.image,
      score: m.score,
      hue: 320,
      malId: m.kind === 'anime' && /^\d+$/.test(m.id.replace('anime-', ''))
        ? Number(m.id.replace('anime-', ''))
        : undefined,
    }));
  }, [myList]);

  const providerNote =
    !heroLoading &&
    heroItems.length > 0 &&
    heroItems[0]?.id.startsWith('kitsu-')
      ? 'Showing Kitsu data (Jikan unavailable on this network).'
      : !heroLoading &&
          heroItems.length > 0 &&
          heroItems[0]?.id.startsWith('shiki-')
        ? 'Showing Shikimori data (Jikan unavailable on this network).'
        : null;

  return (
    <div className="page home">
      <Hero items={heroItems} loading={heroLoading} />

      <main className="home-main">
        {providerNote && <p className="api-note soft">{providerNote}</p>}

        <div className="chips-row">
          <div className="chips">
            {GENRE_CHIPS.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                className={`chip ${genre === c.id ? 'on' : ''}`}
                onClick={() => setGenre(c.id)}
                whileTap={{ scale: 0.97 }}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
          <Link to="/anime" className="view-all">
            View all →
          </Link>
        </div>

        {!!continueItems.length && (
          <MediaRow
            id="cw"
            title="Continue exploring"
            subtitle="From your list"
            items={continueItems}
            wide
            progressMap={Object.fromEntries(myList.map((m) => [m.id, m.progress || 42]))}
          />
        )}

        <MediaRow
          id="trending"
          title="Trending now"
          subtitle="Seasonal picks"
          items={trending}
          loading={trendingLoading}
        />

        {!trendingLoading && !trending.length && (
          <p className="api-note">
            Couldn’t reach anime providers. Check your network, then refresh.
          </p>
        )}

        <MediaRow
          id="top10"
          title="Top 10"
          items={(top.data ?? []).slice(0, 10)}
          ranked
          loading={(top.isPending || top.isFetching) && !(top.data?.length)}
        />

        <SectionReveal>
          <section className="split">
            <div className="quote-card glass-panel">
              <p className="eyebrow">Quote</p>
              {quote.isLoading ? (
                <div className="skeleton" style={{ height: 88 }} />
              ) : (
                <>
                  <blockquote>
                    “{quote.data?.content || 'Stories stay long after the credits.'}”
                  </blockquote>
                  <footer>
                    <span>{quote.data?.character || 'ANIMEAZY'}</span>
                    <em>{quote.data?.anime || 'Discovery'}</em>
                  </footer>
                </>
              )}
              <Link to="/quotes" className="btn ghost" style={{ marginTop: 18 }}>
                Quote theater
              </Link>
            </div>

            <div className="promo-card">
              <p className="eyebrow">Toolkit</p>
              <h2>Discover more than titles</h2>
              <p>Scene finder, schedules, manga reader, and subtitles — all in one clean desk.</p>
              <div className="promo-actions">
                <Link to="/tools/trace">
                  <MagneticButton className="btn primary">Scene Finder</MagneticButton>
                </Link>
                <Link to="/schedule">
                  <MagneticButton className="btn ghost">Schedule</MagneticButton>
                </Link>
              </div>
              <span className="promo-k" aria-hidden>
                探
              </span>
            </div>
          </section>
        </SectionReveal>

        <MediaRow
          id="new"
          title="Coming soon"
          subtitle="On the horizon"
          items={upcoming.data ?? []}
          wide
          loading={(upcoming.isPending || upcoming.isFetching) && !(upcoming.data?.length)}
        />

        <footer className="site-footer">
          <div className="footer-brand">
            ANIME<span>AZY</span>
          </div>
          <p>
            Explore. Track. Read. · We don’t host video · <Link to="/credits">Credits</Link>
          </p>
        </footer>
      </main>

      <style>{`
        .home-main { position: relative; z-index: 1; padding-top: 18px; }
        .chips-row {
          display: flex; align-items: center; gap: 12px;
          padding: 4px clamp(16px, 3vw, 28px) 10px;
        }
        .chips {
          display: flex; gap: 8px; overflow-x: auto; flex: 1; min-width: 0; scrollbar-width: none;
        }
        .chips::-webkit-scrollbar { display: none; }
        .view-all { flex: none; color: var(--mute); font-weight: 700; font-size: .88rem; white-space: nowrap; }
        .view-all:hover { color: var(--cyan); }
        .api-note {
          color: var(--mute); padding: 0 clamp(16px, 3vw, 28px) 8px; font-size: .9rem;
        }
        .api-note.soft { color: var(--cyan); }
        .split {
          margin: 40px clamp(16px, 3vw, 28px) 8px;
          display: grid; grid-template-columns: 1.1fr 1fr; gap: 16px;
        }
        .eyebrow {
          font-size: .72rem; letter-spacing: .22em; text-transform: uppercase;
          color: var(--cyan); font-weight: 700; margin-bottom: 12px;
        }
        .quote-card, .promo-card {
          padding: clamp(22px, 3vw, 32px); border-radius: 28px;
          position: relative; overflow: hidden; min-height: 240px;
        }
        .quote-card blockquote {
          font: 700 clamp(1.15rem, 2.4vw, 1.55rem)/1.35 var(--font-display);
          letter-spacing: -.02em; max-width: 34ch;
        }
        .quote-card footer {
          margin-top: 16px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; color: var(--mute);
        }
        .quote-card em {
          font-style: normal; padding: 4px 10px; border-radius: 99px;
          background: rgba(255,255,255,.08); color: var(--ink); font-weight: 700; font-size: .8rem;
        }
        .promo-card {
          background: linear-gradient(145deg, #17122e, #2a1548 55%, #ff3d7140);
          border: 1px solid rgba(255,255,255,.1); color: #fff;
        }
        .promo-card h2 {
          font-size: clamp(1.5rem, 3vw, 2.2rem); letter-spacing: -.03em; line-height: 1; margin-bottom: 10px;
        }
        .promo-card > p { color: rgba(255,255,255,.8); max-width: 34ch; margin-bottom: 20px; }
        .promo-actions { display: flex; gap: 10px; flex-wrap: wrap; position: relative; z-index: 1; }
        .promo-card .btn.primary { background: #fff; color: #151022; }
        .promo-k {
          position: absolute; right: 4%; bottom: -18%;
          font: 900 9rem/1 var(--font-jp); color: #fff1; pointer-events: none;
        }
        .site-footer {
          padding: 64px clamp(16px, 3vw, 28px) calc(36px + var(--safe-b));
          color: var(--mute); font-size: .85rem; text-align: center;
        }
        .footer-brand {
          font: 800 1.3rem var(--font-display); color: var(--ink); margin-bottom: 8px; letter-spacing: -.03em;
        }
        .footer-brand span { color: var(--pink); }
        .site-footer a { color: var(--cyan); text-decoration: underline; }
        @media (max-width: 900px) {
          .split { grid-template-columns: 1fr; }
          .view-all { display: none; }
        }
      `}</style>
    </div>
  );
}
