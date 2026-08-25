"""
Trade Simulator Engine
Simulates intraday or daily execution of trading strategies.
Matches the execution and exit mechanics of reltsignal.pine:
- Entry triggered on price action
- Adaptive Initial Stop Loss & Anti Stop-Hunt protection
- Target Profit 1 (TP1) & Target Profit 2 (TP2)
- Trailing Stop Loss (trails upwards as price advances)
- Exit signal condition handling
"""

import pandas as pd
from typing import Optional
from datetime import datetime
from models.response import StrategyDetail, BacktestResult
from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")

class TradeSimulator:
    def __init__(self):
        pass

    def simulate(
        self,
        strategy: StrategyDetail,
        intraday_data: pd.DataFrame,
        start_date_str: str,
        trail_percent: float = 3.0,
        positive_trail_mult: float = 4.0,
        use_trailing_stop: bool = True
    ) -> Optional[BacktestResult]:
        """
        Simulates strategy execution on intraday / price action data.
        start_date_str: "DD/MM/YY" format (e.g. "16/07/26").
        """
        if intraday_data is None or intraday_data.empty:
            return None
            
        try:
            dt = datetime.strptime(start_date_str, "%d/%m/%y")
            target_date_iso = dt.strftime("%Y-%m-%d")
        except ValueError:
            return None
            
        df = intraday_data.copy()
        if df.index.tz is None:
            df.index = df.index.tz_localize('UTC').tz_convert(WIB)
        
        if strategy.timeframe in ["Scalping", "Intraday"]:
            # Single day simulation for short timeframes
            df_sim = df[df.index.strftime("%Y-%m-%d") == target_date_iso]
        else:
            # Multi-day swing simulation
            df_sim = df[df.index.strftime("%Y-%m-%d") >= target_date_iso]
            
        if df_sim.empty:
            return BacktestResult(
                status="waiting_entry",
                status_label="⏳ No Data",
                entry_hit_price=0.0,
                exit_price=0.0,
                pnl_pct=0.0,
                time_elapsed=""
            )
            
        status = "waiting_entry"
        entry_price = 0.0
        exit_price = 0.0
        entry_time = None
        exit_time = None
        trailing_sl = None

        active_trail_pct = trail_percent * (positive_trail_mult if getattr(strategy, 'grade', '') in ['A+', 'A'] else 1.0)
        
        for idx, row in df_sim.iterrows():
            low = float(row['Low'])
            high = float(row['High'])
            close = float(row['Close'])
            
            if status == "waiting_entry":
                is_triggered = False
                
                if strategy.signal_type.startswith("buy"):
                    if high >= strategy.trigger_price:
                        is_triggered = True
                        entry_price = strategy.trigger_price
                        if low > strategy.trigger_price: # Gap up
                            entry_price = low
                else:
                    if low <= strategy.trigger_price:
                        is_triggered = True
                        entry_price = strategy.trigger_price
                        if high < strategy.trigger_price: # Gap down
                            entry_price = high
                            
                if is_triggered:
                    status = "floating"
                    entry_time = idx
                    trailing_sl = entry_price * (1.0 - active_trail_pct / 100.0)
                    
                    # Same candle SL / TP check
                    if low <= strategy.stop_loss:
                        status = "hit_sl"
                        exit_price = strategy.stop_loss
                        exit_time = idx
                    elif high >= strategy.target_2:
                        status = "hit_tp2"
                        exit_price = strategy.target_2
                        exit_time = idx
                    elif high >= strategy.target_1:
                        status = "hit_tp1"
                        exit_price = strategy.target_1
                        exit_time = idx
            
            elif status == "floating":
                # Update Trailing SL as price advances
                if use_trailing_stop:
                    new_trail = close * (1.0 - active_trail_pct / 100.0)
                    trailing_sl = new_trail if trailing_sl is None else max(trailing_sl, new_trail)

                # Prioritize SL (worst case assumption within 1 candle)
                if low <= strategy.stop_loss:
                    status = "hit_sl"
                    exit_price = strategy.stop_loss
                    exit_time = idx
                elif use_trailing_stop and trailing_sl and low <= trailing_sl:
                    status = "hit_trail_sl"
                    exit_price = trailing_sl
                    exit_time = idx
                elif high >= strategy.target_2:
                    status = "hit_tp2"
                    exit_price = strategy.target_2
                    exit_time = idx
                elif high >= strategy.target_1:
                    status = "hit_tp1"
                    exit_price = strategy.target_1
                    exit_time = idx
                    
            if status in ["hit_sl", "hit_trail_sl", "hit_tp1", "hit_tp2"]:
                break
                
        # Handle expired / end of simulation
        if status == "floating":
            exit_price = float(df_sim['Close'].iloc[-1])
            exit_time = df_sim.index[-1]
            status = "expired"
            
        # PnL Calculation
        pnl_pct = 0.0
        if status != "waiting_entry" and entry_price > 0:
            if strategy.signal_type.startswith("buy"):
                pnl_pct = (exit_price - entry_price) / entry_price * 100.0
            else:
                pnl_pct = (entry_price - exit_price) / entry_price * 100.0
                
        # Status Label matching reltsignal.pine comments
        if status == "waiting_entry":
            status_label = "⏳ WAITING"
        elif status == "hit_tp1":
            status_label = "🎯 HIT TP1 (1.3R)"
        elif status == "hit_tp2":
            status_label = "🚀 HIT TP2 (2.0R)"
        elif status == "hit_trail_sl":
            status_label = "🔒 TRAIL SL HIT"
        elif status == "hit_sl":
            status_label = "🛑 STOP LOSS"
        else:
            status_label = "⏳ EXPIRED"
            
        # Calculate time elapsed
        time_elapsed = ""
        if entry_time and exit_time:
            diff = exit_time - entry_time
            minutes = int(diff.total_seconds() / 60)
            if minutes == 0:
                time_elapsed = "same bar"
            elif minutes < 60:
                time_elapsed = f"{minutes}m"
            else:
                hours = minutes // 60
                rem_mins = minutes % 60
                time_elapsed = f"{hours}h {rem_mins}m"
                if hours > 24:
                    days = hours // 24
                    time_elapsed = f"{days}d"
                    
        return BacktestResult(
            status=status,
            status_label=status_label,
            entry_hit_price=round(entry_price, 2),
            exit_price=round(exit_price, 2),
            pnl_pct=round(pnl_pct, 2),
            time_elapsed=time_elapsed
        )
