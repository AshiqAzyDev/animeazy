import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const links = [
  {
    to: '/',
    end: true,
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/anime',
    label: 'Browse',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="7" height="7" rx="2" />
        <rect x="14" y="4" width="7" height="7" rx="2" />
        <rect x="3" y="13" width="7" height="7" rx="2" />
        <rect x="14" y="13" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    to: '/manga',
    label: 'Manga',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
        <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/schedule',
    label: 'Schedule',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/mylist',
    label: 'My List',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/tools',
    label: 'Tools',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-3-3 2.5-2.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function SideRail() {
  const { toggle, theme } = useTheme();

  return (
    <aside className="side-rail" aria-label="Primary">
      <NavLink to="/" className="rail-logo" aria-label="ANIMEAZY home" end>
        <span>A</span>
      </NavLink>

      <nav className="rail-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} title={l.label} aria-label={l.label}>
            {l.icon}
          </NavLink>
        ))}
      </nav>

      <div className="rail-foot">
        <button type="button" title="Toggle theme" aria-label="Toggle theme" onClick={toggle}>
          {theme === 'dark' ? '☾' : '☀'}
        </button>
        <NavLink to="/credits" title="Credits" aria-label="Credits">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 10v6M12 7.5h.01" strokeLinecap="round" />
          </svg>
        </NavLink>
      </div>

      <style>{`
        .side-rail {
          position: fixed; left: 0; top: 0; bottom: 0; width: var(--sidebar);
          z-index: 40; display: flex; flex-direction: column; align-items: center;
          padding: 18px 0 calc(18px + var(--safe-b));
          background: rgba(8, 8, 12, 0.72);
          backdrop-filter: blur(18px);
          border-right: 1px solid var(--line);
        }
        .rail-logo {
          width: 44px; height: 44px; border-radius: 14px;
          display: grid; place-items: center;
          background: linear-gradient(145deg, var(--pink), var(--violet));
          color: #fff; font: 800 1.15rem var(--font-display);
          box-shadow: 0 10px 24px -12px var(--pink);
        }
        .rail-nav {
          margin-top: 28px; display: grid; gap: 8px; flex: 1; align-content: start;
        }
        .rail-nav a, .rail-foot button, .rail-foot a {
          width: 46px; height: 46px; border-radius: 50%;
          display: grid; place-items: center; color: var(--mute);
          transition: .25s var(--ease-cinema);
        }
        .rail-nav a:hover, .rail-foot button:hover, .rail-foot a:hover {
          color: var(--ink); background: rgba(255,255,255,.08);
        }
        .rail-nav a.active {
          color: #fff;
          background: color-mix(in srgb, var(--pink) 85%, #000);
          box-shadow: 0 10px 24px -12px var(--pink);
        }
        .rail-foot { display: grid; gap: 8px; }
        @media (max-width: 1100px) {
          .side-rail { display: none !important; }
        }
      `}</style>
    </aside>
  );
}
