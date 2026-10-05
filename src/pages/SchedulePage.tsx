import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { animeCatalog } from '../api/animeCatalog';
import { MediaCard } from '../components/MediaCard';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function SchedulePage() {
  const today = DAYS[(new Date().getDay() + 6) % 7];
  const [day, setDay] = useState(today);
  const { data = [], isLoading } = useQuery({
    queryKey: ['schedule', day],
    queryFn: () => animeCatalog.schedule(day),
  });

  return (
    <div className="page container" style={{ paddingTop: 28 }}>
      <h1>Airing Schedule</h1>
      <p className="sub">Weekly timetable — cascade through the days.</p>
      <div className="days">
        {DAYS.map((d, i) => (
          <motion.button
            key={d}
            type="button"
            className={`chip ${day === d ? 'on' : ''}`}
            onClick={() => setDay(d)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            {d}
          </motion.button>
        ))}
      </div>
      <motion.div
        key={day}
        className="grid"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        {isLoading &&
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
          ))}
        {!isLoading && data.map((item) => <MediaCard key={item.id} item={item} />)}
      </motion.div>
      <style>{`
        h1 { font-size: clamp(2rem,5vw,3.4rem); letter-spacing:-.03em; text-transform: capitalize; }
        .sub { color:var(--mute); margin: 8px 0 24px; }
        .days { display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 28px; text-transform: capitalize; }
        .grid {
          display:grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap:18px;
        }
        .grid .card-wrap { width:100% !important; }
      `}</style>
    </div>
  );
}
