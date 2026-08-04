import pandas as pd
import yfinance as yf
from datetime import datetime, time, timedelta
from typing import Dict, Any, List, Optional
from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")

class SessionService:
    """
    Service untuk menghitung OHLCV per sesi trading IDX.
    
    Jadwal (custom user):
        Sesi 1:  09:00 - 12:30 WIB
        Sesi 2:  13:30 - 16:30 WIB
    
    Aturan ketersediaan:
        - Pre-market (< 09:00):       Live=kemarin, Sesi1=kemarin, CloseMarket=kemarin
        - Sesi 1 (09:00-12:30):       Live=hari ini,  Sesi1=kemarin, CloseMarket=kemarin
        - Istirahat (12:30-13:30):    Live=hari ini,  Sesi1=hari ini, CloseMarket=kemarin
        - Sesi 2 (13:30-16:30):       Live=hari ini,  Sesi1=hari ini, CloseMarket=kemarin
        - Post-market (>= 16:30):     Live=hari ini,  Sesi1=hari ini, CloseMarket=hari ini
    """
    
    SESSION_1_START = time(9, 0)
    SESSION_1_END = time(12, 30)
    SESSION_2_START = time(13, 30)
    SESSION_2_END = time(16, 30)
    
    def get_current_market_phase(self) -> str:
        """Return fase market saat ini berdasarkan waktu WIB."""
        now = datetime.now(WIB).time()
        
        if now < self.SESSION_1_START:
            return "pre_market"
        elif now < self.SESSION_1_END:
            return "session_1"
        elif now < self.SESSION_2_START:
            return "break"
        elif now < self.SESSION_2_END:
            return "session_2"
        else:
            return "post_market"
    
    def get_available_modes(self) -> List[str]:
        """Return daftar mode yang valid saat ini (Live selalu tersedia)."""
        phase = self.get_current_market_phase()
        modes = ["live"]
        
        if phase in ("break", "session_2", "post_market"):
            modes.append("session_1")
        if phase == "post_market":
            modes.append("close_market")
            
        return modes
    
    def _get_last_trading_day(self, today: datetime) -> datetime:
        """Return hari kerja terakhir sebelum `today`."""
        day = today - timedelta(days=1)
        while day.weekday() >= 5:  # Saturday=5, Sunday=6
            day -= timedelta(days=1)
        return day
    
    def _get_target_date(self, mode: str) -> datetime:
        """
        Tentukan tanggal target untuk sesi berdasarkan mode dan fase saat ini.
        Return datetime (date only, WIB).
        """
        now = datetime.now(WIB)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        phase = self.get_current_market_phase()
        
        if mode == "live":
            return today
        
        if mode == "session_1":
            if phase in ("pre_market", "session_1"):
                return self._get_last_trading_day(today)
            else:
                return today
        
        if mode == "close_market":
            if phase == "post_market":
                return today
            else:
                return self._get_last_trading_day(today)
        
        return today
    
    def fetch_session_intraday(self, ticker: str, target_date: datetime) -> Optional[pd.DataFrame]:
        """
        Fetch data intraday 15M fresh dari yfinance untuk tanggal target.
        Return DataFrame dengan kolom OHLCV, index datetime (WIB).
        """
        yf_ticker = f"{ticker}.JK"
        
        # Fetch 5 hari terakhir untuk memastikan target_date tercakup
        df = yf.download(yf_ticker, period="5d", interval="15m", progress=False)
        
        if df is None or df.empty:
            return None
        
        # Handle multi-index columns
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.droplevel(1)
        
        df = df[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        df = df.dropna(subset=['Close'])
        
        # Konversi index ke WIB
        if df.index.tz is None:
            df.index = df.index.tz_localize('UTC').tz_convert(WIB)
        else:
            df.index = df.index.tz_convert(WIB)
        
        # Filter hanya tanggal target
        target_str = target_date.strftime("%Y-%m-%d")
        df_day = df[df.index.strftime("%Y-%m-%d") == target_str]
        
        return df_day if not df_day.empty else None
    
    def calculate_session_ohlcv(self, df_intraday: pd.DataFrame, session: str) -> Optional[Dict[str, Any]]:
        """
        Hitung OHLCV dari candle intraday berdasarkan sesi.
        
        session='session_1': Filter candle 09:00 - 12:30
        session='full_day':  Filter candle 09:00 - 12:30 + 13:30 - 16:30
        """
        if df_intraday is None or df_intraday.empty:
            return None
        
        if session == "session_1":
            mask = (df_intraday.index.time >= self.SESSION_1_START) & \
                   (df_intraday.index.time <= self.SESSION_1_END)
            filtered = df_intraday[mask]
        elif session == "full_day":
            mask_s1 = (df_intraday.index.time >= self.SESSION_1_START) & \
                      (df_intraday.index.time <= self.SESSION_1_END)
            mask_s2 = (df_intraday.index.time >= self.SESSION_2_START) & \
                      (df_intraday.index.time <= self.SESSION_2_END)
            filtered = df_intraday[mask_s1 | mask_s2]
        else:
            return None
        
        if filtered.empty:
            return None
        
        return {
            "open": float(filtered['Open'].iloc[0]),
            "high": float(filtered['High'].max()),
            "low": float(filtered['Low'].min()),
            "close": float(filtered['Close'].iloc[-1]),
            "volume": int(filtered['Volume'].sum()),
        }
    
    def get_reference_data(self, mode: str, ticker: str, live_price: float, 
                           daily_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Return data referensi lengkap berdasarkan mode.
        
        Returns:
            {
                'price': float,        # Harga referensi utama (close sesi)
                'ohlcv': dict,         # { open, high, low, close, volume }
                'label': str,          # Label tampilan: "Live", "Session 1 (16/07/26)", dst
                'target_date': str,    # Tanggal referensi
            }
        """
        target_date = self._get_target_date(mode)
        target_str = target_date.strftime("%d/%m/%y")
        
        if mode == "live":
            # Ambil OHLCV hari ini yang sedang berjalan dari daily terakhir
            if daily_df is not None and not daily_df.empty:
                last_bar = daily_df.iloc[-1]
                ohlcv = {
                    "open": float(last_bar['Open']),
                    "high": float(last_bar['High']),
                    "low": float(last_bar['Low']),
                    "close": live_price,
                    "volume": int(last_bar['Volume']),
                }
            else:
                ohlcv = {
                    "open": live_price, "high": live_price,
                    "low": live_price, "close": live_price, "volume": 0
                }
            
            return {
                "price": live_price,
                "ohlcv": ohlcv,
                "label": "Live",
                "target_date": target_str,
            }
        
        # Untuk mode session_1 dan close_market, fetch data intraday fresh
        df_intraday = self.fetch_session_intraday(ticker, target_date)
        
        if mode == "session_1":
            session_ohlcv = self.calculate_session_ohlcv(df_intraday, "session_1")
            if session_ohlcv:
                return {
                    "price": session_ohlcv["close"],
                    "ohlcv": session_ohlcv,
                    "label": f"Session 1 ({target_str})",
                    "target_date": target_str,
                }
            # Fallback ke live jika data sesi tidak tersedia
            return self.get_reference_data("live", ticker, live_price, daily_df)
        
        if mode == "close_market":
            full_day_ohlcv = self.calculate_session_ohlcv(df_intraday, "full_day")
            if full_day_ohlcv:
                return {
                    "price": full_day_ohlcv["close"],
                    "ohlcv": full_day_ohlcv,
                    "label": f"Close Market ({target_str})",
                    "target_date": target_str,
                }
            # Fallback ke live
            return self.get_reference_data("live", ticker, live_price, daily_df)
        
        # Default fallback
        return self.get_reference_data("live", ticker, live_price, daily_df)
