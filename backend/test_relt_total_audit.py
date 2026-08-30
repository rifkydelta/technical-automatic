import unittest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from services.relt_signal_engine import ReltSignalEngine
from services.smc_engine import SMCEngine
from services.supertrend_engine import SupertrendEngine
from services.historical_backtester import HistoricalBacktester

class TestReltTotalAudit(unittest.TestCase):
    def setUp(self):
        self.relt_engine = ReltSignalEngine()
        self.smc_engine = SMCEngine()
        self.st_engine = SupertrendEngine()
        self.backtester = HistoricalBacktester()

        # Generate synthetic 100-bar uptrend dataset
        dates = [datetime(2025, 1, 1) + timedelta(days=i) for i in range(100)]
        np.random.seed(42)
        base_price = 1000.0
        closes = []
        highs = []
        lows = []
        opens = []
        volumes = []

        cur = base_price
        for i in range(100):
            step = 5.0 + np.random.normal(0, 3)
            cur = max(cur + step, 100.0)
            o = cur - 2.0
            h = cur + 6.0
            l = cur - 5.0
            c = cur
            v = 100000 + int(np.random.uniform(0, 50000))
            opens.append(o)
            highs.append(h)
            lows.append(l)
            closes.append(c)
            volumes.append(v)

        self.uptrend_df = pd.DataFrame({
            'Open': opens,
            'High': highs,
            'Low': lows,
            'Close': closes,
            'Volume': volumes
        }, index=pd.DatetimeIndex(dates))

    def test_10_factor_scoring_and_bounds(self):
        """Verify that score is between 0 and 100 and rating classification is consistent."""
        res = self.relt_engine.analyze(self.uptrend_df, reference_price=self.uptrend_df['Close'].iloc[-1])
        self.assertIn("score", res)
        self.assertIn("rating", res)
        self.assertIn("action", res)
        self.assertGreaterEqual(res["score"], 0)
        self.assertLessEqual(res["score"], 100)
        self.assertIn(res["action"], ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY", "WATCH BUY", "RISK WARNING", "WAIT", "WAIT / NO TRADE"])

    def test_adaptive_stop_loss_hard_floor(self):
        """Verify Stop Loss is strictly capped (max -8% risk floor, min -3% buffer)."""
        res = self.relt_engine.analyze(self.uptrend_df, reference_price=self.uptrend_df['Close'].iloc[-1])
        setup = res["trade_setup"]
        entry = setup["entry_price"]
        sl = setup["stop_loss"]
        risk_pct = setup["risk_percent"]

        self.assertLess(sl, entry, "Stop loss must be below entry price")
        self.assertLessEqual(risk_pct, 8.01, "Stop loss risk percent must not exceed 8%")
        self.assertGreaterEqual(risk_pct, 2.99, "Stop loss risk percent must be at least 3%")

    def test_idx_lot_sizing_calculation(self):
        """Verify IDX Lot sizing uses 1 Lot = 100 Shares integer arithmetic."""
        res = self.relt_engine.analyze(
            self.uptrend_df,
            reference_price=self.uptrend_df['Close'].iloc[-1],
            account_size_idr=10000000,
            risk_per_trade_pct=1.0
        )
        setup = res["trade_setup"]
        lots = setup["recommended_lots"]
        shares = setup["recommended_shares"]

        self.assertEqual(shares, lots * 100, "Shares must be exact multiple of 100 (1 Lot = 100 Shares)")
        self.assertGreaterEqual(lots, 0)
        self.assertLessEqual(setup["max_risk_amount"], 10000000 * 0.01 + 5000, "Max risk must respect risk budget")

    def test_historical_backtester_no_deep_losses(self):
        """Verify backtest trades have no excessive loss > -8.5% and have timestamps."""
        summary = self.backtester.run_relt_daily_backtest(self.uptrend_df, lookback_days=365)
        self.assertIsNotNone(summary)
        self.assertGreaterEqual(summary.total_trades, 1)

        for trade in summary.trade_logs:
            if trade.status == "hit_sl":
                self.assertGreaterEqual(trade.pnl_pct, -8.5, f"Trade loss {trade.pnl_pct}% exceeded hard floor!")
            self.assertIsNotNone(trade.entry_time, "Trade must have entry_time")
            self.assertIsNotNone(trade.exit_time, "Trade must have exit_time")

    def test_smc_engine_detection(self):
        """Verify SMC Fair Value Gaps and Order Blocks detection."""
        smc = self.smc_engine.detect_all(self.uptrend_df)
        self.assertIn("active_bull_fvgs", smc)
        self.assertIn("active_bull_obs", smc)
        self.assertIn("bos_bull", smc)

    def test_supertrend_polarity(self):
        """Verify Supertrend values and polarity."""
        st = self.st_engine.calculate(self.uptrend_df)
        self.assertIn("st_trend", st)
        self.assertIn(st["st_trend"], ["Bullish", "Bearish"])
        self.assertGreater(st["st_value"], 0)

if __name__ == '__main__':
    unittest.main()
