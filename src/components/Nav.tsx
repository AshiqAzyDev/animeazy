import { useAuth0 } from '@auth0/auth0-react';
import { NavLink } from 'react-router-dom';
import { hasAuth0Config } from '../auth/AuthProvider';

type Props = {
  onSearch: () => void;
};

function AuthControls() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();
  if (isLoading) {
    return (
      <div className="profile">
        <div className="av">
          <b>…</b>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <button type="button" className="btn ghost signin" onClick={() => loginWithRedirect()}>
        Sign in
      </button>
    );
  }
  return (
    <button
      type="button"
      className="profile"
      title="Sign out"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      <div className="av online">
        {user?.picture ? (
          <img src={user.picture} alt="" />
        ) : (
          <b>{(user?.name || 'AZ').slice(0, 2).toUpperCase()}</b>
        )}
      </div>
      <div className="profile-meta hide-mobile">
        <strong>{user?.name?.split(' ')[0] || 'Member'}</strong>
        <span>Online</span>
      </div>
    </button>
  );
}

function GuestAvatar() {
  return (
    <div className="profile" title="Configure Auth0 to enable sign-in">
      <div className="av">
        <b>AZ</b>
      </div>
      <div className="profile-meta hide-mobile">
        <strong>Guest</strong>
        <span>Local list</span>
      </div>
    </div>
  );
}

export function Nav({ onSearch }: Props) {
  return (
    <header className="topbar">
      <nav className="links" aria-label="Sections">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/anime">Browse</NavLink>
        <NavLink to="/manga">Manga</NavLink>
        <NavLink to="/schedule" className="hide-sm">
          Schedule
        </NavLink>
        <NavLink to="/tools" className="hide-sm">
          Tools
        </NavLink>
      </nav>

      <button type="button" className="search-pill" onClick={onSearch} aria-label="Search anime">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="8" cy="8" r="5.5" />
          <path d="m12.5 12.5 4 4" />
        </svg>
        <span>Search anime, manga…</span>
        <kbd className="hide-mobile">/</kbd>
      </button>

      <div className="actions">{hasAuth0Config() ? <AuthControls /> : <GuestAvatar />}</div>

      <style>{`
        .topbar {
          position: sticky;
          top: 0;
          z-index: 35;
          height: var(--header-h);
          display: grid;
          grid-template-columns: auto minmax(140px, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 0 clamp(16px, 3vw, 28px);
          background: rgba(10, 10, 15, 0.82);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
        }
        .links {
          display: flex; align-items: center; gap: 2px; min-width: 0;
        }
        .links a {
          color: var(--mute); padding: 8px 12px; border-radius: 99px;
          font-weight: 600; font-size: .9rem; transition: .2s; white-space: nowrap;
        }
        .links a:hover, .links a.active {
          color: var(--ink); background: rgba(255,255,255,.08);
        }
        .search-pill {
          display: flex; align-items: center; gap: 10px; width: 100%;
          min-width: 0; padding: 11px 16px; border-radius: 99px;
          background: rgba(255,255,255,.06);
          border: 1px solid var(--line);
          color: var(--mute); transition: .25s;
        }
        .search-pill:hover { background: rgba(255,255,255,.1); color: var(--ink); }
        .search-pill span {
          flex: 1; text-align: left; font-size: .9rem;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .search-pill kbd {
          font: 600 .72rem var(--font-body);
          padding: 3px 7px; border-radius: 8px;
          background: rgba(255,255,255,.08); border: 1px solid var(--line);
        }
        .actions { display: flex; align-items: center; justify-content: flex-end; }
        .signin { padding: 10px 16px; }
        .profile {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 12px 4px 4px; border-radius: 99px;
          background: rgba(255,255,255,.06); border: 1px solid var(--line);
          max-width: 180px;
        }
        .profile-meta {
          display: grid; text-align: left; line-height: 1.15; min-width: 0;
        }
        .profile-meta strong {
          font-size: .85rem;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .profile-meta span { font-size: .72rem; color: #5dffa0; font-weight: 600; }
        .av {
          width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex: none;
          background: linear-gradient(145deg, var(--pink), var(--cyan));
          padding: 2px; position: relative;
        }
        .av.online::after {
          content: ''; position: absolute; right: 1px; bottom: 1px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #3dff8a; border: 2px solid var(--bg);
        }
        .av b, .av img {
          display: grid; place-items: center; width: 100%; height: 100%;
          border-radius: 50%; background: var(--bg2); font: 800 .8rem Syne; object-fit: cover;
        }
        @media (max-width: 1100px) {
          .hide-sm { display: none !important; }
          .links { display: none; }
          .topbar {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 10px;
          }
        }
        @media (max-width: 900px) {
          .topbar {
            height: auto;
            min-height: var(--header-h);
            padding-top: calc(8px + var(--safe-t));
            padding-bottom: 8px;
          }
          .search-pill { padding: 10px 14px; }
          .search-pill span { display: block; font-size: .85rem; }
          .search-pill kbd, .profile-meta { display: none; }
          .profile { padding: 0; background: none; border: 0; }
          .signin { padding: 10px 12px; font-size: .85rem; }
        }
      `}</style>
    </header>
  );
}
