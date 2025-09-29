# PDD Hello World

FastAPI + uv project that serves an aurora-inspired "Hello, World!" experience alongside a personal message board backed by SQLite.

## Getting Started

1. Install dependencies: `uv sync`
2. Launch the server: `uv run main.py`
3. Visit `http://localhost:8080`

## Features

- Animated Hello World tab with keyboard-accessible color cycling.
- Second tab where visitors can craft and save custom greetings.
- Saved messages persist in `app.db` (SQLite) and surface instantly in the sidebar.
- Clicking any saved message renders it with the same spotlight styling as the main greeting.

## Development Notes

- The database schema is created automatically on startup. Delete `app.db` if you ever want a clean slate.
- Front-end logic lives in `static/app.js`; styles are in `static/styles.css`; the tabbed layout is defined in `templates/index.html`.
