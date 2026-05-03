interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Checkbox({ label, checked, onChange, description }: Props) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        fontSize: 12,
        color: "var(--c-muted)",
        cursor: "pointer",
        marginBottom: description ? 0 : 8,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2 }}
      />
      <div>
        <span style={{ color: "var(--c-fg)", fontSize: 13, fontWeight: 500 }}>{label}</span>
        {description && (
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--c-muted)" }}>{description}</p>
        )}
      </div>
    </label>
  );
}
