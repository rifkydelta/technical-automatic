import sqlite3
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from db import DB_PATH

class SignalRepository:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.row_factory = sqlite3.Row
        return conn

    # ── Synchronous DB Worker Functions ───────────────────────────────

    def _insert_sync(self, data: Dict[str, Any]) -> int:
        signal_time = data.get("signal_time", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        signal_date = data.get("signal_date") or signal_time[:10]
        ticker = data.get("ticker", "").upper()
        signal_type = data.get("signal_type", "BUY").upper()
        status = data.get("status", "OPEN")
        actual_exit_price = data.get("actual_exit_price", 0.0)
        actual_pnl_pct = data.get("actual_pnl_pct", 0.0)

        with self._get_connection() as conn:
            cursor = conn.execute("""
                INSERT INTO signals (
                    ticker, company_name, signal_type, signal_date, signal_time,
                    backtest_winrate, backtest_total_trades, backtest_total_pnl,
                    relt_score, relt_rating, relt_action,
                    entry_price, stop_loss, tp1, tp2,
                    h1_entry_zone_low, h1_entry_zone_high, h1_entry_status, h1_confirmation,
                    minute_bar_open, projected_pnl_pct, projected_pnl_nominal,
                    direction, status, actual_exit_price, actual_pnl_pct,
                    created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                ON CONFLICT(ticker, signal_date, signal_type) DO UPDATE SET
                    status = excluded.status,
                    actual_exit_price = excluded.actual_exit_price,
                    actual_pnl_pct = excluded.actual_pnl_pct,
                    relt_score = excluded.relt_score,
                    relt_action = excluded.relt_action,
                    relt_rating = excluded.relt_rating,
                    backtest_winrate = excluded.backtest_winrate,
                    backtest_total_trades = excluded.backtest_total_trades,
                    backtest_total_pnl = excluded.backtest_total_pnl,
                    h1_entry_status = excluded.h1_entry_status,
                    h1_confirmation = excluded.h1_confirmation,
                    projected_pnl_pct = excluded.projected_pnl_pct,
                    projected_pnl_nominal = excluded.projected_pnl_nominal,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                ticker,
                data.get("company_name", ""),
                signal_type,
                signal_date,
                signal_time,
                data.get("backtest_winrate", 0.0),
                data.get("backtest_total_trades", 0),
                data.get("backtest_total_pnl", 0.0),
                data.get("relt_score", 0),
                data.get("relt_rating", ""),
                data.get("relt_action", ""),
                data.get("entry_price", 0.0),
                data.get("stop_loss", 0.0),
                data.get("tp1", 0.0),
                data.get("tp2", 0.0),
                data.get("h1_entry_zone_low", 0.0),
                data.get("h1_entry_zone_high", 0.0),
                data.get("h1_entry_status", ""),
                data.get("h1_confirmation", ""),
                data.get("minute_bar_open", 0.0),
                data.get("projected_pnl_pct", 0.0),
                data.get("projected_pnl_nominal", 0.0),
                data.get("direction", "UP"),
                status,
                actual_exit_price,
                actual_pnl_pct
            ))
            conn.commit()
            if cursor.lastrowid and cursor.lastrowid > 0:
                return cursor.lastrowid
            
            # Fetch existing id
            id_cur = conn.execute(
                "SELECT id FROM signals WHERE ticker = ? AND signal_date = ? AND signal_type = ?",
                (ticker, signal_date, signal_type)
            )
            row = id_cur.fetchone()
            return row["id"] if row else 0

    def _signal_exists_sync(self, ticker: str, signal_date: str, signal_type: str = "BUY") -> bool:
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) as cnt FROM signals
                WHERE ticker = ? AND signal_date = ? AND signal_type = ?
            """, (ticker.upper(), signal_date, signal_type.upper()))
            row = cursor.fetchone()
            return (row["cnt"] > 0) if row else False

    def _get_latest_sync(
        self,
        limit: int = 100,
        signal_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            query = "SELECT * FROM signals WHERE 1=1"
            params = []

            if signal_type and signal_type.upper() != "ALL":
                query += " AND signal_type = ?"
                params.append(signal_type.upper())

            if status and status.upper() != "ALL":
                st = status.upper()
                if st == "HIT_TP":
                    query += " AND status IN ('HIT_TP1', 'HIT_TP2')"
                elif st == "OPEN":
                    query += " AND status = 'OPEN'"
                elif st == "HIT_SL":
                    query += " AND status = 'HIT_SL'"
                elif st == "CLOSED":
                    query += " AND status IN ('CLOSED', 'HIT_TP1', 'HIT_TP2', 'HIT_SL')"
                else:
                    query += " AND status = ?"
                    params.append(st)

            query += " ORDER BY signal_date DESC, id DESC LIMIT ?"
            params.append(limit)

            cursor = conn.execute(query, tuple(params))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def _get_by_ticker_sync(self, ticker: str, limit: int = 20) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM signals
                WHERE ticker = ?
                ORDER BY signal_date DESC, id DESC LIMIT ?
            """, (ticker.upper(), limit))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def _update_status_sync(self, signal_id: int, status: str, exit_price: Optional[float] = None, actual_pnl: Optional[float] = None) -> bool:
        with self._get_connection() as conn:
            conn.execute("""
                UPDATE signals
                SET status = ?,
                    actual_exit_price = COALESCE(?, actual_exit_price),
                    actual_pnl_pct = COALESCE(?, actual_pnl_pct),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, exit_price, actual_pnl, signal_id))
            conn.commit()
            return True

    def _get_stats_sync(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT
                    COUNT(*) as total_signals,
                    SUM(CASE WHEN signal_type = 'BUY' THEN 1 ELSE 0 END) as buy_count,
                    SUM(CASE WHEN signal_type = 'SELL' THEN 1 ELSE 0 END) as sell_count,
                    AVG(backtest_winrate) as avg_winrate,
                    AVG(projected_pnl_pct) as avg_proj_pnl
                FROM signals
            """)
            stats = dict(cursor.fetchone())

            best_cursor = conn.execute("""
                SELECT ticker, backtest_total_pnl, backtest_winrate
                FROM signals
                ORDER BY backtest_total_pnl DESC LIMIT 1
            """)
            best_row = best_cursor.fetchone()
            if best_row:
                stats["best_performer"] = best_row["ticker"]
                stats["best_pnl"] = best_row["backtest_total_pnl"]
            else:
                stats["best_performer"] = None
                stats["best_pnl"] = 0.0

            return stats

    # ── Asynchronous Public API ───────────────────────────────────────

    async def insert_signal(self, data: Dict[str, Any]) -> int:
        """Insert a newly generated signal into the database asynchronously."""
        return await asyncio.to_thread(self._insert_sync, data)

    async def get_latest_signals(
        self,
        limit: int = 100,
        signal_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get the most recent signals from the database asynchronously."""
        return await asyncio.to_thread(self._get_latest_sync, limit, signal_type, status)

    async def get_signals_by_ticker(self, ticker: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get signal history for a specific ticker asynchronously."""
        return await asyncio.to_thread(self._get_by_ticker_sync, ticker, limit)

    async def update_signal_status(self, signal_id: int, status: str, exit_price: Optional[float] = None, actual_pnl: Optional[float] = None) -> bool:
        """Update the lifecycle status of a signal asynchronously."""
        return await asyncio.to_thread(self._update_status_sync, signal_id, status, exit_price, actual_pnl)

    async def signal_exists(self, ticker: str, signal_date: str, signal_type: str = "BUY") -> bool:
        """Check if a signal exists for the given ticker, candle date, and signal type."""
        return await asyncio.to_thread(self._signal_exists_sync, ticker, signal_date, signal_type)

    async def get_signal_stats(self) -> Dict[str, Any]:
        """Aggregate statistical summary across stored signals asynchronously."""
        return await asyncio.to_thread(self._get_stats_sync)
