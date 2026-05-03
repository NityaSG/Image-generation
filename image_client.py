"""
Thin wrapper around the OpenAI SDK pointed at the Azure v1-compat endpoint
that hosts the gpt-image-2 deployment.

Exposes three calls used by the Streamlit pages:
- generate(prompt, ...) -> list[bytes]
- edit(prompt, image_bytes_list, ...) -> list[bytes]
- edit_iter(prompt, prev_image_bytes, ...) -> bytes  (single-image convenience)
"""

from __future__ import annotations

import base64
import io
import os
from functools import lru_cache
from typing import Iterable

import dotenv
from openai import OpenAI

dotenv.load_dotenv()


SUPPORTED_SIZES = [
    "1024x1024",
    "1024x1536",
    "1536x1024",
    "2048x2048",
    "2048x1152",
]
SUPPORTED_QUALITIES = ["low", "medium", "high", "auto"]


def _required_env(name: str) -> str:
    val = os.getenv(name)
    if not val:
        raise RuntimeError(
            f"Missing required env var {name}. Copy .env.example to .env and fill it in."
        )
    return val


@lru_cache(maxsize=1)
def _client() -> OpenAI:
    return OpenAI(
        base_url=_required_env("AZURE_GPT_IMAGE_ENDPOINT"),
        api_key=_required_env("AZURE_GPT_IMAGE_KEY"),
    )


def _deployment() -> str:
    return os.getenv("AZURE_GPT_IMAGE_DEPLOYMENT", "gpt-image-2")


def _decode(data) -> list[bytes]:
    return [base64.b64decode(item.b64_json) for item in data]


def _to_file(image_bytes: bytes, filename: str = "image.png") -> io.BytesIO:
    """Wrap raw PNG bytes in a BytesIO that the SDK treats as a file upload."""
    buf = io.BytesIO(image_bytes)
    buf.name = filename
    return buf


def generate(
    prompt: str,
    *,
    size: str = "1024x1536",
    quality: str = "medium",
    n: int = 1,
) -> list[bytes]:
    """Generate one or more images from a text prompt."""
    result = _client().images.generate(
        model=_deployment(),
        prompt=prompt,
        size=size,
        quality=quality,
        n=n,
    )
    return _decode(result.data)


def edit(
    prompt: str,
    image_bytes_list: Iterable[bytes],
    *,
    size: str = "1024x1536",
    quality: str = "medium",
    n: int = 1,
) -> list[bytes]:
    """Edit / compose using one or more reference images held in memory."""
    files = [
        _to_file(b, f"reference_{i}.png")
        for i, b in enumerate(image_bytes_list)
    ]
    if not files:
        raise ValueError("edit() requires at least one reference image")
    image_arg = files if len(files) > 1 else files[0]
    result = _client().images.edit(
        model=_deployment(),
        image=image_arg,
        prompt=prompt,
        size=size,
        quality=quality,
        n=n,
    )
    return _decode(result.data)


def edit_iter(
    prompt: str,
    prev_image_bytes: bytes,
    *,
    size: str = "1024x1536",
    quality: str = "medium",
) -> bytes:
    """Single-image multi-turn edit: returns the next image in the chain."""
    return edit(prompt, [prev_image_bytes], size=size, quality=quality, n=1)[0]
