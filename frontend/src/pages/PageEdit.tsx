import { useMemo, useRef, useState } from "react";

import { edit } from "../api/client";
import {
  ImageResult,
  OutputSettings,
  PageWrapper,
  PrimaryButton,
  PromptPreview,
  RadioGroup,
  SectionHead,
  TextArea,
} from "../components";
import { useTaxonomy } from "../data/useTaxonomy";
import { useGallery } from "../theme/GalleryContext";

const PRESERVE_CLAUSE =
  "Keep silhouette, fabric, lighting, and background identical to the source. Do not introduce new elements, text, or watermarks.";

const KIND_COLORS: Record<string, string> = {
  apparel: "#5B2A86",
  sketch: "#1B3A6B",
  pattern: "#2A6B35",
  edit: "#6B3A1B",
};

export function PageEdit() {
  const { gallery, addToGallery } = useGallery();
  const { data } = useTaxonomy();

  const [sourceMode, setSourceMode] = useState<"gallery" | "upload">(
    gallery.length ? "gallery" : "upload",
  );
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [preserve, setPreserve] = useState(true);
  const [size, setSize] = useState("1024x1536");
  const [quality, setQuality] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [genError, setGenError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sourceItem = sourceMode === "gallery" ? gallery[galleryIdx] : null;
  const sourceSrc = sourceMode === "gallery" ? sourceItem?.src ?? null : uploadedSrc;
  const sourceMeta = sourceMode === "gallery" ? sourceItem?.meta ?? {} : {};

  const prompt = useMemo(() => {
    const trimmed = instruction.trim();
    if (!trimmed) return "";
    return preserve ? `${trimmed}\n\n${PRESERVE_CLAUSE}` : trimmed;
  }, [instruction, preserve]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleApply() {
    if (!sourceSrc || !prompt) return;
    setLoading(true);
    setGenError("");
    setResult(null);
    try {
      const img = await edit(prompt, sourceSrc, { size, quality });
      setResult(img);
      await addToGallery({
        src: img,
        prompt,
        kind: "edit",
        meta: { ...sourceMeta, size, quality },
      });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper
      title="Iterate & Edit"
      subtitle="Multi-turn refinement — each edit chains on the previous result"
      sidebar={
        data ? (
          <OutputSettings
            size={size}
            quality={quality}
            sizes={data.sizes}
            qualities={data.qualities}
            onSize={setSize}
            onQuality={setQuality}
          />
        ) : null
      }
    >
      <div>
        <SectionHead n="01" title="Source Image" />
        <RadioGroup
          options={gallery.length ? ["gallery", "upload"] : ["upload"]}
          value={sourceMode}
          onChange={(v) => setSourceMode(v as "gallery" | "upload")}
        />
        <div style={{ marginTop: 16 }}>
          {sourceMode === "gallery" ? (
            gallery.length === 0 ? (
              <div style={{ padding: "20px 16px", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 6, fontSize: 13, color: "var(--c-muted)", textAlign: "center" }}>
                Gallery is empty — generate something on pages 1–3 first.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 8,
                  }}
                >
                  {gallery.map((item, i) => (
                    <div
                      key={item.id}
                      onClick={() => setGalleryIdx(i)}
                      style={{
                        cursor: "pointer",
                        borderRadius: 4,
                        overflow: "hidden",
                        border: `2px solid ${i === galleryIdx ? "var(--c-accent)" : "var(--c-border)"}`,
                        transition: "border-color 0.15s",
                        position: "relative",
                      }}
                    >
                      <img src={item.src} alt="" style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          padding: "2px 6px",
                          borderRadius: 2,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          background: KIND_COLORS[item.kind] ?? "#444",
                          color: "#fff",
                        }}
                      >
                        {item.kind}
                      </div>
                      <div style={{ padding: "4px 6px", fontSize: 10, color: "var(--c-muted)", background: "var(--c-surface)", borderTop: "1px solid var(--c-border)" }}>
                        #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${uploadedSrc ? "var(--c-accent)" : "var(--c-border)"}`,
                  borderRadius: 8,
                  padding: 28,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  background: "var(--c-surface)",
                }}
              >
                {uploadedSrc ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
                    <img src={uploadedSrc} alt="upload" style={{ height: 100, objectFit: "contain", borderRadius: 4 }} />
                    <span style={{ fontSize: 12, color: "var(--c-muted)" }}>Click to replace</span>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500 }}>Click to upload image</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--c-muted)" }}>PNG, JPG accepted</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionHead n="02" title="Edit Instruction" subtitle="Single-change edits work best" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextArea
            value={instruction}
            onChange={setInstruction}
            rows={4}
            placeholder="e.g., 'Change the primary colour to #2A4F7C, keep silhouette, fabric, lighting, and background identical to the original.'"
          />
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={preserve}
              onChange={(e) => setPreserve(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <div>
              <span style={{ fontSize: 13, color: "var(--c-fg)", fontWeight: 500 }}>
                Append preserve clause
              </span>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--c-muted)" }}>
                Adds: "Keep silhouette, fabric, lighting, and background identical…"
              </p>
            </div>
          </label>
        </div>
      </div>

      <PromptPreview prompt={prompt || "(no instruction yet)"} />

      {genError && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 4, fontSize: 13, color: "#c00" }}>
          {genError}
        </div>
      )}

      <PrimaryButton onClick={handleApply} disabled={!sourceSrc || !prompt} loading={loading}>
        {loading ? "Applying edit…" : "Apply Edit"}
      </PrimaryButton>

      {sourceSrc && result && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-muted)" }}>Before / After</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--c-border)" }}>
              <img src={sourceSrc} alt="before" style={{ width: "100%", display: "block" }} />
              <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--c-muted)", borderTop: "1px solid var(--c-border)" }}>Before</div>
            </div>
            <ImageResult
              src={result}
              label="After"
              kind="edit"
              prompt={prompt}
              meta={{ ...sourceMeta, size, quality }}
              onSaveToGallery={addToGallery}
            />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
