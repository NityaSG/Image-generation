"""
Page 2 — Sketch -> Realistic apparel render.
Takes an uploaded sketch + optional disambiguating dropdowns, and renders a
photorealistic product photo using gpt-image-2's edit endpoint.
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from apparel_options import (  # noqa: E402
    GENDER_OPTIONS,
    categories_for_gender,
    subtypes_for,
    fabric_options,
    pattern_options,
    embroidery_options,
)
from prompts import build_sketch_prompt  # noqa: E402
import image_client  # noqa: E402

st.set_page_config(page_title="Sketch → Realistic", page_icon="✏️", layout="wide")

if "gallery" not in st.session_state:
    st.session_state.gallery = []

SKIP = "— skip —"


def _v(x: str | None) -> str | None:
    return None if (x is None or x == SKIP) else x


st.title("Sketch → Realistic apparel")
st.caption("Upload a hand sketch. The model preserves silhouette and proportions while adding fabric, colour and lighting.")

with st.sidebar:
    st.header("Output settings")
    size = st.selectbox("Size", image_client.SUPPORTED_SIZES, index=1)
    quality = st.selectbox("Quality", ["low", "medium", "high"], index=1, help="Sketch renders benefit from `high` for detailed line interpretation.")

# ---- Upload ----
st.subheader("1. Sketch")
uploaded = st.file_uploader("Upload sketch (PNG / JPG)", type=["png", "jpg", "jpeg"])
if uploaded is None:
    st.info("Upload a sketch to enable generation.")
sketch_bytes = uploaded.read() if uploaded is not None else None
if sketch_bytes is not None:
    st.image(sketch_bytes, caption="Source sketch", width=320)

# ---- Optional disambiguation ----
st.subheader("2. Optional disambiguation")
st.caption("All fields below are optional — the sketch is the source of truth for geometry. These just steer fabric, colour, and pattern.")

c1, c2, c3 = st.columns(3)
with c1:
    gender = st.radio("Gender (optional)", ["skip"] + GENDER_OPTIONS, horizontal=True, index=0)
with c2:
    if gender != "skip":
        category_opts = ["skip"] + categories_for_gender(gender)
        category = st.selectbox("Category", category_opts)
    else:
        category = "skip"
with c3:
    if category not in (None, "skip"):
        subtype_opts = ["skip"] + subtypes_for(gender, category)
        subtype = st.selectbox("Sub-type", subtype_opts)
    else:
        subtype = "skip"

f1, f2 = st.columns(2)
with f1:
    fabric_kind = st.radio("Fabric kind", ["skip", "Woven", "Knit"], horizontal=True, index=0)
    if fabric_kind == "Woven":
        fabric_value = st.selectbox("Woven fabric", [SKIP] + fabric_options("Woven Fabrics"))
    elif fabric_kind == "Knit":
        fabric_value = st.selectbox("Knit fabric", [SKIP] + fabric_options("Knitted Fabrics"))
    else:
        fabric_value = None
with f2:
    pattern = st.selectbox("Pattern", [SKIP] + pattern_options())
    embroidery = st.selectbox("Embroidery", [SKIP] + embroidery_options())

st.subheader("3. Colour")
cc1, cc2 = st.columns(2)
with cc1:
    use_primary = st.checkbox("Set primary colour from sketch?", value=True)
    primary_hex = st.color_picker("Primary", value="#E8DCC4", disabled=not use_primary)
with cc2:
    use_secondary = st.checkbox("Add secondary")
    secondary_hex = st.color_picker("Secondary", value="#5B2A86", disabled=not use_secondary)

st.subheader("4. Background & notes")
background = st.selectbox(
    "Background",
    ["white seamless", "studio grey", "lifestyle outdoor", "runway", "flat lay"],
)
free_form_notes = st.text_area(
    "Additional notes",
    placeholder="e.g., 'render as a slightly cropped 3/4 shot, soft golden-hour light'",
    height=80,
)

# ---- Build prompt ----
selections = {
    "subtype": _v(subtype),
    "fabric_value": _v(fabric_value),
    "primary_hex": primary_hex if use_primary else None,
    "secondary_hex": secondary_hex if use_secondary else None,
    "pattern": _v(pattern),
    "embroidery": _v(embroidery),
    "background": background,
    "free_form_notes": free_form_notes.strip() or None,
}
prompt = build_sketch_prompt(selections)

with st.expander("Prompt preview", expanded=False):
    st.code(prompt, language="markdown")

# ---- Generate ----
disabled = sketch_bytes is None
if st.button("Render", type="primary", use_container_width=True, disabled=disabled):
    with st.spinner(f"Rendering at {size} / {quality}…"):
        try:
            images = image_client.edit(prompt, [sketch_bytes], size=size, quality=quality, n=1)
        except Exception as e:
            st.error(f"Render failed: {e}")
            st.stop()

    st.success("Render complete.")
    out_col1, out_col2 = st.columns(2)
    with out_col1:
        st.image(sketch_bytes, caption="Sketch")
    with out_col2:
        st.image(images[0], caption="Realistic render")
        st.download_button(
            "Download PNG",
            images[0],
            file_name="sketch_render.png",
            mime="image/png",
        )

    st.session_state.gallery.append(
        {
            "image": images[0],
            "prompt": prompt,
            "kind": "sketch",
            "meta": {"size": size, "quality": quality},
        }
    )
