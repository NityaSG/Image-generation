"""
FastAPI entry point.

Run from the POC root:
    uvicorn backend.main:app --port 8000 --reload

Frontend dev server (Vite) typically runs on :5173 and calls this on :8000;
CORS is open in dev so that just works. In production you can either:
  - serve a built frontend from /static (uncomment the StaticFiles mount), or
  - reverse-proxy /api -> backend, / -> frontend dist.
"""

from __future__ import annotations

import os
from pathlib import Path

import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

dotenv.load_dotenv()

from .routes import router  # noqa: E402


app = FastAPI(
    title="Fashion Intelligence Platform",
    version="0.1.0",
    description="Backend for gpt-image-2 generation, editing, and gallery persistence.",
)

# CORS — wide-open in dev so Vite (5173) can talk to FastAPI (8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


# Optionally serve a built frontend (Vite produces frontend/dist/).
_FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if _FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIST), html=True), name="frontend")


@app.get("/_routes", include_in_schema=False)
def _routes() -> dict:
    """Convenience: list all registered HTTP routes (debugging)."""
    return {
        "routes": [
            {"path": r.path, "methods": sorted(r.methods or [])}
            for r in app.router.routes
            if hasattr(r, "methods")
        ]
    }
