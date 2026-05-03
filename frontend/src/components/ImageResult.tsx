import { useState } from "react";
import type { GalleryKind } from "../api/types";

interface Props {
  src: string;
  label?: string;
  prompt?: string;
  kind?: GalleryKind;
  meta?: Record<string, unknown>;
  onSaveToGallery?: (input: {
    src: string;
    prompt: string;
    kind: GalleryKind;
    meta: Record<string, unknown>;
  }) => void | Promise<unknown>;
}

export function ImageResult({ src, label, prompt = "", kind, meta = {}, onSaveToGallery }: Props) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        borderRadius: 6,
        overflow: "hidden",
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      <img src={src} alt={label} style={{ width: "100%", display: "block" }} />
      {hover && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {onSaveToGallery && kind && (
            <button
              type="button"
              onClick={() => onSaveToGallery({ src, prompt, kind, meta })}
              style={{
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                background: "var(--c-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              Save to Gallery
            </button>
          )}
          <a
            href={src}
            download="generated.png"
            style={{
              padding: "8px 18px",
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 3,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Download PNG
          </a>
        </div>
      )}
      {label && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: 11,
            color: "var(--c-muted)",
            borderTop: "1px solid var(--c-border)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
