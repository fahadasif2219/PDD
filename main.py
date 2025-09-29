from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI(title="PDD Hello World")

# Mount templates and static assets
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def hello_world(request: Request) -> HTMLResponse:
    """Serve the landing page with the interactive Hello World message."""
    return templates.TemplateResponse("index.html", {"request": request})


def main() -> None:
    """Run the FastAPI application on the requested port."""
    uvicorn.run(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
