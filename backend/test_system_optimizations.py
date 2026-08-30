import unittest
import sqlite3
import time
import pandas as pd
import numpy as np
from services.data_fetcher import DataFetcher
from services.relt_signal_engine import ReltSignalEngine
from services.signal_repository import SignalRepository
from db import DB_PATH, _init_db_sync

class TestSystemOptimizations(unittest.TestCase):
    def setUp(self):
        _init_db_sync()
        self.fetcher = DataFetcher()
        self.relt_engine = ReltSignalEngine()
        self.repo = SignalRepository()

    def test_sqlite_wal_mode_enabled(self):
        """Verify SQLite is running in high-concurrency WAL mode."""
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("PRAGMA journal_mode;")
            mode = cursor.fetchone()[0]
            self.assertEqual(mode.lower(), "wal", "SQLite must be running in WAL mode")

    def test_in_memory_ttl_caching(self):
        """Verify DataFetcher cache stores and serves data within TTL."""
        test_key = "stock_TEST"
        test_data = {"test": 123}
        self.fetcher._set_cache(test_key, test_data)

        cached = self.fetcher._get_from_cache(test_key)
        self.assertIsNotNone(cached)
        self.assertEqual(cached["test"], 123)

    def test_idx_lot_sizing_floor_precision(self):
        """Verify recommended lots strictly floors rather than rounds up."""
        # Generate synthetic uptrend
        df = pd.DataFrame({
            'Open': [1000.0 + i for i in range(50)],
            'High': [1005.0 + i for i in range(50)],
            'Low': [995.0 + i for i in range(50)],
            'Close': [1002.0 + i for i in range(50)],
            'Volume': [100000 for _ in range(50)]
        })
        res = self.relt_engine.analyze(
            df,
            reference_price=1050.0,
            account_size_idr=10000000.0,
            risk_per_trade_pct=1.0
        )
        setup = res["trade_setup"]
        max_risk = setup["max_risk_amount"]
        risk_budget = 10000000.0 * 0.01

        # Max risk must never exceed risk budget
        self.assertLessEqual(max_risk, risk_budget + 1.0, "Risk must respect budget strictly")
        self.assertEqual(setup["recommended_shares"], setup["recommended_lots"] * 100)

if __name__ == "__main__":
    unittest.main()
