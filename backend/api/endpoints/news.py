from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from services.news_scraper import get_news_by_ticker
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

@router.get("/news")
async def fetch_news(
    ticker: str = Query(..., min_length=1, description="Ticker symbol to search news for"),
    company_name: str = Query(None, description="Company name for broader matching")
):
    try:
        # Run the synchronous scraper function in a threadpool to not block the event loop
        loop = asyncio.get_running_loop()
        with ThreadPoolExecutor() as pool:
            results = await loop.run_in_executor(pool, get_news_by_ticker, ticker, company_name)
            
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))