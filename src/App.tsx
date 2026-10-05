import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { ToastProvider } from './context/ToastContext';
import { MyListProvider } from './context/MyListContext';
import { SmoothScroll } from './motion/SmoothScroll';
import { PageTransition } from './motion/PageTransition';
import { Intro } from './components/Intro';
import { SideRail } from './components/SideRail';
import { Nav } from './components/Nav';
import { SearchOverlay } from './components/SearchOverlay';
import { MobileTabs } from './components/MobileTabs';
import { HomePage } from './pages/HomePage';

const AnimeDbPage = lazy(() =>
  import('./pages/AnimeDbPage').then((m) => ({ default: m.AnimeDbPage })),
);
const AnimeDetailPage = lazy(() =>
  import('./pages/AnimeDetailPage').then((m) => ({ default: m.AnimeDetailPage })),
);
const MangaPage = lazy(() => import('./pages/MangaPage').then((m) => ({ default: m.MangaPage })));
const MangaDetailPage = lazy(() =>
  import('./pages/MangaDetailPage').then((m) => ({ default: m.MangaDetailPage })),
);
const QuotesPage = lazy(() =>
  import('./pages/QuotesPage').then((m) => ({ default: m.QuotesPage })),
);
const SchedulePage = lazy(() =>
  import('./pages/SchedulePage').then((m) => ({ default: m.SchedulePage })),
);
const TracePage = lazy(() => import('./pages/TracePage').then((m) => ({ default: m.TracePage })));
const SubtitlesPage = lazy(() =>
  import('./pages/SubtitlesPage').then((m) => ({ default: m.SubtitlesPage })),
);
const MyListPage = lazy(() =>
  import('./pages/MyListPage').then((m) => ({ default: m.MyListPage })),
);
const CreditsPage = lazy(() =>
  import('./pages/CreditsPage').then((m) => ({ default: m.CreditsPage })),
);
const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })));
const WatchPage = lazy(() => import('./pages/WatchPage').then((m) => ({ default: m.WatchPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Shell() {
  const [intro, setIntro] = useState(() => !sessionStorage.getItem('animeazy.intro'));
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('lock', intro || searchOpen);
  }, [intro, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-shell">
      <div className="ambient-bg" aria-hidden />
      <div className="grain" aria-hidden />
      <SmoothScroll />
      {intro && (
        <Intro
          onDone={() => {
            sessionStorage.setItem('animeazy.intro', '1');
            setIntro(false);
          }}
        />
      )}
      <SideRail />
      <div className="app-main">
        <Nav onSearch={() => setSearchOpen(true)} />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <div className="app-content">
          <Suspense
            fallback={
              <div className="page container" style={{ paddingTop: 24 }}>
                <div className="skeleton" style={{ height: 280, borderRadius: 28 }} />
              </div>
            }
          >
            <PageTransition>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/anime" element={<AnimeDbPage />} />
                <Route path="/anime/:id" element={<AnimeDetailPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/manga" element={<MangaPage />} />
                <Route path="/manga/:id" element={<MangaDetailPage />} />
                <Route path="/quotes" element={<QuotesPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/trace" element={<TracePage />} />
                <Route path="/tools/subtitles" element={<SubtitlesPage />} />
                <Route path="/mylist" element={<MyListPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </div>
      </div>
      <MobileTabs />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <MyListProvider>
            <HashRouter>
              <Shell />
            </HashRouter>
          </MyListProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
