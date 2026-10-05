import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMyList } from '../context/MyListContext';
import { hasAuth0Config } from '../auth/AuthProvider';
import { staggerContainer, staggerItem } from '../motion/transitions';

export function MyListPage() {
  const { items, remove } = useMyList();

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1>My List</h1>
      <p className="sub">
        Saved locally in your browser
        {hasAuth0Config() ? ' and keyed to your Auth0 account when signed in' : ''}.
      </p>

      {!items.length && (
        <div className="empty-state">
          <motion.div
            animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ fontSize: '3rem', marginBottom: 12 }}
          >
            ♥
          </motion.div>
          <h3>Your shelf is empty</h3>
          <p>Add titles from Home, Database, or Manga.</p>
          <Link to="/" className="btn primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Explore
          </Link>
        </div>
      )}

      <motion.div className="grid" variants={staggerContainer} initial="hidden" animate="show">
        {items.map((item) => {
          const href =
            item.kind === 'manga'
              ? `/manga/${item.id.replace(/^manga-/, '')}`
              : item.id.startsWith('anime-')
                ? `/anime/${item.id.replace(/^anime-/, '')}`
                : '/anime';
          return (
            <motion.article key={item.id} variants={staggerItem} className="tile">
              <Link to={href}>
                {item.image ? <img src={item.image} alt="" /> : <div className="ph" />}
              </Link>
              <div>
                <h3>{item.title}</h3>
                {item.score != null && <span>★ {item.score.toFixed(1)}</span>}
                <button type="button" className="btn ghost" onClick={() => remove(item.id)}>
                  Remove
                </button>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .sub { color:var(--mute); margin: 8px 0 24px; }
        .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap:16px; }
        .tile {
          display:grid; grid-template-columns: 90px 1fr; gap:12px;
          background:#ffffff0a; border:1px solid var(--line); border-radius:18px; overflow:hidden; padding:10px;
        }
        .tile img, .ph { width:90px; aspect-ratio:2/3; object-fit:cover; border-radius:12px; background:var(--bg2); }
        .tile h3 { font-size:1rem; margin-bottom:6px; }
        .tile span { color:var(--mute); font-size:.85rem; display:block; margin-bottom:10px; }
      `}</style>
    </div>
  );
}
