import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { mangadex } from '../api/mangadex';
import { MagneticButton } from '../motion/MagneticButton';
import { useMyList } from '../context/MyListContext';

export function MangaDetailPage() {
  const { id = '' } = useParams();
  const detail = useQuery({ queryKey: ['md', id], queryFn: () => mangadex.detail(id), enabled: !!id });
  const chapters = useQuery({
    queryKey: ['md-ch', id],
    queryFn: () => mangadex.chapters(id),
    enabled: !!id,
  });
  const { toggle, has } = useMyList();
  const [chapterId, setChapterId] = useState<string | null>(null);
  const pages = useQuery({
    queryKey: ['md-pages', chapterId],
    queryFn: () => mangadex.chapterPages(chapterId!),
    enabled: !!chapterId,
  });

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
  const activeChapter = chapters.data?.find((c) => c.id === chapterId);

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <div className="head">
        <div className="poster">{m.image ? <img src={m.image} alt="" /> : null}</div>
        <div>
          <h1>{m.title}</h1>
          <p className="sub">{m.authors?.join(', ') || 'Unknown author'}</p>
          <p className="syn">{m.synopsis || 'No description.'}</p>
          <p className="credit">Data & images via MangaDex. Respect scanlation group requests.</p>
          <MagneticButton className="btn ghost" onClick={() => toggle(m)}>
            {has(m.id) ? '✓ In My List' : '＋ My List'}
          </MagneticButton>
        </div>
      </div>

      <h2 className="section-title" style={{ padding: '28px 0 12px' }}>
        Chapters
      </h2>
      <div className="chapters">
        {(chapters.data ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${chapterId === c.id ? 'on' : ''}`}
            onClick={() => setChapterId(c.id)}
          >
            {c.chapter ? `Ch. ${c.chapter}` : c.title}
            {c.groupName ? ` · ${c.groupName}` : ''}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {chapterId && (
          <motion.div
            key={chapterId}
            className="reader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="reader-bar">
              <strong>{activeChapter?.title}</strong>
              <span>{activeChapter?.groupName || 'Scanlation group'}</span>
              <button type="button" className="btn ghost" onClick={() => setChapterId(null)}>
                Close
              </button>
            </div>
            {pages.isLoading && <div className="skeleton" style={{ height: 400 }} />}
            <div className="pages">
              {(pages.data ?? []).map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt={`Page ${i + 1}`}
                  loading="lazy"
                  initial={{ opacity: 0, rotateY: -8 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.35 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .head { display:grid; grid-template-columns: 180px 1fr; gap:24px; }
        .poster { border-radius:18px; overflow:hidden; aspect-ratio:2/3; background:var(--bg2); }
        .poster img { width:100%; height:100%; object-fit:cover; }
        h1 { font-size: clamp(1.8rem,4vw,2.8rem); letter-spacing:-.03em; }
        .sub, .credit { color:var(--mute); margin: 8px 0; }
        .syn { max-width: 70ch; margin: 12px 0 18px; }
        .chapters { display:flex; flex-wrap:wrap; gap:8px; }
        .reader {
          margin-top: 28px; border-radius: 22px; background: #0a0814;
          border: 1px solid var(--line); overflow:hidden;
          background-image: linear-gradient(180deg, #ffffff06, transparent);
        }
        .reader-bar {
          display:flex; gap:12px; align-items:center; justify-content:space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--line); flex-wrap:wrap;
        }
        .reader-bar span { color:var(--mute); font-size:.85rem; }
        .pages { display:flex; flex-direction:column; align-items:center; gap:8px; padding: 16px; }
        .pages img {
          width: min(820px, 100%); border-radius: 4px;
          box-shadow: 0 10px 30px #0006;
        }
        @media (max-width:860px) { .head { grid-template-columns: 1fr; max-width: 220px; } .head > div:last-child { max-width: none; } }
      `}</style>
    </div>
  );
}
