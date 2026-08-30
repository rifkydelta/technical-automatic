import tempfile
import os
import sqlite3
import unittest
from db import _init_db_sync
from services.signal_repository import SignalRepository

class TestSignalDatabase(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.test_dir = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.test_db_path = os.path.join(self.test_dir.name, "test_signals.db")
        # Init table in test db
        with sqlite3.connect(self.test_db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS signals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticker TEXT NOT NULL,
                    company_name TEXT,
                    signal_type TEXT NOT NULL,
                    signal_date TEXT DEFAULT '',
                    signal_time TEXT NOT NULL,
                    backtest_winrate REAL DEFAULT 0.0,
                    backtest_total_trades INTEGER DEFAULT 0,
                    backtest_total_pnl REAL DEFAULT 0.0,
                    relt_score INTEGER DEFAULT 0,
                    relt_rating TEXT DEFAULT '',
                    relt_action TEXT DEFAULT '',
                    entry_price REAL NOT NULL,
                    stop_loss REAL DEFAULT 0.0,
                    tp1 REAL DEFAULT 0.0,
                    tp2 REAL DEFAULT 0.0,
                    h1_entry_zone_low REAL DEFAULT 0.0,
                    h1_entry_zone_high REAL DEFAULT 0.0,
                    h1_entry_status TEXT DEFAULT '',
                    h1_confirmation TEXT DEFAULT '',
                    minute_bar_open REAL DEFAULT 0.0,
                    projected_pnl_pct REAL DEFAULT 0.0,
                    projected_pnl_nominal REAL DEFAULT 0.0,
                    direction TEXT DEFAULT 'SIDEWAYS',
                    status TEXT DEFAULT 'OPEN',
                    actual_exit_price REAL DEFAULT 0.0,
                    actual_pnl_pct REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_signals_dedup ON signals(ticker, signal_date, signal_type);")
        self.repo = SignalRepository(db_path=self.test_db_path)

    async def asyncTearDown(self):
        try:
            self.test_dir.cleanup()
        except Exception:
            pass

    async def test_insert_and_query_signal(self):
        sample_signal = {
            "ticker": "BBCA",
            "company_name": "Bank Central Asia Tbk",
            "signal_type": "BUY",
            "signal_date": "2026-08-30",
            "signal_time": "2026-08-30 16:00:00",
            "backtest_winrate": 72.5,
            "backtest_total_trades": 40,
            "backtest_total_pnl": 18.45,
            "relt_score": 82,
            "relt_rating": "A+ Strong Buy",
            "relt_action": "STRONG BUY",
            "entry_price": 9850.0,
            "stop_loss": 9575.0,
            "tp1": 10200.0,
            "tp2": 10400.0,
            "h1_entry_zone_low": 9780.0,
            "h1_entry_zone_high": 9870.0,
            "h1_entry_status": "ENTRY NOW",
            "h1_confirmation": "1H EMA9 > EMA21 | RSI 55.2",
            "minute_bar_open": 9845.0,
            "projected_pnl_pct": 2.85,
            "projected_pnl_nominal": 28500.0,
            "direction": "UP",
            "status": "OPEN"
        }
        sig_id = await self.repo.insert_signal(sample_signal)
        self.assertIsNotNone(sig_id)
        self.assertGreater(sig_id, 0)

        # Test deduplication: inserting again should return the existing ID
        sig_id_2 = await self.repo.insert_signal(sample_signal)
        self.assertEqual(sig_id, sig_id_2)

        # Test signal_exists
        exists = await self.repo.signal_exists("BBCA", "2026-08-30", "BUY")
        self.assertTrue(exists)
        not_exists = await self.repo.signal_exists("BBCA", "2026-08-29", "BUY")
        self.assertFalse(not_exists)

        # Query latest
        latest = await self.repo.get_latest_signals(limit=5)
        self.assertEqual(len(latest), 1)  # Only 1 unique row
        first = latest[0]
        self.assertEqual(first["ticker"], "BBCA")
        self.assertEqual(first["signal_type"], "BUY")
        self.assertEqual(first["signal_date"], "2026-08-30")
        self.assertEqual(first["relt_score"], 82)

        # Update status
        updated = await self.repo.update_signal_status(sig_id, "HIT_TP1", exit_price=10200.0, actual_pnl=3.55)
        self.assertTrue(updated)

        # Query stats
        stats = await self.repo.get_signal_stats()
        self.assertGreater(stats["total_signals"], 0)

if __name__ == "__main__":
    unittest.main()
