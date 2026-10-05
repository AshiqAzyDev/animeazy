import type { SubtitleTrack } from '../../streaming/types';

type Props = {
  tracks: SubtitleTrack[];
  value: string;
  onChange: (language: string) => void;
};

/** language value "" means Off */
export function SubtitleSelector({ tracks, value, onChange }: Props) {
  if (!tracks.length) return null;

  return (
    <div className="ctrl-group">
      <span className="label">Subtitles</span>
      <div className="pills">
        <button
          type="button"
          className={`chip ${value === '' ? 'on' : ''}`}
          onClick={() => onChange('')}
        >
          Off
        </button>
        {tracks.map((t) => (
          <button
            key={`${t.language}-${t.label}`}
            type="button"
            className={`chip ${value === t.language ? 'on' : ''}`}
            onClick={() => onChange(t.language)}
          >
            {t.label || t.language}
          </button>
        ))}
      </div>
    </div>
  );
}
