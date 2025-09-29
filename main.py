from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

DB_PATH = Path("app.db")
app = FastAPI(title="PDD Hello World")

# Mount templates and static assets
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


def _get_connection() -> sqlite3.Connection:
    """Create a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    """Ensure the entries table exists."""
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def _fetch_entries() -> list[dict[str, Any]]:
    with _get_connection() as conn:
        rows = conn.execute(
            "SELECT id, content FROM entries ORDER BY created_at DESC, id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def _insert_entry(content: str) -> dict[str, Any]:
    with _get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO entries (content) VALUES (?)",
            (content,),
        )
        row = conn.execute(
            "SELECT id, content FROM entries WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return dict(row)


async def get_entries() -> list[dict[str, Any]]:
    """Return all stored entries ordered by recency."""
    return await run_in_threadpool(_fetch_entries)


async def create_entry(content: str) -> dict[str, Any]:
    """Persist a new entry and return it."""
    return await run_in_threadpool(_insert_entry, content)


@app.on_event("startup")
async def on_startup() -> None:
    await run_in_threadpool(_init_db)


@app.get("/", response_class=HTMLResponse)
async def hello_world(request: Request) -> HTMLResponse:
    """Serve the landing page with the interactive tabs."""
    entries = await get_entries()
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "entries": entries,
        },
    )


@app.get("/entries")
async def list_entries() -> list[dict[str, Any]]:
    """Expose all entries as JSON for the front-end."""
    return await get_entries()


@app.post("/entries")
async def add_entry(content: str = Form(...)) -> dict[str, Any]:
    """Store a new entry submitted from the Create tab."""
    trimmed = content.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    return await create_entry(trimmed)


def main() -> None:
    """Run the FastAPI application on the requested port."""
    uvicorn.run(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
