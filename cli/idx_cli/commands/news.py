"""News command."""
import typer
from rich.console import Console
from idx_cli.api_client import APIClient, APIClientError
from idx_cli.renderers.news import render_news

console = Console()
client = APIClient()

def news_cmd(
    ticker: str = typer.Argument(..., help="Stock ticker symbol (e.g. BBCA)"),
):
    """Fetch latest market news & catalysts for a specific ticker."""
    try:
        with console.status(f"[bold green]Fetching news for {ticker.upper()}...[/bold green]"):
            news_list = client.fetch_news(ticker)

        console.print(render_news(news_list, ticker.upper()))

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
