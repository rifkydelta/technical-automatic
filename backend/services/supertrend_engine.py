"""
Supertrend Engine
Calculates standard and exact Pine Script equivalent Supertrend (factor=3.0, atr_len=10)
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

class SupertrendEngine:
    def __init__(self, factor: float = 3.0, atr_len: int = 10):
        self.factor = factor
        self.atr_len = atr_len

    def calculate(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate Supertrend on given DataFrame with High, Low, Close.
        Returns:
        - st_value: latest Supertrend line value
        - st_trend: 'Bullish' or 'Bearish'
        - st_direction: 1 (Bullish / below price) or -1 (Bearish / above price)
        - st_flip: True if flipped direction on the latest candle
        - series: full numpy arrays for plotting
        """
        if df is None or df.empty or len(df) < self.atr_len + 1:
            return {
                "st_value": None,
                "st_trend": "Unknown",
                "st_direction": 0,
                "st_flip": False,
                "st_series": []
            }

        high = df['High'].astype(float).values
        low = df['Low'].astype(float).values
        close = df['Close'].astype(float).values
        n = len(close)

        # 1. Calculate True Range
        tr = np.zeros(n)
        tr[0] = high[0] - low[0]
        for i in range(1, n):
            hl = high[i] - low[i]
            hc = abs(high[i] - close[i - 1])
            lc = abs(low[i] - close[i - 1])
            tr[i] = max(hl, hc, lc)

        # 2. Wilder's ATR / RMA equivalent
        atr = np.zeros(n)
        atr[:self.atr_len] = np.mean(tr[:self.atr_len])
        for i in range(self.atr_len, n):
            atr[i] = (atr[i - 1] * (self.atr_len - 1) + tr[i]) / self.atr_len

        # 3. Basic Upper and Lower Bands
        hl2 = (high + low) / 2.0
        basic_upper = hl2 + (self.factor * atr)
        basic_lower = hl2 - (self.factor * atr)

        final_upper = np.zeros(n)
        final_lower = np.zeros(n)
        supertrend = np.zeros(n)
        trend = np.zeros(n, dtype=int) # 1 = Bullish, -1 = Bearish

        # Initial values
        final_upper[0] = basic_upper[0]
        final_lower[0] = basic_lower[0]
        trend[0] = 1 if close[0] > final_upper[0] else -1
        supertrend[0] = final_lower[0] if trend[0] == 1 else final_upper[0]

        for i in range(1, n):
            # Final Upper Band
            if basic_upper[i] < final_upper[i - 1] or close[i - 1] > final_upper[i - 1]:
                final_upper[i] = basic_upper[i]
            else:
                final_upper[i] = final_upper[i - 1]

            # Final Lower Band
            if basic_lower[i] > final_lower[i - 1] or close[i - 1] < final_lower[i - 1]:
                final_lower[i] = basic_lower[i]
            else:
                final_lower[i] = final_lower[i - 1]

            # Determine Trend
            prev_trend = trend[i - 1]
            if prev_trend == 1:
                if close[i] < final_lower[i]:
                    trend[i] = -1
                    supertrend[i] = final_upper[i]
                else:
                    trend[i] = 1
                    supertrend[i] = final_lower[i]
            else:
                if close[i] > final_upper[i]:
                    trend[i] = 1
                    supertrend[i] = final_lower[i]
                else:
                    trend[i] = -1
                    supertrend[i] = final_upper[i]

        latest_trend = "Bullish" if trend[-1] == 1 else "Bearish"
        flipped = bool(n >= 2 and trend[-1] != trend[-2])

        return {
            "st_value": round(float(supertrend[-1]), 2),
            "st_trend": latest_trend,
            "st_direction": int(trend[-1]),
            "st_flip": flipped,
            "supertrend_series": supertrend
        }
