import { motion } from 'framer-motion';
import { useState } from 'react';
import { searchByImageFile, searchByUrl } from '../api/tracemoe';
import type { TraceResult } from '../types/media';
import { MagneticButton } from '../motion/MagneticButton';

export function TracePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<TraceResult[]>([]);

  const runFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      setResults(await searchByImageFile(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      setResults(await searchByUrl(url.trim()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1>Scene Finder</h1>
      <p className="sub">Drop a screenshot — trace.moe finds the episode.</p>

      <motion.label
        className="drop"
        animate={loading ? { boxShadow: ['0 0 0 0 #38e8ff55', '0 0 0 18px #38e8ff00'] } : {}}
        transition={{ repeat: loading ? Infinity : 0, duration: 1.2 }}
      >
        <input type="file" accept="image/*" hidden onChange={(e) => runFile(e.target.files?.[0])} />
        <span>Upload image</span>
        <small>PNG, JPG, WEBP</small>
      </motion.label>

      <div className="row">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Or paste image URL…" />
        <MagneticButton className="btn primary" onClick={runUrl}>
          Search URL
        </MagneticButton>
      </div>

      {error && <p className="err">{error}</p>}

      <div className="results">
        {results.map((r, i) => (
          <motion.article
            key={`${r.filename}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <img src={r.image} alt="" />
            <div>
              <strong>{r.filename}</strong>
              <p>
                Episode {r.episode ?? '?'} · {(r.similarity * 100).toFixed(1)}% match
              </p>
              <div className="bar">
                <i style={{ width: `${Math.min(100, r.similarity * 100)}%` }} />
              </div>
              {r.video && (
                <a href={r.video} target="_blank" rel="noreferrer" className="btn ghost" style={{ marginTop: 10 }}>
                  Preview clip
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .sub { color:var(--mute); margin: 8px 0 24px; }
        .drop {
          display:grid; place-items:center; gap:6px; min-height:180px; border-radius:28px;
          border: 1px dashed #ffffff33; background: #ffffff08; cursor:pointer; margin-bottom:18px;
          transition: .3s;
        }
        .drop:hover { border-color: var(--cyan); background:#38e8ff10; }
        .drop small { color:var(--mute); }
        .row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 24px; }
        .row input {
          flex:1; min-width:220px; background:#ffffff10; border:1px solid var(--line);
          border-radius:14px; padding:14px 16px; outline:none;
        }
        .err { color: var(--pink); margin-bottom: 16px; }
        .results { display:grid; gap:14px; }
        article {
          display:grid; grid-template-columns: 160px 1fr; gap:16px;
          background: var(--bg2); border-radius: 20px; overflow:hidden; border:1px solid var(--line);
        }
        article img { width:100%; height:100%; object-fit:cover; min-height:120px; }
        article > div { padding: 14px 14px 14px 0; }
        .bar { height:6px; border-radius:99px; background:#ffffff14; overflow:hidden; margin-top:8px; }
        .bar i { display:block; height:100%; background: linear-gradient(90deg,var(--pink),var(--cyan)); }
        @media (max-width:860px) { article { grid-template-columns: 1fr; } article > div { padding:14px; } }
      `}</style>
    </div>
  );
}
