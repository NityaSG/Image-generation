"""
Page 4 — Iterate & edit.
Pick any image from the session gallery (or upload one) and apply a single
edit instruction. Each result is appended to the gallery so successive edits
chain into multi-turn refinement.
"""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import image_client  # noqa: E402

st.set_page_config(page_title="Iterate & Edit", page_icon="🔁", layout="wide")

if "gallery" not in st.session_state:
    st.session_state.gallery = []

st.title("Iterate & edit")
st.caption(
    "Multi-turn refinement: each edit operates on the previous result, so chained "
    "instructions like 'change colour to #2A4F7C' → 'make sleeves longer' → "
    "'warmer lighting' compound naturally."
)

with st.sidebar:
    st.header("Output settings")
    size = st.selectbox("Size", image_client.SUPPORTED_SIZES, index=1)
    quality = st.selectbox("Quality", ["low", "medium", "high"], index=1)

# ---- Source ----
st.subheader("1. Source image")
source_mode = st.radio(
    "Where does the source come from?",
    ["From gallery", "Upload"],
    horizontal=True,
    disabled=not st.session_state.gallery,
    index=0 if st.session_state.gallery else 1,
)

source_bytes: bytes | None = None
source_meta: dict = {}

if source_mode == "From gallery":
    if not st.session_state.gallery:
        st.info("Gallery is empty. Generate something on pages 1–3 first, or switch to Upload.")
    else:
        labels = [
            f"#{i+1} · {item['kind']} · "
            + (item["meta"].get("subtype") or item["meta"].get("repeat_type") or "image")
            for i, item in enumerate(st.session_state.gallery)
        ]
        idx = st.selectbox(
            "Pick an image",
            list(range(len(st.session_state.gallery))),
            format_func=lambda i: labels[i],
        )
        chosen = st.session_state.gallery[idx]
        source_bytes = chosen["image"]
        source_meta = chosen["meta"]
        st.image(source_bytes, width=320, caption=labels[idx])
        with st.expander("Source prompt"):
            st.code(chosen["prompt"], language="markdown")
else:
    uploaded = st.file_uploader("Upload PNG / JPG", type=["png", "jpg", "jpeg"])
    if uploaded is not None:
        source_bytes = uploaded.read()
        st.image(source_bytes, width=320)

# ---- Edit instruction ----
st.subheader("2. Edit instruction")
st.caption("Single-change edits work best. Use the 'preserve everything else' wording for surgical changes.")

instruction = st.text_area(
    "What should change?",
    placeholder=(
        "e.g., 'Change the primary colour to #2A4F7C, keep silhouette, fabric, "
        "lighting, and background identical to the original.'"
    ),
    height=110,
)
preserve_default = st.checkbox(
    "Append default preserve clause",
    value=True,
    help="Adds: 'Keep silhouette, fabric, lighting, and background identical to the source. No watermarks, no text, no extra elements.'",
)

PRESERVE_CLAUSE = (
    "Keep silhouette, fabric, lighting, and background identical to the source. "
    "Do not introduce new elements, text, or watermarks."
)

prompt = instruction.strip()
if preserve_default and prompt:
    prompt = prompt + "\n\n" + PRESERVE_CLAUSE

with st.expander("Prompt preview", expanded=False):
    st.code(prompt or "(empty)", language="markdown")

# ---- Apply ----
disabled = (source_bytes is None) or (not prompt)
if st.button("Apply edit", type="primary", use_container_width=True, disabled=disabled):
    with st.spinner(f"Editing at {size} / {quality}…"):
        try:
            new_bytes = image_client.edit_iter(prompt, source_bytes, size=size, quality=quality)
        except Exception as e:
            st.error(f"Edit failed: {e}")
            st.stop()

    st.success("Edit complete — added to gallery, you can now iterate on this result.")
    col1, col2 = st.columns(2)
    with col1:
        st.image(source_bytes, caption="Before")
    with col2:
        st.image(new_bytes, caption="After")
        st.download_button(
            "Download PNG",
            new_bytes,
            file_name="edited.png",
            mime="image/png",
        )

    st.session_state.gallery.append(
        {
            "image": new_bytes,
            "prompt": prompt,
            "kind": "edit",
            "meta": {**source_meta, "size": size, "quality": quality},
        }
    )

# ---- Chain view ----
st.divider()
st.subheader("Gallery & edit chain")
if not st.session_state.gallery:
    st.info("Nothing yet — generate something on pages 1–3.")
else:
    cols = st.columns(4)
    for i, item in enumerate(st.session_state.gallery):
        with cols[i % 4]:
            tag = item["meta"].get("subtype") or item["meta"].get("repeat_type") or item["kind"]
            st.image(item["image"], caption=f"#{i+1} · {item['kind']} · {tag}")
