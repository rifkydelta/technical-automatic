"""Screener renderer matching ScreenerCard.js & DashboardScreener.js."""
from rich.table import Table
from rich.panel import Panel
from typing import List, Dict, Any
from idx_cli.utils.formatters import fmt_idr, fmt_volume, fmt_pct
from idx_cli.utils.colors import get_rec_color, get_bias_color

def render_screener(results: List[Dict[str, Any]], title: str = "MARKET SCREENER RESULTS") -> Panel:
    if not results:
        return Panel("Tidak ada hasil pemindaian.", title=title, border_style="grey30")

    table = Table(show_header=True, header_style="bold bright_white", border_style="grey30", expand=True)
    table.add_column("#", justify="center", width=4)
    table.add_column("TICKER", style="bold bright_white", width=8)
    table.add_column("PRICE", justify="right", width=10)
    table.add_column("CHANGE", justify="right", width=10)
    table.add_column("VOLUME", justify="right", width=10)
    table.add_column("TREND", justify="center", width=12)
    table.add_column("SCORE", justify="center", width=10)
    table.add_column("RECOMMENDATION", justify="center")

    for i, r in enumerate(results, start=1):
        ticker = r.get("ticker", "N/A")
        price = r.get("last_price", 0)
        chg = r.get("change_pct", 0)
        chg_color = "green" if chg > 0 else ("red" if chg < 0 else "white")
        vol = fmt_volume(r.get("volume", 0))
        trend = r.get("trend", "N/A")
        t_color = get_bias_color(trend)
        score_disp = r.get("score_display", "N/A")
        rec = r.get("recommendation", "N/A")
        r_color = get_rec_color(rec)

        table.add_row(
            str(i),
            ticker,
            f"{price:,.0f}",
            f"[{chg_color}]{chg:+.2f}%[/{chg_color}]",
            vol,
            f"[{t_color}]{trend}[/{t_color}]",
            f"[bold bright_blue]{score_disp}[/bold bright_blue]",
            f"[bold {r_color}]{rec}[/bold {r_color}]"
        )

    return Panel(table, title=f"📊 {title} ({len(results)} TICKERS)", border_style="grey30")
