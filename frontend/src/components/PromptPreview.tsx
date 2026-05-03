import { useState } from "react";

export function PromptPreview({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontSize: 12,
          color: "var(--c-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            transform: open ? "rotate(90deg)" : "none",
            display: "inline-block",
            transition: "transform 0.15s",
          }}
        >
          ▶
        </span>
        Prompt preview
      </button>
      {open && (
        <pre
          style={{
            marginTop: 8,
            padding: "12px 14px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: 4,
            fontSize: 11,
            lineHeight: 1.7,
            color: "var(--c-muted)",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-mono)",
          }}
        >
          {prompt}
        </pre>
      )}
    </div>
  );
}
