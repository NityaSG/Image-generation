import { useEffect, useMemo, useRef, useState } from "react";

import { edit } from "../api/client";
import {
  ColorPicker,
  FormGrid,
  ImageResult,
  OutputSettings,
  PageWrapper,
  PrimaryButton,
  PromptPreview,
  RadioGroup,
  SectionHead,
  Select,
  TextArea,
} from "../components";
import { useTaxonomy } from "../data/useTaxonomy";
import { buildSketchPrompt } from "../prompts";
import { useGallery } from "../theme/GalleryContext";

export function PageSketch() {
  const { addToGallery } = useGallery();
  const { data, loading, error } = useTaxonomy();

  const [sketchSrc, setSketchSrc] = useState<string | null>(null);
  const [gender, setGender] = useState("skip");
  const [category, setCategory] = useState("skip");
  const [subtype, setSubtype] = useState("skip");
  const [fabricKind, setFabricKind] = useState("skip");
  const [fabricVal, setFabricVal] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);
  const [emb, setEmb] = useState<string | null>(null);
  const [usePrimary, setUsePrimary] = useState(true);
  const [primary, setPrimary] = useState("#E8DCC4");
  const [useSecond, setUseSecond] = useState(false);
  const [secondary, setSecondary] = useState("#5B2A86");
  const [background, setBackground] = useState<string | null>("white seamless");
  const [notes, setNotes] = useState("");
  const [size, setSize] = useState("1024x1536");
  const [quality, setQuality] = useState("medium");
  const [genLoading, setGenLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [genError, setGenError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCategory("skip");
    setSubtype("skip");
  }, [gender]);
  useEffect(() => {
    setSubtype("skip");
  }, [category]);

  const categories = data && gender !== "skip" ? data.categories[gender] ?? [] : [];
  const subtypes = data && category !== "skip" ? data.subtypes[`${gender}/${category}`] ?? [] : [];

  const prompt = useMemo(
    () =>
      buildSketchPrompt({
        subtype: subtype !== "skip" ? subtype : null,
        fabric_value: fabricVal,
        primary_hex: usePrimary ? primary : null,
        secondary_hex: useSecond ? secondary : null,
        pattern,
        embroidery: emb,
        background,
        free_form_notes: notes.trim() || null,
      }),
    [subtype, fabricVal, usePrimary, primary, useSecond, secondary, pattern, emb, background, notes],
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSketchSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleRender() {
    if (!sketchSrc) return;
    setGenLoading(true);
    setGenError("");
    setResult(null);
    try {
      const img = await edit(prompt, sketchSrc, { size, quality });
      setResult(img);
      await addToGallery({ src: img, prompt, kind: "sketch", meta: { size, quality } });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 40, color: "var(--c-muted)" }}>Loading taxonomy…</div>;
  if (error || !data) return <div style={{ padding: 40, color: "#c00" }}>Backend unreachable: {error}</div>;

  return (
    <PageWrapper
      title="Sketch → Realistic"
      subtitle="Upload a hand sketch. The model preserves silhouette while adding fabric, colour and lighting."
      sidebar={
        <OutputSettings
          size={size}
          quality={quality}
          sizes={data.sizes}
          qualities={data.qualities}
          onSize={setSize}
          onQuality={setQuality}
        />
      }
    >
      <div>
        <SectionHead n="01" title="Sketch Upload" subtitle="PNG or JPG — the sketch is the geometry source of truth" />
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${sketchSrc ? "var(--c-accent)" : "var(--c-border)"}`,
            borderRadius: 8,
            padding: 32,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
            background: "var(--c-surface)",
          }}
        >
          {sketchSrc ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
              <img src={sketchSrc} alt="sketch" style={{ height: 160, objectFit: "contain", borderRadius: 4 }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600 }}>Sketch uploaded</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-muted)" }}>Click to replace</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500 }}>Click to upload sketch</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--c-muted)" }}>PNG, JPG accepted</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>
      </div>

      <div>
        <SectionHead n="02" title="Optional Disambiguation" subtitle="The sketch drives geometry — these steer fabric, colour, and pattern only" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormGrid cols={3}>
            <RadioGroup label="Gender" options={["skip", ...data.GENDER_OPTIONS]} value={gender} onChange={setGender} />
            <Select
              label="Category"
              options={["skip", ...categories]}
              value={category}
              onChange={(v) => setCategory(v ?? "skip")}
              disabled={gender === "skip"}
            />
            <Select
              label="Sub-type"
              options={["skip", ...subtypes]}
              value={subtype}
              onChange={(v) => setSubtype(v ?? "skip")}
              disabled={category === "skip"}
            />
          </FormGrid>
          <RadioGroup
            label="Fabric Kind"
            options={["skip", "Woven", "Knit"]}
            value={fabricKind}
            onChange={(v) => {
              setFabricKind(v);
              setFabricVal(null);
            }}
          />
          {fabricKind === "Woven" && (
            <Select label="Woven Fabric" options={data.woven_fabrics} value={fabricVal} onChange={setFabricVal} placeholder="Skip…" />
          )}
          {fabricKind === "Knit" && (
            <Select label="Knit Fabric" options={data.knit_fabrics} value={fabricVal} onChange={setFabricVal} placeholder="Skip…" />
          )}
          <FormGrid cols={2}>
            <Select label="Pattern" options={data.patterns} value={pattern} onChange={setPattern} placeholder="Skip…" />
            <Select label="Embroidery" options={data.embroidery} value={emb} onChange={setEmb} placeholder="Skip…" />
          </FormGrid>
        </div>
      </div>

      <div>
        <SectionHead n="03" title="Colour" />
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-muted)", marginBottom: 8 }}>
              <input type="checkbox" checked={usePrimary} onChange={(e) => setUsePrimary(e.target.checked)} />
              Set primary colour
            </label>
            <ColorPicker value={primary} onChange={setPrimary} disabled={!usePrimary} />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-muted)", marginBottom: 8 }}>
              <input type="checkbox" checked={useSecond} onChange={(e) => setUseSecond(e.target.checked)} />
              Add secondary
            </label>
            <ColorPicker value={secondary} onChange={setSecondary} disabled={!useSecond} />
          </div>
        </div>
      </div>

      <div>
        <SectionHead n="04" title="Background & Notes" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Select label="Background" options={data.backgrounds} value={background} onChange={setBackground} />
          <TextArea label="Additional Notes" value={notes} onChange={setNotes} rows={3}
            placeholder="e.g., 'render as a 3/4 shot, soft golden-hour light'" />
        </div>
      </div>

      <PromptPreview prompt={prompt} />

      {genError && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 4, fontSize: 13, color: "#c00" }}>
          {genError}
        </div>
      )}

      <PrimaryButton onClick={handleRender} disabled={!sketchSrc} loading={genLoading}>
        {genLoading ? "Rendering…" : "Render Sketch"}
      </PrimaryButton>

      {sketchSrc && result && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-muted)" }}>Before / After</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--c-border)" }}>
              <img src={sketchSrc} alt="sketch" style={{ width: "100%", display: "block" }} />
              <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--c-muted)", borderTop: "1px solid var(--c-border)" }}>Source sketch</div>
            </div>
            <ImageResult
              src={result}
              label="Realistic render"
              kind="sketch"
              prompt={prompt}
              meta={{ size, quality }}
              onSaveToGallery={addToGallery}
            />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
