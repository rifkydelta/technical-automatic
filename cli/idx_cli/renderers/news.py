"""News renderer matching NewsCard.js."""
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from typing import List, Dict, Any

def render_news(news_list: List[Dict[str, Any]], ticker: str) -> Panel:
    if not news_list:
        return Panel("Tidak ada berita terbaru ditemui di sitemap.", title=f"LATEST NEWS & CATALYSTS — {ticker}", border_style="grey30")

    table = Table(show_header=True, header_style="bold bright_blue", border_style="grey30", expand=True)
    table.add_column("#", width=4, justify="center")
    table.add_column("TITLE & SOURCE", style="bright_white")
    table.add_column("DATE", style="grey50", justify="right", width=15)

    for i, item in enumerate(news_list[:10], start=1):
        title = item.get("title", "")
        url = item.get("url", "")
        date = item.get("date", "")
        domain = ""
        if url:
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")
            except Exception:
                pass

        table.add_row(
            str(i),
            f"[bold bright_white]{title}[/bold bright_white]\n[grey50]{domain}[/grey50] · [blue]{url}[/blue]",
            date
        )

    return Panel(table, title=f"📰 LATEST NEWS & CATALYSTS — {ticker}", border_style="bright_blue")
