"""
File-based gallery storage. Each item is one PNG on disk plus a row in
metadata.json. Simple, inspectable, no DB required.

Layout under ./generated/:
  metadata.json       # array of {id, prompt, kind, meta, created_at, filename}
  <uuid>.png          # one file per generated image
"""

from __future__ import annotations

import base64
import json
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .schemas import GalleryItem


GENERATED_DIR = Path(__file__).resolve().parent.parent / "generated"
METADATA_PATH = GENERATED_DIR / "metadata.json"
_LOCK = threading.Lock()


def _ensure_dir() -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    if not METADATA_PATH.exists():
        METADATA_PATH.write_text("[]", encoding="utf-8")


def _load_meta() -> list[dict]:
    _ensure_dir()
    try:
        return json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _save_meta(rows: list[dict]) -> None:
    _ensure_dir()
    METADATA_PATH.write_text(json.dumps(rows, indent=2), encoding="utf-8")


_DATA_URL_RE = re.compile(r"^data:image/(?P<ext>png|jpe?g|webp);base64,(?P<b64>.+)$")


def _decode_data_url(data_url: str) -> tuple[bytes, str]:
    m = _DATA_URL_RE.match(data_url)
    if not m:
        # Fall back: assume it's already raw base64 of a PNG.
        return base64.b64decode(data_url), "png"
    ext = m.group("ext").replace("jpeg", "jpg")
    return base64.b64decode(m.group("b64")), ext


def _to_data_url(image_bytes: bytes, ext: str = "png") -> str:
    mime = "jpeg" if ext == "jpg" else ext
    b64 = base64.b64encode(image_bytes).decode("ascii")
    return f"data:image/{mime};base64,{b64}"


def add_image(
    *,
    image_bytes: Optional[bytes] = None,
    data_url: Optional[str] = None,
    prompt: str,
    kind: str,
    meta: dict,
) -> GalleryItem:
    """Persist an image + its metadata. Accepts either raw bytes or a data URL."""
    if image_bytes is None and data_url is None:
        raise ValueError("Provide image_bytes or data_url")
    if image_bytes is None:
        image_bytes, ext = _decode_data_url(data_url)
    else:
        ext = "png"

    _ensure_dir()
    item_id = uuid.uuid4().hex
    filename = f"{item_id}.{ext}"
    (GENERATED_DIR / filename).write_bytes(image_bytes)

    created_at = datetime.now(timezone.utc).isoformat()
    row = {
        "id": item_id,
        "filename": filename,
        "prompt": prompt,
        "kind": kind,
        "meta": meta,
        "created_at": created_at,
    }
    with _LOCK:
        rows = _load_meta()
        rows.append(row)
        _save_meta(rows)

    return GalleryItem(
        id=item_id,
        src=_to_data_url(image_bytes, ext=ext),
        prompt=prompt,
        kind=kind,
        meta=meta,
        created_at=created_at,
    )


def list_items() -> list[GalleryItem]:
    rows = _load_meta()
    items: list[GalleryItem] = []
    for row in rows:
        path = GENERATED_DIR / row["filename"]
        if not path.exists():
            continue
        ext = path.suffix.lstrip(".")
        items.append(
            GalleryItem(
                id=row["id"],
                src=_to_data_url(path.read_bytes(), ext=ext),
                prompt=row["prompt"],
                kind=row["kind"],
                meta=row.get("meta", {}),
                created_at=row["created_at"],
            )
        )
    return items


def get_item(item_id: str) -> Optional[GalleryItem]:
    for item in list_items():
        if item.id == item_id:
            return item
    return None


def get_image_bytes(item_id: str) -> Optional[bytes]:
    rows = _load_meta()
    row = next((r for r in rows if r["id"] == item_id), None)
    if not row:
        return None
    path = GENERATED_DIR / row["filename"]
    if not path.exists():
        return None
    return path.read_bytes()


def delete_item(item_id: str) -> bool:
    with _LOCK:
        rows = _load_meta()
        new_rows = []
        deleted = False
        for row in rows:
            if row["id"] == item_id:
                path = GENERATED_DIR / row["filename"]
                if path.exists():
                    path.unlink()
                deleted = True
                continue
            new_rows.append(row)
        if deleted:
            _save_meta(new_rows)
        return deleted
