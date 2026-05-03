export interface SketchSelections {
  subtype?: string | null;
  fabric_value?: string | null;
  primary_hex?: string | null;
  secondary_hex?: string | null;
  pattern?: string | null;
  embroidery?: string | null;
  background?: string | null;
  free_form_notes?: string | null;
}

const SKIP = new Set([null, undefined, "", "None", "skip", "Skip"]);
function opt(label: string, value: unknown): string | null {
  if (SKIP.has(value as never)) return null;
  return `- ${label}: ${value}`;
}

export function buildSketchPrompt(s: SketchSelections): string {
  const subtype = s.subtype ?? "garment";
  const background = s.background ?? "white seamless";

  const header =
    `Turn this sketch into a photorealistic product photograph of a ${subtype}.\n\n` +
    "PRESERVE FROM THE SKETCH\n" +
    "- Exact silhouette, proportions, and perspective\n" +
    "- Garment geometry (neckline, sleeve, hem placement as drawn)\n" +
    "- Layout and composition";

  let colourLine: string | null = null;
  if (s.primary_hex) {
    let str = `primary ${s.primary_hex}`;
    if (s.secondary_hex) str += `, secondary ${s.secondary_hex}`;
    colourLine = `- Colour: ${str}`;
  }

  const realismLines = [
    opt("Material", s.fabric_value),
    colourLine,
    opt("Pattern", s.pattern),
    opt("Embroidery", s.embroidery),
    `- Background: ${background}`,
    "- Lighting: soft diffuse studio softbox, natural shadows",
    "- Realistic fabric drape, weave/knit texture, contact shadow",
  ].filter((l): l is string => Boolean(l));
  const realism = `ADD REALISM\n${realismLines.join("\n")}`;

  const constraints =
    "CONSTRAINTS\n" +
    "- Do not add new elements, garments, or text\n" +
    "- Do not reinterpret the design — render the sketch as drawn\n" +
    "- No watermarks, no brand logos";

  const notes = s.free_form_notes ? `ADDITIONAL NOTES\n${s.free_form_notes}` : null;

  return [header, realism, constraints, notes]
    .filter((b): b is string => Boolean(b))
    .join("\n\n");
}
