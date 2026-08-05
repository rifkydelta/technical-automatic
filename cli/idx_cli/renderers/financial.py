"""FinancialTab renderer displaying Fair Value, Annual Financials Table, Health & Growth Metrics."""
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from idx_cli.utils.formatters import fmt_market_cap, fmt_ratio

def render_financial(data: dict) -> Panel:
    ticker = data.get("ticker", "N/A")
    price = data.get("last_price", 0.0)
    fair_value = data.get("fair_value_analysis") or {}
    growth = data.get("growth_analysis") or {}
    health = data.get("financial_health") or {}
    analytics = data.get("financials_analytics") or {}
    valuation = data.get("valuation") or {}
    financials = data.get("financials") or []

    t = Text()

    # 1. VALUASI & FAIR VALUE
    t.append("=== 1. VALUASI & FAIR VALUE ===\n", style="bold bright_blue")
    t.append(f"Current Price:           Rp {price:,.0f}\n", style="bright_white")
    
    consolidated_fv = fair_value.get("consolidated_fair_value")
    overall_status = fair_value.get("overall_status", "N/A")
    mos = fair_value.get("margin_of_safety_pct", 0.0)

    if consolidated_fv:
        t.append(f"Consolidated Fair Value: Rp {consolidated_fv:,.0f}  ", style="bold green")
        t.append(f"(Margin of Safety: {mos:+.1f}%)  ", style="bold bright_yellow")
        t.append(f"[{overall_status}]\n", style="bold cyan")
    
    t.append(f"P/E: {fmt_ratio(valuation.get('pe_ratio'))}  |  PBV: {fmt_ratio(valuation.get('pb_ratio'))}  |  Market Cap: {fmt_market_cap(valuation.get('market_cap'))}\n\n", style="grey70")

    # Models sub-table
    models = fair_value.get("models", [])
    if models:
        t.append("Model Valuasi:\n", style="bold yellow")
        for m in models:
            m_name = m.get("name", "-")
            m_fv = m.get("fair_value", 0.0)
            m_up = m.get("upside_pct", 0.0)
            m_stat = m.get("status", "-")
            t.append(f"  • {m_name:<24}: Rp{m_fv:,.0f} (Upside: {m_up:+.1f}%) [{m_stat}]\n", style="bright_white")
        t.append("\n")

    # 2. KINERJA KEUANGAN TAHUNAN
    t.append("=== 2. KINERJA KEUANGAN TAHUNAN ===\n", style="bold bright_blue")
    if financials:
        for f in financials:
            yr = f.get("year", "-")
            rev = f.get("revenue", "-")
            ni = f.get("net_income", "-")
            margin = f.get("net_margin", "-")
            eps = f.get("eps", "-")
            dps = f.get("dps", "-")
            t.append(f"• Tahun {yr:<4} | Rev: {rev:<10} | Net Profit: {ni:<10} | Margin: {margin:<6} | EPS: {eps:<8} | DPS: {dps}\n", style="bright_white")
        t.append("\n")
    else:
        t.append("Data laporan keuangan tahunan belum tersedia.\n\n", style="grey70")

    # 3. KESEHATAN KEUANGAN & PERTUMBUHAN
    t.append("=== 3. KESEHATAN & PERTUMBUHAN ===\n", style="bold bright_blue")
    roe = health.get("roe")
    roa = health.get("roa")
    der = health.get("der")
    cr = health.get("current_ratio")

    roe_str = f"{roe:.1f}%" if isinstance(roe, (int, float)) else "N/A"
    roa_str = f"{roa:.1f}%" if isinstance(roa, (int, float)) else "N/A"
    der_str = f"{der:.2f}x" if isinstance(der, (int, float)) else "N/A"
    cr_str = f"{cr:.2f}x" if isinstance(cr, (int, float)) else "N/A"

    t.append(f"Rasio Profitabilitas : ROE: {roe_str}  |  ROA: {roa_str}\n", style="bright_white")
    t.append(f"Rasio Solvabilitas   : DER: {der_str}  |  Current Ratio: {cr_str}\n", style="bright_white")
    t.append(f"Status Kesehatan     : {health.get('health_status', 'N/A')}\n", style="bright_white")

    rev_cagr = growth.get("revenue_cagr_3y_pct")
    ni_cagr = growth.get("net_income_cagr_3y_pct")
    rev_cagr_str = f"{rev_cagr:+.1f}%" if isinstance(rev_cagr, (int, float)) else "N/A"
    ni_cagr_str = f"{ni_cagr:+.1f}%" if isinstance(ni_cagr, (int, float)) else "N/A"
    t.append(f"Pertumbuhan 3Y CAGR  : Revenue: {rev_cagr_str}  |  Net Income: {ni_cagr_str} ({growth.get('growth_status', 'N/A')})\n\n", style="bright_white")

    # 4. KUALITAS LABA & SKOR
    t.append("=== 4. KUALITAS LABA & ANALYTICS ===\n", style="bold bright_blue")
    quality = {}
    if isinstance(analytics, dict):
        quality = analytics.get("quality", {})
    
    f_score = quality.get("piotroski_f_score") if isinstance(quality, dict) else None
    m_score = quality.get("beneish_m_score") if isinstance(quality, dict) else None
    m_status = quality.get("beneish_status") if isinstance(quality, dict) else None

    t.append(f"Piotroski F-Score:    {f_score if f_score is not None else 'N/A'}/9\n", style="bold green")
    t.append(f"Beneish M-Score:      {m_score if m_score is not None else 'N/A'} ({m_status if m_status else 'N/A'})\n", style="bright_white")

    return Panel(t, title=f"FINANCIAL & VALUATION ANALYSIS — {ticker}", border_style="grey30")
