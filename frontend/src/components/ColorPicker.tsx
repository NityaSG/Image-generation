interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ label, value, onChange, disabled }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, opacity: disabled ? 0.4 : 1 }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: value,
            border: "1px solid var(--c-border)",
            cursor: disabled ? "not-allowed" : "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              position: "absolute",
              inset: 0,
              width: "200%",
              height: "200%",
              opacity: 0,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--c-muted)",
            letterSpacing: "0.05em",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
