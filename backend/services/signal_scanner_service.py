import asyncio
import logging
import concurrent.futures
from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
from zoneinfo import ZoneInfo

from services.data_fetcher import DataFetcher
from services.relt_signal_engine import ReltSignalEngine
from services.historical_backtester import HistoricalBacktester
from services.hourly_entry_engine import HourlyEntryEngine
from services.signal_repository import SignalRepository
from services.idx_universe import get_all_idx_tickers, get_ticker_company_name
from models.response import SignalRow, SignalScanResponse

logger = logging.getLogger("idx-api.signal_scanner")
WIB = ZoneInfo("Asia/Jakarta")

class SignalScannerService:
    def __init__(self):
        self.fetcher = DataFetcher()
        self.relt_engine = ReltSignalEngine()
        self.backtester = HistoricalBacktester()
        self.hourly_engine = HourlyEntryEngine()
        self.repo = SignalRepository()

    def _process_single_ticker(self, ticker: str) -> List[Dict[str, Any]]:
        """Worker function to analyze a single ticker, extract all RELT trades, and sync 1H timing."""
        try:
            # 1. Fetch stock OHLCV data directly
            data = self.fetcher.fetch_stock_data(ticker)
            daily_df = data.get("daily")
            h1_df = data.get("h1")
            m1_df = data.get("m1")

            if daily_df is None or daily_df.empty or len(daily_df) < 30:
                return []

            cur_price = float(daily_df['Close'].iloc[-1])
            company_name = get_ticker_company_name(ticker)

            # 2. Extract all RELT Trade Signals (both OPEN active and COMPLETED trades)
            extracted_signals = self.backtester.extract_all_relt_signals(
                daily_df=daily_df,
                lookback_days=365,
                signal_mode="Balanced",
                entry_mode="Hybrid"
            )

            if not extracted_signals:
                return []

            # 3. Run Historical Backtest for summary stats
            backtest_res = self.backtester.run_relt_daily_backtest(daily_df, lookback_days=365)
            bt_winrate = backtest_res.win_rate_pct if backtest_res else 0.0
            bt_trades = backtest_res.total_trades if backtest_res else 0
            bt_pnl = backtest_res.total_pnl_pct if backtest_res else 0.0

            # 4. Format all detected signals with 1H intraday entry hour & zone confirmation
            results = []
            for d in extracted_signals:
                relt = d["relt"]
                action = relt.get("action", "STRONG BUY")
                score = relt.get("score", 75)
                rating = relt.get("rating", "A Buy")
                dir_pred = relt.get("direction_prediction", {})
                direction = dir_pred.get("direction", "UP")
                predicted_close = dir_pred.get("predicted_price", cur_price)

                # Detect exact 1H intraday execution hour on entry date
                entry_timestamp = self.hourly_engine.detect_realtime_entry_hour(
                    h1_df=h1_df,
                    target_date_str=d["signal_date"],
                    entry_price=d["entry_price"]
                )

                # Run Hourly Entry Confirmation & PnL Projection
                h1_analysis = self.hourly_engine.evaluate_entry_zone(
                    h1_df=h1_df,
                    daily_df=daily_df,
                    current_price=d["entry_price"],
                    predicted_close_price=predicted_close,
                    m1_df=m1_df
                )

                results.append({
                    "ticker": ticker,
                    "company_name": company_name,
                    "signal_type": d.get("signal_type", "BUY"),
                    "signal_date": d["signal_date"],
                    "signal_time": entry_timestamp,
                    "backtest_winrate": round(bt_winrate, 2),
                    "backtest_total_trades": bt_trades,
                    "backtest_total_pnl": round(bt_pnl, 2),
                    "relt_score": score,
                    "relt_rating": rating,
                    "relt_action": action,
                    "entry_price": round(d["entry_price"], 2),
                    "stop_loss": round(d["stop_loss"], 2),
                    "tp1": round(d["tp1"], 2),
                    "tp2": round(d["tp2"], 2),
                    "h1_entry_zone_low": h1_analysis["h1_entry_zone_low"],
                    "h1_entry_zone_high": h1_analysis["h1_entry_zone_high"],
                    "h1_entry_status": h1_analysis["h1_entry_status"],
                    "h1_confirmation": h1_analysis["h1_confirmation"],
                    "minute_bar_open": h1_analysis["minute_bar_open"],
                    "projected_pnl_pct": h1_analysis["projected_pnl_pct"],
                    "projected_pnl_nominal": h1_analysis["projected_pnl_nominal"],
                    "direction": direction,
                    "status": d.get("status", "OPEN"),
                    "actual_exit_price": round(d.get("actual_exit_price", 0.0), 2),
                    "actual_pnl_pct": round(d.get("actual_pnl_pct", 0.0), 2)
                })

            return results
        except Exception as e:
            logger.warning(f"Error scanning ticker {ticker}: {e}")
            return []

    async def scan_signals(self, tickers: Optional[List[str]] = None, max_workers: int = 6) -> SignalScanResponse:
        """
        Scans given tickers (or all IDX tickers) and returns list of actionable signals.
        Automatically saves detected signals into the database with deduplication and status upsert.
        """
        scan_list = tickers if (tickers and len(tickers) > 0) else get_all_idx_tickers()
        total_scanned = len(scan_list)
        now_wib = datetime.now(WIB)
        scan_time_str = now_wib.strftime("%d %b %Y %H:%M WIB")

        logger.info(f"Starting comprehensive trade signal scan for {total_scanned} tickers...")

        loop = asyncio.get_running_loop()

        # Run processing in threadpool
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            tasks = [loop.run_in_executor(executor, self._process_single_ticker, t) for t in scan_list]
            completed = await asyncio.gather(*tasks)

        # Flatten and save all detected signals idempotently
        new_count = 0
        for res_list in completed:
            if res_list:
                for sig in res_list:
                    sig_id = await self.repo.insert_signal(sig)
                    sig["id"] = sig_id
                    new_count += 1

        # Fetch latest signals from database (both OPEN and recent completed trades)
        latest_signals_rows = await self.repo.get_latest_signals(limit=150)
        signals_found = [SignalRow(**r) for r in latest_signals_rows]

        logger.info(f"Signal scan completed. Scanned {total_scanned} tickers, synced {new_count} trade signals, returning {len(signals_found)} signals.")

        return SignalScanResponse(
            scan_time=scan_time_str,
            total_scanned=total_scanned,
            signals_found=len(signals_found),
            signals=signals_found
        )
