import { useState } from 'react';
import {
  getOpenSubtitlesKey,
  hasProjectOpenSubtitlesKey,
  searchSubtitles,
  setOpenSubtitlesKey,
} from '../api/opensubtitles';
import { subtitleClient } from '../api/subtitleClient';
import { isStreamConfigured } from '../config/streaming';
import type { SubtitleItem } from '../types/media';
import { MagneticButton } from '../motion/MagneticButton';
import { useToast } from '../context/ToastContext';

export function SubtitlesPage() {
  const useBackend = isStreamConfigured();
  const projectKey = hasProjectOpenSubtitlesKey();
  const [key, setKey] = useState(getOpenSubtitlesKey());
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SubtitleItem[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const saveKey = () => {
    setOpenSubtitlesKey(key);
    toast('OpenSubtitles key saved in this browser');
  };

  const search = async () => {
    setLoading(true);
    setError('');
    try {
      if (useBackend) {
        const tracks = await subtitleClient.search({ query: q, languages: 'en' });
        setItems(
          tracks.map((t, i) => ({
            id: `${t.language}-${i}`,
            release: t.label || t.language,
            language: t.language,
            downloads: 0,
            hearingImpaired: t.kind === 'captions',
            url: t.url,
          })),
        );
      } else {
        setItems(await searchSubtitles(q));
      }
    } catch (e) {
      setError((e as Error).message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1>Subtitles</h1>
      <p className="sub">
        Powered by OpenSubtitles.
        {useBackend
          ? ' Searching through the ANIMEAZY API (server-side key).'
          : projectKey
            ? ' Project API key is loaded from `.env` (prefer server OPENSUBTITLES_API_KEY).'
            : ' Start the streaming API or add a browser key below.'}
      </p>

      {useBackend ? (
        <p className="ok">✓ Using streaming API for subtitle search</p>
      ) : projectKey ? (
        <p className="ok">✓ Using project key from environment</p>
      ) : (
        <div className="panel">
          <label>
            API key
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="OpenSubtitles API key"
            />
          </label>
          <MagneticButton className="btn ghost" onClick={saveKey}>
            Save key
          </MagneticButton>
        </div>
      )}

      <div className="row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Anime title…" />
        <MagneticButton className="btn primary" onClick={search} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </MagneticButton>
      </div>

      {error && <p className="err">{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.release}</strong>
              <span>
                {item.language.toUpperCase()}
                {item.downloads ? ` · ${item.downloads} downloads` : ''}
                {item.hearingImpaired ? ' · HI' : ''}
              </span>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className="btn ghost">
                Open
              </a>
            )}
          </li>
        ))}
      </ul>

      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; }
        .sub { color:var(--mute); margin: 8px 0 16px; max-width: 60ch; }
        .ok { color: #5dffa0; font-weight: 700; margin-bottom: 18px; font-size: .9rem; }
        .panel, .row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 18px; align-items:end; }
        label { display:grid; gap:6px; flex:1; min-width:240px; font-size:.85rem; color:var(--mute); }
        input {
          background:#ffffff10; border:1px solid var(--line); border-radius:14px;
          padding:14px 16px; outline:none; color:var(--ink); width:100%;
        }
        .err { color: var(--pink); }
        ul { list-style:none; display:grid; gap:10px; }
        li {
          display:flex; justify-content:space-between; gap:12px; align-items:center;
          padding:14px 16px; border-radius:16px; background:#ffffff0a; border:1px solid var(--line);
        }
        li span { display:block; color:var(--mute); font-size:.85rem; margin-top:4px; }
      `}</style>
    </div>
  );
}
