"""
Page 3 — Pattern / textile design generation.
Free description + cultural family + motif + hex palette -> tile / allover /
placement / border.
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from apparel_options import (  # noqa: E402
    pattern_family_options,
    motifs_for_family,
    pattern_options,
)
from prompts import build_pattern_prompt  # noqa: E402
from prompts.pattern import REPEAT_INSTRUCTIONS  # noqa: E402
import image_client  # noqa: E402

st.set_page_config(page_title="Pattern Generation", page_icon="🧵", layout="wide")

if "gallery" not in st.session_state:
    st.session_state.gallery = []

SKIP = "— skip —"


def _v(x):
    return None if (x is None or x == SKIP) else x


st.title("Pattern / textile design")
st.caption("Free brief + cultural family + colour palette → fabric-printable design.")

with st.sidebar:
    st.header("Output settings")
    size = st.selectbox("Size", image_client.SUPPORTED_SIZES, index=0, help="1024×1024 is best for tileable repeats.")
    quality = st.selectbox("Quality", ["low", "medium", "high"], index=1)

# ---- Brief ----
description = st.text_area(
    "1. Design brief (required)",
    placeholder="e.g., 'delicate paisley with leafy vines, slightly hand-painted feel, gentle asymmetry'",
    height=110,
)

# ---- Family / motif ----
st.subheader("2. Family & motif (optional)")
fc1, fc2 = st.columns(2)
with fc1:
    family = st.selectbox("Pattern family", [SKIP] + pattern_family_options())
with fc2:
    motifs = motifs_for_family(_v(family) or "")
    motif = st.selectbox("Motif within family", [SKIP] + motifs) if motifs else None

direct_pattern = st.selectbox(
    "Or pick a contemporary pattern reference",
    [SKIP] + pattern_options(),
    help="Use this when you want a Western / contemporary pattern directly (e.g., 'Houndstooth', 'Damask florals').",
)

# ---- Repeat & style ----
st.subheader("3. Repeat & style")
rs1, rs2 = st.columns(2)
with rs1:
    repeat_type = st.radio("Repeat behaviour", list(REPEAT_INSTRUCTIONS.keys()), index=0)
with rs2:
    style_mode = st.selectbox(
        "Style mode",
        ["flat vector", "watercolor", "hand-painted", "digital screenprint", "block print"],
    )

# ---- Palette ----
st.subheader("4. Colour palette")
pc1, pc2, pc3, pc4 = st.columns(4)
with pc1:
    c1 = st.color_picker("Colour 1", value="#1B3A6B")
with pc2:
    use2 = st.checkbox("+ 2nd")
    c2 = st.color_picker("Colour 2", value="#E0B084", disabled=not use2)
with pc3:
    use3 = st.checkbox("+ 3rd")
    c3 = st.color_picker("Colour 3", value="#8C2A35", disabled=not use3)
with pc4:
    use4 = st.checkbox("+ 4th")
    c4 = st.color_picker("Colour 4", value="#F4ECD8", disabled=not use4)

palette = [c1] + ([c2] if use2 else []) + ([c3] if use3 else []) + ([c4] if use4 else [])

selections = {
    "description": description.strip(),
    "pattern_family": _v(family),
    "pattern_motif": _v(motif),
    "direct_pattern": _v(direct_pattern),
    "style_mode": style_mode,
    "hex_palette": palette,
    "repeat_type": repeat_type,
}
prompt = build_pattern_prompt(selections)

with st.expander("Prompt preview", expanded=False):
    st.code(prompt, language="markdown")

if st.button("Generate", type="primary", use_container_width=True, disabled=not description.strip()):
    with st.spinner(f"Generating textile design at {size} / {quality}…"):
        try:
            images = image_client.generate(prompt, size=size, quality=quality, n=1)
        except Exception as e:
            st.error(f"Generation failed: {e}")
            st.stop()

    st.success("Done.")
    st.image(images[0], caption=f"{repeat_type} · {style_mode}")
    st.download_button(
        "Download PNG",
        images[0],
        file_name=f"pattern_{repeat_type.replace(' ', '_').lower()}.png",
        mime="image/png",
    )
    st.session_state.gallery.append(
        {
            "image": images[0],
            "prompt": prompt,
            "kind": "pattern",
            "meta": {"repeat_type": repeat_type, "size": size, "quality": quality},
        }
    )
