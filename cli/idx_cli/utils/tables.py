"""Rich table helper functions."""
from rich.table import Table
from rich.style import Style

def create_styled_table(title: str = "", columns: list[dict] = None) -> Table:
    table = Table(title=title, show_header=True, header_style="bold bright_white", border_style="grey30", pad_edge=False)
    if columns:
        for col in columns:
            table.add_column(
                col.get("name", ""),
                justify=col.get("justify", "left"),
                style=col.get("style", None),
                no_wrap=col.get("no_wrap", False)
            )
    return table
