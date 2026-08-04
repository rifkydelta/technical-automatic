"""Styled Help & Prompt Cheat-Sheet Command."""
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

console = Console()

def help_cmd():
    """Display CLI commands cheat-sheet, prompts, & usage examples."""
    table = Table(show_header=True, header_style="bold bright_white", border_style="grey30", expand=True)
    table.add_column("PERINTAH (COMMAND)", style="bold green", width=22)
    table.add_column("CONTOH PROMPT / PENGGUNAAN", style="bold bright_white")
    table.add_column("DESKRIPSI", style="grey70")

    table.add_row(
        "idx analyze <TICKER>",
        "idx analyze BBCA\nidx analyze BBCA --tab technical\nidx analyze BBCA --tab financial",
        "Analisis 1-Click lengkap untuk 1 saham (Overview, Teknikal, Valuasi, Skenario, Sinyal)."
    )
    table.add_row(
        "idx screener <TICKERS>",
        "idx screener BBCA,BBRI,BMRI,BBNI\nidx screener BBCA,BBRI --min-score 60",
        "Pemindaian (screener) beberapa saham sekaligus dengan filter skor & tren."
    )
    table.add_row(
        "idx category [KEY]",
        "idx category\nidx category bank\nidx category bpjs\nidx category opening",
        "Screener otomatis per sektor (bank, bakrie, prajogo) atau strategi (bpjs, opening, bsjp)."
    )
    table.add_row(
        "idx ihsg [--watch]",
        "idx ihsg\nidx ihsg --watch",
        "Pantau indeks IHSG (Composite Index) secara real-time / auto-refresh."
    )
    table.add_row(
        "idx news <TICKER>",
        "idx news BBCA",
        "Tampilkan berita terbaru & katalis pasar untuk saham tertentu."
    )
    table.add_row(
        "idx profile <TICKER>",
        "idx profile BBCA",
        "Lihat profil emiten, sektor, industri, kantor pusat, deskripsi, & valuasi."
    )
    table.add_row(
        "idx export <TICKER>",
        "idx export BBCA --format txt\nidx export BBCA --format json",
        "Export laporan analisis sangat detail ke file teks (.txt) atau JSON."
    )

    t_opsi = Text()
    t_opsi.append("\n💡 PILIHAN OPTION & TAB TEKNIKAL:\n", style="bold yellow")
    t_opsi.append("  • Mode Analisis : ", style="bold bright_white")
    t_opsi.append("--mode live  │  --mode session_1  │  --mode close_market\n", style="green")
    t_opsi.append("  • Sub-Tab Filter: ", style="bold bright_white")
    t_opsi.append("--tab overview  │  --tab technical  │  --tab financial  │  --tab news  │  --tab patterns  │  --tab all\n", style="cyan")
    t_opsi.append("  • Format Export : ", style="bold bright_white")
    t_opsi.append("--format txt  │  --format json\n", style="magenta")

    console.print(Panel(table, title="📖 IDX CLI TERMINAL — PANDUAN PERINTAH & PROMPT", border_style="bright_blue"))
    console.print(t_opsi)
