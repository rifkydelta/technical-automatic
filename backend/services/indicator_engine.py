import talib
import numpy as np
import pandas as pd
from typing import Dict, Any
from models.response import IndicatorSet

class IndicatorEngine:
    def __init__(self):
        pass

    def calculate_all(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate all 12 indicators required by the PRD.
        Expects a DataFrame with 'Open', 'High', 'Low', 'Close', 'Volume'.
        """
        if df is None or df.empty or len(df) < 20:
            # We need at least 20 bars for EMA20 & basic indicators
            return {}
            
        close = df['Close'].astype(float).values
        high = df['High'].astype(float).values
        low = df['Low'].astype(float).values
        volume = df['Volume'].astype(float).values

        # 1. EMAs
        ema20 = talib.EMA(close, timeperiod=20)
        ema50 = talib.EMA(close, timeperiod=50)
        ema200 = talib.EMA(close, timeperiod=200)

        # 2. RSI
        rsi = talib.RSI(close, timeperiod=14)

        # 3. MACD
        macd, macd_signal, macd_hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)

        # 4. Stochastic RSI
        # talib.STOCHRSI can be tricky with NaN, we can compute it using RSI
        try:
            fastk, fastd = talib.STOCHRSI(close, timeperiod=14, fastk_period=14, fastd_period=3, fastd_matype=0)
            stoch_rsi = fastk
        except Exception:
            stoch_rsi = np.full_like(close, np.nan)

        # 5. ATR
        atr = talib.ATR(high, low, close, timeperiod=14)

        # 6. ADX
        adx = talib.ADX(high, low, close, timeperiod=14)

        # 7. Bollinger Bands
        upper, middle, lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)

        # 8. Average Volume
        avg_volume = talib.SMA(volume, timeperiod=20)

        # 9. VWAP (Custom Calculation)
        vwap = self._calculate_vwap(df)

        # Return the latest value for each indicator
        # Note: talib returns numpy arrays with NaN at the beginning
        
        def get_latest(arr):
            # find last valid non-nan index
            valid_idx = np.where(~np.isnan(arr))[0]
            if len(valid_idx) > 0:
                return float(arr[valid_idx[-1]])
            return None

        return IndicatorSet(
            ema20=get_latest(ema20),
            ema50=get_latest(ema50),
            ema200=get_latest(ema200),
            rsi=get_latest(rsi),
            macd=get_latest(macd),
            macd_signal=get_latest(macd_signal),
            macd_hist=get_latest(macd_hist),
            stoch_rsi=get_latest(stoch_rsi),
            atr=get_latest(atr),
            adx=get_latest(adx),
            vwap=vwap.iloc[-1] if not vwap.empty and not pd.isna(vwap.iloc[-1]) else None,
            avg_volume=get_latest(avg_volume),
            bb_upper=get_latest(upper),
            bb_middle=get_latest(middle),
            bb_lower=get_latest(lower)
        ).model_dump()
        
    def _calculate_vwap(self, df: pd.DataFrame) -> pd.Series:
        """
        VWAP = Cumulative(Typical Price * Volume) / Cumulative(Volume)
        Typical Price = (High + Low + Close) / 3
        """
        # Usually VWAP is anchored to a session (e.g. daily for intraday charts).
        # For a simple daily chart, a rolling VWAP or anchored VWAP might be needed.
        # Let's use a rolling VWAP (e.g., 20 days) as an approximation if daily, 
        # or cumulative if intraday. Here we'll do cumulative over the dataset 
        # but realistically you anchor it. We'll do a simple cumulative for now.
        typical_price = (df['High'] + df['Low'] + df['Close']) / 3
        tp_vol = typical_price * df['Volume']
        
        # If the dataframe has a datetime index, we might anchor it.
        # Since it's a general function, let's just do cumulative.
        cum_tp_vol = tp_vol.cumsum()
        cum_vol = df['Volume'].cumsum()
        
        vwap = cum_tp_vol / cum_vol
        return vwap

    def calculate_extended(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate extended indicators for the Technical Detail tab.
        """
        if df is None or df.empty or len(df) < 200:
            return {}
            
        close = df['Close'].astype(float).values
        high = df['High'].astype(float).values
        low = df['Low'].astype(float).values
        volume = df['Volume'].astype(float).values

        # SMAs
        sma5 = talib.SMA(close, timeperiod=5)
        sma10 = talib.SMA(close, timeperiod=10)
        sma20 = talib.SMA(close, timeperiod=20)
        sma50 = talib.SMA(close, timeperiod=50)
        sma100 = talib.SMA(close, timeperiod=100)
        sma200 = talib.SMA(close, timeperiod=200)

        # Directional Indicators
        plus_di = talib.PLUS_DI(high, low, close, timeperiod=14)
        minus_di = talib.MINUS_DI(high, low, close, timeperiod=14)

        # Money Flow Index
        mfi = talib.MFI(high, low, close, volume, timeperiod=14)

        # Bollinger Band Width
        upper, middle, lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)

        def get_latest(arr):
            valid_idx = np.where(~np.isnan(arr))[0]
            if len(valid_idx) > 0:
                return float(arr[valid_idx[-1]])
            return None

        bb_upper = get_latest(upper)
        bb_middle = get_latest(middle)
        bb_lower = get_latest(lower)
        bb_width = None
        if bb_upper and bb_lower and bb_middle and bb_middle != 0:
            bb_width = (bb_upper - bb_lower) / bb_middle * 100

        return {
            "sma5": get_latest(sma5),
            "sma10": get_latest(sma10),
            "sma20": get_latest(sma20),
            "sma50": get_latest(sma50),
            "sma100": get_latest(sma100),
            "sma200": get_latest(sma200),
            "plus_di": get_latest(plus_di),
            "minus_di": get_latest(minus_di),
            "mfi": get_latest(mfi),
            "bb_upper": bb_upper,
            "bb_middle": bb_middle,
            "bb_lower": bb_lower,
            "bb_width": bb_width
        }
