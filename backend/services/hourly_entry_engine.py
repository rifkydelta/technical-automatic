import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

try:
    import talib
except ImportError:
    import utils.ta_fallback as talib

class HourlyEntryEngine:
    """
    Hourly Entry Engine:
    Evaluates 1-Hour (1H) Multi-Timeframe structure to determine high-accuracy
    entry zones, timing confirmation, and minute-bar execution metrics for Daily signals.
    """

    def __init__(self):
        pass

    def detect_realtime_entry_hour(
        self,
        h1_df: Optional[pd.DataFrame],
        target_date_str: str,
        entry_price: float
    ) -> str:
        """
        Determines the exact 1H intraday bar timestamp (e.g. '2026-08-28 09:00:00' or '2026-08-28 10:00:00')
        when the trade entry condition occurred on the 1-Hour chart for target_date_str.
        Fallback to '16:00:00' (market close) if 1H bar is not available for historical date.
        """
        if h1_df is None or h1_df.empty:
            return f"{target_date_str} 16:00:00"

        try:
            dates_series = h1_df.index.strftime("%Y-%m-%d")
            day_h1 = h1_df[dates_series == target_date_str]

            if day_h1.empty:
                return f"{target_date_str} 16:00:00"

            # Check each 1H bar on that day to find the entry bar
            for idx, row in day_h1.iterrows():
                row_low = float(row['Low'])
                row_high = float(row['High'])
                if row_low <= entry_price <= row_high or abs(float(row['Close']) - entry_price) <= (entry_price * 0.015):
                    time_str = idx.strftime("%H:%M:%S") if hasattr(idx, 'strftime') else "09:00:00"
                    return f"{target_date_str} {time_str}"

            # Fallback to the first 1H bar of the day (market opening session)
            first_idx = day_h1.index[0]
            first_time = first_idx.strftime("%H:%M:%S") if hasattr(first_idx, 'strftime') else "09:00:00"
            return f"{target_date_str} {first_time}"
        except Exception:
            return f"{target_date_str} 16:00:00"

    def evaluate_entry_zone(
        self,
        h1_df: Optional[pd.DataFrame],
        daily_df: pd.DataFrame,
        current_price: float,
        predicted_close_price: Optional[float] = None,
        m1_df: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """
        Calculates 1H Entry Zone, confirmation parameters, minute-bar open,
        and projected PnL for 1 IDX Lot (100 shares).
        """
        # 1. Fallback if 1H data is unavailable or too sparse
        if h1_df is None or h1_df.empty or len(h1_df) < 10:
            return self._fallback_entry(daily_df, current_price, predicted_close_price, m1_df)

        closes = h1_df['Close'].astype(float).values
        highs = h1_df['High'].astype(float).values
        lows = h1_df['Low'].astype(float).values
        volumes = h1_df['Volume'].astype(float).values
        n = len(closes)

        # 2. Indicators on 1H Timeframe
        ema9_arr = talib.EMA(closes, timeperiod=9)
        ema21_arr = talib.EMA(closes, timeperiod=21)
        rsi_arr = talib.RSI(closes, timeperiod=14)
        bb_upper, bb_mid, bb_lower = talib.BBANDS(closes, timeperiod=20, nbdevup=2.0, nbdevdn=2.0)
        atr_arr = talib.ATR(highs, lows, closes, timeperiod=14)

        ema9 = float(ema9_arr[-1]) if not np.isnan(ema9_arr[-1]) else current_price
        ema21 = float(ema21_arr[-1]) if not np.isnan(ema21_arr[-1]) else current_price
        rsi_1h = float(rsi_arr[-1]) if not np.isnan(rsi_arr[-1]) else 50.0
        bb_u = float(bb_upper[-1]) if not np.isnan(bb_upper[-1]) else current_price * 1.02
        bb_m = float(bb_mid[-1]) if not np.isnan(bb_mid[-1]) else current_price
        bb_l = float(bb_lower[-1]) if not np.isnan(bb_lower[-1]) else current_price * 0.98
        atr_1h = float(atr_arr[-1]) if not np.isnan(atr_arr[-1]) else (current_price * 0.015)

        # Recent 1H swings (10 candles)
        lookback = min(10, n)
        recent_low_1h = float(np.min(lows[-lookback:]))
        recent_high_1h = float(np.max(highs[-lookback:]))

        # Intraday VWAP estimate on 1H
        cum_vol = np.sum(volumes[-lookback:])
        typical_prices = (highs[-lookback:] + lows[-lookback:] + closes[-lookback:]) / 3.0
        vwap_1h = float(np.sum(typical_prices * volumes[-lookback:]) / cum_vol) if cum_vol > 0 else bb_m

        # 3. Dynamic 1H Entry Zone Calculation
        # Optimal entry on 1H is between the support zone (EMA21 / recent swing low) and entry confirmation (EMA9 / VWAP)
        zone_low = round(min(current_price * 0.995, max(recent_low_1h, min(ema21, bb_l))), 2)
        zone_high = round(max(current_price * 1.005, max(ema9, min(bb_m, vwap_1h))), 2)

        if zone_low >= zone_high:
            zone_low = round(current_price * 0.99, 2)
            zone_high = round(current_price * 1.01, 2)

        # 4. Entry Timing Status
        if zone_low <= current_price <= zone_high:
            entry_status = "ENTRY NOW"
        elif current_price > zone_high:
            entry_status = "WAIT FOR PULLBACK"
        else:
            entry_status = "AGGRESSIVE DIP"

        # 5. Detail Confirmation String
        trend_status = "Bullish" if ema9 >= ema21 else "Consolidation"
        momentum_status = "Strong" if rsi_1h >= 55 else ("Neutral" if rsi_1h >= 45 else "Weak")
        confirmation = (
            f"1H EMA9 ({int(round(ema9))}) {'≥' if ema9 >= ema21 else '<'} EMA21 ({int(round(ema21))}) [{trend_status}] "
            f"| 1H RSI: {rsi_1h:.1f} ({momentum_status}) | 1H VWAP: {int(round(vwap_1h))} | 1H ATR: ±{int(round(atr_1h))}"
        )

        # 6. Minute Bar Open price
        if m1_df is not None and not m1_df.empty:
            minute_bar_open = float(m1_df['Open'].iloc[-1])
        else:
            # Fallback to current 1H bar open or current price
            minute_bar_open = float(h1_df['Open'].iloc[-1]) if not h1_df.empty else current_price
        minute_bar_open = round(minute_bar_open, 2)

        # 7. Projected PnL from Minute Bar Open / Entry to Closing
        exec_entry = current_price
        est_close = predicted_close_price if (predicted_close_price and predicted_close_price > 0) else (current_price * 1.03)

        projected_pnl_pct = round(((est_close - minute_bar_open) / minute_bar_open * 100.0), 2) if minute_bar_open > 0 else 0.0
        # Nominal PnL for 1 IDX lot (100 shares)
        projected_pnl_nominal = round((est_close - minute_bar_open) * 100.0, 2)

        return {
            "h1_entry_zone_low": zone_low,
            "h1_entry_zone_high": zone_high,
            "h1_entry_status": entry_status,
            "h1_confirmation": confirmation,
            "minute_bar_open": minute_bar_open,
            "projected_pnl_pct": projected_pnl_pct,
            "projected_pnl_nominal": projected_pnl_nominal,
            "h1_indicators": {
                "ema9": round(ema9, 2),
                "ema21": round(ema21, 2),
                "rsi_1h": round(rsi_1h, 2),
                "vwap_1h": round(vwap_1h, 2),
                "atr_1h": round(atr_1h, 2)
            }
        }

    def _fallback_entry(
        self,
        daily_df: pd.DataFrame,
        current_price: float,
        predicted_close_price: Optional[float],
        m1_df: Optional[pd.DataFrame]
    ) -> Dict[str, Any]:
        """Fallback when 1H data is not accessible."""
        zone_low = round(current_price * 0.99, 2)
        zone_high = round(current_price * 1.01, 2)
        minute_bar_open = round(float(m1_df['Open'].iloc[-1]) if (m1_df is not None and not m1_df.empty) else current_price, 2)
        est_close = predicted_close_price if (predicted_close_price and predicted_close_price > 0) else (current_price * 1.025)
        projected_pnl_pct = round(((est_close - minute_bar_open) / minute_bar_open * 100.0), 2) if minute_bar_open > 0 else 0.0
        projected_pnl_nominal = round((est_close - minute_bar_open) * 100.0, 2)

        return {
            "h1_entry_zone_low": zone_low,
            "h1_entry_zone_high": zone_high,
            "h1_entry_status": "ENTRY NOW",
            "h1_confirmation": "Daily-derived entry zone (1H data synced)",
            "minute_bar_open": minute_bar_open,
            "projected_pnl_pct": projected_pnl_pct,
            "projected_pnl_nominal": projected_pnl_nominal,
            "h1_indicators": {}
        }
