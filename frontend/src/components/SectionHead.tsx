interface Props {
  n: string;
  title: string;
  subtitle?: string;
}

export function SectionHead({ n, title, subtitle }: Props) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--c-border)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--c-accent)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {n}
        </span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--c-fg)" }}>{title}</h3>
      </div>
      {subtitle && (
        <p style={{ margin: "4px 0 0 22px", fontSize: 12, color: "var(--c-muted)" }}>{subtitle}</p>
      )}
    </div>
  );
}
