"""
Pure Python/Pandas/Numpy Fallback for TA-Lib Functions.
Allows backend to run seamlessly on Termux Android or systems where TA-Lib C-library is missing.
"""
import numpy as np
import pandas as pd

def EMA(close: np.ndarray, timeperiod: int = 20) -> np.ndarray:
    s = pd.Series(close)
    res = s.ewm(span=timeperiod, adjust=False).mean().values
    res[:timeperiod - 1] = np.nan
    return res

def SMA(close: np.ndarray, timeperiod: int = 20) -> np.ndarray:
    s = pd.Series(close)
    res = s.rolling(window=timeperiod).mean().values
    return res

def RSI(close: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    s = pd.Series(close)
    delta = s.diff()
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    
    avg_gain = gain.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean()
    
    rs = avg_gain / (avg_loss + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return rsi.values

def MACD(close: np.ndarray, fastperiod: int = 12, slowperiod: int = 26, signalperiod: int = 9):
    s = pd.Series(close)
    fast_ema = s.ewm(span=fastperiod, adjust=False).mean()
    slow_ema = s.ewm(span=slowperiod, adjust=False).mean()
    macd = fast_ema - slow_ema
    macd_signal = macd.ewm(span=signalperiod, adjust=False).mean()
    macd_hist = macd - macd_signal
    return macd.values, macd_signal.values, macd_hist.values

def STOCHRSI(close: np.ndarray, timeperiod: int = 14, fastk_period: int = 14, fastd_period: int = 3, fastd_matype: int = 0):
    rsi = pd.Series(RSI(close, timeperiod=timeperiod))
    rsi_min = rsi.rolling(window=fastk_period).min()
    rsi_max = rsi.rolling(window=fastk_period).max()
    stoch_rsi = (rsi - rsi_min) / ((rsi_max - rsi_min) + 1e-10) * 100
    fastd = stoch_rsi.rolling(window=fastd_period).mean()
    return stoch_rsi.values, fastd.values

def ATR(high: np.ndarray, low: np.ndarray, close: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    h = pd.Series(high)
    l = pd.Series(low)
    c_prev = pd.Series(close).shift(1)
    
    tr1 = h - l
    tr2 = (h - c_prev).abs()
    tr3 = (l - c_prev).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    
    atr = tr.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean()
    return atr.values

def BBANDS(close: np.ndarray, timeperiod: int = 20, nbdevup: float = 2.0, nbdevdn: float = 2.0, matype: int = 0):
    s = pd.Series(close)
    middle = s.rolling(window=timeperiod).mean()
    std = s.rolling(window=timeperiod).std()
    upper = middle + (std * nbdevup)
    lower = middle - (std * nbdevdn)
    return upper.values, middle.values, lower.values

def PLUS_DM(high: np.ndarray, low: np.ndarray) -> pd.Series:
    h = pd.Series(high)
    l = pd.Series(low)
    up_move = h.diff()
    down_move = -l.diff()
    plus_dm = pd.Series(np.where((up_move > down_move) & (up_move > 0), up_move, 0.0))
    return plus_dm

def MINUS_DM(high: np.ndarray, low: np.ndarray) -> pd.Series:
    h = pd.Series(high)
    l = pd.Series(low)
    up_move = h.diff()
    down_move = -l.diff()
    minus_dm = pd.Series(np.where((down_move > up_move) & (down_move > 0), down_move, 0.0))
    return minus_dm

def PLUS_DI(high: np.ndarray, low: np.ndarray, close: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    atr_s = pd.Series(ATR(high, low, close, timeperiod=timeperiod))
    plus_dm = PLUS_DM(high, low)
    plus_di = 100 * (plus_dm.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean() / (atr_s + 1e-10))
    return plus_di.values

def MINUS_DI(high: np.ndarray, low: np.ndarray, close: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    atr_s = pd.Series(ATR(high, low, close, timeperiod=timeperiod))
    minus_dm = MINUS_DM(high, low)
    minus_di = 100 * (minus_dm.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean() / (atr_s + 1e-10))
    return minus_di.values

def ADX(high: np.ndarray, low: np.ndarray, close: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    p_di = pd.Series(PLUS_DI(high, low, close, timeperiod=timeperiod))
    m_di = pd.Series(MINUS_DI(high, low, close, timeperiod=timeperiod))
    dx = 100 * (p_di - m_di).abs() / ((p_di + m_di) + 1e-10)
    adx = dx.ewm(alpha=1/timeperiod, min_periods=timeperiod, adjust=False).mean()
    return adx.values

def MFI(high: np.ndarray, low: np.ndarray, close: np.ndarray, volume: np.ndarray, timeperiod: int = 14) -> np.ndarray:
    tp = (pd.Series(high) + pd.Series(low) + pd.Series(close)) / 3.0
    mf = tp * pd.Series(volume)
    pos_mf = pd.Series(np.where(tp.diff() > 0, mf, 0.0))
    neg_mf = pd.Series(np.where(tp.diff() < 0, mf, 0.0))
    
    pos_mf_sum = pos_mf.rolling(window=timeperiod).sum()
    neg_mf_sum = neg_mf.rolling(window=timeperiod).sum()
    
    mfr = pos_mf_sum / (neg_mf_sum + 1e-10)
    mfi = 100 - (100 / (1 + mfr))
    return mfi.values

# Candlestick Pattern Fallbacks
def CDLHAMMER(open_arr: np.ndarray, high_arr: np.ndarray, low_arr: np.ndarray, close_arr: np.ndarray) -> np.ndarray:
    o, h, l, c = pd.Series(open_arr), pd.Series(high_arr), pd.Series(low_arr), pd.Series(close_arr)
    body = (c - o).abs()
    upper_wick = h - np.maximum(o, c)
    lower_wick = np.minimum(o, c) - l
    
    is_hammer = (lower_wick >= 2 * body) & (upper_wick <= body * 0.5) & (body > 0)
    return np.where(is_hammer, 100, 0)

def CDLSHOOTINGSTAR(open_arr: np.ndarray, high_arr: np.ndarray, low_arr: np.ndarray, close_arr: np.ndarray) -> np.ndarray:
    o, h, l, c = pd.Series(open_arr), pd.Series(high_arr), pd.Series(low_arr), pd.Series(close_arr)
    body = (c - o).abs()
    upper_wick = h - np.maximum(o, c)
    lower_wick = np.minimum(o, c) - l
    
    is_star = (upper_wick >= 2 * body) & (lower_wick <= body * 0.5) & (body > 0)
    return np.where(is_star, -100, 0)

def CDLENGULFING(open_arr: np.ndarray, high_arr: np.ndarray, low_arr: np.ndarray, close_arr: np.ndarray) -> np.ndarray:
    o, h, l, c = pd.Series(open_arr), pd.Series(high_arr), pd.Series(low_arr), pd.Series(close_arr)
    prev_o, prev_c = o.shift(1), c.shift(1)
    
    bullish_engulf = (prev_c < prev_o) & (c > o) & (c >= prev_o) & (o <= prev_c)
    bearish_engulf = (prev_c > prev_o) & (c < o) & (c <= prev_o) & (o >= prev_c)
    
    res = np.zeros(len(open_arr), dtype=int)
    res[bullish_engulf] = 100
    res[bearish_engulf] = -100
    return res
