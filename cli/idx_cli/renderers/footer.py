"""FooterRow renderer matching FooterRow.js."""
from rich.table import Table
from rich.panel import Panel
from rich.columns import Columns
from rich.text import Text
from idx_cli.utils.formatters import fmt_market_cap, fmt_ratio, fmt_pct, fmt_number
from idx_cli.utils.colors import get_rec_color

def render_footer(data: dict) -> Columns:
    risk = data.get("risk_management", {})
    rec = data.get("recommendation", "N/A")
    rec_reason = data.get("recommendation_reason", "")
    rec_color = get_rec_color(rec)
    valuation = data.get("valuation") or {}

    # Left Side: Risk & Reward Plan
    rr_table = Table(show_header=True, header_style="bold bright_white", border_style="grey30", expand=True)
    rr_table.add_column("Entry Zone", justify="center", style="bold green")
    rr_table.add_column("Stop Loss", justify="center", style="bold red")
    rr_table.add_column("Target 1 (R1)", justify="center", style="bold bright_blue")
    rr_table.add_column("Target 2 (R2)", justify="center", style="bold bright_blue")
    rr_table.add_column("Risk:Reward", justify="center", style="bold green")

    entry_z = risk.get("entry_zone", "N/A")
    sl = risk.get("stop_loss")
    sl_str = f"{round(sl):,.0f}" if sl else "N/A"
    t1 = risk.get("target_1")
    t1_str = f"{round(t1):,.0f}" if t1 else "N/A"
    t2 = risk.get("target_2")
    t2_str = f"{round(t2):,.0f}" if t2 else "N/A"
    rr_ratio = risk.get("risk_reward_ratio", "N/A")

    rr_table.add_row(entry_z, sl_str, t1_str, t2_str, f"1 : {rr_ratio}")

    left_panel = Panel(rr_table, title="RISK & REWARD PLAN", border_style="grey30")

    # Right Side: Signal Output
    sig_text = Text()
    sig_text.append(f"\n   ★ ★ ★  {rec}  ★ ★ ★\n\n", style=f"bold {rec_color} size=16")
    sig_text.append(f"{rec_reason}\n\n", style="grey70")

    ohlcv_list = data.get("ohlcv_daily") or []
    if ohlcv_list and data.get("indicators", {}).get("avg_volume"):
        today_vol = ohlcv_list[-1].get("volume", 0)
        avg_vol = data.get("indicators", {}).get("avg_volume", 0)
        sig_text.append(f"Today's Vol: {today_vol // 100:,.0f} Lot  │  Avg Vol (20D): {avg_vol // 100:,.0f} Lot\n", style="grey50")

    right_panel = Panel(sig_text, title="SIGNAL OUTPUT", border_style=rec_color)

    return Columns([left_panel, right_panel], equal=True)
