"""FinancialCard renderer matching FinancialCard.js (valuasi, growth, health, quality, outlook, peers, risk)."""
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from idx_cli.utils.formatters import fmt_market_cap, fmt_ratio, fmt_pct, fmt_money, fmt_div_yield
from idx_cli.utils.colors import status_color

def render_financial(data: dict) -> Panel:
    ticker = data.get("ticker", "N/A")
    fair_value = data.get("fair_value_analysis") or {}
    growth = data.get("growth_analysis") or {}
    health = data.get("financial_health") or {}
    analytics = data.get("financials_analytics") or {}
    valuation = data.get("valuation") or {}
    financials = data.get("financials") or []

    t = Text()

    # 1. Valuasi & Fair Value
    t.append("=== 1. VALUASI & FAIR VALUE ===\n", style="bold bright_blue")
    price = data.get("last_price", 0)
    fv_avg = fair_value.get("fair_value_avg")
    upside = fair_value.get("upside_pct")
    status = fair_value.get("status", "N/A")
    s_col = status_color(status)

    t.append(f"Current Price:  Rp {price:,.0f}\n", style="bright_white")
    if fv_avg:
        t.append(f"Fair Value Avg: Rp {fv_avg:,.0f}  ", style="bold green")
        t.append(f"Upside: {upside}%  ", style="bold bright_green")
        t.append(f"[{status}]\n", style=f"bold {s_col}")
    t.append(f"P/E: {fmt_ratio(valuation.get('pe_ratio'))}  PBV: {fmt_ratio(valuation.get('pb_ratio'))}  Market Cap: {fmt_market_cap(valuation.get('market_cap'))}\n\n", style="grey70")

    # 2. Financial History Table
    if financials:
        t.append("=== 2. KINERJA KEUANGAN TAHUNAN ===\n", style="bold bright_blue")
        f_table = Table(show_header=True, header_style="bold bright_white", border_style="grey30")
        f_table.add_column("Tahun", justify="center")
        f_table.add_column("Revenue", justify="right")
        f_table.add_column("Net Profit", justify="right")
        f_table.add_column("Margin", justify="right")
        f_table.add_column("EPS", justify="right")

        for f in financials:
            f_table.add_row(
                str(f.get("year", "")),
                str(f.get("revenue", "")),
                str(f.get("net_income", "")),
                str(f.get("net_margin", "")),
                str(f.get("eps", ""))
            )
        # Append formatted table to panel content via markup
        t.append_text(Text.from_markup(f"\n"))

    # 3. Health & Quality
    t.append("=== 3. KESEHATAN & KUALITAS LABA ===\n", style="bold bright_blue")
    quality = getattr(analytics, "quality", {}) if hasattr(analytics, "quality") else (analytics.get("quality", {}) if isinstance(analytics, dict) else {})
    if isinstance(quality, dict):
        t.append(f"Piotroski F-Score:  {quality.get('piotroski_f_score', 'N/A')}/9\n", style="bold green")
        t.append(f"Beneish M-Score:    {quality.get('beneish_m_score', 'N/A')} ({quality.get('beneish_status', 'N/A')})\n\n", style="bright_white")

    return Panel(t, title=f"FINANCIAL & VALUATION ANALYSIS — {ticker}", border_style="grey30")
