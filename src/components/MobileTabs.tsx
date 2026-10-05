import { NavLink } from 'react-router-dom';

export function MobileTabs() {
  return (
    <div className="tabs">
      <NavLink to="/" end>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
        </svg>
        <span>Home</span>
      </NavLink>
      <NavLink to="/anime">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="7" height="7" rx="2" />
          <rect x="14" y="4" width="7" height="7" rx="2" />
          <rect x="3" y="13" width="7" height="7" rx="2" />
          <rect x="14" y="13" width="7" height="7" rx="2" />
        </svg>
        <span>Browse</span>
      </NavLink>
      <NavLink to="/manga">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
        </svg>
        <span>Manga</span>
      </NavLink>
      <NavLink to="/mylist">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" strokeLinejoin="round" />
        </svg>
        <span>List</span>
      </NavLink>
      <style>{`
        .tabs { display: none; }
        @media (max-width: 1100px) {
          .tabs {
            display: flex; position: fixed; z-index: 40;
            left: 12px; right: 12px; bottom: calc(12px + var(--safe-b));
            justify-content: space-around; padding: 8px 6px; border-radius: 24px;
            background: rgba(16, 16, 22, 0.82);
            backdrop-filter: blur(18px);
            border: 1px solid var(--line);
            box-shadow: 0 16px 40px rgba(0,0,0,.45);
          }
          .tabs a {
            display: grid; justify-items: center; gap: 3px; font-size: .68rem;
            color: var(--mute); padding: 8px 12px; border-radius: 16px; font-weight: 600;
          }
          .tabs a.active {
            color: #fff; background: color-mix(in srgb, var(--pink) 80%, #000);
          }
        }
      `}</style>
    </div>
  );
}
