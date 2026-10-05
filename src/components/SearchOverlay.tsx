import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { MediaCard } from './MediaCard';
import { staggerContainer, staggerItem } from '../motion/transitions';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const { data = [], isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => animeCatalog.search(debounced),
    enabled: open && debounced.length > 1,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden={!open}
        >
          <button type="button" className="ico" aria-label="Close search" onClick={onClose}>
            ✕
          </button>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anime…"
            aria-label="Search anime"
          />
          <motion.div
            className="res"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            onClick={onClose}
          >
            {isFetching && <p style={{ color: 'var(--mute)' }}>Searching…</p>}
            {!isFetching && debounced.length > 1 && !data.length && (
              <p style={{ color: 'var(--mute)' }}>No matches. Try another title or genre.</p>
            )}
            {data.map((item) => (
              <motion.div key={item.id} variants={staggerItem}>
                <MediaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
          <style>{`
            .search {
              position: fixed; inset: 0; z-index: 60;
              background: rgba(10, 10, 15, 0.9);
              backdrop-filter: blur(24px);
              display: grid; align-content: start;
              padding: calc(var(--header-h) + 28px) clamp(16px, 6vw, 100px) 40px;
            }
            .search .ico { position: absolute; top: calc(18px + var(--safe-t)); right: 22px; }
            .search input {
              width: 100%; background: none; border: 0; border-bottom: 2px solid var(--line);
              color: var(--ink); font: 800 clamp(1.6rem, 5vw, 3.2rem) var(--font-display);
              padding: 10px 0; outline: 0; letter-spacing: -.03em;
            }
            .search input:focus { border-color: var(--pink); }
            .res {
              display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
              gap: 16px; margin-top: 28px; overflow: auto; max-height: 62vh; padding: 10px 4px;
            }
            .res .card-wrap { width: 100% !important; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
