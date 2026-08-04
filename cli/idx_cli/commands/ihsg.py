"""IHSG command matching IHSGCard.js."""
import typer
import time
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from idx_cli.api_client import APIClient, APIClientError

console = Console()
client = APIClient()

def ihsg_cmd(
    watch: bool = typer.Option(False, "--watch", "-w", help="Auto-refresh IHSG every 5 seconds"),
):
    """Display real-time IHSG (Composite Index) status."""
    def display_once():
        ihsg = client.fetch_ihsg()
        price = ihsg.get("price", 0)
        chg = ihsg.get("change", 0)
        chg_pct = ihsg.get("change_pct", 0)
        ts = ihsg.get("timestamp", "")

        is_up = chg >= 0
        chg_color = "green" if is_up else "red"
        sign = "+" if is_up else ""

        t = Text()
        t.append("IHSG (COMPOSITE)\n", style="bold bright_white")
        t.append(f"{price:,.2f}  ", style="bold size=16 bright_white")
        t.append(f"{sign}{chg:,.2f} ({sign}{chg_pct:.2f}%)\n", style=f"bold {chg_color}")
        t.append(f"🕐 {ts}", style="grey50")

        console.clear()
        console.print(Panel(t, title="INDONESIA STOCK EXCHANGE", border_style=chg_color))

    try:
        if watch:
            while True:
                display_once()
                time.sleep(5)
        else:
            display_once()
    except KeyboardInterrupt:
        console.print("\n[grey70]IHSG monitor stopped.[/grey70]")
    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
