type ServerOption = {
  id: string;
  label: string;
  developmentOnly?: boolean;
};

type Props = {
  servers: ServerOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
};

export function ServerSelector({ servers, value, onChange, label = 'Server' }: Props) {
  return (
    <div className="ctrl-group">
      <span className="label">{label}</span>
      <div className="pills">
        {servers.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${value === s.id ? 'on' : ''}`}
            onClick={() => onChange(s.id)}
          >
            {s.label}
            {s.developmentOnly ? ' · Demo' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
