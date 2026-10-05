import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { quotesByAnime, randomQuote } from '../api/animechan';
import { MagneticButton } from '../motion/MagneticButton';

export function QuotesPage() {
  const [anime, setAnime] = useState('');
  const [query, setQuery] = useState('');

  const random = useQuery({ queryKey: ['quote-random'], queryFn: randomQuote });
  const byAnime = useQuery({
    queryKey: ['quote-anime', query],
    queryFn: () => quotesByAnime(query),
    enabled: query.length > 1,
  });

  const quote = query ? byAnime.data?.[0] : random.data;
  const list = query ? byAnime.data ?? [] : quote ? [quote] : [];

  return (
    <div className="page quotes container" style={{ paddingTop: 28 }}>
      <h1>Quote Theater</h1>
      <p className="sub">Lines that linger — powered by Animechan.</p>
      <div className="row">
        <input
          value={anime}
          onChange={(e) => setAnime(e.target.value)}
          placeholder="Filter by anime name…"
        />
        <MagneticButton
          className="btn primary"
          onClick={() => {
            setQuery(anime.trim());
            if (!anime.trim()) random.refetch();
          }}
        >
          Reveal
        </MagneticButton>
        <MagneticButton
          className="btn ghost"
          onClick={() => {
            setQuery('');
            setAnime('');
            random.refetch();
          }}
        >
          Random
        </MagneticButton>
      </div>

      <div className="stage">
        {(random.isFetching || byAnime.isFetching) && <div className="skeleton" style={{ height: 200 }} />}
        {list.map((q, i) => (
          <motion.blockquote
            key={`${q.content}-${i}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: i * 0.08, duration: 0.55 }}
          >
            <p className="ink">“{q.content}”</p>
            <footer>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                — {q.character}
              </motion.span>
              <span className="anime">{q.anime}</span>
            </footer>
          </motion.blockquote>
        ))}
      </div>

      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .sub { color:var(--mute); margin: 8px 0 24px; }
        .row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 32px; }
        .row input {
          flex:1; min-width:220px; background:#ffffff10; border:1px solid var(--line);
          border-radius:14px; padding:14px 16px; outline:none;
        }
        .stage { display:grid; gap:18px; }
        blockquote {
          position:relative; padding: clamp(28px,5vw,48px);
          border-radius: 28px; background: linear-gradient(135deg, #1a1433, #2a1248);
          overflow:hidden; border: 1px solid #ffffff14;
        }
        blockquote::before {
          content:"言"; position:absolute; right:4%; top:-10%;
          font:900 10rem/1 var(--font-jp); color:#fff1;
        }
        .ink {
          font-size: clamp(1.2rem, 2.8vw, 1.8rem); line-height:1.45; max-width: 40ch;
          position:relative; z-index:1;
        }
        footer {
          margin-top: 22px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;
          color: var(--mute); position:relative; z-index:1;
        }
        .anime {
          padding: 4px 12px; border-radius:99px; background:#ffffff14; color:var(--ink); font-weight:700; font-size:.85rem;
        }
      `}</style>
    </div>
  );
}
