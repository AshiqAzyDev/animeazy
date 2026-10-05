type ServerOption = {
  id: string;
  label: string;
  developmentOnly?: boolean;
};

type Props = {
  servers: ServerOption[];
  value: string;
  onChange: (id: string) => void;
};

export function ServerSelector({ servers, value, onChange }: Props) {
  return (
    <div className="ctrl-group">
      <span className="label">Server</span>
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
