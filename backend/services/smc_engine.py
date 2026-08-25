"""
Smart Money Concepts (SMC) & Price Action Engine
Ported and enhanced from reltsignal.pine (TradingView Pine Script v6)
Implements:
- Fair Value Gap (FVG) detection & mitigation tracking
- Order Block (OB) detection with volume spike filtering & mitigation
- Market Structure: Break of Structure (BOS) & Change of Character (CHOCH)
- Liquidity Sweep (High/Low wick sweeps)
- Breakout Box (highest/lowest 20-period channel)
- Sudden Pump / Dump Warning
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

class SMCEngine:
    def __init__(self, volume_len: int = 20, ob_vol_mult: float = 1.5, breakout_len: int = 20):
        self.volume_len = volume_len
        self.ob_vol_mult = ob_vol_mult
        self.breakout_len = breakout_len

    def detect_all(self, df: pd.DataFrame, swing_len: int = 3, ema_fast: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Calculates all Smart Money Concepts & Price Action features on the given DataFrame.
        DataFrame must contain 'Open', 'High', 'Low', 'Close', 'Volume'.
        """
        if df is None or df.empty or len(df) < 5:
            return {
                "bullish_fvg": False,
                "bearish_fvg": False,
                "active_bull_fvgs": [],
                "active_bear_fvgs": [],
                "bullish_ob": False,
                "bearish_ob": False,
                "active_bull_obs": [],
                "active_bear_obs": [],
                "smart_money_buy": False,
                "smart_money_sell": False,
                "bos_bull": False,
                "bos_bear": False,
                "choch_bull": False,
                "choch_bear": False,
                "liquidity_sweep_high": False,
                "liquidity_sweep_low": False,
                "breakout_up": False,
                "breakout_down": False,
                "pump_candle": False,
                "dump_candle": False,
                "last_swing_high": None,
                "last_swing_low": None,
                "market_phase": "Accumulation"
            }

        opens = df['Open'].astype(float).values
        highs = df['High'].astype(float).values
        lows = df['Low'].astype(float).values
        closes = df['Close'].astype(float).values
        volumes = df['Volume'].astype(float).values
        n = len(closes)

        # 1. Volume moving average
        vol_series = pd.Series(volumes)
        vol_avg = vol_series.rolling(window=self.volume_len, min_periods=1).mean().values

        # 2. Fair Value Gaps (FVG) and Active Tracking
        active_bull_fvgs = []
        active_bear_fvgs = []

        for i in range(2, n):
            # Bullish FVG: Low of current bar is higher than High of 2 bars ago
            if lows[i] > highs[i - 2]:
                active_bull_fvgs.append({
                    "bar_index": i,
                    "top": float(lows[i]),
                    "bottom": float(highs[i - 2]),
                    "date": str(df.index[i]) if hasattr(df.index, 'strftime') else str(i)
                })

            # Bearish FVG: High of current bar is lower than Low of 2 bars ago
            if highs[i] < lows[i - 2]:
                active_bear_fvgs.append({
                    "bar_index": i,
                    "top": float(lows[i - 2]),
                    "bottom": float(highs[i]),
                    "date": str(df.index[i]) if hasattr(df.index, 'strftime') else str(i)
                })

            # Check mitigation by subsequent price action
            curr_low = lows[i]
            curr_high = highs[i]

            # Mitigate bull FVGs if price drops into or below bottom
            active_bull_fvgs = [fvg for fvg in active_bull_fvgs if not (curr_low <= fvg["bottom"] and fvg["bar_index"] < i)]
            # Mitigate bear FVGs if price rises into or above top
            active_bear_fvgs = [fvg for fvg in active_bear_fvgs if not (curr_high >= fvg["top"] and fvg["bar_index"] < i)]

            # Keep only the last 5 most recent unmitigated boxes
            if len(active_bull_fvgs) > 5:
                active_bull_fvgs = active_bull_fvgs[-5:]
            if len(active_bear_fvgs) > 5:
                active_bear_fvgs = active_bear_fvgs[-5:]

        # Current bar FVG status
        curr_bull_fvg = bool(n >= 3 and lows[-1] > highs[-3])
        curr_bear_fvg = bool(n >= 3 and highs[-1] < lows[-3])

        # 3. Smart Money Volume Spikes & Order Blocks (OB)
        active_bull_obs = []
        active_bear_obs = []
        smart_money_buy_flags = np.zeros(n, dtype=bool)
        smart_money_sell_flags = np.zeros(n, dtype=bool)

        for i in range(2, n):
            va = vol_avg[i] if not np.isnan(vol_avg[i]) and vol_avg[i] > 0 else 1.0
            v_spike = volumes[i] > va * self.ob_vol_mult
            v_big = volumes[i] > va * 2.0

            strong_bull_candle = closes[i] > opens[i] and closes[i] > highs[i - 1]
            strong_bear_candle = closes[i] < opens[i] and closes[i] < lows[i - 1]

            ef = ema_fast[i] if ema_fast is not None and not np.isnan(ema_fast[i]) else closes[i]

            if v_big and strong_bull_candle and closes[i] > ef:
                smart_money_buy_flags[i] = True
            if v_big and strong_bear_candle and closes[i] < ef:
                smart_money_sell_flags[i] = True

            # Bullish OB: volume spike + bullish FVG + strong close + previous candle was bearish
            is_bull_fvg_bar = lows[i] > highs[i - 2]
            if v_spike and is_bull_fvg_bar and closes[i] > highs[i - 1] and opens[i - 1] > closes[i - 1]:
                active_bull_obs.append({
                    "bar_index": i - 1,
                    "top": float(highs[i - 1]),
                    "bottom": float(lows[i - 1]),
                    "date": str(df.index[i - 1]) if hasattr(df.index, 'strftime') else str(i - 1)
                })

            # Bearish OB: volume spike + bearish FVG + strong close down + previous candle was bullish
            is_bear_fvg_bar = highs[i] < lows[i - 2]
            if v_spike and is_bear_fvg_bar and closes[i] < lows[i - 1] and opens[i - 1] < closes[i - 1]:
                active_bear_obs.append({
                    "bar_index": i - 1,
                    "top": float(highs[i - 1]),
                    "bottom": float(lows[i - 1]),
                    "date": str(df.index[i - 1]) if hasattr(df.index, 'strftime') else str(i - 1)
                })

            # Mitigate OBs
            curr_low = lows[i]
            curr_high = highs[i]
            active_bull_obs = [ob for ob in active_bull_obs if not (curr_low <= ob["top"] and ob["bar_index"] < i - 1)]
            active_bear_obs = [ob for ob in active_bear_obs if not (curr_high >= ob["bottom"] and ob["bar_index"] < i - 1)]

            if len(active_bull_obs) > 5:
                active_bull_obs = active_bull_obs[-5:]
            if len(active_bear_obs) > 5:
                active_bear_obs = active_bear_obs[-5:]

        # 4. Market Structure: Swing Highs & Lows, BOS, CHOCH
        # Pivot identification
        pivot_highs = []
        pivot_lows = []
        last_swing_high = None
        last_swing_low = None

        for i in range(swing_len, n - swing_len):
            # Pivot High: highs[i] is highest in [i-swing_len, i+swing_len]
            if highs[i] == np.max(highs[i - swing_len : i + swing_len + 1]):
                pivot_highs.append((i, highs[i]))
                last_swing_high = float(highs[i])

            # Pivot Low: lows[i] is lowest in [i-swing_len, i+swing_len]
            if lows[i] == np.min(lows[i - swing_len : i + swing_len + 1]):
                pivot_lows.append((i, lows[i]))
                last_swing_low = float(lows[i])

        # Fallback if not enough pivot bars
        if last_swing_high is None and n >= 5:
            last_swing_high = float(np.max(highs[-20:] if n >= 20 else highs))
        if last_swing_low is None and n >= 5:
            last_swing_low = float(np.min(lows[-20:] if n >= 20 else lows))

        # BOS (Break of Structure)
        last_close = closes[-1]
        bos_bull = bool(last_swing_high is not None and last_close > last_swing_high)
        bos_bear = bool(last_swing_low is not None and last_close < last_swing_low)

        # CHOCH (Change of Character) based on EMA trend shift
        choch_bull = False
        choch_bear = False
        if ema_fast is not None and len(ema_fast) >= 2:
            prev_bull = closes[-2] > ema_fast[-2] if not np.isnan(ema_fast[-2]) else False
            curr_bull = closes[-1] > ema_fast[-1] if not np.isnan(ema_fast[-1]) else False
            choch_bull = not prev_bull and curr_bull
            choch_bear = prev_bull and not curr_bull

        # 5. Liquidity Sweep
        # Low sweep (fake break below previous low, closing above it)
        liquidity_sweep_low = bool(n >= 2 and lows[-1] < lows[-2] and closes[-1] > lows[-2])
        # High sweep (fake break above previous high, closing below it)
        liquidity_sweep_high = bool(n >= 2 and highs[-1] > highs[-2] and closes[-1] < highs[-2])

        # 6. Breakout Box
        lookback = min(self.breakout_len, n - 1)
        if lookback >= 2:
            prev_highest = np.max(highs[-lookback - 1 : -1])
            prev_lowest = np.min(lows[-lookback - 1 : -1])
            breakout_up = bool(last_close > prev_highest)
            breakout_down = bool(last_close < prev_lowest)
        else:
            breakout_up = False
            breakout_down = False

        # 7. Pump & Dump Warnings
        cur_open = opens[-1]
        cur_close = closes[-1]
        cur_vol = volumes[-1]
        last_vol_avg = vol_avg[-1] if not np.isnan(vol_avg[-1]) and vol_avg[-1] > 0 else 1.0
        ef_last = ema_fast[-1] if ema_fast is not None and not np.isnan(ema_fast[-1]) else cur_close

        pump_strength = ((cur_close - cur_open) / cur_open * 100) if cur_open > 0 else 0.0
        dump_strength = ((cur_open - cur_close) / cur_open * 100) if cur_open > 0 else 0.0

        pump_candle = bool(cur_close > cur_open and pump_strength >= 3.0 and cur_vol > last_vol_avg * 1.3 and cur_close > ef_last)
        dump_candle = bool(cur_close < cur_open and dump_strength >= 3.0 and cur_vol > last_vol_avg * 1.3 and cur_close < ef_last)

        # Market phase classification
        is_bullish_trend = cur_close > ef_last
        is_vol_elevated = cur_vol >= last_vol_avg * 0.9
        if is_bullish_trend and is_vol_elevated:
            phase = "Markup"
        elif not is_bullish_trend and is_vol_elevated:
            phase = "Markdown"
        elif cur_vol < last_vol_avg * 0.7:
            phase = "Accumulation"
        else:
            phase = "Distribution"

        return {
            "bullish_fvg": curr_bull_fvg,
            "bearish_fvg": curr_bear_fvg,
            "active_bull_fvgs": active_bull_fvgs,
            "active_bear_fvgs": active_bear_fvgs,
            "bullish_ob": bool(len(active_bull_obs) > 0 and active_bull_obs[-1]["bar_index"] >= n - 3),
            "bearish_ob": bool(len(active_bear_obs) > 0 and active_bear_obs[-1]["bar_index"] >= n - 3),
            "active_bull_obs": active_bull_obs,
            "active_bear_obs": active_bear_obs,
            "smart_money_buy": bool(smart_money_buy_flags[-1]),
            "smart_money_sell": bool(smart_money_sell_flags[-1]),
            "bos_bull": bos_bull,
            "bos_bear": bos_bear,
            "choch_bull": choch_bull,
            "choch_bear": choch_bear,
            "liquidity_sweep_high": liquidity_sweep_high,
            "liquidity_sweep_low": liquidity_sweep_low,
            "breakout_up": breakout_up,
            "breakout_down": breakout_down,
            "pump_candle": pump_candle,
            "dump_candle": dump_candle,
            "last_swing_high": last_swing_high,
            "last_swing_low": last_swing_low,
            "market_phase": phase
        }
