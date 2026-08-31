from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.request import SignalScanRequest, SignalStatusUpdateRequest
from models.response import SignalScanResponse, SignalRow, SignalStatsResponse, PaginatedSignalResponse, SignalDateOption
from services.signal_scanner_service import SignalScannerService
from services.signal_repository import SignalRepository

router = APIRouter()
scanner_service = SignalScannerService()
repo = SignalRepository()

@router.post("/signals/scan", response_model=SignalScanResponse)
async def scan_signals(req: SignalScanRequest = SignalScanRequest()):
    """
    Trigger real-time signal scan across tickers.
    If tickers is not provided, scans all registered IDX tickers.
    Saves generated signals into the database.
    """
    try:
        res = await scanner_service.scan_signals(
            tickers=req.tickers,
            max_workers=req.max_workers or 6
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan signals: {str(e)}")

@router.get("/signals/paginated", response_model=PaginatedSignalResponse)
async def get_paginated_signals(
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
    signal_type: Optional[str] = Query(None, description="'BUY', 'SELL', or 'ALL'"),
    status: Optional[str] = Query(None, description="'ALL', 'OPEN', 'HIT_TP', 'HIT_SL', 'CLOSED'"),
    signal_date: Optional[str] = Query(None, description="Exact date (e.g. '2026-08-28')"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    min_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum RELT score"),
    search: Optional[str] = Query(None, description="Ticker or company name search")
):
    """
    Fetch paginated signals with comprehensive date, status, score, and text filtering.
    """
    try:
        res = await repo.get_paginated_signals(
            page=page,
            page_size=page_size,
            signal_type=signal_type,
            status=status,
            signal_date=signal_date,
            start_date=start_date,
            end_date=end_date,
            min_score=min_score,
            search=search
        )
        return PaginatedSignalResponse(
            items=[SignalRow(**r) for r in res["items"]],
            total_items=res["total_items"],
            total_pages=res["total_pages"],
            current_page=res["current_page"],
            page_size=res["page_size"],
            has_next=res["has_next"],
            has_prev=res["has_prev"],
            available_dates=[SignalDateOption(**d) for d in res.get("available_dates", [])]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch paginated signals: {str(e)}")

@router.get("/signals/dates", response_model=List[SignalDateOption])
async def get_available_signal_dates(limit: int = Query(30, ge=1, le=100)):
    """
    Get list of unique trading dates that have generated trade signals in the database.
    """
    try:
        dates = await repo.get_available_dates(limit=limit)
        return [SignalDateOption(**d) for d in dates]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch signal dates: {str(e)}")

@router.get("/signals/latest", response_model=List[SignalRow])
async def get_latest_signals(
    limit: int = Query(100, ge=1, le=500),
    signal_type: Optional[str] = Query(None, description="'BUY', 'SELL', or 'ALL'"),
    status: Optional[str] = Query(None, description="'ALL', 'OPEN', 'HIT_TP', 'HIT_SL', 'CLOSED'")
):
    """
    Fetch the most recently generated signals from the database with optional type and status filtering.
    """
    try:
        rows = await repo.get_latest_signals(limit=limit, signal_type=signal_type, status=status)
        return [SignalRow(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest signals: {str(e)}")

@router.get("/signals/history", response_model=List[SignalRow])
async def get_signal_history(
    ticker: Optional[str] = Query(None, description="Ticker symbol (e.g. 'BBCA')"),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None, description="'ALL', 'OPEN', 'HIT_TP', 'HIT_SL', 'CLOSED'")
):
    """
    Fetch historical signal logs, optionally filtered by ticker and status.
    """
    try:
        if ticker:
            rows = await repo.get_signals_by_ticker(ticker=ticker, limit=limit)
        else:
            rows = await repo.get_latest_signals(limit=limit, status=status)
        return [SignalRow(**r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch signal history: {str(e)}")

@router.get("/signals/stats", response_model=SignalStatsResponse)
async def get_signal_stats():
    """
    Fetch statistical summary across all stored signals.
    """
    try:
        stats = await repo.get_signal_stats()
        winrate = float(stats.get("top_winrate") or stats.get("avg_winrate") or 0.0)
        return SignalStatsResponse(
            total_signals=int(stats.get("total_signals") or 0),
            total_emiten=int(stats.get("total_emiten") or 0),
            buy_count=int(stats.get("buy_count") or 0),
            sell_count=int(stats.get("sell_count") or 0),
            hit_tp_count=int(stats.get("hit_tp_count") or 0),
            hit_sl_count=int(stats.get("hit_sl_count") or 0),
            open_signals_count=int(stats.get("open_signals_count") or 0),
            closed_count=int(stats.get("closed_count") or 0),
            avg_winrate=round(winrate, 1),
            top_winrate=round(float(stats.get("top_winrate") or 0.0), 1),
            avg_proj_pnl=round(float(stats.get("avg_proj_pnl") or 0.0), 2),
            best_performer=stats.get("best_performer"),
            best_pnl=round(float(stats.get("best_pnl") or 0.0), 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.patch("/signals/{signal_id}/status")
async def update_signal_status(signal_id: int, req: SignalStatusUpdateRequest):
    """
    Update signal status (e.g. HIT_TP1, HIT_TP2, HIT_SL, CLOSED).
    """
    try:
        success = await repo.update_signal_status(
            signal_id=signal_id,
            status=req.status,
            exit_price=req.actual_exit_price,
            actual_pnl=req.actual_pnl_pct
        )
        return {"status": "success", "updated": success, "signal_id": signal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update signal status: {str(e)}")
