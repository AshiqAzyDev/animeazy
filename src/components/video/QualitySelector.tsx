type Props = {
  qualities: string[];
  value: string;
  onChange: (q: string) => void;
  disabled?: boolean;
};

export function QualitySelector({ qualities, value, onChange, disabled }: Props) {
  return (
    <div className="ctrl-group">
      <span className="label">Quality</span>
      <div className="pills">
        {qualities.map((q) => (
          <button
            key={q}
            type="button"
            className={`chip ${value === q ? 'on' : ''}`}
            disabled={disabled}
            onClick={() => onChange(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
