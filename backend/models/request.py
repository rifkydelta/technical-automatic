from pydantic import BaseModel, Field
from typing import Optional

class OrderFlowInput(BaseModel):
    broker_summary: Optional[str] = Field(None, description="Net Buy / Net Sell / Neutral")
    broker_summary_value: Optional[str] = Field(None, description="e.g. +18.6B")
    foreign_flow: Optional[str] = Field(None, description="Net Buy / Net Sell / Neutral")
    foreign_flow_value: Optional[str] = Field(None, description="e.g. +12.3B")
    running_trade: Optional[str] = Field(None, description="Aggressive Buy / Aggressive Sell / Mixed")
    running_trade_pct: Optional[str] = Field(None, description="e.g. 65%")
    big_lot: Optional[str] = Field(None, description="Accumulation / Distribution / Neutral")

class AnalyzeRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol (e.g., 'BBCA')")
    order_flow: Optional[OrderFlowInput] = Field(None, description="Optional manual order flow data")
    mode: str = Field("live", description="Analysis mode: 'live', 'session_1', 'close_market'")

class ScreenerRequest(BaseModel):
    tickers: list[str] = Field(..., description="List of stock tickers (e.g., ['BBCA', 'BBNI'])")
    mode: str = Field("live", description="Analysis mode: 'live', 'session_1', 'close_market'")
    min_score: Optional[int] = Field(None, description="Minimum setup score filter")
    trend_filter: Optional[str] = Field(None, description="Trend filter: 'Bullish', 'Bearish', etc.")
    risk_filter: Optional[str] = Field(None, description="Risk filter: 'Good Setup', 'High Risk'")

class CustomScreenerExecuteRequest(BaseModel):
    screener_id: str = Field("bpjs_daytrade", description="ID of custom screener strategy (e.g. 'bpjs_daytrade')")
    mode: str = Field("live", description="Analysis mode: 'live', 'session_1', 'close_market'")
    custom_tickers: Optional[list[str]] = Field(None, description="Optional custom tickers override; if omitted, scans full IDX universe")

