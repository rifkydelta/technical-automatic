from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import analyze, ticker, news, market

app = FastAPI(title="IDX Technical Analysis Dashboard API", version="1.0.0")

# Setup CORS to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ticker.router, prefix="/api", tags=["ticker"])
app.include_router(news.router, prefix="/api", tags=["news"])
app.include_router(market.router, prefix="/api", tags=["market"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "IDX Technical Analysis API is running"}
