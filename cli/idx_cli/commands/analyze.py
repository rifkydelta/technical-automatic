"""Analyze command for single ticker technical analysis."""
import typer
from typing import Optional
from rich.console import Console
from idx_cli.api_client import APIClient, APIClientError
from idx_cli.renderers.header import render_header
from idx_cli.renderers.top_cards import render_top_cards
from idx_cli.renderers.support_resistance import render_support_resistance
from idx_cli.renderers.analysis import render_analysis
from idx_cli.renderers.scenarios import render_scenarios
from idx_cli.renderers.footer import render_footer
from idx_cli.renderers.disclaimer import render_disclaimer
from idx_cli.renderers.technical import render_technical
from idx_cli.renderers.financial import render_financial
from idx_cli.renderers.news import render_news
from idx_cli.renderers.chart_pattern import render_chart_patterns
from idx_cli.renderers.relt_signal import render_relt_signal

console = Console()
client = APIClient()

def analyze_cmd(
    ticker: str = typer.Argument(..., help="Stock ticker symbol (e.g. BBCA)"),
    mode: str = typer.Option("live", "--mode", "-m", help="Analysis mode: live, session_1, close_market"),
    tab: str = typer.Option("overview", "--tab", "-t", help="Sub-tab to view: overview, technical, financial, news, patterns, all"),
):
    """Run 1-Click Algorithmic Technical Analysis for a single ticker."""
    try:
        with console.status(f"[bold green]Scanning & Analyzing {ticker.upper()}...[/bold green]"):
            data = client.analyze_ticker(ticker, mode=mode)

        # Always render Header first
        console.print(render_header(data))

        t = tab.lower()
        if t in ["overview", "all"]:
            console.print(render_top_cards(data))
            console.print(render_relt_signal(data))
            console.print(render_support_resistance(data))
            console.print(render_analysis(data))
            console.print(render_scenarios(data))

        if t in ["technical", "all"]:
            console.print(render_technical(data))

        if t in ["financial", "all"]:
            console.print(render_financial(data))

        if t in ["patterns", "all"]:
            patterns = data.get("detected_patterns", [])
            console.print(render_chart_patterns(patterns, ticker.upper()))

        if t in ["news", "all"]:
            news_data = client.fetch_news(ticker, data.get("company_name"))
            console.print(render_news(news_data, ticker.upper()))

        # Always render Footer & Disclaimer
        console.print(render_footer(data))
        console.print(render_disclaimer())

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
