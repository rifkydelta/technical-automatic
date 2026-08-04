"""IDX Technical Analysis & Screener CLI Terminal Main Entry Point."""
import sys
import typer
from rich.console import Console

# Reconfigure stdout/stderr for Unicode/emoji support on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from idx_cli.commands.analyze import analyze_cmd
from idx_cli.commands.screener import screener_cmd
from idx_cli.commands.category import category_cmd
from idx_cli.commands.news import news_cmd
from idx_cli.commands.ihsg import ihsg_cmd
from idx_cli.commands.profile import profile_cmd
from idx_cli.commands.export import export_cmd

app = typer.Typer(
    name="idx",
    help="IDX Technical Analysis & Screener CLI Terminal (Termux / Desktop)",
    add_completion=False,
)

# Register commands
app.command(name="analyze", help="Run 1-Click Algorithmic Technical Analysis for a single ticker")(analyze_cmd)
app.command(name="screener", help="Run Market Screener across multiple stock tickers")(screener_cmd)
app.command(name="category", help="Scan stocks by sector category or preset strategy")(category_cmd)
app.command(name="news", help="Fetch latest market news & catalysts for a ticker")(news_cmd)
app.command(name="ihsg", help="Display real-time IHSG (Composite Index) status")(ihsg_cmd)
app.command(name="profile", help="Display company profile, valuation, & statistics")(profile_cmd)
app.command(name="export", help="Export analysis data to JSON or TXT file")(export_cmd)

if __name__ == "__main__":
    app()
