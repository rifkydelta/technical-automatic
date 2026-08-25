import unittest
import numpy as np
import pandas as pd
from services.smc_engine import SMCEngine
from services.supertrend_engine import SupertrendEngine
from services.relt_signal_engine import ReltSignalEngine

class TestReltSignalAndSMC(unittest.TestCase):
    def setUp(self):
        np.random.seed(42)
        n = 60
        dates = pd.date_range("2026-01-01", periods=n, freq="D")
        
        # Bullish base price
        base = 1000.0
        closes = []
        opens = []
        highs = []
        lows = []
        volumes = []

        # Phase 1: uptrend up to bar 40
        for i in range(40):
            c = base + i * 10 + np.random.uniform(-2, 5)
            o = c - 4
            h = c + 6
            l = o - 4
            v = 1000000 + np.random.randint(50000, 200000)
            closes.append(c)
            opens.append(o)
            highs.append(h)
            lows.append(l)
            volumes.append(v)

        # Bar 40 forms a swing high at around 1420
        # Phase 2: Pullback towards EMA from bar 40 to 48
        for i in range(40, 48):
            c = closes[-1] - 8
            o = c + 5
            h = o + 3
            l = c - 4
            v = 800000
            closes.append(c)
            opens.append(o)
            highs.append(h)
            lows.append(l)
            volumes.append(v)

        # Phase 3: Strong Bullish Rebound & Breakout with volume spike (bars 48 to 60)
        for i in range(48, n):
            c = closes[-1] + 20
            o = c - 15
            h = c + 10
            l = o - 5
            v = 2500000 # Big volume spike
            closes.append(c)
            opens.append(o)
            highs.append(h)
            lows.append(l)
            volumes.append(v)

        self.df = pd.DataFrame({
            "Open": opens,
            "High": highs,
            "Low": lows,
            "Close": closes,
            "Volume": volumes
        }, index=dates)

    def test_smc_detection(self):
        smc = SMCEngine()
        res = smc.detect_all(self.df)
        self.assertIn("bullish_fvg", res)
        self.assertIn("active_bull_fvgs", res)
        self.assertIn("bos_bull", res)
        self.assertIn("smart_money_buy", res)
        self.assertIn("liquidity_sweep_low", res)
        self.assertTrue(res["bos_bull"] or len(res["active_bull_fvgs"]) > 0 or res["smart_money_buy"])

    def test_supertrend(self):
        st_engine = SupertrendEngine(factor=3.0, atr_len=10)
        res = st_engine.calculate(self.df)
        self.assertIn("st_value", res)
        self.assertIn("st_trend", res)
        self.assertEqual(res["st_trend"], "Bullish", "In strong uptrend breakout, Supertrend must be Bullish")
        self.assertIsNotNone(res["st_value"])

    def test_relt_signal_scoring(self):
        relt_engine = ReltSignalEngine()
        res = relt_engine.analyze(
            daily_df=self.df,
            reference_price=float(self.df['Close'].iloc[-1]),
            signal_mode="Balanced",
            entry_mode="Hybrid",
            account_size_idr=10000000,
            risk_per_trade_pct=1.0,
            mtf_bullish=True
        )

        self.assertIn("action", res)
        self.assertIn("score", res)
        self.assertIn("rating", res)
        self.assertIn("trade_setup", res)
        self.assertIn("direction_prediction", res)

        # Check that score is high on breakout with volume & MTF bull (>= 60)
        self.assertGreaterEqual(res["score"], 60, f"Expected high score for bullish breakout, got {res['score']}")
        self.assertIn(res["action"], ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY", "WATCH BUY"])

        # Check Trade Setup
        setup = res["trade_setup"]
        self.assertLess(setup["stop_loss"], setup["entry_price"], "Stop Loss must be below Entry Price")
        self.assertGreater(setup["tp1"], setup["entry_price"], "TP1 must be above Entry Price")
        self.assertGreater(setup["tp2"], setup["tp1"], "TP2 must be above TP1")
        self.assertGreater(setup["recommended_lots"], 0, "Recommended lots must be greater than 0")
        self.assertEqual(setup["recommended_shares"], setup["recommended_lots"] * 100, "Shares must be exact multiple of 100")

        # Check Direction Prediction
        pred = res["direction_prediction"]
        self.assertEqual(pred["direction"], "UP")
        self.assertGreaterEqual(pred["predicted_price"], setup["entry_price"])

if __name__ == "__main__":
    unittest.main()
