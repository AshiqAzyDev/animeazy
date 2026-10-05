import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mangadex } from '../api/mangadex';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';
import type { MangaChapter } from '../types/media';

export function MangaDetailPage() {
  const { id = '' } = useParams();
  const mangaId = id.replace(/^manga-/, '');
  const detail = useQuery({
    queryKey: ['md', mangaId],
    queryFn: () => mangadex.detail(mangaId),
    enabled: !!mangaId,
  });
  const chapters = useQuery({
    queryKey: ['md-ch', mangaId],
    queryFn: () => mangadex.chapters(mangaId),
    enabled: !!mangaId,
  });
  const { toggle, has } = useMyList();
  const [chapterId, setChapterId] = useState<string | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const pages = useQuery({
    queryKey: ['md-pages', chapterId],
    queryFn: () => mangadex.chapterPages(chapterId!),
    enabled: !!chapterId,
    retry: 1,
  });

  const activeChapter = chapters.data?.find((c) => c.id === chapterId);
  const readableCount = useMemo(
    () => (chapters.data ?? []).filter((c) => c.readable).length,
    [chapters.data],
  );

  useEffect(() => {
    if (chapterId && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [chapterId]);

  const openChapter = (c: MangaChapter) => {
    if (c.externalUrl) {
      window.open(c.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!c.readable) return;
    setChapterId(c.id);
  };

  if (detail.isLoading) {
    return (
      <div className="page container" style={{ paddingTop: 28 }}>
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="page empty-state" style={{ paddingTop: 140 }}>
        <h3>Manga not found</h3>
      </div>
    );
  }

  const m = detail.data;

  return (
    <div className="page container manga-detail" style={{ paddingTop: 28 }}>
      <div className="head">
        <div className="poster">{m.image ? <img src={m.image} alt="" /> : null}</div>
        <div className="meta-block">
          <h1>{m.title}</h1>
          <p className="sub">{m.authors?.join(', ') || 'Unknown author'}</p>
          <p className="syn">{m.synopsis || 'No description.'}</p>
          <p className="credit">Data & images via MangaDex. Respect scanlation group requests.</p>
          <MagneticButton className="btn ghost" onClick={() => toggle(m)}>
            {has(m.id) ? '✓ In My List' : '＋ My List'}
          </MagneticButton>
        </div>
      </div>

      <h2 className="section-title" style={{ padding: '28px 0 8px' }}>
        Chapters
        <small>
          {readableCount} readable
          {(chapters.data?.length ?? 0) > readableCount
            ? ` · ${(chapters.data?.length ?? 0) - readableCount} external`
            : ''}
        </small>
      </h2>
      <p className="chap-hint">
        Official releases (e.g. MangaPlus) open on their site. MangaDex-hosted chapters open in the
        reader below.
      </p>
      <div className="chapters">
        {(chapters.data ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${chapterId === c.id ? 'on' : ''} ${c.externalUrl ? 'external' : ''} ${
              !c.readable && !c.externalUrl ? 'disabled' : ''
            }`}
            onClick={() => openChapter(c)}
            title={
              c.externalUrl
                ? 'Opens on official site'
                : c.readable
                  ? 'Read on MangaDex'
                  : 'Unavailable'
            }
          >
            {c.chapter ? `Ch. ${c.chapter}` : c.title}
            {c.translatedLanguage && c.translatedLanguage !== 'en'
              ? ` · ${c.translatedLanguage}`
              : ''}
            {c.groupName ? ` · ${c.groupName}` : ''}
            {c.externalUrl ? ' ↗' : ''}
          </button>
        ))}
        {!chapters.isLoading && !(chapters.data ?? []).length && (
          <p className="empty-ch">No chapters found for this title.</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {chapterId && (
          <motion.div
            ref={readerRef}
            key={chapterId}
            className="reader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="reader-bar">
              <strong>{activeChapter?.title}</strong>
              <span>
                {activeChapter?.groupName || 'Scanlation group'}
                {activeChapter?.translatedLanguage
                  ? ` · ${activeChapter.translatedLanguage}`
                  : ''}
              </span>
              <button type="button" className="btn ghost" onClick={() => setChapterId(null)}>
                Close
              </button>
            </div>
            {pages.isLoading && <div className="skeleton" style={{ height: 400 }} />}
            {pages.isError && (
              <div className="reader-empty">
                <h3>Couldn’t load pages</h3>
                <p>
                  {(pages.error as Error)?.message ||
                    'This chapter may only be available on an official site.'}
                </p>
                {activeChapter?.externalUrl && (
                  <a
                    className="btn primary"
                    href={activeChapter.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open official reader
                  </a>
                )}
              </div>
            )}
            {!pages.isLoading && !pages.isError && !(pages.data ?? []).length && (
              <div className="reader-empty">
                <h3>No pages</h3>
                <p>MangaDex did not return images for this chapter.</p>
              </div>
            )}
            <div className="pages">
              {(pages.data ?? []).map((src, i) => (
                <motion.img
                  key={`${src}-${i}`}
                  src={src}
                  alt={`Page ${i + 1}`}
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-8%' }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .manga-detail { max-width: 1100px; margin: 0 auto; }
        .head {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .poster {
          border-radius: 18px; overflow: hidden; aspect-ratio: 2/3;
          background: var(--bg2); width: 100%; max-width: 220px;
        }
        .poster img { width: 100%; height: 100%; object-fit: cover; }
        .meta-block { min-width: 0; }
        h1 {
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          letter-spacing: -.03em;
          word-break: break-word;
        }
        .sub, .credit, .chap-hint { color: var(--mute); margin: 8px 0; }
        .chap-hint { font-size: .88rem; margin-bottom: 12px; max-width: 70ch; }
        .syn {
          max-width: 70ch; margin: 12px 0 18px;
          display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden;
        }
        .chapters {
          display: flex; flex-wrap: wrap; gap: 8px;
          max-height: min(42vh, 360px); overflow: auto;
          padding-right: 4px; margin-bottom: 8px;
        }
        .chapters .chip.external {
          border-style: dashed; opacity: .92;
        }
        .chapters .chip.disabled { opacity: .45; cursor: not-allowed; }
        .empty-ch { color: var(--mute); padding: 8px 0; }
        .reader {
          margin-top: 28px; border-radius: 22px; background: #0a0814;
          border: 1px solid var(--line); overflow: hidden;
          scroll-margin-top: calc(var(--header-h) + 12px);
        }
        .reader-bar {
          display: flex; gap: 12px; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--line); flex-wrap: wrap;
          position: sticky; top: var(--header-h); z-index: 2;
          background: rgba(10, 8, 20, .92); backdrop-filter: blur(12px);
        }
        .reader-bar strong { min-width: 0; flex: 1; }
        .reader-bar span { color: var(--mute); font-size: .85rem; }
        .reader-empty {
          padding: 48px 20px; text-align: center; color: var(--mute);
        }
        .reader-empty h3 { color: var(--ink); margin-bottom: 8px; }
        .reader-empty .btn { margin-top: 16px; display: inline-flex; }
        .pages {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 16px 12px calc(24px + var(--safe-b));
        }
        .pages img {
          width: min(820px, 100%); border-radius: 4px;
          box-shadow: 0 10px 30px #0006; background: #111;
          min-height: 40px;
        }
        @media (max-width: 860px) {
          .head {
            grid-template-columns: 1fr;
            justify-items: stretch;
          }
          .poster {
            max-width: 160px; margin: 0 auto;
          }
          .meta-block { text-align: left; }
          .syn { -webkit-line-clamp: 6; }
          .chapters { max-height: min(36vh, 280px); }
          .reader-bar { top: var(--header-h); gap: 8px; }
          .reader-bar .btn { padding: 10px 14px; }
        }
      `}</style>
    </div>
  );
}
