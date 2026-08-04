import pandas as pd
import numpy as np
try:
    import talib
except ImportError:
    import utils.ta_fallback as talib
from typing import List, Dict, Any
from datetime import datetime, timedelta
from models.response import StrategyDetail, HistoricalTradeLog, BacktestSummary
from services.trade_simulator import TradeSimulator
from services.pattern_engine import PatternEngine
from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")

class HistoricalBacktester:
    def __init__(self):
        self.simulator = TradeSimulator()

    def run_backtest(self, daily_df: pd.DataFrame, m15_df: pd.DataFrame) -> List[BacktestSummary]:
        if daily_df is None or daily_df.empty or m15_df is None or m15_df.empty:
            return []
            
        # Ensure timezone
        if m15_df.index.tz is None:
            m15_df.index = m15_df.index.tz_localize('UTC').tz_convert(WIB)
            
        # 1. Get unique dates in m15_df (sorted)
        m15_dates = sorted(list(set(m15_df.index.strftime("%Y-%m-%d"))))
        
        # 2. Calculate historical ATR, SMA20, and RSI on daily_df
        high = daily_df['High'].values
        low = daily_df['Low'].values
        close = daily_df['Close'].values
        
        atr_array = talib.ATR(high, low, close, timeperiod=14)
        sma20_array = talib.SMA(close, timeperiod=20)
        sma50_array = talib.SMA(close, timeperiod=50)
        rsi_array = talib.RSI(close, timeperiod=14)
        macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
        
        daily_df_copy = daily_df.copy()
        daily_df_copy['ATR'] = atr_array
        daily_df_copy['SMA20'] = sma20_array
        daily_df_copy['SMA50'] = sma50_array
        daily_df_copy['RSI'] = rsi_array
        daily_df_copy['MACD_HIST'] = macdhist
        
        # We will track results for Intraday and Scalping
        intraday_logs = []
        scalping_logs = []
        
        # 3. Loop through available intraday dates (max ~40 days)
        # We skip the very first date if it doesn't have a previous day in daily_df for ATR
        for target_date_str in m15_dates:
            target_ts = pd.Timestamp(target_date_str)
            
            # Find the previous day's data in daily_df
            # If target date exists in daily_df, prev day is the one before it
            past_data = daily_df_copy[daily_df_copy.index < target_ts]
            if past_data.empty:
                continue
                
            prev_row = past_data.iloc[-1]
            prev_atr = prev_row['ATR']
            prev_rsi = prev_row['RSI']
            
            if pd.isna(prev_atr) or pd.isna(prev_rsi):
                continue
                
            # Current day open price (we can get from m15_df first bar of the day)
            day_data = m15_df[m15_df.index.strftime("%Y-%m-%d") == target_date_str]
            if day_data.empty:
                continue
                
            day_open = float(day_data['Open'].iloc[0])
            sma20_prev = prev_row['SMA20'] if not pd.isna(prev_row['SMA20']) else day_open
            sma50_prev = prev_row['SMA50'] if not pd.isna(prev_row['SMA50']) else day_open
            macd_hist_prev = prev_row['MACD_HIST'] if not pd.isna(prev_row['MACD_HIST']) else 0
            
            # Strict Strategy Filter
            # 1. Momentum & daily trend check
            is_indicator_bullish = (day_open > sma50_prev) and (prev_rsi > 45) and (macd_hist_prev > -0.05)
            
            # 2. Daily Chart Pattern check
            pe = PatternEngine()
            patterns = pe.detect_patterns(past_data)
            has_bullish_chart_pattern = False
            if patterns:
                pattern = patterns[0]
                if pattern['pattern_id'] == 'double-bottom':
                    has_bullish_chart_pattern = True
            
            # 3. Daily Candlestick Pattern check
            candles = pe.detect_candlestick_patterns(past_data)
            has_bullish_candle = "Hammer" in candles or "Bullish Engulfing" in candles
            
            # 4. Daily Volume check
            prev_vol = float(prev_row['Volume']) if 'Volume' in prev_row else 0
            vol_history = past_data['Volume'].tail(20)
            avg_vol_20 = vol_history.mean() if len(vol_history) > 0 else 1
            vol_ratio = prev_vol / avg_vol_20 if avg_vol_20 > 0 else 0
            has_volume_confirmation = (vol_ratio >= 1.2)
            
            # Strictly combine them:
            # - Trend must be generally bullish
            # - Must have chart pattern, candlestick pattern, or bullish close
            # - Breakout day volume must be elevated (ratio >= 1.2x MA20)
            is_strict_setup = is_indicator_bullish and (has_bullish_chart_pattern or has_bullish_candle or "Bullish Close" in candles) and has_volume_confirmation
            
            if not is_strict_setup:
                # NO_TRADE / SKIP
                continue
                
            sig_type = "buy on breakout"
            
            # Build setup context reasons
            reasons = []
            if has_bullish_chart_pattern:
                reasons.append("Pattern: Double Bottom")
            if has_bullish_candle:
                reasons.append(f"Candles: {', '.join([c for c in candles if c in ['Hammer', 'Bullish Engulfing']])}")
            elif "Bullish Close" in candles:
                reasons.append("Candle: Bullish Close")
            reasons.append(f"Vol Ratio: {vol_ratio:.1f}x")
            setup_context = " | ".join(reasons)
            
            # Reconstruct StrategyDetail for Scalping
            scalp_sl = day_open - (prev_atr * 0.3)
            scalp_tp1 = day_open + (prev_atr * 0.4)
            scalp_tp2 = day_open + (prev_atr * 0.6)
            scalp_t_price = day_open * 1.002
            
            scalp_strat = StrategyDetail(
                timeframe="Scalping",
                grade="A" if has_bullish_chart_pattern else "B",
                signal_type="buy on breakout",
                description=f"Strict: {setup_context}",
                entry_low=day_open - (prev_atr * 0.2),
                entry_high=day_open,
                stop_loss=scalp_sl,
                risk_pct=0,
                target_1=scalp_tp1,
                target_2=scalp_tp2,
                risk_reward=0,
                trigger_price=scalp_t_price,
                trigger_condition="",
                context=setup_context
            )
            
            # Reconstruct StrategyDetail for Intraday
            intraday_sl = day_open - (prev_atr * 0.6)
            intraday_tp1 = day_open + (prev_atr * 0.8)
            intraday_tp2 = day_open + (prev_atr * 1.2)
            intraday_t_price = day_open * 1.005
            
            intraday_strat = StrategyDetail(
                timeframe="Intraday",
                grade="A" if has_bullish_chart_pattern else "B",
                signal_type="buy on breakout",
                description=f"Strict: {setup_context}",
                entry_low=day_open - (prev_atr * 0.5),
                entry_high=day_open,
                stop_loss=intraday_sl,
                risk_pct=0,
                target_1=intraday_tp1,
                target_2=intraday_tp2,
                risk_reward=0,
                trigger_price=intraday_t_price,
                trigger_condition="",
                context=setup_context
            )
            
            # Backtest!
            # Convert target_date_str (YYYY-MM-DD) to format required by simulate (DD/MM/YY)
            dt = datetime.strptime(target_date_str, "%Y-%m-%d")
            sim_date_str = dt.strftime("%d/%m/%y")
            
            s_res = self.simulator.simulate(scalp_strat, m15_df, sim_date_str)
            if s_res and s_res.status != "waiting_entry":
                scalping_logs.append(HistoricalTradeLog(
                    date=dt.strftime("%d %b %Y"),
                    signal_type=f"Buy ({setup_context})",
                    trigger_price=scalp_t_price,
                    entry_price=s_res.entry_hit_price,
                    exit_price=s_res.exit_price,
                    status=s_res.status,
                    pnl_pct=s_res.pnl_pct
                ))
                
            i_res = self.simulator.simulate(intraday_strat, m15_df, sim_date_str)
            if i_res and i_res.status != "waiting_entry":
                intraday_logs.append(HistoricalTradeLog(
                    date=dt.strftime("%d %b %Y"),
                    signal_type=f"Buy ({setup_context})",
                    trigger_price=intraday_t_price,
                    entry_price=i_res.entry_hit_price,
                    exit_price=i_res.exit_price,
                    status=i_res.status,
                    pnl_pct=i_res.pnl_pct
                ))
                
        # 4. Summarize
        def build_summary(tf: str, logs: List[HistoricalTradeLog]) -> BacktestSummary:
            total = len(logs)
            win = sum(1 for x in logs if x.status in ["hit_tp1", "hit_tp2"])
            loss = sum(1 for x in logs if x.status == "hit_sl")
            exp = sum(1 for x in logs if x.status == "expired")
            
            wr = (win / total * 100) if total > 0 else 0.0
            pnl = sum(x.pnl_pct for x in logs)
            
            # Sort logs newest first
            logs.reverse()
            
            return BacktestSummary(
                timeframe=tf,
                total_trades=total,
                win_count=win,
                loss_count=loss,
                expired_count=exp,
                win_rate_pct=wr,
                total_pnl_pct=pnl,
                trade_logs=logs
            )
            
        summaries = []
        if scalping_logs:
            summaries.append(build_summary("Scalping", scalping_logs))
        if intraday_logs:
            summaries.append(build_summary("Intraday", intraday_logs))
            
        return summaries
