"""
Page 1 — Apparel from dropdowns (text -> image).
Drives gpt-image-2 from the cascading apparel taxonomy.
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

# Make the POC root importable when Streamlit runs this file directly.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from apparel_options import (  # noqa: E402
    GENDER_OPTIONS,
    categories_for_gender,
    subtypes_for,
    features_for,
    fabric_options,
    pattern_options,
    embroidery_options,
    wash_options,
    pattern_family_options,
    motifs_for_family,
)
from prompts import build_apparel_prompt  # noqa: E402
import image_client  # noqa: E402

st.set_page_config(page_title="Apparel · Dropdowns", page_icon="👗", layout="wide")

if "gallery" not in st.session_state:
    st.session_state.gallery = []

SKIP = "— skip / let model decide —"


def _select(label: str, options: list[str], *, key: str, allow_skip: bool = True, help: str | None = None):
    opts = ([SKIP] + options) if allow_skip else options
    return st.selectbox(label, opts, key=key, help=help)


def _value(v: str | None) -> str | None:
    if v is None or v == SKIP:
        return None
    return v


st.title("Apparel from dropdowns")
st.caption("Gender → category → sub-type → silhouette/details → fabric → pattern → colour → photography.")

# ---- Output sidebar ----
with st.sidebar:
    st.header("Output settings")
    size = st.selectbox("Size", image_client.SUPPORTED_SIZES, index=1)
    quality = st.selectbox("Quality", ["low", "medium", "high"], index=1)
    n = st.slider("Variations (n)", 1, 4, 1, help="Each variation costs a separate generation.")
    st.caption("Tip: use `low` to iterate quickly, `high` for embroidery / dense pattern detail.")

# ---- Step 1: gender + category + subtype ----
st.subheader("1. Garment")
c1, c2, c3 = st.columns(3)
with c1:
    gender = st.radio("Gender", GENDER_OPTIONS, horizontal=True)
with c2:
    categories = categories_for_gender(gender)
    category = st.selectbox("Apparel category", categories, key="cat")
with c3:
    subtypes = subtypes_for(gender, category)
    subtype = st.selectbox("Sub-type", subtypes, key="subtype")

# ---- Step 2: attributes (cascading from features_for) ----
st.subheader("2. Garment details")
feature_schema = features_for(gender, category)
if not feature_schema:
    st.info(
        f"No detailed attribute schema is registered for **{gender} / {category}**. "
        "Use the free-form notes section below to describe details."
    )
    selected_attrs: dict[str, str] = {}
else:
    selected_attrs = {}
    cols = st.columns(2)
    for idx, (attr_name, schema) in enumerate(feature_schema.items()):
        with cols[idx % 2]:
            choice = _select(
                attr_name,
                list(schema.get("enum", [])),
                key=f"attr_{attr_name}",
                help=schema.get("description"),
            )
            if _value(choice) is not None:
                selected_attrs[attr_name] = choice

# ---- Step 3: material ----
st.subheader("3. Material")
m1, m2 = st.columns(2)
with m1:
    fabric_kind = st.radio("Fabric kind", ["Woven", "Knit", "skip"], horizontal=True)
    if fabric_kind == "Woven":
        fabric_value = _select("Woven fabric", fabric_options("Woven Fabrics"), key="fab_w")
    elif fabric_kind == "Knit":
        fabric_value = _select("Knit fabric", fabric_options("Knitted Fabrics"), key="fab_k")
    else:
        fabric_value = None
with m2:
    pattern = _select("Pattern", pattern_options(), key="pattern")
    embroidery = _select("Embroidery", embroidery_options(), key="emb")
    wash = _select("Wash", wash_options(), key="wash")

# ---- Step 4: cultural pattern family ----
st.subheader("4. Cultural pattern (optional)")
p1, p2 = st.columns(2)
with p1:
    pattern_family = _select("Family", pattern_family_options(), key="fam")
with p2:
    motif_options = motifs_for_family(_value(pattern_family) or "")
    pattern_motif = _select("Motif", motif_options, key="motif") if motif_options else None

# ---- Step 5: colour ----
st.subheader("5. Colour palette")
c_a, c_b, c_c = st.columns(3)
with c_a:
    primary_hex = st.color_picker("Primary (required)", value="#5B2A86")
with c_b:
    use_secondary = st.checkbox("Add secondary")
    secondary_hex = st.color_picker("Secondary", value="#E0B084", disabled=not use_secondary)
with c_c:
    use_accent = st.checkbox("Add accent")
    accent_hex = st.color_picker("Accent", value="#1B3A6B", disabled=not use_accent)

# ---- Step 6: photography ----
st.subheader("6. Photography")
ph1, ph2, ph3 = st.columns(3)
with ph1:
    background = st.selectbox(
        "Background",
        ["white seamless", "studio grey", "lifestyle outdoor", "runway", "flat lay"],
    )
with ph2:
    photo_style = st.selectbox(
        "Style",
        ["ecommerce catalog", "editorial", "lookbook"],
    )
with ph3:
    framing = st.selectbox(
        "Framing",
        ["full body", "3/4 body", "flat lay"],
    )

# ---- Step 7: free-form notes ----
free_form_notes = st.text_area(
    "7. Additional notes",
    placeholder="Any extra creative direction (e.g., 'monsoon-ready, slightly oversized, hand-block-printed feel').",
    height=80,
)

# ---- Build prompt ----
selections = {
    "gender": gender,
    "category": category,
    "subtype": subtype,
    "attributes": selected_attrs,
    "fabric_kind": fabric_kind if fabric_kind != "skip" else None,
    "fabric_value": _value(fabric_value),
    "pattern": _value(pattern),
    "embroidery": _value(embroidery),
    "wash": _value(wash),
    "pattern_family": _value(pattern_family),
    "pattern_motif": _value(pattern_motif),
    "primary_hex": primary_hex,
    "secondary_hex": secondary_hex if use_secondary else None,
    "accent_hex": accent_hex if use_accent else None,
    "background": background,
    "photo_style": photo_style,
    "framing": framing,
    "free_form_notes": free_form_notes.strip() or None,
}
prompt = build_apparel_prompt(selections)

with st.expander("Prompt preview", expanded=False):
    st.code(prompt, language="markdown")

# ---- Generate ----
if st.button("Generate", type="primary", use_container_width=True):
    with st.spinner(f"Generating {n} image(s) at {size} / {quality}…"):
        try:
            images = image_client.generate(prompt, size=size, quality=quality, n=n)
        except Exception as e:
            st.error(f"Generation failed: {e}")
            st.stop()

    st.success(f"Generated {len(images)} image(s).")
    cols = st.columns(min(len(images), 2))
    for i, img_bytes in enumerate(images):
        with cols[i % len(cols)]:
            st.image(img_bytes, caption=f"{subtype} · variation {i+1}")
            st.download_button(
                "Download PNG",
                img_bytes,
                file_name=f"{gender}_{category}_{subtype}_{i+1}.png".replace("/", "-"),
                mime="image/png",
                key=f"dl_{i}",
            )
        st.session_state.gallery.append(
            {
                "image": img_bytes,
                "prompt": prompt,
                "kind": "apparel",
                "meta": {
                    "gender": gender,
                    "category": category,
                    "subtype": subtype,
                    "size": size,
                    "quality": quality,
                },
            }
        )
