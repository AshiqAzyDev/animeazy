import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tools = [
  {
    to: '/tools/trace',
    title: 'Scene Finder',
    desc: 'Upload a screenshot and identify the anime with trace.moe.',
    kanji: '視',
  },
  {
    to: '/tools/subtitles',
    title: 'Subtitles',
    desc: 'Search OpenSubtitles with your own API key.',
    kanji: '字',
  },
  {
    to: '/quotes',
    title: 'Quote Theater',
    desc: 'Pull memorable lines from Animechan.',
    kanji: '言',
  },
  {
    to: '/schedule',
    title: 'Schedule',
    desc: 'Browse the weekly airing timetable.',
    kanji: '週',
  },
];

export function ToolsPage() {
  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1>Tools</h1>
      <p className="sub">Utility suite for discovery — cinematic, useful, free.</p>
      <div className="grid">
        {tools.map((t, i) => (
          <motion.div
            key={t.to}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link to={t.to} className="card">
              <span className="k">{t.kanji}</span>
              <h2>{t.title}</h2>
              <p>{t.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .sub { color:var(--mute); margin: 8px 0 28px; }
        .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap:16px; }
        .card {
          display:block; position:relative; overflow:hidden;
          padding: 28px; border-radius: 24px; min-height: 180px;
          background: linear-gradient(145deg, #1b1535, #2d1648);
          border: 1px solid #ffffff14; transition: transform .3s var(--ease-cinema), border-color .3s;
        }
        .card:hover { transform: translateY(-4px); border-color: var(--cyan); }
        .k {
          position:absolute; right:8%; top:0; font:900 6rem/1 var(--font-jp); color:#fff1;
        }
        .card h2 { position:relative; z-index:1; margin-bottom:8px; }
        .card p { position:relative; z-index:1; color:var(--mute); max-width: 28ch; }
      `}</style>
    </div>
  );
}
