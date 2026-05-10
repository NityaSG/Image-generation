import { useState } from "react";

import { vectorize } from "../api/client";
import type { GalleryItem } from "../api/types";
import { useGallery } from "../theme/GalleryContext";

const KIND_COLORS: Record<string, string> = {
  apparel: "#5B2A86",
  sketch: "#1B3A6B",
  pattern: "#2A6B35",
  edit: "#6B3A1B",
};

export function PageGallery() {
  const { gallery, clearGallery, removeFromGallery } = useGallery();
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [svgLoading, setSvgLoading] = useState(false);
  const [svgError, setSvgError] = useState("");

  async function handleExportSvg(item: GalleryItem) {
    setSvgLoading(true);
    setSvgError("");
    try {
      const svg = await vectorize({ gallery_id: item.id });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `pattern-${item.id.slice(0, 8)}.svg`;
      a.click();
      URL.revokeObjectURL(href);
    } catch (e) {
      setSvgError(e instanceof Error ? e.message : String(e));
    } finally {
      setSvgLoading(false);
    }
  }

  const kinds = ["all", ...Array.from(new Set(gallery.map((i) => i.kind)))];
  const filtered = filter === "all" ? gallery : gallery.filter((i) => i.kind === filter);

  return (
    <div style={{ overflowY: "auto", flex: 1, padding: "36px 40px 60px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--c-fg)" }}>Gallery</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--c-muted)" }}>
            {gallery.length} image{gallery.length !== 1 ? "s" : ""} stored on disk
          </p>
        </div>
        {gallery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete every image in the gallery?")) void clearGallery();
            }}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              background: "none",
              border: "1px solid var(--c-border)",
              borderRadius: 4,
              color: "var(--c-muted)",
              cursor: "pointer",
            }}
          >
            Clear gallery
          </button>
        )}
      </div>

      {gallery.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-border)" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9l4-4 4 4 4-6 4 6" />
            <circle cx="8" cy="14" r="1.5" />
          </svg>
          <p style={{ margin: 0, fontSize: 14, color: "var(--c-muted)" }}>
            No images yet — generate something on pages 1–4.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {kinds.map((k) => {
              const active = filter === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: active ? "var(--c-accent)" : "var(--c-border)",
                    background: active ? "var(--c-accent)" : "var(--c-surface)",
                    color: active ? "#fff" : "var(--c-muted)",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {k}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightbox(item)}
                style={{
                  cursor: "zoom-in",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--c-border)",
                }}
              >
                <img
                  src={item.src}
                  alt=""
                  style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "8px 10px", background: "var(--c-surface)", borderTop: "1px solid var(--c-border)" }}>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: 2,
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      background: (KIND_COLORS[item.kind] ?? "#444") + "20",
                      color: KIND_COLORS[item.kind] ?? "#444",
                    }}
                  >
                    {item.kind}
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 10,
                      color: "var(--c-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(item.meta?.subtype as string) ||
                      (item.meta?.repeatType as string) ||
                      (item.meta?.size as string) ||
                      "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 600,
              width: "100%",
              background: "var(--c-bg)",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--c-border)",
            }}
          >
            <img
              src={lightbox.src}
              alt=""
              style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: KIND_COLORS[lightbox.kind] ?? "var(--c-muted)",
                  }}
                >
                  {lightbox.kind}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-muted)" }}>
                  {(lightbox.meta?.size as string) ?? ""} · {(lightbox.meta?.quality as string) ?? ""}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={lightbox.src}
                    download="generated.png"
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      background: "var(--c-accent)",
                      color: "#fff",
                      borderRadius: 3,
                      textDecoration: "none",
                    }}
                  >
                    Download PNG
                  </a>
                  {lightbox.kind === "pattern" && (
                    <button
                      type="button"
                      onClick={() => void handleExportSvg(lightbox)}
                      disabled={svgLoading}
                      style={{
                        padding: "7px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: "var(--c-surface)",
                        border: "1px solid var(--c-accent)",
                        borderRadius: 3,
                        cursor: svgLoading ? "wait" : "pointer",
                        color: "var(--c-accent)",
                      }}
                    >
                      {svgLoading ? "Vectorizing…" : "Export SVG"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this image?")) {
                        void removeFromGallery(lightbox.id);
                        setLightbox(null);
                      }
                    }}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      background: "var(--c-surface)",
                      border: "1px solid var(--c-border)",
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "var(--c-fg)",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLightbox(null); setSvgError(""); }}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12,
                      background: "var(--c-surface)",
                      border: "1px solid var(--c-border)",
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "var(--c-fg)",
                    }}
                  >
                    Close
                  </button>
                </div>
                {svgError && (
                  <p style={{ margin: 0, fontSize: 11, color: "#c00" }}>{svgError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
