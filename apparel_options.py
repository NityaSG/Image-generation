"""
Bootstrap path to ICH-Next/Colour_analysis and re-export the apparel taxonomy
so the POC can use a single import surface for cascading dropdowns.

The dictionaries live in the analysis codebase; this module imports them live
so any taxonomy edits there propagate without copies.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import dotenv

dotenv.load_dotenv()


def _resolve_colour_analysis_path() -> Path:
    explicit = os.getenv("COLOUR_ANALYSIS_PATH", "").strip()
    if explicit:
        return Path(explicit).expanduser().resolve()
    here = Path(__file__).resolve().parent
    return (here.parent / "ICH-Next" / "Colour_analysis").resolve()


_CA_PATH = _resolve_colour_analysis_path()
if not _CA_PATH.exists():
    raise RuntimeError(
        f"Could not find Colour_analysis at {_CA_PATH}. "
        "Set COLOUR_ANALYSIS_PATH in .env to override."
    )

if str(_CA_PATH) not in sys.path:
    sys.path.insert(0, str(_CA_PATH))

from apparels_dict import (  # noqa: E402
    men_apparels,
    women_apparel,
    men_top_wear,
    women_top_wear,
    men_bottom_wear,
    women_bottom_wear_pants,
    women_bottom_wear_skirts,
    get_apparel_types,
    get_apparel_features,
)
from fabrics_pattern_dict import (  # noqa: E402
    fabrics,
    pattern as pattern_families,
)


GENDER_OPTIONS = ["female", "male"]


def categories_for_gender(gender: str) -> list[str]:
    if gender == "male":
        return list(men_apparels.keys())
    if gender == "female":
        return list(women_apparel.keys())
    return []


def subtypes_for(gender: str, category: str) -> list[str]:
    """Return the enum of sub-types for a (gender, category)."""
    schema = get_apparel_types(gender, category)
    if not schema:
        return []
    return list(schema["type"].get("enum", []))


def features_for(gender: str, category: str) -> dict[str, dict]:
    """Return {attribute_name: {type, enum, description}} for a (gender, category)."""
    return get_apparel_features(gender, category) or {}


def fabric_options(kind: str) -> list[str]:
    """kind: 'Woven Fabrics' or 'Knitted Fabrics'."""
    return list(fabrics.get(kind, {}).get("enum", []))


def pattern_options() -> list[str]:
    return list(fabrics["pattern"]["enum"])


def embroidery_options() -> list[str]:
    return list(fabrics["Embroidery"]["enum"])


def wash_options() -> list[str]:
    return list(fabrics["Washes"]["enum"])


def pattern_family_options() -> list[str]:
    return list(pattern_families.keys())


def motifs_for_family(family: str) -> list[str]:
    return list(pattern_families.get(family, {}).get("enum", []))


__all__ = [
    "GENDER_OPTIONS",
    "categories_for_gender",
    "subtypes_for",
    "features_for",
    "fabric_options",
    "pattern_options",
    "embroidery_options",
    "wash_options",
    "pattern_family_options",
    "motifs_for_family",
    "men_apparels",
    "women_apparel",
    "men_top_wear",
    "women_top_wear",
    "men_bottom_wear",
    "women_bottom_wear_pants",
    "women_bottom_wear_skirts",
    "fabrics",
    "pattern_families",
]
