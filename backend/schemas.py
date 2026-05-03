"""Pydantic request / response schemas for the FastAPI backend."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ---- Generate ---------------------------------------------------------------

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    size: str = "1024x1536"
    quality: str = "medium"
    n: int = Field(1, ge=1, le=4)


class GenerateResponse(BaseModel):
    images: list[str]                  # data URLs (data:image/png;base64,...)
    gallery_ids: list[str] = []        # if persisted via /generate?save=true


# ---- Edit -------------------------------------------------------------------

class EditRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    image: str                         # data URL of source image
    size: str = "1024x1536"
    quality: str = "medium"


class EditResponse(BaseModel):
    images: list[str]                  # always length 1
    gallery_ids: list[str] = []


# ---- Options (rich taxonomy) ------------------------------------------------

class OptionsResponse(BaseModel):
    GENDER_OPTIONS: list[str]
    categories: dict[str, list[str]]                    # gender -> list[category]
    subtypes: dict[str, list[str]]                      # "gender/category" -> list[subtype]
    features: dict[str, dict[str, list[str]]]           # "gender/category" -> attr -> enum
    woven_fabrics: list[str]
    knit_fabrics: list[str]
    patterns: list[str]
    embroidery: list[str]
    washes: list[str]
    pattern_families: dict[str, list[str]]              # family -> motifs
    repeat_types: list[str]
    style_modes: list[str]
    sizes: list[str]
    qualities: list[str]
    backgrounds: list[str]
    photo_styles: list[str]
    framings: list[str]


# ---- Gallery ----------------------------------------------------------------

class GalleryItem(BaseModel):
    id: str
    src: str                            # data URL — bytes inlined for browser
    prompt: str
    kind: str                           # "apparel" | "sketch" | "pattern" | "edit"
    meta: dict[str, Any] = {}
    created_at: str                     # ISO timestamp


class GalleryListResponse(BaseModel):
    items: list[GalleryItem]


class GalleryAddRequest(BaseModel):
    src: str
    prompt: str
    kind: str
    meta: dict[str, Any] = {}


class GalleryAddResponse(BaseModel):
    item: GalleryItem
