"""TechnicalTab renderer matching TechnicalTab.js and sub-views."""
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from idx_cli.utils.formatters import fmt_number

def render_technical(data: dict) -> Panel:
    tech = data.get("technical_detail")
    if not tech:
        return Panel("Detail analisis teknikal tidak tersedia.", title="ANALISIS TEKNIKAL DETAILED", border_style="grey30")

    trend_view = tech.get("trend", {})
    momentum_view = tech.get("momentum", {})
    volatility_view = tech.get("volatility", {})
    levels_view = tech.get("levels", {})
    strategy_view = tech.get("strategies", {})

    t = Text()
    t.append("=== 1. TREN ===\n", style="bold bright_blue")
    t.append(f"Main Trend (EMA200):       {trend_view.get('main_trend', 'N/A')}\n", style="bright_white")
    t.append(f"Short Term Trend (EMA20):  {trend_view.get('short_term_trend', 'N/A')}\n", style="bright_white")
    t.append(f"ADX Strength:              {trend_view.get('adx_status', 'N/A')}\n\n", style="grey70")

    t.append("=== 2. MOMENTUM ===\n", style="bold bright_blue")
    t.append(f"RSI Status:       {momentum_view.get('rsi_status', 'N/A')}\n", style="bright_white")
    t.append(f"Stochastic RSI:   {momentum_view.get('stoch_rsi_status', 'N/A')}\n", style="bright_white")
    t.append(f"MACD Status:      {momentum_view.get('macd_status', 'N/A')}\n\n", style="grey70")

    t.append("=== 3. VOLATILITAS ===\n", style="bold bright_blue")
    t.append(f"ATR Value:         {volatility_view.get('atr_value', 'N/A')}\n", style="bright_white")
    t.append(f"Bollinger Status:  {volatility_view.get('bollinger_status', 'N/A')}\n", style="bright_white")
    t.append(f"Volatilitas:       {volatility_view.get('volatility_state', 'N/A')}\n\n", style="grey70")

    t.append("=== 4. LEVEL HARGA ===\n", style="bold bright_blue")
    if isinstance(levels_view, dict):
        for k, v in levels_view.items():
            if isinstance(v, (str, int, float)):
                t.append(f"{k}: {v}  ", style="bright_white")
        t.append("\n\n")

    t.append("=== 5. STRATEGI & POSITION SIZING ===\n", style="bold bright_blue")
    if isinstance(strategy_view, dict):
        t.append(f"Rekomendasi Strategi: {strategy_view.get('recommended_strategy', 'N/A')}\n", style="bold green")
        t.append(f"Position Sizing:       {strategy_view.get('position_size', 'N/A')}\n", style="bright_white")

    return Panel(t, title=f"ANALISIS TEKNIKAL DETAILED — {data.get('ticker')}", border_style="grey30")
