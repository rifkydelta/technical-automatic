"""Category preset hub command matching CategoryPresetHub.js."""
import typer
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from idx_cli.api_client import APIClient, APIClientError
from idx_cli.renderers.screener import render_screener

console = Console()
client = APIClient()

CATEGORIES = {
    "bank": {
        "label": "Sektor Bank (Big & Mid Bank)",
        "tickers": ["BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "BBTN", "BDMN", "NISP", "PNBN", "ARTO"],
        "is_custom": False,
    },
    "bakrie": {
        "label": "Bakrie Group",
        "tickers": ["BUMI", "BRMS", "ENRG", "DEWA", "VKTR", "UNSP", "BNBR", "VIVA", "MDIA"],
        "is_custom": False,
    },
    "prajogo": {
        "label": "Prajogo Pangestu (Barito Group)",
        "tickers": ["BRPT", "TPIA", "BREN", "CUAN", "PTRO", "CGAS"],
        "is_custom": False,
    },
    "bpjs": {
        "label": "BPJS Daytrade (09.05 - 09.20)",
        "screener_id": "bpjs_daytrade",
        "is_custom": True,
    },
    "opening": {
        "label": "OPENING Strategy (08.58)",
        "screener_id": "opening_0858",
        "is_custom": True,
    },
    "bsjp": {
        "label": "BSJP Strategy (Beli Sore Jual Pagi)",
        "screener_id": "bsjp_1530",
        "is_custom": True,
    },
}

def category_cmd(
    name: Optional[str] = typer.Argument(None, help="Category name: bank, bakrie, prajogo, bpjs, opening, bsjp"),
    mode: str = typer.Option("live", "--mode", "-m", help="Analysis mode: live, session_1, close_market"),
):
    """Scan stocks by category or algorithm strategy."""
    if not name:
        # Render categories overview table
        table = Table(show_header=True, header_style="bold bright_blue", border_style="grey30", expand=True)
        table.add_column("KEY", style="bold bright_white", width=12)
        table.add_column("CATEGORY / STRATEGY NAME", style="bright_white")
        table.add_column("TYPE", justify="center", width=15)

        for key, cat in CATEGORIES.items():
            cat_type = "Custom Preset" if cat["is_custom"] else f"{len(cat.get('tickers', []))} Tickers"
            table.add_row(key, cat["label"], cat_type)

        console.print(Panel(table, title="📂 CATEGORY & PRESET STRATEGY HUB", border_style="grey30"))
        console.print("\n[grey70]Gunakan [bold white]idx category <key>[/bold white] untuk menjalankan pemindaian.[/grey70]")
        return

    key = name.lower()
    if key not in CATEGORIES:
        console.print(f"[red]Kategori '{name}' tidak valid. Pilihan: {', '.join(CATEGORIES.keys())}[/red]")
        raise typer.Exit(code=1)

    cat_info = CATEGORIES[key]
    try:
        if cat_info["is_custom"]:
            with console.status(f"[bold green]Running Full Market Scan: {cat_info['label']}...[/bold green]"):
                res = client.custom_screener(screener_id=cat_info["screener_id"], mode=mode)
        else:
            tickers = cat_info["tickers"]
            with console.status(f"[bold green]Scanning Category {cat_info['label']} ({len(tickers)} tickers)...[/bold green]"):
                res = client.screen_tickers(tickers, mode=mode)

        results = res.get("data", [])
        console.print(render_screener(results, title=f"CATEGORY SCREENER — {cat_info['label'].upper()}"))

    except APIClientError as e:
        console.print(f"[bold red]Error:[bold red] {str(e)}")
        raise typer.Exit(code=1)
