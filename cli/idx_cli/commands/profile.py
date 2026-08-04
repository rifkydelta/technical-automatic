"""Profile command matching Header.js Company Profile Modal."""
import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from idx_cli.api_client import APIClient, APIClientError
from idx_cli.utils.formatters import fmt_market_cap, fmt_ratio, fmt_pct, fmt_number

console = Console()
client = APIClient()

def profile_cmd(
    ticker: str = typer.Argument(..., help="Stock ticker symbol (e.g. BBCA)"),
):
    """Display company profile, valuation, & statistics."""
    try:
        with console.status(f"[bold green]Fetching company profile for {ticker.upper()}...[/bold green]"):
            info = client.fetch_ticker_info(ticker)

        t = Text()
        name = info.get("name", ticker.upper())
        sector = info.get("sector", "Unknown")
        industry = info.get("industry", "Unknown")
        desc = info.get("description", "Deskripsi perusahaan tidak tersedia.")
        city = info.get("city", "N/A")
        website = info.get("website", "N/A")

        t.append(f"{ticker.upper()} — {name}\n", style="bold bright_white size=14")
        t.append(f"Sektor: {sector}  │  Industri: {industry}\n", style="bold green")
        t.append(f"Kantor Pusat: {city}  │  Website: {website}\n\n", style="grey70")

        t.append("=== TENTANG PERUSAHAAN ===\n", style="bold bright_blue")
        t.append(f"{desc}\n\n", style="bright_white")

        val = info.get("valuation") or {}
        t.append("=== VALUASI & STATISTIK SAHAM ===\n", style="bold bright_blue")
        t.append(f"Market Cap:   {fmt_market_cap(val.get('market_cap'))}\n", style="bright_white")
        t.append(f"P/E Ratio:    {fmt_ratio(val.get('pe_ratio'))}\n", style="bright_white")
        t.append(f"P/B Ratio:    {fmt_ratio(val.get('pb_ratio'))}\n", style="bright_white")
        t.append(f"Div Yield:    {fmt_pct(val.get('dividend_yield'))}\n", style="bright_white")
        if info.get("shares_outstanding"):
            t.append(f"Total Saham:  {fmt_number(info.get('shares_outstanding'))}\n", style="bright_white")

        console.print(Panel(t, title=f"🏢 EMITEN PROFILE — {ticker.upper()}", border_style="grey30"))

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
