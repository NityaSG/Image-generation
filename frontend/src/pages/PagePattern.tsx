import { useEffect, useMemo, useState } from "react";

import { generate, vectorize } from "../api/client";
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
import { buildPatternPrompt } from "../prompts";
import { useGallery } from "../theme/GalleryContext";

export function PagePattern() {
  const { addToGallery } = useGallery();
  const { data, loading, error } = useTaxonomy();

  const [description, setDescription] = useState("");
  const [patFamily, setPatFamily] = useState<string | null>(null);
  const [patMotif, setPatMotif] = useState<string | null>(null);
  const [directPattern, setDirectPattern] = useState<string | null>(null);
  const [repeatType, setRepeatType] = useState("Seamless tile");
  const [styleMode, setStyleMode] = useState("flat vector");
  const [colors, setColors] = useState<string[]>(["#1B3A6B", "#E0B084", "#8C2A35", "#F4ECD8"]);
  const [useColor, setUseColor] = useState<boolean[]>([true, false, false, false]);
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("medium");
  const [genLoading, setGenLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [genError, setGenError] = useState("");
  const [svgLoading, setSvgLoading] = useState(false);
  const [svgError, setSvgError] = useState("");

  useEffect(() => setPatMotif(null), [patFamily]);

  const motifOpts = data && patFamily ? data.pattern_families[patFamily] ?? [] : [];
  const hexPalette = colors.filter((_, i) => useColor[i]);

  const prompt = useMemo(
    () =>
      buildPatternPrompt({
        description: description.trim(),
        pattern_family: patFamily,
        pattern_motif: patMotif,
        direct_pattern: directPattern,
        style_mode: styleMode,
        hex_palette: hexPalette,
        repeat_type: repeatType,
      }),
    [description, patFamily, patMotif, directPattern, styleMode, hexPalette, repeatType],
  );

  async function handleExportSvg() {
    if (!result) return;
    setSvgLoading(true);
    setSvgError("");
    try {
      const svg = await vectorize({ src: result });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pattern.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setSvgError(e instanceof Error ? e.message : String(e));
    } finally {
      setSvgLoading(false);
    }
  }

  async function handleGenerate() {
    if (!description.trim()) return;
    setGenLoading(true);
    setGenError("");
    setResult(null);
    try {
      const imgs = await generate(prompt, { size, quality, n: 1 });
      setResult(imgs[0]);
      await addToGallery({
        src: imgs[0],
        prompt,
        kind: "pattern",
        meta: { repeatType, styleMode, size, quality },
      });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 40, color: "var(--c-muted)" }}>Loading taxonomy…</div>;
  if (error || !data) return <div style={{ padding: 40, color: "#c00" }}>Backend unreachable: {error}</div>;

  const colorLabels = ["Colour 1", "Colour 2", "Colour 3", "Colour 4"];

  return (
    <PageWrapper
      title="Pattern / Textile Design"
      subtitle="Free brief + cultural family + colour palette → fabric-printable design"
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
        <SectionHead n="01" title="Design Brief" subtitle="Required — describe the feeling, motif, or reference" />
        <TextArea
          value={description}
          onChange={setDescription}
          rows={4}
          placeholder="e.g., 'delicate paisley with leafy vines, slightly hand-painted feel, gentle asymmetry'"
        />
      </div>

      <div>
        <SectionHead n="02" title="Family & Motif" subtitle="Optional — drives cultural vocabulary in the prompt" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormGrid cols={2}>
            <Select label="Pattern Family" options={Object.keys(data.pattern_families)} value={patFamily} onChange={setPatFamily} placeholder="Skip…" />
            <Select label="Motif" options={motifOpts} value={patMotif} onChange={setPatMotif} placeholder="Skip…" disabled={!patFamily} />
          </FormGrid>
          <Select
            label="Or — Contemporary Pattern Reference"
            options={data.patterns}
            value={directPattern}
            onChange={setDirectPattern}
            placeholder="Skip…"
          />
        </div>
      </div>

      <div>
        <SectionHead n="03" title="Repeat & Style" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RadioGroup label="Repeat Behaviour" options={data.repeat_types} value={repeatType} onChange={setRepeatType} />
          <Select label="Style Mode" options={data.style_modes} value={styleMode} onChange={(v) => v && setStyleMode(v)} />
        </div>
      </div>

      <div>
        <SectionHead n="04" title="Colour Palette" subtitle="Up to 4 hex values" />
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {colors.map((c, i) => (
            <div key={i}>
              {i > 0 ? (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-muted)", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={useColor[i]}
                    onChange={(e) => {
                      const u = [...useColor];
                      u[i] = e.target.checked;
                      setUseColor(u);
                    }}
                  />
                  {colorLabels[i]}
                </label>
              ) : (
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 8 }}>
                  {colorLabels[i]}
                </div>
              )}
              <ColorPicker
                value={c}
                onChange={(v) => {
                  const nc = [...colors];
                  nc[i] = v;
                  setColors(nc);
                }}
                disabled={i > 0 && !useColor[i]}
              />
            </div>
          ))}
        </div>
        {hexPalette.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {hexPalette.map((c, i) => (
              <div
                key={i}
                title={c}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  background: c,
                  border: "1px solid var(--c-border)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <PromptPreview prompt={prompt} />

      {genError && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 4, fontSize: 13, color: "#c00" }}>
          {genError}
        </div>
      )}

      <PrimaryButton onClick={handleGenerate} disabled={!description.trim()} loading={genLoading}>
        {genLoading ? "Generating textile…" : "Generate Pattern"}
      </PrimaryButton>

      {result && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-muted)" }}>
            {repeatType} · {styleMode}
          </p>
          <ImageResult
            src={result}
            label={`${repeatType} · ${styleMode}`}
            kind="pattern"
            prompt={prompt}
            meta={{ repeatType, styleMode, size, quality }}
            onSaveToGallery={addToGallery}
          />
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => void handleExportSvg()}
              disabled={svgLoading}
              style={{
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid var(--c-border)",
                borderRadius: 4,
                background: "var(--c-surface)",
                color: "var(--c-fg)",
                cursor: svgLoading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {svgLoading ? "Vectorizing…" : "Export as SVG"}
            </button>
            <span style={{ fontSize: 11, color: "var(--c-muted)" }}>
              Opens in Adobe Illustrator &amp; Inkscape
            </span>
          </div>
          {svgError && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#c00" }}>{svgError}</p>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
