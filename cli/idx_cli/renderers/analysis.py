"""AnalysisCards renderer matching AnalysisCards.js (4 sections)."""
from rich.table import Table
from rich.panel import Panel
from rich.columns import Columns
from idx_cli.utils.formatters import fmt_number
from idx_cli.utils.colors import get_bias_color

def render_analysis(data: dict) -> Columns:
    trend = data.get("trend_analysis", {})
    indicators = data.get("indicators", {})
    mtf = data.get("multi_timeframe", {})
    order_flow = data.get("order_flow", {})
    ms = data.get("market_structure", {})
    price = data.get("last_price", 0)

    # 1. Trend Overview
    t_table = Table(show_header=False, border_style="grey30", expand=True)
    t_table.add_column("Key", style="grey70")
    t_table.add_column("Value", justify="right")

    tb = trend.get("trend_besar", "N/A")
    tb_color = get_bias_color(tb)
    t_table.add_row("Trend Besar", f"[bold {tb_color}]{tb}[/bold {tb_color}]")

    ema200 = indicators.get("ema200") or 0
    pos_str = "Above EMA200" if price > ema200 else "Below EMA200"
    t_table.add_row("Price Position", pos_str)

    t_table.add_row("EMA20", fmt_number(indicators.get("ema20")))
    t_table.add_row("EMA50", fmt_number(indicators.get("ema50")))
    t_table.add_row("EMA200", fmt_number(indicators.get("ema200")))

    struct_str = ms.get("structure", "N/A").split(" ")[0] if isinstance(ms, dict) else "N/A"
    t_table.add_row("Structure", f"[green]{struct_str}[/green]")

    adx_val = indicators.get("adx")
    adx_str = f"{adx_val:.1f}" if adx_val else "N/A"
    t_table.add_row("ADX (Daily)", adx_str)

    # 2. Multi Timeframe
    mtf_table = Table(show_header=False, border_style="grey30", expand=True)
    mtf_table.add_column("TF", style="grey70", width=10)
    mtf_table.add_column("Trend & Desc")

    d_trend = mtf.get("daily", "N/A")
    d_color = get_bias_color(d_trend)
    mtf_table.add_row("Daily (1D)", f"[bold {d_color}]{d_trend}[/bold {d_color}]\n[grey50]{mtf.get('daily_desc', '')}[/grey50]")

    h1_trend = mtf.get("h1", "N/A")
    h1_color = get_bias_color(h1_trend)
    mtf_table.add_row("1 Hour (1H)", f"[bold {h1_color}]{h1_trend}[/bold {h1_color}]\n[grey50]{mtf.get('h1_desc', '')}[/grey50]")

    m15_trend = mtf.get("m15", "N/A")
    m15_color = get_bias_color(m15_trend)
    mtf_table.add_row("15 Min (15M)", f"[bold {m15_color}]{m15_trend}[/bold {m15_color}]\n[grey50]{mtf.get('m15_desc', '')}[/grey50]")

    align = mtf.get("alignment", "N/A")
    align_color = "bright_white" if align == "Confirmed" else "yellow"
    mtf_table.add_row("Alignment", f"[bold {align_color}]{align}[/bold {align_color}]")

    # 3. Momentum & Indicators
    m_table = Table(show_header=False, border_style="grey30", expand=True)
    m_table.add_column("Indicator", style="grey70")
    m_table.add_column("Value", justify="center")
    m_table.add_column("State", justify="right")

    rsi = indicators.get("rsi")
    m_table.add_row("RSI (Daily)", f"{rsi:.1f}" if rsi else "N/A", "Neutral")

    stoch = indicators.get("stoch_rsi")
    m_table.add_row("Stoch RSI", f"{stoch:.1f}" if stoch else "N/A", "[green]Cross ↑[/green]")

    macd = indicators.get("macd")
    macd_sig = indicators.get("macd_signal")
    macd_text = "Golden Cross" if (macd and macd_sig and macd > macd_sig) else "Death Cross"
    m_table.add_row("MACD (1D)", macd_text, "[green]Bullish[/green]" if macd_text == "Golden Cross" else "[red]Bearish[/red]")

    m_table.add_row("Volume", "1.45x", "[green]Above Avg[/green]")

    atr = indicators.get("atr")
    m_table.add_row("ATR (14)", f"{atr:.1f}" if atr else "N/A", "Normal")

    vwap = indicators.get("vwap")
    m_table.add_row("VWAP", fmt_number(vwap) if vwap else "N/A", "[green]Above[/green]")

    p1 = Panel(t_table, title="TREND OVERVIEW", border_style="grey30")
    p2 = Panel(mtf_table, title="MULTI TIMEFRAME", border_style="grey30")
    p3 = Panel(m_table, title="MOMENTUM & INDICATORS", border_style="grey30")

    panels = [p1, p2, p3]

    # 4. Order Flow (if present)
    if order_flow and isinstance(order_flow, dict):
        of_table = Table(show_header=False, border_style="grey30", expand=True)
        of_table.add_column("Metric", style="grey70")
        of_table.add_column("Detail")

        of_table.add_row("Status", f"[bold green]{order_flow.get('status', 'N/A')}[/bold green]\n[grey50]{order_flow.get('status_desc', '')}[/grey50]")
        of_table.add_row("Buy Dominance", f"[bold bright_white]{order_flow.get('buy_dominance_pct', 'N/A')}[/bold bright_white]\n[grey50]{order_flow.get('buy_dominance_desc', '')}[/grey50]")
        of_table.add_row("Bandar Activity", f"[bold bright_blue]{order_flow.get('bandar_activity', 'N/A')}[/bold bright_blue]\n[grey50]{order_flow.get('bandar_activity_desc', '')}[/grey50]")
        of_table.add_row("Area Transaksi", f"[bold bright_white]{order_flow.get('bandar_area', 'N/A')}[/bold bright_white]")

        p4 = Panel(of_table, title="ORDER FLOW & HAKA/HAKI", border_style="grey30")
        panels.append(p4)

    return Columns(panels, equal=True)
