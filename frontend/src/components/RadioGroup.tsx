interface Props {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ label, options, value, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--c-muted)",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                borderRadius: 3,
                border: "1px solid",
                borderColor: active ? "var(--c-accent)" : "var(--c-border)",
                background: active ? "var(--c-accent)" : "var(--c-surface)",
                color: active ? "#fff" : "var(--c-fg)",
                cursor: "pointer",
                transition: "all 0.15s",
                fontWeight: active ? 600 : 400,
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
