import { useEffect, useMemo, useState } from "react";

import { generate } from "../api/client";
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
import { buildApparelPrompt } from "../prompts";
import { useGallery } from "../theme/GalleryContext";

export function PageApparel() {
  const { addToGallery } = useGallery();
  const { data, loading: loadingTaxonomy, error } = useTaxonomy();

  const [gender, setGender] = useState("female");
  const [category, setCategory] = useState<string | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [attrs, setAttrs] = useState<Record<string, string | null>>({});

  const [fabricKind, setFabricKind] = useState("skip");
  const [fabricVal, setFabricVal] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);
  const [emb, setEmb] = useState<string | null>(null);
  const [wash, setWash] = useState<string | null>(null);

  const [patFamily, setPatFamily] = useState<string | null>(null);
  const [patMotif, setPatMotif] = useState<string | null>(null);

  const [primary, setPrimary] = useState("#5B2A86");
  const [useSecond, setUseSecond] = useState(false);
  const [secondary, setSecondary] = useState("#E0B084");
  const [useAccent, setUseAccent] = useState(false);
  const [accent, setAccent] = useState("#1B3A6B");

  const [background, setBackground] = useState<string | null>("white seamless");
  const [photoStyle, setPhotoStyle] = useState<string | null>("ecommerce catalog");
  const [framing, setFraming] = useState<string | null>("full body");
  const [notes, setNotes] = useState("");

  const [size, setSize] = useState("1024x1536");
  const [quality, setQuality] = useState("medium");
  const [n, setN] = useState(1);
  const [genLoading, setGenLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [genError, setGenError] = useState("");

  const categories = data && gender ? data.categories[gender] ?? [] : [];
  const subtypes = data && category ? data.subtypes[`${gender}/${category}`] ?? [] : [];
  const features = data && category ? data.features[`${gender}/${category}`] ?? {} : {};
  const motifOpts = data && patFamily ? data.pattern_families[patFamily] ?? [] : [];

  useEffect(() => {
    setCategory(null);
    setSubtype(null);
    setAttrs({});
  }, [gender]);
  useEffect(() => {
    setSubtype(null);
    setAttrs({});
  }, [category]);
  useEffect(() => {
    setPatMotif(null);
  }, [patFamily]);

  const prompt = useMemo(
    () =>
      buildApparelPrompt({
        gender,
        category,
        subtype,
        attributes: attrs,
        fabric_kind: fabricKind !== "skip" ? fabricKind : null,
        fabric_value: fabricVal,
        pattern,
        embroidery: emb,
        wash,
        pattern_family: patFamily,
        pattern_motif: patMotif,
        primary_hex: primary,
        secondary_hex: useSecond ? secondary : null,
        accent_hex: useAccent ? accent : null,
        background,
        photo_style: photoStyle,
        framing,
        free_form_notes: notes.trim() || null,
      }),
    [
      gender,
      category,
      subtype,
      attrs,
      fabricKind,
      fabricVal,
      pattern,
      emb,
      wash,
      patFamily,
      patMotif,
      primary,
      useSecond,
      secondary,
      useAccent,
      accent,
      background,
      photoStyle,
      framing,
      notes,
    ],
  );

  async function handleGenerate() {
    setGenLoading(true);
    setGenError("");
    setResults([]);
    try {
      const imgs = await generate(prompt, { size, quality, n });
      setResults(imgs);
      const meta = { gender, category, subtype, size, quality };
      await Promise.all(
        imgs.map((src) => addToGallery({ src, prompt, kind: "apparel", meta })),
      );
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenLoading(false);
    }
  }

  if (loadingTaxonomy) return <div style={{ padding: 40, color: "var(--c-muted)" }}>Loading taxonomy…</div>;
  if (error || !data) {
    return (
      <div style={{ padding: 40, color: "#c00" }}>
        Failed to load taxonomy: {error}. Make sure the FastAPI backend is running on
        localhost:8000.
      </div>
    );
  }

  return (
    <PageWrapper
      title="Apparel from Dropdowns"
      subtitle="Gender → category → sub-type → details → fabric → colour → photography"
      sidebar={
        <OutputSettings
          size={size}
          quality={quality}
          n={n}
          sizes={data.sizes}
          qualities={data.qualities}
          onSize={setSize}
          onQuality={setQuality}
          onN={setN}
          showN
        />
      }
    >
      <div>
        <SectionHead n="01" title="Garment" />
        <FormGrid cols={3}>
          <RadioGroup
            label="Gender"
            options={data.GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <Select
            label="Category"
            options={categories}
            value={category}
            onChange={setCategory}
            placeholder="Select category…"
          />
          <Select
            label="Sub-type"
            options={subtypes}
            value={subtype}
            onChange={setSubtype}
            placeholder="Select sub-type…"
            disabled={!category}
          />
        </FormGrid>
      </div>

      {Object.keys(features).length > 0 && (
        <div>
          <SectionHead n="02" title="Garment Details" subtitle="Cascaded from category selection" />
          <FormGrid cols={2}>
            {Object.entries(features).map(([name, vals]) => (
              <Select
                key={name}
                label={name}
                options={vals}
                value={attrs[name] ?? null}
                onChange={(v) => setAttrs((a) => ({ ...a, [name]: v }))}
                placeholder="Skip…"
              />
            ))}
          </FormGrid>
        </div>
      )}

      <div>
        <SectionHead n="03" title="Material" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <Select
              label="Woven Fabric"
              options={data.woven_fabrics}
              value={fabricVal}
              onChange={setFabricVal}
              placeholder="Skip…"
            />
          )}
          {fabricKind === "Knit" && (
            <Select
              label="Knit Fabric"
              options={data.knit_fabrics}
              value={fabricVal}
              onChange={setFabricVal}
              placeholder="Skip…"
            />
          )}
          <FormGrid cols={3}>
            <Select label="Pattern" options={data.patterns} value={pattern} onChange={setPattern} placeholder="Skip…" />
            <Select label="Embroidery" options={data.embroidery} value={emb} onChange={setEmb} placeholder="Skip…" />
            <Select label="Wash" options={data.washes} value={wash} onChange={setWash} placeholder="Skip…" />
          </FormGrid>
        </div>
      </div>

      <div>
        <SectionHead n="04" title="Cultural Pattern" subtitle="Optional — drives prompt motif vocabulary" />
        <FormGrid cols={2}>
          <Select
            label="Family"
            options={Object.keys(data.pattern_families)}
            value={patFamily}
            onChange={setPatFamily}
            placeholder="Skip…"
          />
          <Select
            label="Motif"
            options={motifOpts}
            value={patMotif}
            onChange={setPatMotif}
            placeholder="Skip…"
            disabled={!patFamily}
          />
        </FormGrid>
      </div>

      <div>
        <SectionHead n="05" title="Colour Palette" />
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <ColorPicker label="Primary (required)" value={primary} onChange={setPrimary} />
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-muted)", marginBottom: 8 }}>
              <input type="checkbox" checked={useSecond} onChange={(e) => setUseSecond(e.target.checked)} />
              Secondary
            </label>
            <ColorPicker value={secondary} onChange={setSecondary} disabled={!useSecond} />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-muted)", marginBottom: 8 }}>
              <input type="checkbox" checked={useAccent} onChange={(e) => setUseAccent(e.target.checked)} />
              Accent
            </label>
            <ColorPicker value={accent} onChange={setAccent} disabled={!useAccent} />
          </div>
        </div>
      </div>

      <div>
        <SectionHead n="06" title="Photography" />
        <FormGrid cols={3}>
          <Select label="Background" options={data.backgrounds} value={background} onChange={setBackground} />
          <Select label="Style" options={data.photo_styles} value={photoStyle} onChange={setPhotoStyle} />
          <Select label="Framing" options={data.framings} value={framing} onChange={setFraming} />
        </FormGrid>
      </div>

      <div>
        <SectionHead n="07" title="Additional Notes" subtitle="Any extra creative direction" />
        <TextArea value={notes} onChange={setNotes} placeholder="e.g., 'monsoon-ready, slightly oversized, hand-block-printed feel'" rows={3} />
      </div>

      <PromptPreview prompt={prompt} />

      {genError && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 4, fontSize: 13, color: "#c00" }}>
          {genError}
        </div>
      )}

      <PrimaryButton onClick={handleGenerate} disabled={!category} loading={genLoading}>
        {genLoading ? `Generating ${n} image${n > 1 ? "s" : ""}…` : "Generate"}
      </PrimaryButton>

      {results.length > 0 && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-muted)" }}>
            {results.length} image{results.length > 1 ? "s" : ""} generated
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {results.map((src, i) => (
              <ImageResult
                key={i}
                src={src}
                label={`${subtype || category} · variation ${i + 1}`}
                prompt={prompt}
                kind="apparel"
                meta={{ gender, category, subtype, size, quality }}
                onSaveToGallery={addToGallery}
              />
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
