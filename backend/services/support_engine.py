"""
Support & Resistance Detection Engine
======================================
Implements the PROMPT.md specification:
- Swing Low/High detection (window ±5 candles)
- Dynamic level mapping (EMA50, EMA200, Bollinger Lower/Upper Band)
- Momentum validation (RSI extremes, MACD crossovers)
- Clustering into zones (1.5% margin)
- Confluence scoring (1-5 points)
"""

try:
    import talib
except ImportError:
    import utils.ta_fallback as talib
import numpy as np
import pandas as pd
from typing import List, Dict, Any


def find_best_support(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Detect, cluster, and score the best Support Areas.
    
    STEP 1: Swing Lows (window 5L + 5R) + Bullish candlestick patterns
    STEP 2: Dynamic Support (EMA50, EMA200, Bollinger Lowerband)
    STEP 3: Momentum validation (RSI, MACD crossover)
    STEP 4: Clustering into Support Zones (1.5% margin)
    STEP 5: Scoring (1-5 confluence points)
    
    Returns a list of dicts with keys:
      date_index, zone_bottom, zone_top, score, details
    """
    if df is None or df.empty or len(df) < 50:
        return []

    df = df.copy()

    # Ensure float arrays for talib
    open_arr = df['Open'].values.astype(float)
    high_arr = df['High'].values.astype(float)
    low_arr = df['Low'].values.astype(float)
    close_arr = df['Close'].values.astype(float)

    # ── STEP 1: Identify Historical Swing Lows & Price Action ──────────
    # Swing Low: low[i] is the lowest within a window of 5 left + 5 right (total 11)
    rolling_min = df['Low'].rolling(window=11, center=True).min()
    df['is_swing_low'] = df['Low'] == rolling_min

    # Bullish candlestick patterns
    df['hammer'] = talib.CDLHAMMER(open_arr, high_arr, low_arr, close_arr)
    df['engulfing'] = talib.CDLENGULFING(open_arr, high_arr, low_arr, close_arr)
    # Filter for bullish only (result > 0)
    df['bullish_pattern'] = ((df['hammer'] > 0) | (df['engulfing'] > 0))

    # ── STEP 2: Map Dynamic Support ────────────────────────────────────
    df['EMA_50'] = talib.EMA(close_arr, timeperiod=50)
    df['EMA_200'] = talib.EMA(close_arr, timeperiod=200)
    _upper, _middle, lower = talib.BBANDS(close_arr, timeperiod=20, nbdevup=2, nbdevdn=2)
    df['lowerband'] = lower

    # ── STEP 3: Momentum & Extremes Validation ────────────────────────
    df['RSI'] = talib.RSI(close_arr, timeperiod=14)
    macd_line, macd_signal, _macd_hist = talib.MACD(
        close_arr, fastperiod=12, slowperiod=26, signalperiod=9
    )
    df['macd'] = macd_line
    df['macd_signal'] = macd_signal
    # Bullish crossover: MACD crosses above Signal line
    macd_s = pd.Series(macd_line, index=df.index)
    signal_s = pd.Series(macd_signal, index=df.index)
    df['macd_cross'] = (
        (macd_s > signal_s) & (macd_s.shift(1) <= signal_s.shift(1))
    )

    # ── STEP 4: Clustering into Support Zones (1.5% margin) ───────────
    swing_lows = df[df['is_swing_low']].copy()

    zones: List[Dict[str, Any]] = []
    for idx in swing_lows.index:
        row = df.loc[idx]
        price = float(row['Low'])
        margin = price * 0.015  # 1.5%

        zone_points = [price]

        # Check if EMA_50 is within 1.5% margin of the Swing Low price
        ema50_val = row.get('EMA_50', np.nan)
        if not pd.isna(ema50_val) and abs(float(ema50_val) - price) <= margin:
            zone_points.append(float(ema50_val))

        # Check EMA_200
        ema200_val = row.get('EMA_200', np.nan)
        if not pd.isna(ema200_val) and abs(float(ema200_val) - price) <= margin:
            zone_points.append(float(ema200_val))

        # Check Bollinger Lowerband
        lb_val = row.get('lowerband', np.nan)
        if not pd.isna(lb_val) and abs(float(lb_val) - price) <= margin:
            zone_points.append(float(lb_val))

        zones.append({
            'date_index': idx,
            'price': price,
            'zone_bottom': min(zone_points),
            'zone_top': max(zone_points),
        })

    # ── STEP 5: Scoring System (1 to 5 Points) ────────────────────────
    results: List[Dict[str, Any]] = []
    for z in zones:
        score = 0
        details: List[str] = []
        idx = z['date_index']
        i = df.index.get_loc(idx)
        row = df.iloc[i]

        # +1: Bullish candlestick pattern at or within 1 candle of the Swing Low
        nearby_start = max(0, i - 1)
        nearby_end = min(len(df), i + 2)
        if any(bool(df.iloc[j]['bullish_pattern']) for j in range(nearby_start, nearby_end)):
            score += 1
            details.append("Bullish Pattern (Hammer/Engulfing)")

        # +1: Low touches or drops below Bollinger Lowerband
        lb = row.get('lowerband', np.nan)
        if not pd.isna(lb) and float(row['Low']) <= float(lb):
            score += 1
            details.append("Touches Bollinger Lower Band")

        # +1: Low is within 1% margin of EMA_50 or EMA_200
        ema_margin = float(row['Low']) * 0.01
        ema50 = row.get('EMA_50', np.nan)
        ema200 = row.get('EMA_200', np.nan)
        near_ema = False
        if not pd.isna(ema50) and abs(float(row['Low']) - float(ema50)) <= ema_margin:
            near_ema = True
        if not pd.isna(ema200) and abs(float(row['Low']) - float(ema200)) <= ema_margin:
            near_ema = True
        if near_ema:
            score += 1
            details.append("Near EMA50/EMA200 (within 1%)")

        # +1: RSI < 30 (Oversold)
        rsi_val = row.get('RSI', np.nan)
        if not pd.isna(rsi_val) and float(rsi_val) < 30:
            score += 1
            details.append("RSI Oversold (<30)")

        # +1: MACD bullish crossover within the last 3 candles
        cross_start = max(0, i - 2)
        if any(bool(df.iloc[j].get('macd_cross', False)) for j in range(cross_start, i + 1)):
            score += 1
            details.append("MACD Bullish Crossover (3-bar)")

        results.append({
            'date_index': str(idx),
            'zone_bottom': round(z['zone_bottom'], 2),
            'zone_top': round(z['zone_top'], 2),
            'score': score,
            'details': ' | '.join(details) if details else 'No confluence detected',
        })

    return results


def find_best_resistance(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Detect, cluster, and score the best Resistance Areas.
    
    Mirror logic of find_best_support but for Swing Highs:
    STEP 1: Swing Highs (window 5L + 5R) + Bearish candlestick patterns
    STEP 2: Dynamic Resistance (EMA50, EMA200, Bollinger Upperband)
    STEP 3: Momentum validation (RSI overbought, MACD bearish crossover)
    STEP 4: Clustering into Resistance Zones (1.5% margin)
    STEP 5: Scoring (1-5 confluence points)
    """
    if df is None or df.empty or len(df) < 50:
        return []

    df = df.copy()

    open_arr = df['Open'].values.astype(float)
    high_arr = df['High'].values.astype(float)
    low_arr = df['Low'].values.astype(float)
    close_arr = df['Close'].values.astype(float)

    # ── STEP 1: Identify Historical Swing Highs & Price Action ─────────
    # Swing High: high[i] is the highest within a window of 5 left + 5 right
    rolling_max = df['High'].rolling(window=11, center=True).max()
    df['is_swing_high'] = df['High'] == rolling_max

    # Bearish candlestick patterns
    df['shooting_star'] = talib.CDLSHOOTINGSTAR(open_arr, high_arr, low_arr, close_arr)
    df['engulfing'] = talib.CDLENGULFING(open_arr, high_arr, low_arr, close_arr)
    # Filter for bearish only (result < 0 for bearish engulfing)
    df['bearish_pattern'] = ((df['shooting_star'] != 0) | (df['engulfing'] < 0))

    # ── STEP 2: Map Dynamic Resistance ─────────────────────────────────
    df['EMA_50'] = talib.EMA(close_arr, timeperiod=50)
    df['EMA_200'] = talib.EMA(close_arr, timeperiod=200)
    upper, _middle, _lower = talib.BBANDS(close_arr, timeperiod=20, nbdevup=2, nbdevdn=2)
    df['upperband'] = upper

    # ── STEP 3: Momentum & Extremes Validation ────────────────────────
    df['RSI'] = talib.RSI(close_arr, timeperiod=14)
    macd_line, macd_signal, _macd_hist = talib.MACD(
        close_arr, fastperiod=12, slowperiod=26, signalperiod=9
    )
    df['macd'] = macd_line
    df['macd_signal'] = macd_signal
    # Bearish crossover: MACD crosses below Signal line
    macd_s = pd.Series(macd_line, index=df.index)
    signal_s = pd.Series(macd_signal, index=df.index)
    df['macd_cross_bear'] = (
        (macd_s < signal_s) & (macd_s.shift(1) >= signal_s.shift(1))
    )

    # ── STEP 4: Clustering into Resistance Zones (1.5% margin) ────────
    swing_highs = df[df['is_swing_high']].copy()

    zones: List[Dict[str, Any]] = []
    for idx in swing_highs.index:
        row = df.loc[idx]
        price = float(row['High'])
        margin = price * 0.015

        zone_points = [price]

        ema50_val = row.get('EMA_50', np.nan)
        if not pd.isna(ema50_val) and abs(float(ema50_val) - price) <= margin:
            zone_points.append(float(ema50_val))

        ema200_val = row.get('EMA_200', np.nan)
        if not pd.isna(ema200_val) and abs(float(ema200_val) - price) <= margin:
            zone_points.append(float(ema200_val))

        ub_val = row.get('upperband', np.nan)
        if not pd.isna(ub_val) and abs(float(ub_val) - price) <= margin:
            zone_points.append(float(ub_val))

        zones.append({
            'date_index': idx,
            'price': price,
            'zone_bottom': min(zone_points),
            'zone_top': max(zone_points),
        })

    # ── STEP 5: Scoring System (1 to 5 Points) ────────────────────────
    results: List[Dict[str, Any]] = []
    for z in zones:
        score = 0
        details: List[str] = []
        idx = z['date_index']
        i = df.index.get_loc(idx)
        row = df.iloc[i]

        # +1: Bearish candlestick pattern at or within 1 candle of the Swing High
        nearby_start = max(0, i - 1)
        nearby_end = min(len(df), i + 2)
        if any(bool(df.iloc[j]['bearish_pattern']) for j in range(nearby_start, nearby_end)):
            score += 1
            details.append("Bearish Pattern (Shooting Star/Engulfing)")

        # +1: High touches or exceeds Bollinger Upperband
        ub = row.get('upperband', np.nan)
        if not pd.isna(ub) and float(row['High']) >= float(ub):
            score += 1
            details.append("Touches Bollinger Upper Band")

        # +1: High is within 1% margin of EMA_50 or EMA_200
        ema_margin = float(row['High']) * 0.01
        ema50 = row.get('EMA_50', np.nan)
        ema200 = row.get('EMA_200', np.nan)
        near_ema = False
        if not pd.isna(ema50) and abs(float(row['High']) - float(ema50)) <= ema_margin:
            near_ema = True
        if not pd.isna(ema200) and abs(float(row['High']) - float(ema200)) <= ema_margin:
            near_ema = True
        if near_ema:
            score += 1
            details.append("Near EMA50/EMA200 (within 1%)")

        # +1: RSI > 70 (Overbought)
        rsi_val = row.get('RSI', np.nan)
        if not pd.isna(rsi_val) and float(rsi_val) > 70:
            score += 1
            details.append("RSI Overbought (>70)")

        # +1: MACD bearish crossover within the last 3 candles
        cross_start = max(0, i - 2)
        if any(bool(df.iloc[j].get('macd_cross_bear', False)) for j in range(cross_start, i + 1)):
            score += 1
            details.append("MACD Bearish Crossover (3-bar)")

        results.append({
            'date_index': str(idx),
            'zone_bottom': round(z['zone_bottom'], 2),
            'zone_top': round(z['zone_top'], 2),
            'score': score,
            'details': ' | '.join(details) if details else 'No confluence detected',
        })

    return results
