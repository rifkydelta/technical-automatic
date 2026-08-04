"""Header renderer matching Header.js."""
from rich.panel import Panel
from rich.text import Text
from rich.columns import Columns
from idx_cli.utils.formatters import fmt_short_date, fmt_number, fmt_volume
from idx_cli.utils.colors import get_rec_color

def render_header(data: dict) -> Panel:
    ticker = data.get("ticker", "N/A")
    company_name = data.get("company_name", "N/A")
    sector = data.get("sector", "UNKNOWN")
    date_str = fmt_short_date(data.get("date", ""))
    last_price = data.get("last_price", 0)

    score_info = data.get("setup_score", {})
    score_display = score_info.get("score_display", "N/A")
    rec = data.get("recommendation", "N/A")
    rec_color = get_rec_color(rec)

    # OHLCV bar
    ohlcv_list = data.get("ohlcv_daily") or []
    ohlcv_str = ""
    if ohlcv_list:
        last_bar = ohlcv_list[-1]
        o = fmt_number(last_bar.get("open"))
        h = fmt_number(last_bar.get("high"))
        l = fmt_number(last_bar.get("low"))
        c = fmt_number(last_bar.get("close"))
        vol = fmt_volume(last_bar.get("volume"))
        close_val = last_bar.get("close", 0)
        open_val = last_bar.get("open", 0)
        c_color = "green" if close_val > open_val else ("red" if close_val < open_val else "white")
        ohlcv_str = f"O: [white]{o}[/white]  H: [white]{h}[/white]  L: [white]{l}[/white]  C: [{c_color}]{c}[/{c_color}]  Vol: [white]{vol}[/white]"

    title_text = Text()
    title_text.append("TECHNICAL ANALYSIS ", style="bold green")
    title_text.append("│ powered by ", style="grey50")
    title_text.append("@rifkydelta\n", style="bold green")

    body_text = Text()
    body_text.append(f"{ticker} ", style="bold bright_white size=16")
    body_text.append(f"{company_name} - IDX ", style="grey70")
    body_text.append(f"[{sector}]\n", style="bold green")

    if ohlcv_str:
        body_text.append_text(Text.from_markup(f"{ohlcv_str}\n"))

    body_text.append(f"\nPRICE: ", style="grey50")
    body_text.append(f"{last_price:,.0f} ", style="bold bright_white")
    body_text.append(f"({date_str})  │  ", style="grey50")
    body_text.append(f"SCORE: ", style="grey50")
    body_text.append(f"{score_display}  │  ", style="bold bright_blue")
    body_text.append(f"OUTLOOK: ", style="grey50")
    body_text.append(f"{rec}", style=f"bold {rec_color}")

    return Panel(
        body_text,
        title=title_text,
        border_style="grey30",
        padding=(1, 2)
    )
