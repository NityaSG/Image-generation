export interface PatternSelections {
  description?: string;
  pattern_family?: string | null;
  pattern_motif?: string | null;
  direct_pattern?: string | null;
  style_mode?: string | null;
  hex_palette?: string[];
  repeat_type?: string;
}

export const REPEAT_INSTRUCTIONS: Record<string, string> = {
  "Seamless tile":
    "Seamless tileable repeat — the left edge must match the right edge, and the top edge must match the bottom, so the design tiles cleanly across a fabric with no visible seams.",
  "Allover scattered": "Allover scattered motif distributed evenly across the canvas.",
  "Centered placement": "Single centered placement print, generous negative space around it.",
  "Border panel": "Horizontal border / panel layout intended for a saree pallu, dupatta edge, or hem panel.",
};

export function buildPatternPrompt(s: PatternSelections): string {
  const repeatType = s.repeat_type ?? "Seamless tile";
  const repeatInstruction = REPEAT_INSTRUCTIONS[repeatType] ?? REPEAT_INSTRUCTIONS["Seamless tile"];

  const header = `Generate a ${repeatType.toLowerCase()} textile / print design.`;

  const familyLines: string[] = [];
  if (s.pattern_family) familyLines.push(`- Family: ${s.pattern_family}`);
  if (s.pattern_motif) familyLines.push(`- Motif: ${s.pattern_motif}`);
  if (s.direct_pattern) familyLines.push(`- Pattern reference: ${s.direct_pattern}`);
  if (s.style_mode) familyLines.push(`- Style mode: ${s.style_mode}`);
  const familyBlock = familyLines.length ? `CULTURAL / STYLISTIC FAMILY\n${familyLines.join("\n")}` : null;

  const palette = (s.hex_palette ?? []).filter(Boolean);
  const paletteBlock = palette.length
    ? `COLOUR PALETTE (use these hex values exactly)\n- ${palette.join(", ")}`
    : null;

  const repeatBlock = `REPEAT BEHAVIOUR\n- ${repeatInstruction}`;

  const description = (s.description ?? "").trim();
  const briefBlock = description ? `DESIGN BRIEF\n${description}` : null;

  const constraints =
    "CONSTRAINTS\n" +
    "- Flat 2D textile design only — no model, no garment, no 3D mockup\n" +
    "- No watermarks, no signatures, no text in the design\n" +
    "- Crisp edges suitable for fabric printing\n" +
    "- Balanced composition with even visual weight across the canvas";

  return [header, familyBlock, paletteBlock, repeatBlock, briefBlock, constraints]
    .filter((b): b is string => Boolean(b))
    .join("\n\n");
}
