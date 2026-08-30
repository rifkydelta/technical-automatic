import numpy as np
import pandas as pd
import talib
import math
from typing import Dict, Any, List, Optional
from services.smc_engine import SMCEngine
from services.supertrend_engine import SupertrendEngine


class ReltSignalEngine:
    """
    Enhanced High-Probability RELT Trading Signal Engine.
    Implements a strict Quantitative Trend Regime Filter (EMA 50/200 + Supertrend),
    Volume Surge confirmation, Dynamic Swing-Low Invalidation (SL), and Multi-Target Profit Taking (1.5R & 2.5R).
    """

    MODE_PRESETS = {
        "Balanced": {
            "ema_fast": 9,
            "ema_slow": 21,
            "rsi_len": 14,
            "rsi_buy": 50.0,
            "rsi_max": 75.0,
            "vol_mult": 0.85,
            "breakout_vol_mult": 1.15,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_sig": 9,
            "swing_len": 5
        },
        "Super Sensitive": {
            "ema_fast": 7,
            "ema_slow": 14,
            "rsi_len": 9,
            "rsi_buy": 45.0,
            "rsi_max": 80.0,
            "vol_mult": 0.70,
            "breakout_vol_mult": 1.05,
            "macd_fast": 8,
            "macd_slow": 17,
            "macd_sig": 9,
            "swing_len": 3
        },
        "Conservative": {
            "ema_fast": 13,
            "ema_slow": 34,
            "rsi_len": 14,
            "rsi_buy": 52.0,
            "rsi_max": 70.0,
            "vol_mult": 1.00,
            "breakout_vol_mult": 1.30,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_sig": 9,
            "swing_len": 8
        }
    }

    def __init__(self):
        self.smc_engine = SMCEngine()
        self.supertrend_engine = SupertrendEngine(factor=3.0, atr_len=10)

    def analyze(
        self,
        daily_df: Optional[pd.DataFrame] = None,
        reference_price: float = 0.0,
        signal_mode: str = "Balanced",
        entry_mode: str = "Hybrid",
        account_size_idr: float = 10000000.0,
        risk_per_trade_pct: float = 2.0,
        mtf_bullish: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze daily OHLCV dataframe and generate comprehensive RELT Signal,
        Smart Money metrics, Adaptive Risk parameters, and multi-tier price forecast.
        """
        if daily_df is None or daily_df.empty or len(daily_df) < 20:
            return self._empty_result(signal_mode, entry_mode)

        config = self.MODE_PRESETS.get(signal_mode, self.MODE_PRESETS["Balanced"])

        opens = daily_df['Open'].astype(float).values
        highs = daily_df['High'].astype(float).values
        lows = daily_df['Low'].astype(float).values
        closes = daily_df['Close'].astype(float).values
        volumes = daily_df['Volume'].astype(float).values
        n = len(closes)

        # 1. Core Technical Indicators
        ema_fast_arr = talib.EMA(closes, timeperiod=config["ema_fast"])
        ema_slow_arr = talib.EMA(closes, timeperiod=config["ema_slow"])
        ema_50_arr = talib.EMA(closes, timeperiod=50) if n >= 50 else ema_slow_arr
        ema_200_arr = talib.EMA(closes, timeperiod=200) if n >= 200 else ema_50_arr

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
        ema_50 = float(ema_50_arr[-1]) if not np.isnan(ema_50_arr[-1]) else ema_slow
        ema_200 = float(ema_200_arr[-1]) if not np.isnan(ema_200_arr[-1]) else ema_50

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

        st_bullish = (st_res.get("st_trend") == "Bullish")
        bullish_short_trend = cur_price > ema_fast and ema_fast > ema_slow
        bearish_short_trend = cur_price < ema_fast and ema_fast < ema_slow

        # 3. Quantitative Trend Regime Gate (Anti-Counter-Trend Filter)
        has_ema200 = (n >= 200 and not np.isnan(ema_200_arr[-1]))
        macro_uptrend = (cur_price > ema_50 and (cur_price > ema_200 if has_ema200 else True)) or (ema_50 > ema_200 if has_ema200 else True)
        trend_regime_ok = (macro_uptrend and st_bullish) or (cur_price > ema_50 and cur_price > ema_fast and st_bullish)

        # 4. No-Trade Zone & Volatility Guards
        atr_pct = (atr_val / cur_price) * 100.0 if cur_price > 0 else 0.0
        low_volatility = atr_pct < 0.8
        sideways_market = (abs(ema_fast - ema_slow) / cur_price * 100.0) < 0.4 if cur_price > 0 else False
        low_volume_market = cur_vol < (vol_avg * 0.5)
        no_trade_zone = low_volatility or sideways_market or low_volume_market

        # 5. Pullback & Breakout Setup Detection
        prev_low = float(lows[-2]) if n >= 2 else cur_low
        prev_close = float(closes[-2]) if n >= 2 else cur_price
        prev_open = float(opens[-2]) if n >= 2 else cur_open
        prev_high = float(highs[-2]) if n >= 2 else cur_high

        # Bullish candle patterns
        body = abs(cur_price - cur_open)
        lower_wick = min(cur_open, cur_price) - cur_low
        upper_wick = cur_high - max(cur_open, cur_price)
        bullish_pinbar = (cur_price > cur_open and lower_wick > body * 1.3 and upper_wick < body * 1.2)
        bullish_engulfing = (cur_price > cur_open and prev_close < prev_open and cur_price > prev_open)
        bullish_reversal = bullish_pinbar or bullish_engulfing or (cur_price > cur_open and cur_price > prev_high)

        # Pullback Conditions (Bounce off EMA9 or EMA21)
        lowest_3 = float(np.min(lows[-3:])) if n >= 3 else cur_low
        pullback_touch_ema = (lowest_3 <= ema_fast * 1.01 or lowest_3 <= ema_slow * 1.01)
        pullback_bounce = cur_price > ema_fast and cur_price > cur_open
        pullback_rsi_ok = (45.0 <= rsi_val <= 72.0)
        pullback_vol_ok = cur_vol >= (vol_avg * config["vol_mult"])

        pullback_buy = bool(
            trend_regime_ok and
            pullback_touch_ema and
            pullback_bounce and
            pullback_rsi_ok and
            pullback_vol_ok and
            bullish_reversal
        )

        # Momentum / Breakout Conditions (Breakout above recent 10-bar high with Volume Surge)
        recent_high_10 = float(np.max(highs[-min(10, n):-1])) if n >= 10 else cur_high
        is_breakout = cur_price >= recent_high_10 * 0.995 and cur_price > cur_open
        breakout_vol_ok = cur_vol >= (vol_avg * config["breakout_vol_mult"])
        momentum_rsi_ok = (52.0 <= rsi_val <= config["rsi_max"])
        macd_momentum_up = (macd_line > macd_sig) or (macd_hist > macd_hist_prev and macd_hist > 0)

        momentum_buy = bool(
            trend_regime_ok and
            is_breakout and
            breakout_vol_ok and
            momentum_rsi_ok and
            macd_momentum_up
        )

        # Super Sensitive Entry
        super_sensitive_buy = bool(
            signal_mode == "Super Sensitive" and
            trend_regime_ok and
            (pullback_buy or momentum_buy or smc_res.get("breakout_up", False))
        )

        # 6. Composite Score Engine (0 - 100%)
        score = 0.0
        if trend_regime_ok: score += 20.0
        if cur_price > ema_50: score += 10.0
        if cur_price > ema_fast: score += 10.0
        if ema_fast > ema_slow: score += 10.0
        if st_bullish: score += 10.0
        if 48.0 <= rsi_val <= 72.0: score += 10.0
        if macd_line > macd_sig: score += 10.0
        if breakout_vol_ok: score += 10.0
        elif pullback_vol_ok: score += 5.0
        if smc_res.get("smart_money_buy", False): score += 10.0
        if smc_res.get("bos_bull", False): score += 10.0

        # Severe penalty if trading against macro downtrend
        if not trend_regime_ok:
            score = min(score * 0.4, 45.0)

        score = min(max(score, 0.0), 100.0)

        # Rating Category
        if score >= 80:
            rating = "A+ Strong Buy"
        elif score >= 65:
            rating = "A Buy"
        elif score >= 50:
            rating = "B Watch"
        elif score >= 35:
            rating = "C Weak"
        else:
            rating = "D Avoid"

        trend_strength_num = (abs(ema_fast - ema_slow) / cur_price * 100.0) if cur_price > 0 else 0.0
        trend_strength = "Strong" if trend_strength_num > 2.5 else ("Medium" if trend_strength_num > 1.2 else "Weak")

        # 7. Adaptive Stop Loss & Risk Management (Anchored to Swing Low + ATR)
        recent_low_5 = float(np.min(lows[-min(5, n):])) if n >= 5 else cur_low
        raw_sl = min(cur_price - (1.5 * atr_val), recent_low_5 - (0.2 * atr_val))

        # Enforce protective risk bounds: minimum 3% breathing buffer, maximum 8% risk floor
        stop_loss = max(raw_sl, cur_price * 0.92)
        stop_loss = min(stop_loss, cur_price * 0.97)
        stop_loss = round(stop_loss, 2)

        price_risk = max(cur_price - stop_loss, cur_price * 0.03)

        # Multi-Target Profit Levels (TP1 = 1.5R, TP2 = 2.5R)
        tp1 = round(cur_price + (price_risk * 1.5), 2)
        tp2 = round(cur_price + (price_risk * 2.5), 2)

        tp1_pct = round(((tp1 - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0
        tp2_pct = round(((tp2 - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0

        tp1_distance = abs(tp1 - cur_price)
        daily_movement_pace = max(atr_val * 0.85, cur_price * 0.01)
        estimated_tp_days = max(1, int(round(tp1_distance / daily_movement_pace))) if daily_movement_pace > 0 else 2
        if estimated_tp_days == 1:
            estimated_tp_range = "1-2 Hari"
        elif estimated_tp_days <= 3:
            estimated_tp_range = f"{estimated_tp_days}-{estimated_tp_days + 2} Hari"
        else:
            estimated_tp_range = f"{estimated_tp_days}-{estimated_tp_days + 3} Hari"

        trailing_sl = round(cur_price * 0.965, 2)
        rr_ratio = round((tp2 - cur_price) / max(price_risk, 1.0), 2)

        # 8. Indonesian Stock Exchange (IDX) Position Sizing
        risk_cash = account_size_idr * (risk_per_trade_pct / 100.0)
        risk_per_share = price_risk if price_risk > 0 else (cur_price * 0.05)
        raw_shares = math.floor(risk_cash / risk_per_share) if risk_per_share > 0 else 0
        recommended_lots = math.floor(raw_shares / 100) # 1 lot = 100 shares on IDX
        recommended_shares = recommended_lots * 100
        estimated_capital = recommended_shares * cur_price
        max_risk_amount = recommended_shares * risk_per_share

        # 9. Direction Prediction (Linear Regression Slope)
        pred_bars = 12
        pred_len = min(20, n)
        if pred_len >= 5:
            x = np.arange(pred_len)
            y = closes[-pred_len:]
            slope, intercept = np.polyfit(x, y, 1)
            raw_prediction_price = cur_price + (slope * pred_bars)
            target_up = max(cur_price, float(np.max(highs[-min(50, n):])))

            direction_score = 0.0
            direction_score += 20.0 if trend_regime_ok else -20.0
            direction_score += 15.0 if st_bullish else -15.0
            direction_score += 15.0 if macd_line > macd_sig else -15.0
            direction_score += 10.0 if rsi_val > 52.0 else (-10.0 if rsi_val < 45.0 else 0.0)
            direction_score += 10.0 if breakout_vol_ok else (5.0 if pullback_vol_ok else -5.0)

            if direction_score > 20.0:
                direction = "UP"
                predicted_price = round(max(cur_price, min(raw_prediction_price, target_up)), 2)
            elif direction_score < -20.0:
                direction = "DOWN"
                predicted_price = round(min(cur_price, raw_prediction_price), 2)
            else:
                direction = "SIDEWAYS"
                predicted_price = round(cur_price, 2)

            upside_pct = round(((predicted_price - cur_price) / cur_price * 100.0), 2) if cur_price > 0 else 0.0
        else:
            direction = "SIDEWAYS"
            predicted_price = cur_price
            upside_pct = 0.0
            direction_score = 0.0

        # 10. Action Badge Determination
        if not trend_regime_ok or no_trade_zone:
            action = "WAIT"
        elif score >= 80.0 and (momentum_buy or pullback_buy):
            action = "ULTRA BUY"
        elif score >= 65.0 and (momentum_buy or pullback_buy):
            action = "STRONG BUY"
        elif pullback_buy:
            action = "PULLBACK BUY"
        elif momentum_buy:
            action = "STRONG BUY"
        elif score >= 50.0:
            action = "WATCH BUY"
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
                "bullish_fvg_active": smc_res.get("bullish_fvg", False),
                "bearish_fvg_active": smc_res.get("bearish_fvg", False),
                "bullish_ob_active": smc_res.get("bullish_ob", False),
                "bearish_ob_active": smc_res.get("bearish_ob", False),
                "smart_money_buy": smc_res.get("smart_money_buy", False),
                "smart_money_sell": smc_res.get("smart_money_sell", False),
                "bos_bull": smc_res.get("bos_bull", False),
                "bos_bear": smc_res.get("bos_bear", False),
                "choch_bull": smc_res.get("choch_bull", False),
                "choch_bear": smc_res.get("choch_bear", False),
                "liquidity_sweep_low": smc_res.get("liquidity_sweep_low", False),
                "liquidity_sweep_high": smc_res.get("liquidity_sweep_high", False),
                "breakout_up": smc_res.get("breakout_up", False),
                "breakout_down": smc_res.get("breakout_down", False),
                "pump_candle": smc_res.get("pump_candle", False),
                "dump_candle": smc_res.get("dump_candle", False),
                "market_phase": smc_res.get("market_phase", "Markup"),
                "active_bull_fvgs": smc_res.get("active_bull_fvgs", []),
                "active_bull_obs": smc_res.get("active_bull_obs", [])
            },
            "supertrend": {
                "st_value": st_res.get("st_value", 0.0),
                "st_trend": st_res.get("st_trend", "Neutral"),
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
                "ema_50": round(ema_50, 2),
                "ema_200": round(ema_200, 2),
                "rsi": round(rsi_val, 2),
                "macd_line": round(macd_line, 2),
                "macd_signal": round(macd_sig, 2),
                "macd_hist": round(macd_hist, 2),
                "atr": round(atr_val, 2)
            }
        }

    def _empty_result(self, signal_mode: str, entry_mode: str) -> Dict[str, Any]:
        return {
            "action": "WAIT",
            "signal_mode": signal_mode,
            "entry_mode": entry_mode,
            "score": 0,
            "score_max": 100,
            "rating": "D Avoid",
            "trend_strength": "Weak",
            "is_no_trade_zone": True,
            "smc": {},
            "supertrend": {"st_value": 0.0, "st_trend": "Neutral", "st_color": "gray"},
            "trade_setup": {
                "entry_price": 0.0,
                "stop_loss": 0.0,
                "tp1": 0.0,
                "tp2": 0.0,
                "trailing_stop": 0.0,
                "risk_reward_ratio": 2.0,
                "risk_per_share": 0.0,
                "risk_percent": 0.0,
                "tp1_percent": 0.0,
                "tp2_percent": 0.0,
                "estimated_tp_days": 2,
                "estimated_tp_range": "2-4 Hari",
                "account_size_idr": 10000000.0,
                "risk_per_trade_pct": 2.0,
                "recommended_lots": 0,
                "recommended_shares": 0,
                "estimated_capital_required": 0.0,
                "max_risk_amount": 0.0
            },
            "direction_prediction": {
                "direction": "SIDEWAYS",
                "predicted_price": 0.0,
                "upside_pct": 0.0,
                "confidence_score": 0,
                "target_bars": 12
            },
            "indicators": {
                "ema_fast": 0.0,
                "ema_slow": 0.0,
                "ema_50": 0.0,
                "ema_200": 0.0,
                "rsi": 50.0,
                "macd_line": 0.0,
                "macd_signal": 0.0,
                "macd_hist": 0.0,
                "atr": 0.0
            }
        }
