from fastapi import APIRouter
from services.data_fetcher import DataFetcher
from services.session_service import SessionService
from typing import Dict, Any

router = APIRouter()
fetcher = DataFetcher()
session_svc = SessionService()

@router.get("/ticker-info/{ticker}")
async def get_ticker_info(ticker: str) -> Dict[str, Any]:
    return fetcher.fetch_ticker_info(ticker.upper())

@router.get("/price/{ticker}")
async def get_live_price(ticker: str, mode: str = "live") -> Dict[str, Any]:
    """
    Lightweight endpoint untuk polling harga per detik.
    Mengembalikan harga berdasarkan mode yang dipilih.
    """
    ticker = ticker.upper()
    info = fetcher.fetch_ticker_info(ticker)
    live_price = info.get("last_price", 0.0)
    
    if mode == "live":
        return {
            "price": live_price,
            "mode": "live",
            "label": "Live",
            "market_phase": session_svc.get_current_market_phase(),
            "available_modes": session_svc.get_available_modes(),
        }
    
    # Untuk mode session, fetch intraday data
    ref = session_svc.get_reference_data(mode, ticker, live_price, None)
    return {
        "price": ref["price"],
        "mode": mode,
        "label": ref["label"],
        "ohlcv": ref.get("ohlcv"),
        "market_phase": session_svc.get_current_market_phase(),
        "available_modes": session_svc.get_available_modes(),
    }

@router.get("/session-info")
async def get_session_info() -> Dict[str, Any]:
    """Return current market phase and available modes."""
    return {
        "market_phase": session_svc.get_current_market_phase(),
        "available_modes": session_svc.get_available_modes(),
    }
