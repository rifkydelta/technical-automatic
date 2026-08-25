"""RELT Signal & SMC Panel renderer for CLI."""
from rich.table import Table
from rich.panel import Panel
from rich.columns import Columns

def render_relt_signal(data: dict) -> Panel:
    relt = data.get("relt_signal")
    if not relt or not isinstance(relt, dict):
        return Panel("[grey50]No RELT Signal data available.[/grey50]", title="RELT SIGNAL PRO", border_style="grey30")

    action = relt.get("action", "WAIT")
    score = relt.get("score", 0)
    rating = relt.get("rating", "D Avoid")
    smc = relt.get("smc", {})
    st = relt.get("supertrend", {})
    setup = relt.get("trade_setup", {})
    pred = relt.get("direction_prediction", {})

    action_color = "bold green" if "BUY" in action else ("bold red" if "WARNING" in action else "yellow")
    score_color = "green" if score >= 70 else ("yellow" if score >= 50 else "red")

    # Main Grid Table
    grid = Table(show_header=False, border_style="grey30", expand=True, padding=(0, 1))
    grid.add_column("Section 1", ratio=1)
    grid.add_column("Section 2", ratio=1)

    # Left: Signal & Smart Money Matrix
    left_table = Table(show_header=False, border_style="none", expand=True)
    left_table.add_column("Key", style="grey70")
    left_table.add_column("Value", justify="right")

    left_table.add_row("Action", f"[{action_color}]{action}[/{action_color}]")
    left_table.add_row("Score / Grade", f"[{score_color}]{score}/100[/{score_color}] ({rating})")
    left_table.add_row("Supertrend", f"[{'green' if st.get('st_trend') == 'Bullish' else 'red'}]{st.get('st_trend', 'N/A')}[/{'green' if st.get('st_trend') == 'Bullish' else 'red'}]")
    left_table.add_row("Order Block (OB)", "[green]Bullish Active[/green]" if smc.get("bullish_ob_active") else "[grey50]Inactive[/grey50]")
    left_table.add_row("FVG Gap", "[green]Bullish Gap[/green]" if smc.get("bullish_fvg_active") else ("[red]Bearish Gap[/red]" if smc.get("bearish_fvg_active") else "[grey50]Clear[/grey50]"))
    left_table.add_row("Structure (BOS)", "[green]Bullish Break[/green]" if smc.get("bos_bull") else "[grey50]In Range[/grey50]")
    left_table.add_row("Liquidity Sweep", "[green]Low Sweep[/green]" if smc.get("liquidity_sweep_low") else "[grey50]Normal[/grey50]")

    # Right: Trade Setup & Lot Sizing
    right_table = Table(show_header=False, border_style="none", expand=True)
    right_table.add_column("Key", style="grey70")
    right_table.add_column("Value", justify="right")

    entry = setup.get("entry_price", 0)
    sl = setup.get("stop_loss", 0)
    tp1 = setup.get("tp1", 0)
    tp2 = setup.get("tp2", 0)
    lots = setup.get("recommended_lots", 0)
    cap = setup.get("estimated_capital_required", 0)
    risk_pct = setup.get("risk_percent", 0)

    pred_dir = pred.get("direction", "SIDEWAYS")
    pred_price = pred.get("predicted_price", 0)
    upside = pred.get("upside_pct", 0)

    right_table.add_row("Harga Entry", f"[bold white]{entry:,.0f}[/bold white]")
    right_table.add_row("Stop Loss (Adaptive)", f"[bold red]{sl:,.0f}[/bold red] (-{risk_pct}%)")
    right_table.add_row("Target TP1 (1.3R)", f"[bold green]{tp1:,.0f}[/bold green]")
    right_table.add_row("Target TP2 (2.0R)", f"[bold cyan]{tp2:,.0f}[/bold cyan]")
    right_table.add_row("Recommended Sizing", f"[bold green]{lots} Lot[/bold green] (Rp {cap:,.0f})")
    right_table.add_row("Forecast Arah", f"[{'green' if pred_dir == 'UP' else 'yellow'}]{pred_dir}[/{'green' if pred_dir == 'UP' else 'yellow'}] -> Rp {pred_price:,.0f} (+{upside}%)")

    grid.add_row(
        Panel(left_table, title="SMC & STATUS", border_style="grey30"),
        Panel(right_table, title="TRADE PLAN & LOT SIZER", border_style="grey30")
    )

    return Panel(grid, title=f"⚡ RELT SIGNAL PRO — {action} (Grade {rating})", border_style="bright_green" if "BUY" in action else "grey30")
