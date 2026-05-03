// TS port of POC/prompts/apparel.py — keeps prompt logic identical on both sides
// so client-side preview matches server-side regeneration.

export interface ApparelSelections {
  gender?: string | null;
  category?: string | null;
  subtype?: string | null;
  attributes?: Record<string, string | null>;
  fabric_kind?: string | null;
  fabric_value?: string | null;
  pattern?: string | null;
  embroidery?: string | null;
  wash?: string | null;
  pattern_family?: string | null;
  pattern_motif?: string | null;
  primary_hex: string;
  secondary_hex?: string | null;
  accent_hex?: string | null;
  background?: string | null;
  photo_style?: string | null;
  framing?: string | null;
  free_form_notes?: string | null;
}

const SKIP_VALUES = new Set([null, undefined, "", "None", "skip", "Skip"]);

function line(label: string, value: unknown): string | null {
  if (SKIP_VALUES.has(value as never)) return null;
  return `- ${label}: ${value}`;
}

function section(title: string, lines: Array<string | null>): string | null {
  const kept = lines.filter((l): l is string => Boolean(l));
  if (!kept.length) return null;
  return [title, ...kept].join("\n");
}

export function buildApparelPrompt(s: ApparelSelections): string {
  const gender = s.gender ?? "model";
  const category = s.category ?? "garment";
  const subtype = s.subtype ?? category;

  const header = `Studio product photograph of a ${gender} model wearing a ${subtype} (${category}).`;

  const attrs = s.attributes ?? {};
  const detail = section(
    "GARMENT DETAILS",
    Object.entries(attrs).map(([name, value]) => line(name, value)),
  );

  const fabricStr =
    s.fabric_kind && s.fabric_value
      ? `${s.fabric_kind}: ${s.fabric_value}`
      : s.fabric_value ?? s.fabric_kind ?? null;

  let cultural: string | null = null;
  if (s.pattern_family && s.pattern_motif) {
    cultural = `${s.pattern_family} -> ${s.pattern_motif}`;
  } else if (s.pattern_family) {
    cultural = s.pattern_family;
  }

  const material = section("MATERIAL", [
    line("Fabric", fabricStr),
    line("Pattern", s.pattern),
    line("Cultural pattern influence", cultural),
    line("Embroidery", s.embroidery),
    line("Wash", s.wash),
  ]);

  const colourLines = [`- Primary: ${s.primary_hex}`];
  if (s.secondary_hex) colourLines.push(`- Secondary: ${s.secondary_hex}`);
  if (s.accent_hex) colourLines.push(`- Accent: ${s.accent_hex}`);
  colourLines.push("Render the colours faithfully to these hex values.");
  const colour = `COLOUR\n${colourLines.join("\n")}`;

  const photography = section("PHOTOGRAPHY", [
    line("Background", s.background),
    line("Style", s.photo_style),
    "- Lighting: soft diffuse studio softbox, natural white balance",
    line("Framing", s.framing),
    "- Camera: 50mm equivalent, shallow depth of field",
  ]);

  const constraints =
    "CONSTRAINTS\n" +
    "- Photorealistic, real fabric texture (visible weave/knit, natural drape and folds)\n" +
    "- No watermarks, no brand logos, no text in the image\n" +
    "- No accessories beyond those specified\n" +
    "- Do not modify garment geometry beyond the spec above";

  const notes = s.free_form_notes ? `ADDITIONAL NOTES\n${s.free_form_notes}` : null;

  return [header, detail, material, colour, photography, constraints, notes]
    .filter((b): b is string => Boolean(b))
    .join("\n\n");
}
