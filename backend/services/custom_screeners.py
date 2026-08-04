"""
Custom Screener Evaluator & Registry Module
Memproses evaluasi kriteria screener kustom seperti DAYTRADE BPJS (09.05-09.20).
"""

import pandas as pd
from typing import Dict, Any, List, Optional

def evaluate_bpjs_daytrade(daily_df: pd.DataFrame, reference_price: float) -> Dict[str, Any]:
    """
    Evaluasi Saham berdasarkan Kriteria DAYTRADE BPJS (09.05-09.20):
    1. Open Price <= 1.01 * Low Price
    2. Volume >= 1.5 * Volume MA 5
    3. Price >= 1.0 * Price MA 5
    4. Price Change >= 2.0%
    5. Value (Price * Volume) > Rp 5.000.000.000 (5 Miliar)
    6. Price >= 100
    """
    if daily_df is None or daily_df.empty or len(daily_df) < 5:
        return {"passed": False, "reason": "Data histori kurang dari 5 hari"}

    last_row = daily_df.iloc[-1]
    prev_row = daily_df.iloc[-2] if len(daily_df) > 1 else last_row

    open_price = float(last_row['Open'])
    high_price = float(last_row['High'])
    low_price = float(last_row['Low'])
    close_price = reference_price if reference_price > 0 else float(last_row['Close'])
    curr_volume = float(last_row['Volume'])
    prev_close = float(prev_row['Close'])

    # 1. Price >= 100
    if close_price < 100:
        return {"passed": False, "reason": f"Harga {close_price} < 100"}

    # 2. Value > 5.000.000.000
    total_value = close_price * curr_volume
    if total_value <= 5_000_000_000:
        return {"passed": False, "reason": f"Nilai transaksi Rp {total_value:,.0f} <= Rp 5B"}

    # 3. Price Change >= 2.0%
    change_pct = ((close_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
    if change_pct < 2.0:
        return {"passed": False, "reason": f"Kenaikan harga {change_pct:.2f}% < 2.0%"}

    # 4. Open Price <= 1.01 * Low Price
    if low_price <= 0:
        return {"passed": False, "reason": "Harga low tidak valid"}
    
    open_low_ratio = open_price / low_price
    if open_low_ratio > 1.01:
        return {"passed": False, "reason": f"Open/Low ratio {open_low_ratio:.4f} > 1.01 (Open: {open_price}, Low: {low_price})"}

    # 5. Calculate 5-Day Volume MA & Price MA
    recent_5 = daily_df.iloc[-5:]
    vol_ma5 = float(recent_5['Volume'].mean()) if not recent_5.empty else 0.0
    price_ma5 = float(recent_5['Close'].mean()) if not recent_5.empty else 0.0

    # Volume >= 1.5 * Volume MA 5
    if vol_ma5 <= 0:
        return {"passed": False, "reason": "Volume MA 5 hari <= 0"}
    
    vol_ma5_ratio = curr_volume / vol_ma5
    if vol_ma5_ratio < 1.5:
        return {"passed": False, "reason": f"Volume ratio {vol_ma5_ratio:.2f}x < 1.5x (Vol: {curr_volume:,.0f}, Vol MA5: {vol_ma5:,.0f})"}

    # Price >= 1.0 * Price MA 5
    if price_ma5 <= 0:
        return {"passed": False, "reason": "Price MA 5 hari <= 0"}

    price_ma5_ratio = close_price / price_ma5
    if price_ma5_ratio < 1.0:
        return {"passed": False, "reason": f"Harga {close_price} < Price MA5 {price_ma5:.2f}"}

    # All 6 rules passed!
    return {
        "passed": True,
        "metrics": {
            "open": open_price,
            "low": low_price,
            "open_low_ratio": round(open_low_ratio, 4),
            "close": close_price,
            "change_pct": round(change_pct, 2),
            "volume": int(curr_volume),
            "vol_ma5": round(vol_ma5, 0),
            "vol_ma5_ratio": round(vol_ma5_ratio, 2),
            "price_ma5": round(price_ma5, 2),
            "total_value": int(total_value)
        }
    }


def evaluate_opening_0858(daily_df: pd.DataFrame, reference_price: float) -> Dict[str, Any]:
    """
    Evaluasi Saham berdasarkan Kriteria OPENING (08.58):
    1. Volume > 500,000
    2. Open Price <= 1.0 * Low Price
    3. Price <= 1000
    4. 1 Day Price Returns (%) >= 1.0%
    5. Price > 100
    """
    if daily_df is None or daily_df.empty or len(daily_df) < 2:
        return {"passed": False, "reason": "Data histori kurang dari 2 hari"}

    last_row = daily_df.iloc[-1]
    prev_row = daily_df.iloc[-2] if len(daily_df) > 1 else last_row

    open_price = float(last_row['Open'])
    low_price = float(last_row['Low'])
    close_price = reference_price if reference_price > 0 else float(last_row['Close'])
    curr_volume = float(last_row['Volume'])
    prev_close = float(prev_row['Close'])

    # 1. Price > 100
    if close_price <= 100:
        return {"passed": False, "reason": f"Harga {close_price} <= 100"}

    # 2. Price <= 1000
    if close_price > 1000:
        return {"passed": False, "reason": f"Harga {close_price} > 1000"}

    # 3. Volume > 500.000
    if curr_volume <= 500_000:
        return {"passed": False, "reason": f"Volume {curr_volume:,.0f} <= 500,000"}

    # 4. 1 Day Price Returns (%) >= 1.0%
    change_pct = ((close_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
    if change_pct < 1.0:
        return {"passed": False, "reason": f"Kenaikan harga 1D {change_pct:.2f}% < 1.0%"}

    # 5. Open Price <= 1.0 * Low Price
    if low_price <= 0:
        return {"passed": False, "reason": "Harga low tidak valid"}

    open_low_ratio = open_price / low_price
    if open_low_ratio > 1.0:
        return {"passed": False, "reason": f"Open/Low ratio {open_low_ratio:.4f} > 1.0 (Open: {open_price}, Low: {low_price})"}

    return {
        "passed": True,
        "metrics": {
            "open": open_price,
            "low": low_price,
            "open_low_ratio": round(open_low_ratio, 4),
            "close": close_price,
            "change_pct": round(change_pct, 2),
            "volume": int(curr_volume),
        }
    }


def evaluate_bsjp_1530(daily_df: pd.DataFrame, reference_price: float) -> Dict[str, Any]:
    """
    Evaluasi Saham berdasarkan Kriteria BSJP (15.30-15.40):
    1. Price Change >= 2.0%
    2. Price >= 1.0 * Price MA 20
    3. Volume >= 1.2 * Volume MA 20
    4. Value > 10.000.000.000 (10 Miliar)
    """
    if daily_df is None or daily_df.empty or len(daily_df) < 20:
        return {"passed": False, "reason": "Data histori kurang dari 20 hari"}

    last_row = daily_df.iloc[-1]
    prev_row = daily_df.iloc[-2] if len(daily_df) > 1 else last_row

    close_price = reference_price if reference_price > 0 else float(last_row['Close'])
    curr_volume = float(last_row['Volume'])
    prev_close = float(prev_row['Close'])

    # 1. Value > 10.000.000.000
    total_value = close_price * curr_volume
    if total_value <= 10_000_000_000:
        return {"passed": False, "reason": f"Nilai transaksi Rp {total_value:,.0f} <= Rp 10B"}

    # 2. Price Change >= 2.0%
    change_pct = ((close_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
    if change_pct < 2.0:
        return {"passed": False, "reason": f"Kenaikan harga {change_pct:.2f}% < 2.0%"}

    # 3. Calculate 20-Day Volume MA & Price MA
    recent_20 = daily_df.iloc[-20:]
    vol_ma20 = float(recent_20['Volume'].mean()) if not recent_20.empty else 0.0
    price_ma20 = float(recent_20['Close'].mean()) if not recent_20.empty else 0.0

    # Volume >= 1.2 * Volume MA 20
    if vol_ma20 <= 0:
        return {"passed": False, "reason": "Volume MA 20 hari <= 0"}
    
    vol_ma20_ratio = curr_volume / vol_ma20
    if vol_ma20_ratio < 1.2:
        return {"passed": False, "reason": f"Volume ratio {vol_ma20_ratio:.2f}x < 1.2x (Vol: {curr_volume:,.0f}, Vol MA20: {vol_ma20:,.0f})"}

    # Price >= 1.0 * Price MA 20
    if price_ma20 <= 0:
        return {"passed": False, "reason": "Price MA 20 hari <= 0"}

    price_ma20_ratio = close_price / price_ma20
    if price_ma20_ratio < 1.0:
        return {"passed": False, "reason": f"Harga {close_price} < Price MA20 {price_ma20:.2f}"}

    return {
        "passed": True,
        "metrics": {
            "close": close_price,
            "change_pct": round(change_pct, 2),
            "volume": int(curr_volume),
            "vol_ma20": round(vol_ma20, 0),
            "vol_ma20_ratio": round(vol_ma20_ratio, 2),
            "price_ma20": round(price_ma20, 2),
            "total_value": int(total_value)
        }
    }


SCREENER_REGISTRY = {
    "bpjs_daytrade": {
        "id": "bpjs_daytrade",
        "name": "BPJS (09.05-09.20)",
        "description": "Strategi momentum pembukaan pasar dengan syarat Open <= 1.01x Low, Vol >= 1.5x Vol MA5, Price >= Price MA5, Change >= +2%, Value > 5B, Price >= 100.",
        "evaluator": evaluate_bpjs_daytrade,
        "rules": [
            "Open Price <= 1.01 x Low Price",
            "Volume >= 1.5 x Volume MA 5",
            "Price >= 1.0 x Price MA 5",
            "Price Change >= +2.0%",
            "Nilai Transaksi > Rp 5.000.000.000",
            "Harga Saham >= Rp 100"
        ]
    },
    "opening_0858": {
        "id": "opening_0858",
        "name": "OPENING (08.58)",
        "description": "Strategi momentum pembukaan pasar (08.58) dengan syarat Volume > 500k, Open <= 1.0x Low, Price 100-1000, 1D Return >= +1%.",
        "evaluator": evaluate_opening_0858,
        "rules": [
            "Volume > 500.000",
            "Open Price <= 1.0 x Low Price",
            "Price <= 1.000",
            "1 Day Price Returns (%) >= +1.0%",
            "Price > 100"
        ]
    },
    "bsjp_1530": {
        "id": "bsjp_1530",
        "name": "BSJP (15.30-15.40)",
        "description": "Strategi penutupan pasar BSJP (Beli Sore Jual Pagi) dengan syarat Price Change >= +2%, Price >= Price MA20, Vol >= 1.2x Vol MA20, Value > 10B.",
        "evaluator": evaluate_bsjp_1530,
        "rules": [
            "Price Change >= +2.0%",
            "Price >= 1.0 x Price MA 20",
            "Volume >= 1.2 x Volume MA 20",
            "Nilai Transaksi > Rp 10.000.000.000"
        ]
    }
}

def get_available_custom_screeners() -> List[Dict[str, Any]]:
    """Return list of metadata for all registered custom screeners."""
    output = []
    for s_id, s_info in SCREENER_REGISTRY.items():
        output.append({
            "id": s_info["id"],
            "name": s_info["name"],
            "description": s_info["description"],
            "rules": s_info["rules"]
        })
    return output
