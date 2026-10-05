import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { MediaCard } from '../components/MediaCard';
import { staggerContainer, staggerItem } from '../motion/transitions';

export function AnimeDbPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [order, setOrder] = useState('score');
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['anime-db', q, type, status, order, page],
    queryFn: () =>
      animeCatalog.animeDb(
        {
          q: q || undefined,
          type: type || undefined,
          status: status || undefined,
          order_by: order,
          sort: 'desc',
        },
        page,
      ),
  });

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1 className="page-h">Anime Database</h1>
      <p className="page-sub">Filter the catalog. Explore. Track what matters.</p>
      <div className="filters">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search titles…"
        />
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="">All types</option>
          <option value="tv">TV</option>
          <option value="movie">Movie</option>
          <option value="ova">OVA</option>
          <option value="ona">ONA</option>
          <option value="special">Special</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">Any status</option>
          <option value="airing">Airing</option>
          <option value="complete">Complete</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="score">Score</option>
          <option value="popularity">Popularity</option>
          <option value="start_date">Start date</option>
          <option value="title">Title</option>
        </select>
      </div>

      {isError && <p className="page-sub">Couldn’t load results. Wait a few seconds and retry.</p>}

      <motion.div className="grid" variants={staggerContainer} initial="hidden" animate="show">
        {isFetching &&
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
          ))}
        {!isFetching &&
          data?.items.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <MediaCard item={item} />
            </motion.div>
          ))}
      </motion.div>

      <div className="pager">
        <button type="button" className="btn ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          className="btn ghost"
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <style>{`
        .page-h { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .page-sub { color:var(--mute); margin: 8px 0 24px; }
        .filters {
          display:grid; grid-template-columns: 2fr repeat(3,1fr); gap:10px; margin-bottom: 28px;
        }
        .filters input, .filters select {
          background: #ffffff10; border:1px solid var(--line); border-radius: 14px;
          padding: 12px 14px; outline: none;
        }
        .filters input:focus, .filters select:focus { border-color: var(--cyan); }
        .grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap:18px;
        }
        .grid .card-wrap { width: 100% !important; }
        .pager {
          display:flex; justify-content:center; align-items:center; gap:16px; margin: 36px 0;
        }
        @media (max-width:860px) {
          .filters { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
