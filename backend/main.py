import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import analyze, ticker, news, market

# Load environment variables
load_dotenv()

# ── Logging ────────────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("idx-api")

# ── App ────────────────────────────────────────────────────────────
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="IDX Technical Analysis Dashboard API",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
)

# ── CORS ───────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

if FRONTEND_URL:
    origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ticker.router, prefix="/api", tags=["ticker"])
app.include_router(news.router, prefix="/api", tags=["news"])
app.include_router(market.router, prefix="/api", tags=["market"])


@app.get("/")
def read_root():
    return {"status": "ok", "message": "IDX Technical Analysis API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint for Render."""
    return {"status": "healthy", "environment": ENVIRONMENT}


# ── Local dev entry point ──────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting dev server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
