import pandas as pd
import numpy as np
from typing import List, Dict, Any

class PatternEngine:
    def __init__(self):
        self.swing_window = 3 # reduced from 5 to detect patterns more easily
        
    def _find_swings(self, df: pd.DataFrame) -> tuple:
        """Finds swing highs and swing lows in the dataframe."""
        if len(df) < self.swing_window * 2 + 1:
            return [], []
            
        highs = df['High'].values
        lows = df['Low'].values
        times = df.index
        
        swing_highs = []
        swing_lows = []
        
        for i in range(self.swing_window, len(df) - self.swing_window):
            is_high = True
            is_low = True
            
            for j in range(i - self.swing_window, i + self.swing_window + 1):
                if j == i: continue
                if highs[j] >= highs[i]:
                    is_high = False
                if lows[j] <= lows[i]:
                    is_low = False
                    
            if is_high:
                swing_highs.append((times[i], highs[i], i))
            if is_low:
                swing_lows.append((times[i], lows[i], i))
                
        return swing_highs, swing_lows

    def _format_time(self, t) -> str:
        if isinstance(t, str):
            return t
        try:
            return t.strftime("%Y-%m-%d")
        except:
            return str(t)

    def detect_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Scans recent price action for common chart patterns.
        Returns a list of detected patterns.
        """
        if df is None or df.empty or len(df) < 20:
            return []
            
        swing_highs, swing_lows = self._find_swings(df)
        detected = []
        
        # We need at least a few swings to detect anything
        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return detected
            
        # Look at the most recent swings
        recent_highs = swing_highs[-3:]
        recent_lows = swing_lows[-3:]
        current_price = df['Close'].iloc[-1]
        current_time = self._format_time(df.index[-1])
        
        # 1. Check for Double Bottom
        if len(recent_lows) >= 2 and len(recent_highs) >= 1:
            l1_time, l1_price, l1_idx = recent_lows[-2]
            l2_time, l2_price, l2_idx = recent_lows[-1]
            
            # Find the highest high between the two lows (the neckline)
            middle_highs = [h for h in swing_highs if l1_idx < h[2] < l2_idx]
            if middle_highs:
                neck_time, neck_price, neck_idx = max(middle_highs, key=lambda x: x[1])
                
                # Check if lows are roughly equal (within 5%)
                margin = l1_price * 0.05
                if abs(l1_price - l2_price) <= margin:
                    
                    status = "Forming"
                    if current_price > neck_price:
                        status = "Confirmed"
                        
                    # Calculate prediction target (Neckline + Height of pattern)
                    pattern_height = neck_price - min(l1_price, l2_price)
                    target_price = neck_price + pattern_height
                    
                    # Estimate time to target (roughly the same time it took to form the pattern)
                    time_diff = l2_idx - l1_idx
                    future_idx = min(len(df) - 1 + time_diff, len(df) + 30) # Prevent going too far
                    
                    detected.append({
                        "pattern_id": "double-bottom",
                        "name": "Double Bottom",
                        "status": status,
                        "lines": [
                            {
                                "type": "neckline",
                                "points": [
                                    {"time": self._format_time(l1_time), "val": neck_price},
                                    {"time": current_time, "val": neck_price}
                                ]
                            },
                            {
                                "type": "support",
                                "points": [
                                    {"time": self._format_time(l1_time), "val": min(l1_price, l2_price)},
                                    {"time": self._format_time(l2_time), "val": min(l1_price, l2_price)}
                                ]
                            }
                        ],
                        "prediction": [
                            {"time": current_time, "val": current_price},
                            {"time": "FUTURE", "val": target_price} # Special flag for frontend to project dates
                        ]
                    })
                    
        # 2. Check for Double Top
        if len(recent_highs) >= 2 and len(recent_lows) >= 1:
            h1_time, h1_price, h1_idx = recent_highs[-2]
            h2_time, h2_price, h2_idx = recent_highs[-1]
            
            middle_lows = [l for l in swing_lows if h1_idx < l[2] < h2_idx]
            if middle_lows:
                neck_time, neck_price, neck_idx = min(middle_lows, key=lambda x: x[1])
                
                margin = h1_price * 0.05
                if abs(h1_price - h2_price) <= margin:
                    
                    status = "Forming"
                    if current_price < neck_price:
                        status = "Confirmed"
                        
                    pattern_height = max(h1_price, h2_price) - neck_price
                    target_price = neck_price - pattern_height
                    
                    detected.append({
                        "pattern_id": "double-top",
                        "name": "Double Top",
                        "status": status,
                        "lines": [
                            {
                                "type": "neckline",
                                "points": [
                                    {"time": self._format_time(h1_time), "val": neck_price},
                                    {"time": current_time, "val": neck_price}
                                ]
                            },
                            {
                                "type": "resistance",
                                "points": [
                                    {"time": self._format_time(h1_time), "val": max(h1_price, h2_price)},
                                    {"time": self._format_time(h2_time), "val": max(h1_price, h2_price)}
                                ]
                            }
                        ],
                        "prediction": [
                            {"time": current_time, "val": current_price},
                            {"time": "FUTURE", "val": max(0, target_price)}
                        ]
                    })

        # Return only the most relevant/recent pattern to avoid clutter
        if detected:
            # Sort by "Confirmed" first, then by most recently formed
            detected.sort(key=lambda x: (x['status'] != "Confirmed"))
            return [detected[0]]
            
        return []

    def detect_candlestick_patterns(self, df: pd.DataFrame) -> List[str]:
        """
        Detects bullish candlestick patterns on the most recent daily candle(s).
        Returns a list of strings representing the detected patterns.
        """
        if df is None or df.empty or len(df) < 3:
            return []
            
        patterns = []
        
        # Row -1: Current/latest daily candle
        c1 = df.iloc[-1]
        # Row -2: Previous daily candle
        c2 = df.iloc[-2]
        
        o1, h1, l1, cl1 = float(c1['Open']), float(c1['High']), float(c1['Low']), float(c1['Close'])
        o2, h2, l2, cl2 = float(c2['Open']), float(c2['High']), float(c2['Low']), float(c2['Close'])
        
        body1 = abs(cl1 - o1)
        body2 = abs(cl2 - o2)
        
        range1 = h1 - l1
        if range1 == 0:
            range1 = 0.001
            
        lower_shadow1 = min(o1, cl1) - l1
        upper_shadow1 = h1 - max(o1, cl1)
        
        # 1. Detect Hammer (Bullish Reversal Pin Bar)
        if lower_shadow1 >= 2 * body1 and upper_shadow1 <= 0.15 * range1 and body1 > 0:
            patterns.append("Hammer")
            
        # 2. Detect Bullish Engulfing
        if cl2 < o2 and cl1 > o1:
            if o1 <= cl2 and cl1 >= o2:
                patterns.append("Bullish Engulfing")
                
        # 3. Standard Bullish close
        if cl1 > o1:
            patterns.append("Bullish Close")
            
        return patterns
