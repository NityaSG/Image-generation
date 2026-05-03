interface Props {
  label?: string;
  options: string[];
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Select({ label, options, value, onChange, placeholder = "Select…", disabled }: Props) {
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
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        style={{
          appearance: "none",
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 4,
          padding: "9px 32px 9px 12px",
          fontSize: 13,
          color: value ? "var(--c-fg)" : "var(--c-muted)",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          width: "100%",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          transition: "border-color 0.15s",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
