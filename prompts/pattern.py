"""
Textile / print pattern prompt builder.
"""

from __future__ import annotations


REPEAT_INSTRUCTIONS = {
    "Seamless tile": (
        "Seamless tileable repeat — the left edge must match the right edge, "
        "and the top edge must match the bottom, so the design tiles cleanly "
        "across a fabric with no visible seams."
    ),
    "Allover scattered": "Allover scattered motif distributed evenly across the canvas.",
    "Centered placement": "Single centered placement print, generous negative space around it.",
    "Border panel": "Horizontal border / panel layout intended for a saree pallu, dupatta edge, or hem panel.",
}


def build_pattern_prompt(s: dict) -> str:
    """
    Inputs (selections dict):
      description (required)
      pattern_family, pattern_motif (optional)
      direct_pattern (optional, e.g. from fabrics["pattern"]["enum"])
      style_mode (e.g. "flat vector", "watercolor", "hand-painted", "digital screenprint")
      hex_palette: list[str] (1-4 hex codes)
      repeat_type (key in REPEAT_INSTRUCTIONS)
    """
    repeat_type = s.get("repeat_type", "Seamless tile")
    repeat_instruction = REPEAT_INSTRUCTIONS.get(repeat_type, REPEAT_INSTRUCTIONS["Seamless tile"])

    header = f"Generate a {repeat_type.lower()} textile / print design."

    # Family block
    family_lines = []
    if s.get("pattern_family"):
        family_lines.append(f"- Family: {s['pattern_family']}")
    if s.get("pattern_motif"):
        family_lines.append(f"- Motif: {s['pattern_motif']}")
    if s.get("direct_pattern"):
        family_lines.append(f"- Pattern reference: {s['direct_pattern']}")
    if s.get("style_mode"):
        family_lines.append(f"- Style mode: {s['style_mode']}")
    family_block = "CULTURAL / STYLISTIC FAMILY\n" + "\n".join(family_lines) if family_lines else None

    # Palette
    palette = [c for c in s.get("hex_palette", []) if c]
    palette_block = (
        "COLOUR PALETTE (use these hex values exactly)\n- " + ", ".join(palette)
        if palette
        else None
    )

    repeat_block = "REPEAT BEHAVIOUR\n- " + repeat_instruction

    description = s.get("description", "").strip()
    brief_block = f"DESIGN BRIEF\n{description}" if description else None

    constraints = (
        "CONSTRAINTS\n"
        "- Flat 2D textile design only — no model, no garment, no 3D mockup\n"
        "- No watermarks, no signatures, no text in the design\n"
        "- Crisp edges suitable for fabric printing\n"
        "- Balanced composition with even visual weight across the canvas"
    )

    blocks = [header, family_block, palette_block, repeat_block, brief_block, constraints]
    return "\n\n".join(b for b in blocks if b)
