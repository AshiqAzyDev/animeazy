import { Link } from 'react-router-dom';

export function CreditsPage() {
  return (
    <div className="page container" style={{ paddingTop: 28, maxWidth: 820 }}>
      <h1>Credits & Disclaimer</h1>
      <p className="lead">
        ANIMEAZY is a free discovery hub. We do <strong>not</strong> host or stream anime video files.
      </p>

      <section>
        <h2>Data sources</h2>
        <ul>
          <li>
            <a href="https://docs.api.jikan.moe/" target="_blank" rel="noreferrer">
              Jikan
            </a>{' '}
            — unofficial MyAnimeList API
          </li>
          <li>
            <a href="https://kitsu.io/api/edge" target="_blank" rel="noreferrer">
              Kitsu
            </a>
          </li>
          <li>
            <a href="https://shikimori.one/api/doc" target="_blank" rel="noreferrer">
              Shikimori
            </a>
          </li>
          <li>
            <a href="https://api.mangadex.org/docs/" target="_blank" rel="noreferrer">
              MangaDex
            </a>{' '}
            — manga catalog & chapter images (credit groups; honor removal requests; no ads)
          </li>
          <li>
            <a href="https://soruly.github.io/trace.moe-api/#/" target="_blank" rel="noreferrer">
              trace.moe
            </a>
          </li>
          <li>
            <a
              href="https://opensubtitles.stoplight.io/docs/opensubtitles-api/e3750fd63a100-getting-started"
              target="_blank"
              rel="noreferrer"
            >
              OpenSubtitles
            </a>{' '}
            — user-supplied API key
          </li>
          <li>
            <a href="https://animechan.io/docs" target="_blank" rel="noreferrer">
              Animechan
            </a>{' '}
            — quotes
          </li>
        </ul>
      </section>

      <section>
        <h2>Tools</h2>
        <p>
          <Link to="/tools/trace">Scene Finder</Link> · <Link to="/tools/subtitles">Subtitles</Link>
        </p>
      </section>

      <section>
        <h2>Auth</h2>
        <p>
          Optional Auth0 login recognizes you without storing passwords on this site. My List is kept in
          browser localStorage.
        </p>
      </section>

      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.2rem); letter-spacing:-.03em; }
        .lead { color:var(--mute); margin: 12px 0 28px; }
        section { margin-bottom: 28px; }
        h2 { margin-bottom: 10px; }
        ul { padding-left: 1.2rem; display:grid; gap:8px; color:var(--mute); }
        a { color: var(--cyan); text-decoration: underline; }
      `}</style>
    </div>
  );
}
