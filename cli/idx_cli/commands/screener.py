"""Screener command for multi-ticker analysis."""
import typer
from rich.console import Console
from idx_cli.api_client import APIClient, APIClientError
from idx_cli.renderers.screener import render_screener

console = Console()
client = APIClient()

def screener_cmd(
    tickers_str: str = typer.Argument(..., help="Comma-separated stock tickers (e.g. BBCA,BBRI,BMRI)"),
    mode: str = typer.Option("live", "--mode", "-m", help="Analysis mode: live, session_1, close_market"),
    min_score: int = typer.Option(0, "--min-score", help="Filter by minimum score (0-100)"),
):
    """Run Market Screener across multiple stock tickers."""
    tickers = [t.strip() for t in tickers_str.split(",") if t.strip()]
    if not tickers:
        console.print("[red]Minimal masukan 1 ticker.[/red]")
        raise typer.Exit(code=1)

    try:
        with console.status(f"[bold green]Scanning {len(tickers)} tickers across market...[/bold green]"):
            res = client.screen_tickers(tickers, mode=mode)

        results = res.get("data", [])
        if min_score > 0:
            results = [r for r in results if r.get("score", 0) >= min_score]

        console.print(render_screener(results, title=f"MARKET SCREENER — {len(tickers)} TICKERS"))

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
