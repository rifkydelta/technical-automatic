"""
Historical Backtester Engine - Enhanced High-Probability Quantitative Engine
Implements realistic multi-bar strategy simulation:
- Trend Regime Gate & Multi-Tier Validation
- Adaptive Swing Low Invalidation (SL) with protective bounds [3%, 8%]
- TP1 (1.5R) Breakeven Lock & TP2 (2.5R) Runner Target
- Chandelier / Supertrend Trend Breakdown Exit
- Comprehensive performance metrics: Win Rate %, Net PnL %, Win/Loss breakdown, Trade Logs
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from models.response import StrategyDetail, HistoricalTradeLog, BacktestSummary
from services.trade_simulator import TradeSimulator
from services.relt_signal_engine import ReltSignalEngine
from services.supertrend_engine import SupertrendEngine
from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")

class HistoricalBacktester:
    def __init__(self):
        self.simulator = TradeSimulator()
        self.relt_engine = ReltSignalEngine()
        self.supertrend_engine = SupertrendEngine()

    def run_relt_daily_backtest(
        self,
        daily_df: pd.DataFrame,
        lookback_days: int = 365,
        signal_mode: str = "Balanced",
        entry_mode: str = "Hybrid"
    ) -> Optional[BacktestSummary]:
        """
        Runs full multi-bar historical backtest of the RELT Signal Strategy on Daily OHLCV.
        """
        if daily_df is None or daily_df.empty or len(daily_df) < 30:
            return None

        df = daily_df.copy()
        n = len(df)
        start_idx = max(25, n - min(lookback_days, n))

        trade_logs = []
        in_trade = False
        entry_price = 0.0
        stop_loss = 0.0
        tp1 = 0.0
        tp2 = 0.0
        entry_date = ""
        entry_time_str = ""
        tp1_hit = False
        action = "BUY"
        holding_bars = 0

        for i in range(start_idx, n):
            past_slice = df.iloc[:i + 1]
            cur_row = df.iloc[i]
            cur_open = float(cur_row['Open'])
            cur_high = float(cur_row['High'])
            cur_low = float(cur_row['Low'])
            cur_close = float(cur_row['Close'])
            raw_time = cur_row.name
            date_str = raw_time.strftime("%d %b %Y") if hasattr(raw_time, 'strftime') else str(raw_time)
            iso_time_str = raw_time.strftime("%Y-%m-%d") if hasattr(raw_time, 'strftime') else str(raw_time)

            if not in_trade:
                # Evaluate RELT Strategy Entry
                relt = self.relt_engine.analyze(
                    daily_df=past_slice,
                    reference_price=cur_close,
                    signal_mode=signal_mode,
                    entry_mode=entry_mode
                )

                action = relt.get("action", "WAIT")
                score = relt.get("score", 0)
                is_buy_signal = (action in ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY"] or (action == "WATCH BUY" and score >= 65)) and not relt.get("is_no_trade_zone", False)

                if is_buy_signal:
                    in_trade = True
                    entry_price = cur_close
                    setup = relt.get("trade_setup", {})
                    stop_loss = setup.get("stop_loss", cur_close * 0.95)
                    tp1 = setup.get("tp1", cur_close * 1.05)
                    tp2 = setup.get("tp2", cur_close * 1.10)
                    entry_date = date_str
                    entry_time_str = iso_time_str
                    tp1_hit = False
                    holding_bars = 0

            else:
                holding_bars += 1
                status = None
                exit_price = 0.0

                # 1. Stop Loss Hit
                if cur_low <= stop_loss:
                    status = "hit_sl"
                    exit_price = stop_loss
                # 2. Take Profit 2 Hit (Runner Target reached)
                elif cur_high >= tp2:
                    status = "hit_tp2"
                    exit_price = tp2
                # 3. Take Profit 1 Hit (Move SL to Breakeven + 0.5% profit buffer)
                elif cur_high >= tp1 and not tp1_hit:
                    tp1_hit = True
                    stop_loss = max(stop_loss, entry_price * 1.005)

                # 4. Trend Breakdown / Supertrend Exit (Protect open gains after 3+ bars)
                if not status and holding_bars >= 3 and len(past_slice) >= 15:
                    st_res = self.supertrend_engine.calculate(past_slice)
                    if st_res.get("st_trend") == "Bearish":
                        status = "st_exit"
                        exit_price = cur_close
                    elif tp1_hit and cur_close < past_slice['Close'].iloc[-2] * 0.97:
                        status = "hit_trail_sl"
                        exit_price = cur_close

                # If exited on this candle
                if status:
                    pnl_pct = ((exit_price - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0
                    trade_logs.append(HistoricalTradeLog(
                        date=f"{entry_date} -> {date_str}",
                        signal_type=f"RELT Long ({action})",
                        trigger_price=entry_price,
                        entry_price=entry_price,
                        exit_price=round(exit_price, 2),
                        status=status,
                        pnl_pct=round(pnl_pct, 2),
                        entry_time=entry_time_str,
                        exit_time=iso_time_str
                    ))
                    in_trade = False

        # Close open trade at the end of backtest range
        if in_trade:
            final_close = float(df['Close'].iloc[-1])
            pnl_pct = ((final_close - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0
            trade_logs.append(HistoricalTradeLog(
                date=f"{entry_date} -> Now",
                signal_type="RELT Long (Open)",
                trigger_price=entry_price,
                entry_price=entry_price,
                exit_price=round(final_close, 2),
                status="open_floating",
                pnl_pct=round(pnl_pct, 2),
                entry_time=entry_time_str,
                exit_time=iso_time_str
            ))

        total_trades = len(trade_logs)
        win_count = sum(1 for t in trade_logs if t.pnl_pct > 0)
        loss_count = sum(1 for t in trade_logs if t.pnl_pct < 0)
        expired_count = sum(1 for t in trade_logs if t.pnl_pct == 0)
        win_rate = (win_count / total_trades * 100.0) if total_trades > 0 else 0.0
        total_pnl = sum(t.pnl_pct for t in trade_logs)

        # Reverse so newest trades show first
        sorted_logs = list(reversed(trade_logs))

        return BacktestSummary(
            timeframe=f"RELT Strategy (Daily {lookback_days}D)",
            total_trades=total_trades,
            win_count=win_count,
            loss_count=loss_count,
            expired_count=expired_count,
            win_rate_pct=round(win_rate, 2),
            total_pnl_pct=round(total_pnl, 2),
            trade_logs=sorted_logs
        )

    def extract_all_relt_signals(
        self,
        daily_df: pd.DataFrame,
        lookback_days: int = 365,
        signal_mode: str = "Balanced",
        entry_mode: str = "Hybrid"
    ) -> List[Dict[str, Any]]:
        """
        Runs the multi-bar RELT simulation over lookback_days and extracts all historical
        signals (both active OPEN positions and completed trades with actual PnL).
        """
        if daily_df is None or daily_df.empty or len(daily_df) < 30:
            return []

        df = daily_df.copy()
        n = len(df)
        start_idx = max(25, n - min(lookback_days, n))

        signals = []
        in_trade = False
        entry_price = 0.0
        stop_loss = 0.0
        tp1 = 0.0
        tp2 = 0.0
        entry_date_iso = ""
        entry_relt = {}
        tp1_hit = False
        holding_bars = 0

        for i in range(start_idx, n):
            past_slice = df.iloc[:i + 1]
            cur_row = df.iloc[i]
            cur_close = float(cur_row['Close'])
            cur_high = float(cur_row['High'])
            cur_low = float(cur_row['Low'])
            raw_time = cur_row.name
            iso_time_str = raw_time.strftime("%Y-%m-%d") if hasattr(raw_time, 'strftime') else str(raw_time)[:10]

            if not in_trade:
                # Evaluate RELT Strategy Entry
                relt = self.relt_engine.analyze(
                    daily_df=past_slice,
                    reference_price=cur_close,
                    signal_mode=signal_mode,
                    entry_mode=entry_mode
                )

                action = relt.get("action", "WAIT")
                score = relt.get("score", 0)
                is_buy_signal = (action in ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY"] or (action == "WATCH BUY" and score >= 65)) and not relt.get("is_no_trade_zone", False)

                if is_buy_signal:
                    in_trade = True
                    entry_price = cur_close
                    entry_date_iso = iso_time_str
                    entry_relt = relt
                    setup = relt.get("trade_setup", {})
                    stop_loss = setup.get("stop_loss", cur_close * 0.95)
                    tp1 = setup.get("tp1", cur_close * 1.05)
                    tp2 = setup.get("tp2", cur_close * 1.10)
                    tp1_hit = False
                    holding_bars = 0

            else:
                holding_bars += 1
                status_raw = None
                exit_price = 0.0

                # 1. Hit SL
                if cur_low <= stop_loss:
                    status_raw = "HIT_SL"
                    exit_price = stop_loss
                # 2. Hit TP2 (Runner Target)
                elif cur_high >= tp2:
                    status_raw = "HIT_TP2"
                    exit_price = tp2
                # 3. Hit TP1 (Safe Profit Lock -> Breakeven SL)
                elif cur_high >= tp1 and not tp1_hit:
                    tp1_hit = True
                    stop_loss = max(stop_loss, entry_price * 1.005)

                # 4. Trend Breakdown / Supertrend Exit (Protect open gains after 3+ bars)
                if not status_raw and holding_bars >= 3 and len(past_slice) >= 15:
                    st_res = self.supertrend_engine.calculate(past_slice)
                    if st_res.get("st_trend") == "Bearish":
                        status_raw = "CLOSED"
                        exit_price = cur_close
                    elif tp1_hit and cur_close < past_slice['Close'].iloc[-2] * 0.97:
                        status_raw = "CLOSED"
                        exit_price = cur_close

                if status_raw:
                    pnl_pct = ((exit_price - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0
                    signals.append({
                        "signal_date": entry_date_iso,
                        "signal_time": f"{entry_date_iso} 16:00:00",
                        "signal_type": "BUY",
                        "entry_price": round(entry_price, 2),
                        "stop_loss": round(stop_loss, 2),
                        "tp1": round(tp1, 2),
                        "tp2": round(tp2, 2),
                        "status": status_raw,
                        "actual_exit_price": round(exit_price, 2),
                        "actual_pnl_pct": round(pnl_pct, 2),
                        "relt": entry_relt,
                        "exit_date": iso_time_str
                    })
                    in_trade = False

        # If trade is still open at the latest bar
        if in_trade:
            final_close = float(df['Close'].iloc[-1])
            pnl_pct = ((final_close - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0
            signals.append({
                "signal_date": entry_date_iso,
                "signal_time": f"{entry_date_iso} 16:00:00",
                "signal_type": "BUY",
                "entry_price": round(entry_price, 2),
                "stop_loss": round(stop_loss, 2),
                "tp1": round(tp1, 2),
                "tp2": round(tp2, 2),
                "status": "OPEN",
                "actual_exit_price": round(final_close, 2),
                "actual_pnl_pct": round(pnl_pct, 2),
                "relt": entry_relt,
                "exit_date": None
            })

        # Return signals sorted latest entry first
        signals.sort(key=lambda s: s["signal_date"], reverse=True)
        return signals

    def run_backtest(self, daily_df: pd.DataFrame, m15_df: pd.DataFrame) -> List[BacktestSummary]:
        """
        Runs comprehensive multi-timeframe backtests:
        1. RELT Daily 365-Day Strategy Backtest
        2. Intraday / Scalping Backtests
        """
        summaries = []

        # 1. Primary RELT Daily Backtest (365 Days)
        if daily_df is not None and not daily_df.empty:
            relt_daily_summary = self.run_relt_daily_backtest(daily_df, lookback_days=365)
            if relt_daily_summary:
                summaries.append(relt_daily_summary)

        # 2. Intraday Backtests if M15 data is available
        if m15_df is not None and not m15_df.empty and daily_df is not None:
            if m15_df.index.tz is None:
                m15_df.index = m15_df.index.tz_localize('UTC').tz_convert(WIB)

            m15_dates = sorted(list(set(m15_df.index.strftime("%Y-%m-%d"))))
            intraday_logs = []

            for target_date_str in m15_dates:
                target_ts = pd.Timestamp(target_date_str)
                past_data = daily_df[daily_df.index < target_ts]
                if len(past_data) < 20:
                    continue

                day_data = m15_df[m15_df.index.strftime("%Y-%m-%d") == target_date_str]
                if day_data.empty:
                    continue

                day_open = float(day_data['Open'].iloc[0])
                relt_res = self.relt_engine.analyze(past_data, reference_price=day_open, signal_mode="Balanced")

                if relt_res.get("action") not in ["ULTRA BUY", "STRONG BUY", "PULLBACK BUY"]:
                    continue

                setup = relt_res.get("trade_setup", {})
                dt = datetime.strptime(target_date_str, "%Y-%m-%d")
                sim_date_str = dt.strftime("%d/%m/%y")

                # Strategy Details for simulation
                intraday_strat = StrategyDetail(
                    timeframe="Intraday",
                    grade=relt_res.get("rating", "A"),
                    signal_type="buy",
                    description=f"RELT {relt_res.get('action')}",
                    entry_low=setup.get("entry_price", day_open),
                    entry_high=setup.get("entry_price", day_open),
                    stop_loss=setup.get("stop_loss", day_open * 0.95),
                    risk_pct=setup.get("risk_percent", 2.0),
                    target_1=setup.get("tp1", day_open * 1.03),
                    target_2=setup.get("tp2", day_open * 1.06),
                    risk_reward=setup.get("risk_reward_ratio", 2.0),
                    trigger_price=day_open,
                    trigger_condition="RELT Signal Trigger",
                    context="Multi-indicator momentum & SMC confirmation"
                )

                i_res = self.simulator.simulate(intraday_strat, m15_df, sim_date_str)
                if i_res and i_res.status != "waiting_entry":
                    intraday_logs.append(HistoricalTradeLog(
                        date=dt.strftime("%d %b %Y"),
                        signal_type=f"RELT Buy ({relt_res.get('action')})",
                        trigger_price=day_open,
                        entry_price=i_res.entry_hit_price,
                        exit_price=i_res.exit_price,
                        status=i_res.status,
                        pnl_pct=i_res.pnl_pct
                    ))

            if intraday_logs:
                total = len(intraday_logs)
                win = sum(1 for x in intraday_logs if x.pnl_pct > 0)
                loss = sum(1 for x in intraday_logs if x.pnl_pct < 0)
                exp = sum(1 for x in intraday_logs if x.pnl_pct == 0)
                wr = (win / total * 100.0) if total > 0 else 0.0
                pnl = sum(x.pnl_pct for x in intraday_logs)

                summaries.append(BacktestSummary(
                    timeframe="Intraday RELT Strategy",
                    total_trades=total,
                    win_count=win,
                    loss_count=loss,
                    expired_count=exp,
                    win_rate_pct=round(wr, 2),
                    total_pnl_pct=round(pnl, 2),
                    trade_logs=list(reversed(intraday_logs))
                ))

        return summaries
