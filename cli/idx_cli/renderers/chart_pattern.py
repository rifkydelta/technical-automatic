"""ChartPattern renderer matching ChartPatternTab.js (detected patterns)."""
from rich.table import Table
from rich.panel import Panel
from typing import List, Dict, Any

def render_chart_patterns(patterns: List[Dict[str, Any]], ticker: str) -> Panel:
    if not patterns:
        return Panel("Tidak ada pola grafik yang terdeteksi saat ini.", title=f"DETECTED CHART PATTERNS — {ticker}", border_style="grey30")

    table = Table(show_header=True, header_style="bold bright_blue", border_style="grey30", expand=True)
    table.add_column("PATTERN", style="bold bright_white")
    table.add_column("TYPE", justify="center")
    table.add_column("STATUS", justify="center")
    table.add_column("NECKLINE", justify="right")
    table.add_column("TARGET", justify="right")

    for p in patterns:
        name = p.get("name", p.get("pattern_id", "N/A"))
        p_type = p.get("type", "N/A")
        status = p.get("status", "N/A")
        neck = p.get("neckline")
        target = p.get("target")

        table.add_row(
            name,
            f"[green]{p_type}[/green]" if "Bullish" in p_type else f"[red]{p_type}[/red]",
            f"[bold green]{status}[/bold green]" if status == "Confirmed" else f"[yellow]{status}[/yellow]",
            f"{neck:,.0f}" if isinstance(neck, (int, float)) else "N/A",
            f"{target:,.0f}" if isinstance(target, (int, float)) else "N/A"
        )

    return Panel(table, title=f"🔍 DETECTED CHART PATTERNS — {ticker}", border_style="bright_blue")
