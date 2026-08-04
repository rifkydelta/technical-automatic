"""TopCards renderer matching TopCards.js (bento grid)."""
from rich.table import Table
from idx_cli.utils.formatters import fmt_number, fmt_short_date
from idx_cli.utils.colors import get_bias_color

def render_top_cards(data: dict) -> Table:
    table = Table(show_header=True, header_style="bold bright_white", border_style="grey30", expand=True)
    table.add_column("SETUP SCORE", justify="center")
    table.add_column("CURRENT PRICE", justify="center")
    table.add_column("BIAS (DAILY)", justify="center")
    table.add_column("BREAK LEVEL", justify="center")
    table.add_column("INVALIDATION", justify="center")

    score = data.get("setup_score", {})
    trend = data.get("trend_analysis", {})
    sr = data.get("support_resistance", {})
    risk = data.get("risk_management", {})

    score_val = score.get("score_display", "N/A")
    rating = score.get("rating", "")

    price = data.get("last_price", 0)
    date_str = fmt_short_date(data.get("date", ""))

    bias = trend.get("trend_besar", "N/A")
    bias_color = get_bias_color(bias)
    reason = trend.get("reason", "")

    resistances = sr.get("resistances", [])
    break_lvl = resistances[0].get("zone", "N/A").split("-")[0] if resistances else "N/A"

    sl = risk.get("stop_loss")
    invalidation = f"{round(sl):,.0f}" if sl else "N/A"

    table.add_row(
        f"[bold bright_blue]{score_val}[/bold bright_blue]\n[grey70]{rating}[/grey70]",
        f"[bold bright_white]{price:,.0f}[/bold bright_white]\n[grey50]{date_str}[/grey50]",
        f"[bold {bias_color}]{bias}[/bold {bias_color}]\n[grey70]{reason}[/grey70]",
        f"[bold bright_white]{break_lvl}[/bold bright_white]\n[grey50]Confirmation Level[/grey50]",
        f"[bold red]{invalidation}[/bold red]\n[grey50]Below Support[/grey50]",
    )

    return table
