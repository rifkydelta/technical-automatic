"""Formatters for numbers, currency, dates, and percentages matching frontend behavior."""
from datetime import datetime

def fmt_market_cap(val) -> str:
    if val is None or val == 0:
        return "N/A"
    try:
        num = float(val)
        if num >= 1e12:
            return f"Rp {num / 1e12:.2f} T"
        if num >= 1e9:
            return f"Rp {num / 1e9:.2f} B"
        if num >= 1e6:
            return f"Rp {num / 1e6:.2f} M"
        return f"Rp {num:,.0f}"
    except (ValueError, TypeError):
        return "N/A"

def fmt_number(val) -> str:
    if val is None:
        return "N/A"
    try:
        return f"{float(val):,.0f}"
    except (ValueError, TypeError):
        return "N/A"

def fmt_ratio(val) -> str:
    if val is None:
        return "N/A"
    try:
        return f"{float(val):.2f}x"
    except (ValueError, TypeError):
        return "N/A"

def fmt_pct(val) -> str:
    if val is None:
        return "N/A"
    try:
        num = float(val)
        pct = num if abs(num) > 1.0 else num * 100
        sign = "+" if pct > 0 else ""
        return f"{sign}{pct:.2f}%"
    except (ValueError, TypeError):
        return "N/A"

def fmt_volume(val) -> str:
    if val is None:
        return "N/A"
    try:
        v = float(val)
        if v >= 1e9:
            return f"{v / 1e9:.2f}B"
        if v >= 1e6:
            return f"{v / 1e6:.2f}M"
        if v >= 1e3:
            return f"{v / 1e3:.1f}K"
        return f"{v:,.0f}"
    except (ValueError, TypeError):
        return "N/A"

def fmt_idr(val) -> str:
    if val is None:
        return "N/A"
    try:
        return f"{float(val):,.0f}"
    except (ValueError, TypeError):
        return "N/A"

def fmt_money(val) -> str:
    if val is None:
        return "—"
    try:
        num = float(val)
        abs_v = abs(num)
        sign = "-" if num < 0 else ""
        if abs_v >= 1e12:
            return f"{sign}Rp{(abs_v / 1e12):.1f}T"
        if abs_v >= 1e9:
            return f"{sign}Rp{(abs_v / 1e9):.1f}B"
        if abs_v >= 1e6:
            return f"{sign}Rp{(abs_v / 1e6):.1f}M"
        return f"{sign}Rp{abs_v:,.0f}"
    except (ValueError, TypeError):
        return "—"

def fmt_div_yield(val) -> str:
    if val is None:
        return "—"
    try:
        num = float(val)
        if num <= 0:
            return "0.00%"
        pct = num if abs(num) > 1.0 else num * 100
        return f"{pct:.2f}%"
    except (ValueError, TypeError):
        return "—"

def fmt_short_date(date_string: str) -> str:
    if not date_string:
        return ""
    try:
        parts = date_string.split(" - ")
        if len(parts) != 2:
            return date_string
        date_part = parts[0]
        time_part = parts[1].replace(" WIB", "")
        return f"{date_part} - {time_part}"
    except Exception:
        return date_string
