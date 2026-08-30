"""
RELT Signal Engine - Complete Python Implementation
Ported directly from reltsignal.pine (TradingView Pine Script v6)
Features:
- Dynamic sensitivity modes (Conservative, Balanced, Sensitive, Super Sensitive)
- Multi-mode entry (Momentum, Pullback Reversal, Hybrid)
- 10-Factor Weighted Scoring Engine (0-100%) & Grading (A+, A, B, C, D)
- Smart Money Concepts integration (FVG, OB, BOS, CHOCH, Liquidity Sweep)
- Supertrend Integration & Multi-Timeframe Confirmation
- Adaptive Stop Loss with Anti Stop-Hunt Buffer
- TP1 (1.3R), TP2 (2.0R), Trailing Stop
- Indonesian Stock Exchange (IDX) Lot Sizer (1 lot = 100 shares, capital risk allocation)
- Direction Prediction via Linear Regression Slope Projection
"""

import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

try:
    import talib
except ImportError:
    import utils.ta_fallback as talib

from services.smc_engine import SMCEngine
from services.supertrend_engine import SupertrendEngine

class ReltSignalEngine:
    MODE_PRESETS = {
        "Conservative": {
            "ema_fast": 20,
            "ema_slow": 50,
            "rsi_len": 14,
            "rsi_buy": 50.0,
            "rsi_sell": 50.0,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_sig": 9,
            "vol_mult": 1.00,
            "swing_len": 5
        },
        "Balanced": {
            "ema_fast": 13,
            "ema_slow": 34,
            "rsi_len": 14,
            "rsi_buy": 48.0,
            "rsi_sell": 48.0,
            "macd_fast": 10,
            "macd_slow": 21,
            "macd_sig": 7,
            "vol_mult": 0.90,
            "swing_len": 4
        },
        "Sensitive": {
            "ema_fast": 9,
            "ema_slow": 21,
            "rsi_len": 10,
            "rsi_buy": 45.0,
            "rsi_sell": 45.0,
            "macd_fast": 8,
            "macd_slow": 17,
            "macd_sig": 5,
            "vol_mult": 0.80,
            "swing_len": 3
        },
        "Super Sensitive": {
            "ema_fast": 5,
            "ema_slow": 13,
            "rsi_len": 7,
            "rsi_buy": 40.0,
            "rsi_sell": 42.0,
            "macd_fast": 6,
            "macd_slow": 13,
            "macd_sig": 4,
            "vol_mult": 0.60,
            "swing_len": 2
        }
    }

    def __init__(self):
        self.smc_engine = SMCEngine()
        self.supertrend_engine = SupertrendEngine(factor=3.0, atr_len=10)

    def analyze(
        self,
        daily_df: pd.DataFrame,
        reference_price: float,
        signal_mode: str = "Balanced",
        entry_mode: str = "Hybrid",
        account_size_idr: float = 10_000_000.0,
        risk_per_trade_pct: float = 1.0,
        mtf_bullish: bool = True
    ) -> Dict[str, Any]:
        """
        Runs the full RELT Signal & Scoring Pipeline.
        """
        if daily_df is None or daily_df.empty or len(daily_df) < 20:
            return self._empty_result(reference_price)

        config = self.MODE_PRESETS.get(signal_mode, self.MODE_PRESETS["Balanced"])

        opens = daily_df['Open'].astype(float).values
        highs = daily_df['High'].astype(float).values
        lows = daily_df['Low'].astype(float).values
        closes = daily_df['Close'].astype(float).values
        volumes = daily_df['Volume'].astype(float).values
        n = len(closes)

        # 1. Dynamic Core Indicators
        ema_fast_arr = talib.EMA(closes, timeperiod=config["ema_fast"])
        ema_slow_arr = talib.EMA(closes, timeperiod=config["ema_slow"])
        rsi_arr = talib.RSI(closes, timeperiod=config["rsi_len"])
        macd_arr, macd_sig_arr, macd_hist_arr = talib.MACD(
            closes,
            fastperiod=config["macd_fast"],
            slowperiod=config["macd_slow"],
            signalperiod=config["macd_sig"]
        )
        vol_avg_arr = talib.SMA(volumes, timeperiod=20)
        atr_arr = talib.ATR(highs, lows, closes, timeperiod=14)

        # Latest values
        cur_price = reference_price if reference_price > 0 else float(closes[-1])
        cur_open = float(opens[-1])
        cur_high = float(highs[-1])
        cur_low = float(lows[-1])
        cur_vol = float(volumes[-1])

        ema_fast = float(ema_fast_arr[-1]) if not np.isnan(ema_fast_arr[-1]) else cur_price
        ema_slow = float(ema_slow_arr[-1]) if not np.isnan(ema_slow_arr[-1]) else cur_price
        rsi_val = float(rsi_arr[-1]) if not np.isnan(rsi_arr[-1]) else 50.0
        macd_line = float(macd_arr[-1]) if not np.isnan(macd_arr[-1]) else 0.0
        macd_sig = float(macd_sig_arr[-1]) if not np.isnan(macd_sig_arr[-1]) else 0.0
        macd_hist = float(macd_hist_arr[-1]) if not np.isnan(macd_hist_arr[-1]) else 0.0
        macd_hist_prev = float(macd_hist_arr[-2]) if len(macd_hist_arr) >= 2 and not np.isnan(macd_hist_arr[-2]) else macd_hist
        vol_avg = float(vol_avg_arr[-1]) if not np.isnan(vol_avg_arr[-1]) and vol_avg_arr[-1] > 0 else 1.0
        atr_val = float(atr_arr[-1]) if not np.isnan(atr_arr[-1]) and atr_arr[-1] > 0 else max(cur_price * 0.02, 1.0)

        # 2. SMC & Supertrend Execution
        smc_res = self.smc_engine.detect_all(daily_df, swing_len=config["swing_len"], ema_fast=ema_fast_arr)
        st_res = self.supertrend_engine.calculate(daily_df)

        st_bullish = st_res["st_trend"] == "Bullish"
        bullish_trend = cur_price > ema_fast and ema_fast > ema_slow
        bearish_trend = cur_price < ema_fast and ema_fast < ema_slow

        # 3. No-Trade Zone Detection
        atr_pct = (atr_val / cur_price) * 100.0 if cur_price > 0 else 0.0
        low_volatility = atr_pct < 1.0
        sideways_market = (abs(ema_fast - ema_slow) / cur_price * 100.0) < 0.5 if cur_price > 0 else False
        low_volume_market = cur_vol < (vol_avg * 0.7)
        no_trade_zone = low_volatility or sideways_market or low_volume_market

        # 4. Pullback Reversal Candle Detection
        body = abs(cur_close := cur_price - cur_open)
        upper_wick = cur_high - max(cur_open, cur_price)
        lower_wick = min(cur_open, cur_price) - cur_low
        bullish_pinbar = cur_price > cur_open and lower_wick > body * 1.5 and upper_wick < body * 1.2
        prev_open = float(opens[-2]) if n >= 2 else cur_open
        prev_close = float(closes[-2]) if n >= 2 else cur_price
        prev_high = float(highs[-2]) if n >= 2 else cur_high
        bullish_engulfing = cur_price > cur_open and prev_close < prev_open and cur_price > prev_open and cur_open <= prev_close
        bullish_reversal = bullish_pinbar or bullish_engulfing

        # Pullback Conditions
        lowest_3 = float(np.min(lows[-3:])) if n >= 3 else cur_low
        pullback_touch_ema = cur_low <= ema_fast or cur_low <= ema_slow or lowest_3 <= ema_fast
        pullback_trend_ok = ema_fast > ema_slow and cur_price > ema_slow
        pullback_rsi_ok = 35.0 < rsi_val < 60.0
        pullback_bounce_ok = cur_price > ema_fast or cur_price > prev_high
        pullback_macd_ok = macd_hist > macd_hist_prev or macd_line > macd_sig
        pullback_candle_ok = bullish_reversal or cur_price > cur_open or cur_price > prev_high
        volume_ok = cur_vol >= (vol_avg * config["vol_mult"])

        pullback_buy = bool(pullback_trend_ok and pullback_touch_ema and pullback_rsi_ok and pullback_bounce_ok and pullback_macd_ok and pullback_candle_ok and volume_ok)

        # Momentum Conditions
        macd_momentum_up = macd_hist > macd_hist_prev
        early_buy = cur_price > ema_fast and rsi_val > config["rsi_buy"] and macd_momentum_up and volume_ok
        momentum_buy = bool(cur_price > ema_fast and ema_fast > ema_slow and rsi_val > config["rsi_buy"] and macd_line > macd_sig and volume_ok)

        # Super Sensitive Entry
        super_sensitive_buy = bool(signal_mode == "Super Sensitive" and (early_buy or smc_res["breakout_up"] or macd_line > macd_sig))

        # 5. Composite Score Engine (0 - 100%)
        score = 0.0
        if cur_price > ema_fast: score += 10.0
        if ema_fast > ema_slow: score += 10.0
        if rsi_val > config["rsi_buy"]: score += 10.0
        if macd_line > macd_sig: score += 10.0
        if volume_ok: score += 10.0
        if mtf_bullish: score += 15.0
        if smc_res["smart_money_buy"]: score += 10.0
        if smc_res["bos_bull"]: score += 8.0
        if pullback_buy: score += 7.0
        if st_bullish: score += 10.0

        score = min(score, 100.0)

        # Rating
        if score >= 85:
            rating = "A+ Strong Buy"
        elif score >= 70:
            rating = "A Buy"
        elif score >= 55:
            rating = "B Watch"
        elif score >= 40:
            rating = "C Weak"
        else:
            rating = "D Avoid"

        trend_strength_num = (abs(ema_fast - ema_slow) / cur_price * 100.0) if cur_price > 0 else 0.0
        trend_strength = "Strong" if trend_strength_num > 3.0 else ("Medium" if trend_strength_num > 1.5 else "Weak")

        # 6. Stop Loss & Risk Management (Adaptive Hybrid)
        base_sl_atr = cur_price - (atr_val * 1.5)
        recent_low_10 = float(np.min(lows[-10:])) if n >= 10 else cur_low
        base_sl_lowest = recent_low_10
        base_initial_sl = max(base_sl_atr, base_sl_lowest)

        last_swing_low = smc_res.get("last_swing_low")
        long_liquidity_ref = last_swing_low if (last_swing_low is not None and last_swing_low < cur_price) else base_sl_lowest
        long_hunt_sl = long_liquidity_ref - (atr_val * 0.35)
        long_wide_atr_sl = cur_price - (atr_val * 1.5)
        adaptive_long_sl = max(long_wide_atr_sl, long_hunt_sl)

        positive_long_bias = bool(bullish_trend or (cur_price > ema_fast and macd_line > macd_sig and volume_ok) or (st_bullish and cur_price > ema_fast) or smc_res["liquidity_sweep_low"])

        stop_loss = adaptive_long_sl if positive_long_bias else base_initial_sl
        
        # Ensure SL is strictly protective (max 10% risk floor, min 2% risk buffer)
        if stop_loss >= cur_price or np.isnan(stop_loss):
            stop_loss = cur_price * 0.95
        else:
            # Enforce max 10% risk floor on daily swings (protecting from abnormal outliers)
            stop_loss = max(stop_loss, cur_price * 0.90)
            # Enforce minimum 2% breathing room
            stop_loss = min(stop_loss, cur_price * 0.98)

        stop_loss = round(stop_loss, 2)
        price_risk = cur_price - stop_loss
        tp1 = round(cur_price + (price_risk * 1.3), 2)
        tp2 = round(cur_price + (price_risk * 2.0), 2)

        tp1_pct = round(((tp1 - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0
        tp2_pct = round(((tp2 - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0

        tp1_distance = abs(tp1 - cur_price)
        daily_movement_pace = max(atr_val * 0.75, cur_price * 0.008)
        estimated_tp_days = max(1, int(round(tp1_distance / daily_movement_pace))) if daily_movement_pace > 0 else 2
        if estimated_tp_days == 1:
            estimated_tp_range = "1-2 Hari"
        elif estimated_tp_days <= 3:
            estimated_tp_range = f"{estimated_tp_days}-{estimated_tp_days + 2} Hari"
        else:
            estimated_tp_range = f"{estimated_tp_days}-{estimated_tp_days + 3} Hari"

        trail_pct = 3.0 * (4.0 if score >= 60.0 else 1.0)
        trailing_sl = round(cur_price * (1.0 - trail_pct / 100.0), 2)
        rr_ratio = round((tp2 - cur_price) / max(price_risk, 1.0), 2)

        # 7. Indonesian Stock Exchange (IDX) Position Sizing
        risk_cash = account_size_idr * (risk_per_trade_pct / 100.0)
        risk_per_share = price_risk if price_risk > 0 else (cur_price * 0.05)
        raw_shares = math.floor(risk_cash / risk_per_share) if risk_per_share > 0 else 0
        recommended_lots = math.floor(raw_shares / 100) # 1 lot = 100 shares on IDX
        recommended_shares = recommended_lots * 100
        estimated_capital = recommended_shares * cur_price
        max_risk_amount = recommended_shares * risk_per_share

        # 8. Direction Prediction (Linear Regression Slope)
        pred_bars = 12
        pred_len = min(20, n)
        if pred_len >= 5:
            # Calculate linreg slope over last pred_len closes
            x = np.arange(pred_len)
            y = closes[-pred_len:]
            slope, intercept = np.polyfit(x, y, 1)
            raw_prediction_price = cur_price + (slope * pred_bars)
            target_up = max(last_swing_high if (last_swing_high := smc_res.get("last_swing_high")) and last_swing_high > cur_price else cur_price, float(np.max(highs[-min(50, n):])))

            direction_score = 0.0
            direction_score += 15.0 if bullish_trend else (-15.0 if bearish_trend else 0.0)
            direction_score += 15.0 if mtf_bullish else 0.0
            direction_score += 15.0 if macd_line > macd_sig else -15.0
            direction_score += 10.0 if rsi_val > 55.0 else (-10.0 if rsi_val < 45.0 else 0.0)
            direction_score += 10.0 if volume_ok else -5.0
            direction_score += 15.0 if smc_res["bos_bull"] else (-15.0 if smc_res["bos_bear"] else 0.0)
            direction_score += 10.0 if smc_res["smart_money_buy"] else (-10.0 if smc_res["smart_money_sell"] else 0.0)
            direction_score += 10.0 if st_bullish else -10.0

            if direction_score > 25.0:
                direction = "UP"
                predicted_price = round(max(cur_price, min(raw_prediction_price, target_up)), 2)
            elif direction_score < -25.0:
                direction = "DOWN"
                predicted_price = round(min(cur_price, raw_prediction_price), 2)
            else:
                direction = "SIDEWAYS"
                predicted_price = round(cur_price, 2)

            upside_pct = round(((predicted_price - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0
        else:
            direction = "SIDEWAYS"
            predicted_price = round(cur_price, 2)
            upside_pct = 0.0
            direction_score = 0.0

        # 9. Determine Action Badge & Gate Checks
        momentum_gate = momentum_buy and score >= 55.0 and not no_trade_zone
        pullback_gate = pullback_buy and score >= 45.0 and not no_trade_zone
        super_gate = super_sensitive_buy and score >= 45.0 and not no_trade_zone

        if entry_mode == "Momentum":
            entry_triggered = momentum_gate
        elif entry_mode == "Pullback":
            entry_triggered = pullback_gate
        else:
            entry_triggered = momentum_gate or pullback_gate or super_gate

        if score >= 85.0 and volume_ok and mtf_bullish and bullish_trend:
            action = "ULTRA BUY"
        elif entry_triggered and score >= 70.0:
            action = "STRONG BUY"
        elif pullback_gate:
            action = "PULLBACK BUY"
        elif entry_triggered or smc_res["smart_money_buy"] or smc_res["bos_bull"]:
            action = "WATCH BUY"
        elif smc_res["pump_candle"] or smc_res["dump_candle"]:
            action = "RISK WARNING"
        elif no_trade_zone:
            action = "WAIT / NO TRADE"
        else:
            action = "WAIT"

        return {
            "action": action,
            "signal_mode": signal_mode,
            "entry_mode": entry_mode,
            "score": int(round(score)),
            "score_max": 100,
            "rating": rating,
            "trend_strength": trend_strength,
            "is_no_trade_zone": no_trade_zone,
            "smc": {
                "bullish_fvg_active": smc_res["bullish_fvg"],
                "bearish_fvg_active": smc_res["bearish_fvg"],
                "bullish_ob_active": smc_res["bullish_ob"],
                "bearish_ob_active": smc_res["bearish_ob"],
                "smart_money_buy": smc_res["smart_money_buy"],
                "smart_money_sell": smc_res["smart_money_sell"],
                "bos_bull": smc_res["bos_bull"],
                "bos_bear": smc_res["bos_bear"],
                "choch_bull": smc_res["choch_bull"],
                "choch_bear": smc_res["choch_bear"],
                "liquidity_sweep_low": smc_res["liquidity_sweep_low"],
                "liquidity_sweep_high": smc_res["liquidity_sweep_high"],
                "breakout_up": smc_res["breakout_up"],
                "breakout_down": smc_res["breakout_down"],
                "pump_candle": smc_res["pump_candle"],
                "dump_candle": smc_res["dump_candle"],
                "market_phase": smc_res["market_phase"],
                "active_bull_fvgs": smc_res["active_bull_fvgs"],
                "active_bull_obs": smc_res["active_bull_obs"]
            },
            "supertrend": {
                "st_value": st_res["st_value"],
                "st_trend": st_res["st_trend"],
                "st_color": "lime" if st_bullish else "red"
            },
            "trade_setup": {
                "entry_price": cur_price,
                "stop_loss": stop_loss,
                "tp1": tp1,
                "tp2": tp2,
                "trailing_stop": trailing_sl,
                "risk_reward_ratio": rr_ratio,
                "risk_per_share": round(price_risk, 2),
                "risk_percent": round((price_risk / cur_price * 100.0), 2) if cur_price > 0 else 0.0,
                "tp1_percent": tp1_pct,
                "tp2_percent": tp2_pct,
                "estimated_tp_days": estimated_tp_days,
                "estimated_tp_range": estimated_tp_range,
                "account_size_idr": account_size_idr,
                "risk_per_trade_pct": risk_per_trade_pct,
                "recommended_lots": recommended_lots,
                "recommended_shares": recommended_shares,
                "estimated_capital_required": round(estimated_capital, 2),
                "max_risk_amount": round(max_risk_amount, 2)
            },
            "direction_prediction": {
                "direction": direction,
                "predicted_price": predicted_price,
                "upside_pct": upside_pct,
                "confidence_score": int(round(direction_score)),
                "target_bars": pred_bars
            },
            "indicators": {
                "ema_fast": round(ema_fast, 2),
                "ema_slow": round(ema_slow, 2),
                "rsi": round(rsi_val, 2),
                "macd_line": round(macd_line, 2),
                "macd_signal": round(macd_sig, 2),
                "macd_hist": round(macd_hist, 2),
                "atr": round(atr_val, 2)
            }
        }

    def detect_signals_historical(
        self,
        daily_df: pd.DataFrame,
        reference_price: float = 0.0,
        signal_mode: str = "Balanced",
        entry_mode: str = "Hybrid",
        lookback_bars: int = 15,
        mtf_bullish: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Iterate bar-by-bar across the lookback_bars window on daily_df to detect
        historical BUY and SELL signals at the exact bar/date they were triggered on the chart.
        Follows TradingView Pine Script logic (buySignal = ... and not tradeWasActive).
        """
        if daily_df is None or daily_df.empty or len(daily_df) < 20:
            return []

        df = daily_df.copy()
        n = len(df)
        start_idx = max(20, n - min(lookback_bars, n))

        signals = []
        in_trade = False
        stop_loss = 0.0
        tp1 = 0.0
        tp2 = 0.0
        trailing_sl = 0.0
        tp1_hit = False

        for i in range(start_idx, n):
            past_slice = df.iloc[:i + 1]
            cur_row = df.iloc[i]
            cur_close = float(cur_row['Close'])
            cur_high = float(cur_row['High'])
            cur_low = float(cur_row['Low'])
            raw_time = cur_row.name

            # Format candle date and full market close timestamp (16:00:00 WIB)
            if hasattr(raw_time, 'strftime'):
                signal_date = raw_time.strftime("%Y-%m-%d")
            else:
                signal_date = str(raw_time)[:10]
            signal_time = f"{signal_date} 16:00:00"

            # Check trade management / exits if in trade
            if in_trade:
                new_trail = cur_close * 0.965
                trailing_sl = max(trailing_sl, new_trail)

                # Check if trade exited on this bar
                exited = False
                if cur_low <= stop_loss or cur_low <= trailing_sl or cur_high >= tp2:
                    exited = True
                elif cur_high >= tp1 and not tp1_hit:
                    tp1_hit = True
                    trailing_sl = max(trailing_sl, stop_loss + (cur_close - stop_loss) * 0.5)

                if exited:
                    in_trade = False
                    tp1_hit = False

            # Run full RELT analysis for this bar slice
            ref_p = reference_price if (i == n - 1 and reference_price > 0) else cur_close
            relt = self.analyze(
                daily_df=past_slice,
                reference_price=ref_p,
                signal_mode=signal_mode,
                entry_mode=entry_mode,
                mtf_bullish=mtf_bullish
            )

            action = relt.get("action", "WAIT")
            score = relt.get("score", 0)
            is_no_trade = relt.get("is_no_trade_zone", False)
            dir_pred = relt.get("direction_prediction", {})
            direction = dir_pred.get("direction", "SIDEWAYS")

            is_buy = action in ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY", "WATCH BUY"] and not is_no_trade
            is_sell = (action == "RISK WARNING") or (direction == "DOWN" and score < 45)

            if is_buy and not in_trade:
                in_trade = True
                setup = relt.get("trade_setup", {})
                stop_loss = setup.get("stop_loss", cur_close * 0.95)
                tp1 = setup.get("tp1", cur_close * 1.05)
                tp2 = setup.get("tp2", cur_close * 1.10)
                trailing_sl = cur_close * 0.965
                tp1_hit = False

                signals.append({
                    "signal_date": signal_date,
                    "signal_time": signal_time,
                    "signal_type": "BUY",
                    "entry_price": round(cur_close, 2),
                    "relt": relt,
                    "bar_index": i,
                    "is_latest_bar": (i == n - 1)
                })
            elif is_sell and not in_trade:
                signals.append({
                    "signal_date": signal_date,
                    "signal_time": signal_time,
                    "signal_type": "SELL",
                    "entry_price": round(cur_close, 2),
                    "relt": relt,
                    "bar_index": i,
                    "is_latest_bar": (i == n - 1)
                })

        return signals

    def _empty_result(self, reference_price: float) -> Dict[str, Any]:
        return {
            "action": "WAIT",
            "signal_mode": "Balanced",
            "entry_mode": "Hybrid",
            "score": 0,
            "score_max": 100,
            "rating": "D Avoid",
            "trend_strength": "Weak",
            "is_no_trade_zone": True,
            "smc": {
                "bullish_fvg_active": False,
                "bearish_fvg_active": False,
                "bullish_ob_active": False,
                "bearish_ob_active": False,
                "smart_money_buy": False,
                "smart_money_sell": False,
                "bos_bull": False,
                "bos_bear": False,
                "choch_bull": False,
                "choch_bear": False,
                "liquidity_sweep_low": False,
                "liquidity_sweep_high": False,
                "breakout_up": False,
                "breakout_down": False,
                "pump_candle": False,
                "dump_candle": False,
                "market_phase": "Accumulation",
                "active_bull_fvgs": [],
                "active_bull_obs": []
            },
            "supertrend": {
                "st_value": None,
                "st_trend": "Unknown",
                "st_color": "gray"
            },
            "trade_setup": {
                "entry_price": reference_price,
                "stop_loss": reference_price * 0.95,
                "tp1": reference_price * 1.05,
                "tp2": reference_price * 1.10,
                "trailing_stop": reference_price * 0.95,
                "risk_reward_ratio": 1.5,
                "risk_per_share": reference_price * 0.05,
                "risk_percent": 5.0,
                "tp1_percent": 5.0,
                "tp2_percent": 10.0,
                "estimated_tp_days": 2,
                "estimated_tp_range": "2-4 Hari",
                "account_size_idr": 10_000_000,
                "risk_per_trade_pct": 1.0,
                "recommended_lots": 0,
                "recommended_shares": 0,
                "estimated_capital_required": 0,
                "max_risk_amount": 0
            },
            "direction_prediction": {
                "direction": "SIDEWAYS",
                "predicted_price": reference_price,
                "upside_pct": 0.0,
                "confidence_score": 0,
                "target_bars": 12
            },
            "indicators": {}
        }
