"""TechnicalTab renderer matching backend TechnicalDetail schemas."""
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

def render_technical(data: dict) -> Panel:
    tech = data.get("technical_detail")
    if not tech:
        return Panel("Detail analisis teknikal tidak tersedia.", title="ANALISIS TEKNIKAL DETAILED", border_style="grey30")

    trend_view = tech.get("trend", {})
    momentum_view = tech.get("momentum", {})
    volatility_view = tech.get("volatility", {})
    levels_view = tech.get("levels", [])
    strategy_view = tech.get("strategies", [])

    t = Text()

    # 1. TREN
    grade = trend_view.get("grade", "C")
    t.append("=== 1. TREN ===\n", style="bold bright_blue")
    t.append(f"Main Trend (EMA200):       {trend_view.get('main_trend', 'N/A')}\n", style="bright_white")
    t.append(f"Short Term Trend (EMA20):  {trend_view.get('short_term_trend', 'N/A')}\n", style="bright_white")
    adx_val = trend_view.get('adx_value')
    adx_str = f"{adx_val:.2f}" if isinstance(adx_val, (int, float)) else "N/A"
    t.append(f"ADX Strength:              {trend_view.get('adx_status', 'N/A')} ({adx_str})\n", style="bright_white")
    t.append(f"Trend Grade:               Grade {grade}\n", style="bold yellow")
    if trend_view.get("main_reason"):
        t.append(f"Catatan Tren:              {trend_view.get('main_reason')}\n\n", style="grey70")
    else:
        t.append("\n")

    # 2. MOMENTUM
    rsi_val = momentum_view.get("rsi_value")
    rsi_str = f"{rsi_val:.2f}" if isinstance(rsi_val, (int, float)) else "N/A"
    stoch_val = momentum_view.get("stoch_rsi_value")
    stoch_str = f"{stoch_val:.2f}" if isinstance(stoch_val, (int, float)) else "N/A"
    mfi_val = momentum_view.get("mfi_value")
    mfi_str = f"{mfi_val:.2f}" if isinstance(mfi_val, (int, float)) else "N/A"

    t.append("=== 2. MOMENTUM ===\n", style="bold bright_blue")
    t.append(f"RSI Status:       {momentum_view.get('rsi_zone', 'N/A')} ({rsi_str})\n", style="bright_white")
    t.append(f"Stochastic RSI:   {momentum_view.get('stoch_rsi_zone', 'N/A')} ({stoch_str})\n", style="bright_white")
    t.append(f"MFI (Money Flow): {momentum_view.get('mfi_zone', 'N/A')} ({mfi_str})\n", style="bright_white")
    t.append(f"MACD Status:      {momentum_view.get('macd_cross', 'N/A')}\n\n", style="bright_white")

    # 3. VOLATILITAS
    atr_val = volatility_view.get("atr_value")
    atr_str = f"{atr_val:.2f}" if isinstance(atr_val, (int, float)) else "N/A"
    atr_pct = volatility_view.get("atr_pct")
    atr_pct_str = f"{atr_pct:.2f}%" if isinstance(atr_pct, (int, float)) else ""

    t.append("=== 3. VOLATILITAS ===\n", style="bold bright_blue")
    t.append(f"ATR Value:         {atr_str} ({atr_pct_str})\n", style="bright_white")
    t.append(f"Bollinger Status:  {volatility_view.get('bb_position', 'N/A')}\n", style="bright_white")
    t.append(f"Rezim Volatilitas: {volatility_view.get('atr_regime', 'N/A')}\n\n", style="bright_white")

    # 4. LEVEL HARGA
    t.append("=== 4. LEVEL HARGA ===\n", style="bold bright_blue")
    if isinstance(levels_view, list) and len(levels_view) > 0:
        for item in levels_view:
            lbl = item.get("label", "-")
            price = item.get("price", 0.0)
            strength = item.get("strength", "-")
            dist = item.get("distance_pct", 0.0)
            t.append(f"• {lbl:<8}: Rp{price:,.0f} (Jarak: {dist:+.1f}%) [{strength}]\n", style="bright_white")
        t.append("\n")
    else:
        t.append("Tidak ada level spesifik terdeteksi.\n\n", style="grey70")

    # 5. STRATEGI & POSITION SIZING
    t.append("=== 5. STRATEGI & POSITION SIZING ===\n", style="bold bright_blue")
    if isinstance(strategy_view, list) and len(strategy_view) > 0:
        for strat in strategy_view:
            tf = strat.get("timeframe", "Setup")
            s_type = strat.get("signal_type", "-").upper()
            e_low = strat.get("entry_low", 0.0)
            e_high = strat.get("entry_high", 0.0)
            sl = strat.get("stop_loss", 0.0)
            tp1 = strat.get("target_1", 0.0)
            rr = strat.get("risk_reward", 0.0)
            t.append(f"[{tf}] Signal: {s_type} | Entry: {e_low:,.0f}-{e_high:,.0f} | SL: {sl:,.0f} | TP1: {tp1:,.0f} (RR: {rr:.1f}x)\n", style="bright_white")
    else:
        t.append("Posisi berisiko tinggi / Tidak disarankan untuk entry saat ini.\n", style="yellow")

    return Panel(t, title=f"ANALISIS TEKNIKAL DETAILED — {data.get('ticker')}", border_style="grey30")
