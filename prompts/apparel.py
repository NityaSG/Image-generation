"""
Build a hyper-personalized prompt for gpt-image-2 from cascading dropdown
selections (gender / category / sub-type / attributes / fabric / pattern /
colour / photography). Follows the GPT image prompting guide:
structure -> goal -> specificity -> constraints.
"""

from __future__ import annotations

from typing import Any


def _line(label: str, value: Any) -> str | None:
    if value in (None, "", "None", "skip", "Skip"):
        return None
    return f"- {label}: {value}"


def _section(title: str, lines: list[str | None]) -> str | None:
    kept = [ln for ln in lines if ln]
    if not kept:
        return None
    return "\n".join([title, *kept])


def _colour_block(primary: str, secondary: str | None, accent: str | None) -> str:
    rows = [f"- Primary: {primary}"]
    if secondary:
        rows.append(f"- Secondary: {secondary}")
    if accent:
        rows.append(f"- Accent: {accent}")
    rows.append("Render the colours faithfully to these hex values.")
    return "COLOUR\n" + "\n".join(rows)


def build_apparel_prompt(s: dict) -> str:
    """
    Inputs (selections dict). All except gender / category / subtype / primary_hex
    / background may be None / "skip".

      gender, category, subtype
      attributes: dict[str, str]   (Fit, Necklines & collars, Sleeve types, ...)
      fabric_kind: "Woven" | "Knit"
      fabric_value: e.g. "Linen", "Single Jersey"
      pattern, embroidery, wash
      pattern_family, pattern_motif
      primary_hex, secondary_hex, accent_hex
      background, photo_style, framing
      free_form_notes
    """
    gender = s.get("gender", "model")
    category = s.get("category", "garment")
    subtype = s.get("subtype") or category

    header = (
        f"Studio product photograph of a {gender} model wearing a "
        f"{subtype} ({category})."
    )

    # GARMENT DETAILS — comes from get_apparel_features() output, which is
    # already routed correctly between top-wear / bottom-wear / skirts.
    attrs = s.get("attributes") or {}
    detail_lines = [_line(name, value) for name, value in attrs.items()]
    garment = _section("GARMENT DETAILS", detail_lines)

    # MATERIAL
    fabric_kind = s.get("fabric_kind")
    fabric_value = s.get("fabric_value")
    fabric_str = (
        f"{fabric_kind}: {fabric_value}"
        if fabric_kind and fabric_value
        else fabric_value or fabric_kind
    )
    cultural = None
    if s.get("pattern_family") and s.get("pattern_motif"):
        cultural = f"{s['pattern_family']} -> {s['pattern_motif']}"
    elif s.get("pattern_family"):
        cultural = s["pattern_family"]

    material = _section(
        "MATERIAL",
        [
            _line("Fabric", fabric_str),
            _line("Pattern", s.get("pattern")),
            _line("Cultural pattern influence", cultural),
            _line("Embroidery", s.get("embroidery")),
            _line("Wash", s.get("wash")),
        ],
    )

    colour = _colour_block(
        s["primary_hex"],
        s.get("secondary_hex"),
        s.get("accent_hex"),
    )

    photography = _section(
        "PHOTOGRAPHY",
        [
            _line("Background", s.get("background")),
            _line("Style", s.get("photo_style")),
            "- Lighting: soft diffuse studio softbox, natural white balance",
            _line("Framing", s.get("framing")),
            "- Camera: 50mm equivalent, shallow depth of field",
        ],
    )

    constraints = (
        "CONSTRAINTS\n"
        "- Photorealistic, real fabric texture (visible weave/knit, natural drape and folds)\n"
        "- No watermarks, no brand logos, no text in the image\n"
        "- No accessories beyond those specified\n"
        "- Do not modify garment geometry beyond the spec above"
    )

    notes = s.get("free_form_notes")
    notes_block = f"ADDITIONAL NOTES\n{notes}" if notes else None

    blocks = [header, garment, material, colour, photography, constraints, notes_block]
    return "\n\n".join(b for b in blocks if b)
