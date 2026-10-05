import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { mangadex } from '../api/mangadex';
import { MediaCard } from '../components/MediaCard';
import { staggerContainer, staggerItem } from '../motion/transitions';

export function MangaPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const popular = useQuery({ queryKey: ['md-popular'], queryFn: mangadex.popular });
  const search = useQuery({
    queryKey: ['md-search', debounced],
    queryFn: () => mangadex.search(debounced),
    enabled: debounced.length > 1,
  });

  const items = debounced.length > 1 ? search.data ?? [] : popular.data ?? [];
  const loading = debounced.length > 1 ? search.isFetching : popular.isLoading;

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1 className="page-h">Manga</h1>
      <p className="page-sub">
        Powered by MangaDex. Credit scanlation groups. No ads. Read respectfully.
      </p>
      <input
        className="search-input"
        placeholder="Search manga…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <motion.div className="grid" variants={staggerContainer} initial="hidden" animate="show">
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
          ))}
        {!loading &&
          items.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <MediaCard item={item} />
            </motion.div>
          ))}
      </motion.div>
      <style>{`
        .page-h { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .page-sub { color:var(--mute); margin: 8px 0 24px; }
        .search-input {
          width:100%; max-width:520px; margin-bottom:28px;
          background:#ffffff10; border:1px solid var(--line); border-radius:14px;
          padding:14px 16px; outline:none;
        }
        .search-input:focus { border-color: var(--pink); }
        .grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap:18px;
        }
        .grid .card-wrap { width:100% !important; }
      `}</style>
    </div>
  );
}
