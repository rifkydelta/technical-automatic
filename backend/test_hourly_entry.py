import unittest
import pandas as pd
import numpy as np
from services.hourly_entry_engine import HourlyEntryEngine

class TestHourlyEntryEngine(unittest.TestCase):
    def setUp(self):
        self.engine = HourlyEntryEngine()
        # Mock 1H DataFrame
        dates = pd.date_range(start="2026-08-01", periods=50, freq="1h")
        self.mock_h1 = pd.DataFrame({
            "Open": np.linspace(9500, 9800, 50),
            "High": np.linspace(9550, 9850, 50),
            "Low": np.linspace(9480, 9780, 50),
            "Close": np.linspace(9520, 9820, 50),
            "Volume": np.random.randint(10000, 50000, 50)
        }, index=dates)

        self.mock_daily = pd.DataFrame({
            "Open": np.linspace(9000, 9800, 50),
            "High": np.linspace(9100, 9850, 50),
            "Low": np.linspace(8900, 9750, 50),
            "Close": np.linspace(9050, 9820, 50),
            "Volume": np.random.randint(100000, 500000, 50)
        }, index=pd.date_range(start="2026-06-01", periods=50, freq="1d"))

    def test_entry_zone_calculation(self):
        cur_price = 9820.0
        pred_close = 10100.0

        res = self.engine.evaluate_entry_zone(
            h1_df=self.mock_h1,
            daily_df=self.mock_daily,
            current_price=cur_price,
            predicted_close_price=pred_close
        )

        self.assertIn("h1_entry_zone_low", res)
        self.assertIn("h1_entry_zone_high", res)
        self.assertIn("h1_entry_status", res)
        self.assertIn("projected_pnl_pct", res)
        self.assertIn("projected_pnl_nominal", res)

        self.assertLessEqual(res["h1_entry_zone_low"], res["h1_entry_zone_high"])
        self.assertGreater(res["projected_pnl_pct"], 0)
        self.assertGreater(res["minute_bar_open"], 0)

if __name__ == "__main__":
    unittest.main()
