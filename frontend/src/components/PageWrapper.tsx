import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  sidebar?: ReactNode;
}

export function PageWrapper({ title, subtitle, children, sidebar }: Props) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 60px" }}>
        <div style={{ maxWidth: 800 }}>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--c-fg)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: "0 0 32px", fontSize: 13, color: "var(--c-muted)" }}>{subtitle}</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>{children}</div>
        </div>
      </div>
      {sidebar && (
        <div
          style={{
            width: 220,
            flexShrink: 0,
            borderLeft: "1px solid var(--c-border)",
            padding: "36px 20px",
            overflowY: "auto",
            background: "var(--c-bg)",
          }}
        >
          {sidebar}
        </div>
      )}
    </div>
  );
}
