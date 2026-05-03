"""
Sketch -> realistic apparel render prompt builder.
Mirrors the prompting guide's Drawing -> Image (5.3) and Try-On (5.2) patterns.
"""

from __future__ import annotations


def _opt(label: str, value) -> str | None:
    if value in (None, "", "None", "skip", "Skip"):
        return None
    return f"- {label}: {value}"


def build_sketch_prompt(s: dict) -> str:
    """
    Inputs (selections dict):
      subtype (optional, defaults to "garment")
      fabric_value (optional)
      primary_hex (optional), secondary_hex (optional)
      pattern (optional), embroidery (optional)
      background (optional, defaults to "white seamless")
      free_form_notes (optional)
    """
    subtype = s.get("subtype") or "garment"
    background = s.get("background") or "white seamless"

    header = (
        f"Turn this sketch into a photorealistic product photograph of a {subtype}.\n\n"
        "PRESERVE FROM THE SKETCH\n"
        "- Exact silhouette, proportions, and perspective\n"
        "- Garment geometry (neckline, sleeve, hem placement as drawn)\n"
        "- Layout and composition"
    )

    colour_line = None
    if s.get("primary_hex"):
        colour_str = f"primary {s['primary_hex']}"
        if s.get("secondary_hex"):
            colour_str += f", secondary {s['secondary_hex']}"
        colour_line = f"- Colour: {colour_str}"

    realism_lines = [
        _opt("Material", s.get("fabric_value")),
        colour_line,
        _opt("Pattern", s.get("pattern")),
        _opt("Embroidery", s.get("embroidery")),
        f"- Background: {background}",
        "- Lighting: soft diffuse studio softbox, natural shadows",
        "- Realistic fabric drape, weave/knit texture, contact shadow",
    ]
    realism = "ADD REALISM\n" + "\n".join(ln for ln in realism_lines if ln)

    constraints = (
        "CONSTRAINTS\n"
        "- Do not add new elements, garments, or text\n"
        "- Do not reinterpret the design — render the sketch as drawn\n"
        "- No watermarks, no brand logos"
    )

    notes = s.get("free_form_notes")
    notes_block = f"ADDITIONAL NOTES\n{notes}" if notes else None

    blocks = [header, realism, constraints, notes_block]
    return "\n\n".join(b for b in blocks if b)
