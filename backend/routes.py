"""FastAPI routes — wraps image_client and exposes the rich taxonomy."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

# Run uvicorn from the POC root: `uvicorn backend.main:app`. POC root must be
# importable so `image_client`, `prompts`, and `apparel_options` resolve.
_POC_ROOT = Path(__file__).resolve().parent.parent
if str(_POC_ROOT) not in sys.path:
    sys.path.insert(0, str(_POC_ROOT))

import image_client  # noqa: E402
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
from prompts.pattern import REPEAT_INSTRUCTIONS  # noqa: E402

from . import storage  # noqa: E402
from .schemas import (  # noqa: E402
    EditRequest,
    EditResponse,
    GalleryAddRequest,
    GalleryAddResponse,
    GalleryListResponse,
    GenerateRequest,
    GenerateResponse,
    OptionsResponse,
    VectorizeRequest,
    VectorizeResponse,
)


router = APIRouter()


def _to_data_url(image_bytes: bytes) -> str:
    return storage._to_data_url(image_bytes, ext="png")


# ---- Health -----------------------------------------------------------------

@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


# ---- Generate ---------------------------------------------------------------

@router.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    try:
        images = image_client.generate(
            prompt=req.prompt, size=req.size, quality=req.quality, n=req.n
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"gpt-image-2 generate failed: {e}") from e
    return GenerateResponse(images=[_to_data_url(b) for b in images])


# ---- Edit -------------------------------------------------------------------

@router.post("/edit", response_model=EditResponse)
def edit(req: EditRequest) -> EditResponse:
    try:
        src_bytes, _ = storage._decode_data_url(req.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid source image data URL: {e}") from e

    try:
        images = image_client.edit(
            prompt=req.prompt,
            image_bytes_list=[src_bytes],
            size=req.size,
            quality=req.quality,
            n=1,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"gpt-image-2 edit failed: {e}") from e
    return EditResponse(images=[_to_data_url(b) for b in images])


# ---- Options (rich taxonomy) ------------------------------------------------

@router.get("/options", response_model=OptionsResponse)
def options() -> OptionsResponse:
    """
    Serialize the full taxonomy from ICH-Next/Colour_analysis into the shape
    the frontend expects (matching app-data.js but with the deep enums).
    """
    categories: dict[str, list[str]] = {}
    subtypes: dict[str, list[str]] = {}
    features: dict[str, dict[str, list[str]]] = {}

    for gender in GENDER_OPTIONS:
        cats = categories_for_gender(gender)
        categories[gender] = cats
        for cat in cats:
            key = f"{gender}/{cat}"
            subtypes[key] = subtypes_for(gender, cat)
            feats = features_for(gender, cat) or {}
            features[key] = {name: list(schema.get("enum", [])) for name, schema in feats.items()}

    return OptionsResponse(
        GENDER_OPTIONS=GENDER_OPTIONS,
        categories=categories,
        subtypes=subtypes,
        features=features,
        woven_fabrics=fabric_options("Woven Fabrics"),
        knit_fabrics=fabric_options("Knitted Fabrics"),
        patterns=pattern_options(),
        embroidery=embroidery_options(),
        washes=wash_options(),
        pattern_families={fam: motifs_for_family(fam) for fam in pattern_family_options()},
        repeat_types=list(REPEAT_INSTRUCTIONS.keys()),
        style_modes=["flat vector", "watercolor", "hand-painted", "digital screenprint", "block print"],
        sizes=image_client.SUPPORTED_SIZES,
        qualities=["low", "medium", "high"],
        backgrounds=["white seamless", "studio grey", "lifestyle outdoor", "runway", "flat lay"],
        photo_styles=["ecommerce catalog", "editorial", "lookbook"],
        framings=["full body", "3/4 body", "flat lay"],
    )


# ---- Gallery ----------------------------------------------------------------

@router.get("/gallery", response_model=GalleryListResponse)
def gallery_list() -> GalleryListResponse:
    return GalleryListResponse(items=storage.list_items())


@router.post("/gallery", response_model=GalleryAddResponse)
def gallery_add(req: GalleryAddRequest) -> GalleryAddResponse:
    try:
        item = storage.add_image(
            data_url=req.src,
            prompt=req.prompt,
            kind=req.kind,
            meta=req.meta,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to persist image: {e}") from e
    return GalleryAddResponse(item=item)


@router.get("/gallery/{item_id}/raw")
def gallery_raw(item_id: str):
    data = storage.get_image_bytes(item_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Not found")
    return Response(content=data, media_type="image/png")


@router.delete("/gallery/{item_id}")
def gallery_delete(item_id: str) -> dict:
    if not storage.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": item_id}


# ---- Vectorize --------------------------------------------------------------

@router.post("/vectorize", response_model=VectorizeResponse)
def vectorize(req: VectorizeRequest) -> VectorizeResponse:
    try:
        import vtracer  # lazy import — optional dependency
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="vtracer is not installed. Run: pip install vtracer",
        )

    if req.gallery_id:
        image_bytes = storage.get_image_bytes(req.gallery_id)
        if image_bytes is None:
            raise HTTPException(status_code=404, detail="Gallery item not found")
    elif req.src:
        try:
            image_bytes, _ = storage._decode_data_url(req.src)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data URL: {e}") from e
    else:
        raise HTTPException(status_code=422, detail="Provide gallery_id or src")

    try:
        svg = vtracer.convert_raw_image_to_svg(
            image_bytes,
            colormode="color",
            filter_speckle=req.filter_speckle,
            color_precision=req.color_precision,
            corner_threshold=req.corner_threshold,
            length_threshold=req.length_threshold,
            mode="spline",
            layer_difference=16,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {e}") from e

    return VectorizeResponse(svg=svg)
