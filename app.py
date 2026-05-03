"""
Fashion Intelligence Platform — landing page.
Streamlit picks up `pages/*.py` automatically as side-nav entries.
"""

import streamlit as st

st.set_page_config(
    page_title="Fashion Intelligence Platform",
    page_icon="👗",
    layout="wide",
)

# Shared gallery used by every page so iterate / edit can target prior outputs.
if "gallery" not in st.session_state:
    st.session_state.gallery = []  # list[dict]: {"image": bytes, "prompt": str, "kind": str, "meta": dict}

st.title("Fashion Intelligence Platform")
st.caption("gpt-image-2 powered apparel & textile generation, driven by your existing taxonomy.")

st.markdown(
    """
This POC turns the apparel taxonomy that already lives in **ICH-Next/Colour_analysis**
into hyper-personalized prompts for `gpt-image-2`. Pick a workflow on the left:
    """
)

col_a, col_b = st.columns(2)

with col_a:
    st.subheader("1 · Apparel from dropdowns")
    st.write(
        "Cascading widgets — gender → category → sub-type → silhouette / sleeves / "
        "neckline / hem / pockets / details, plus fabric, pattern, embroidery, wash, "
        "colour palette and photography. Builds a structured prompt and renders the result."
    )

    st.subheader("3 · Pattern generation")
    st.write(
        "Free-text design brief + cultural family + motif + hex palette → seamless tile, "
        "allover scatter, centered placement, or border panel. Flat textile-ready output."
    )

with col_b:
    st.subheader("2 · Sketch → realistic apparel")
    st.write(
        "Upload a hand sketch, optionally disambiguate fabric / colour / pattern. "
        "Renders a photorealistic product photo while preserving silhouette and proportions."
    )

    st.subheader("4 · Iterate & edit")
    st.write(
        "Pick any image from the session gallery (or upload a new one) and apply a "
        "single-change refinement — change colour, lighting, swap embroidery, etc. "
        "Each edit chains on the previous result to give multi-turn behaviour."
    )

st.divider()

with st.expander("Configuration check"):
    import os
    endpoint = os.getenv("AZURE_GPT_IMAGE_ENDPOINT") or "(unset)"
    deployment = os.getenv("AZURE_GPT_IMAGE_DEPLOYMENT") or "gpt-image-2"
    key_set = bool(os.getenv("AZURE_GPT_IMAGE_KEY"))
    st.write(f"**Endpoint:** `{endpoint}`")
    st.write(f"**Deployment:** `{deployment}`")
    st.write(f"**API key set:** {'yes' if key_set else 'no — fill .env before generating'}")

st.caption(f"Gallery items: {len(st.session_state.gallery)}")
