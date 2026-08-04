"""Export command for exporting analysis to JSON/TXT."""
import typer
import json
from datetime import datetime
from rich.console import Console
from idx_cli.api_client import APIClient, APIClientError

console = Console()
client = APIClient()

from idx_cli.renderers.export_txt import generate_full_txt_report

def export_cmd(
    ticker: str = typer.Argument(..., help="Stock ticker symbol (e.g. BBCA)"),
    format_type: str = typer.Option("json", "--format", "-f", help="Export format: json or txt"),
    output: str = typer.Option(None, "--output", "-o", help="Optional output filepath"),
):
    """Export analysis data to a JSON or TXT file."""
    try:
        with console.status(f"[bold green]Fetching analysis & news for {ticker.upper()}...[/bold green]"):
            data = client.analyze_ticker(ticker)
            news_list = client.fetch_news(ticker, data.get("company_name"))

        date_suffix = datetime.now().strftime("%Y-%m-%d")
        fmt = format_type.lower()

        if not output:
            output = f"{ticker.upper()}_Analysis_{date_suffix}.{fmt}"

        if fmt == "json":
            # Also attach news to JSON dump if available
            if news_list:
                data["latest_news"] = news_list
            with open(output, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            report_content = generate_full_txt_report(data, news_list)
            with open(output, "w", encoding="utf-8") as f:
                f.write(report_content)

        console.print(f"[bold green]✓ Laporan sangat detail berhasil diekspor ke:[bold green] [bold white]{output}[/bold white]")

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
