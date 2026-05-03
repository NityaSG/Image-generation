interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 4,
          padding: "9px 12px",
          fontSize: 13,
          color: "var(--c-fg)",
          resize: "vertical",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.15s",
          lineHeight: 1.5,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
      />
    </div>
  );
}
