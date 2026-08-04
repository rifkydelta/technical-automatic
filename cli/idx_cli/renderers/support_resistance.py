"""SupportResistance renderer matching SupportResistance.js."""
from rich.table import Table
from rich.panel import Panel
from rich.columns import Columns
from rich.text import Text

def render_support_resistance(data: dict) -> Columns:
    sr = data.get("support_resistance", {})
    supports = sr.get("supports", [])
    resistances = sr.get("resistances", [])

    # Supports table
    sup_table = Table(show_header=True, header_style="bold green", border_style="grey30", expand=True)
    sup_table.add_column("ID", style="bold green", width=6)
    sup_table.add_column("ZONE", style="bold bright_white")
    sup_table.add_column("STRENGTH", style="green")
    sup_table.add_column("SCORE", style="bold green")

    for s in supports:
        rating_dots = "●" * s.get("rating", 0) + "○" * (5 - s.get("rating", 0))
        sup_table.add_row(
            s.get("id", ""),
            s.get("zone", ""),
            s.get("strength", ""),
            rating_dots
        )
        if s.get("details"):
            sup_table.add_row("", f"[grey50]{s.get('details')}[/grey50]", "", "")

    # Resistances table
    res_table = Table(show_header=True, header_style="bold red", border_style="grey30", expand=True)
    res_table.add_column("ID", style="bold red", width=6)
    res_table.add_column("ZONE", style="bold bright_white")
    res_table.add_column("STRENGTH", style="red")
    res_table.add_column("SCORE", style="bold red")

    for r in resistances:
        rating_dots = "●" * r.get("rating", 0) + "○" * (5 - r.get("rating", 0))
        res_table.add_row(
            r.get("id", ""),
            r.get("zone", ""),
            r.get("strength", ""),
            rating_dots
        )
        if r.get("details"):
            res_table.add_row("", f"[grey50]{r.get('details')}[/grey50]", "", "")

    sup_panel = Panel(sup_table, title="🛡 SUPPORT ZONES", border_style="green")
    res_panel = Panel(res_table, title="🔺 RESISTANCE ZONES", border_style="red")

    return Columns([sup_panel, res_panel], equal=True)
