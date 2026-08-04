import pandas as pd
from typing import Optional
from datetime import datetime
from models.response import StrategyDetail, BacktestResult
from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")

class TradeSimulator:
    def __init__(self):
        pass

    def simulate(self, strategy: StrategyDetail, intraday_data: pd.DataFrame, 
                 start_date_str: str) -> Optional[BacktestResult]:
        """
        Simulasikan pergerakan harga pada data intraday.
        start_date_str: "DD/MM/YY" format from mode_label target_date (e.g. "16/07/26").
        """
        if intraday_data is None or intraday_data.empty:
            return None
            
        try:
            # Parse start_date
            dt = datetime.strptime(start_date_str, "%d/%m/%y")
            # Convert ke YYYY-MM-DD
            target_date_iso = dt.strftime("%Y-%m-%d")
        except ValueError:
            return None
            
        # Pastikan index pandas dalam bentuk timezone-aware WIB jika belum
        df = intraday_data.copy()
        if df.index.tz is None:
            df.index = df.index.tz_localize('UTC').tz_convert(WIB)
        
        # Filter data intraday mulai dari awal hari target (atau spesifik jam tertentu)
        # Karena strategy dihasilkan pada awal hari (atau dari harga acuan hari tersebut),
        # kita simulasi data intraday HANYA pada hari tersebut untuk Intraday & Scalping.
        # Untuk Swing, bisa lebih dari satu hari (semua sisa dataframe sejak target_date).
        
        if strategy.timeframe in ["Scalping", "Intraday"]:
            # Hanya hari target
            df_sim = df[df.index.strftime("%Y-%m-%d") == target_date_iso]
        else:
            # Swing: mulai dari target date hingga akhir data
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
            
        # Inisialisasi state
        status = "waiting_entry"
        entry_price = 0.0
        exit_price = 0.0
        entry_time = None
        exit_time = None
        
        entry_low = min(strategy.entry_low, strategy.entry_high)
        entry_high = max(strategy.entry_low, strategy.entry_high)
        
        for idx, row in df_sim.iterrows():
            low = float(row['Low'])
            high = float(row['High'])
            
            if status == "waiting_entry":
                # Kita gunakan trigger_price (Action Trigger) sebagai titik masuk yang pasti
                is_triggered = False
                
                if strategy.signal_type.startswith("buy"):
                    if high >= strategy.trigger_price:
                        is_triggered = True
                        entry_price = strategy.trigger_price
                        if low > strategy.trigger_price: # gap up
                            entry_price = low
                else:
                    if low <= strategy.trigger_price:
                        is_triggered = True
                        entry_price = strategy.trigger_price
                        if high < strategy.trigger_price: # gap down
                            entry_price = high
                            
                if is_triggered:
                    status = "floating"
                    entry_time = idx
                    
                    # Cek jika dalam candle yang sama menyentuh SL atau TP
                    # Ini ambresif, SL dieksekusi lebih dulu jika sama-sama tersentuh
                    if low <= strategy.stop_loss:
                        status = "hit_sl"
                        exit_price = strategy.stop_loss
                        exit_time = idx
                    elif high >= strategy.target_1:
                        # Jika dia bisa hit TP1 juga
                        status = "hit_tp1"
                        exit_price = strategy.target_1
                        exit_time = idx
                        if high >= strategy.target_2:
                            status = "hit_tp2"
                            exit_price = strategy.target_2
            
            elif status == "floating":
                # Prioritaskan SL (asumsi terburuk dalam 1 bar)
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
                    
            if status in ["hit_sl", "hit_tp1", "hit_tp2"]:
                break
                
        # Handle expired / end of sim
        if status == "floating":
            # Ditutup di harga close terakhir
            exit_price = float(df_sim['Close'].iloc[-1])
            exit_time = df_sim.index[-1]
            status = "expired"
            
        # Hitung PnL
        pnl_pct = 0.0
        if status != "waiting_entry" and entry_price > 0:
            if strategy.signal_type.startswith("buy"):
                pnl_pct = (exit_price - entry_price) / entry_price * 100
            else: # sell
                pnl_pct = (entry_price - exit_price) / entry_price * 100
                
        # Status Label
        if status == "waiting_entry":
            status_label = "⏳ WAITING"
        elif status == "hit_tp1":
            status_label = "🎯 HIT TP1"
        elif status == "hit_tp2":
            status_label = "🚀 HIT TP2"
        elif status == "hit_sl":
            status_label = "🛑 STOP LOSS"
        else: # expired
            status_label = "⏳ EXPIRED"
            
        # Hitung durasi
        time_elapsed = ""
        if entry_time and exit_time:
            diff = exit_time - entry_time
            minutes = int(diff.total_seconds() / 60)
            if minutes == 0:
                time_elapsed = "same candle"
            elif minutes < 60:
                time_elapsed = f"{minutes}m"
            else:
                hours = minutes // 60
                rem_mins = minutes % 60
                time_elapsed = f"{hours}h {rem_mins}m"
                if strategy.timeframe == "Swing" and hours > 24:
                    days = hours // 24
                    time_elapsed = f"{days}d"
                    
        return BacktestResult(
            status=status,
            status_label=status_label,
            entry_hit_price=entry_price,
            exit_price=exit_price,
            pnl_pct=pnl_pct,
            time_elapsed=time_elapsed
        )
