"""Detailed TXT Report Generator for IDX Analysis Export."""
from typing import Dict, Any, List, Optional
from idx_cli.utils.formatters import fmt_market_cap, fmt_ratio, fmt_pct, fmt_number, fmt_money, fmt_div_yield, fmt_volume

def generate_full_txt_report(data: Dict[str, Any], news_list: Optional[List[Dict[str, Any]]] = None) -> str:
    lines = []
    def line(text=""):
        lines.append(text)
    def header(title):
        line("=" * 80)
        line(f"  {title}")
        line("=" * 80)
    def subheader(title):
        line("-" * 80)
        line(f"▶ {title}")
        line("-" * 80)

    ticker = data.get("ticker", "N/A")
    company_name = data.get("company_name", "N/A")
    date_str = data.get("date", "N/A")
    last_price = data.get("last_price", 0)

    # Title Banner
    header(f"LAPORAN ANALISIS TEKNIKAL & VALUASI LENGKAP — {ticker} ({company_name})")
    line(f"Tanggal & Waktu Update : {date_str}")
    line(f"Harga Terakhir (Last)  : Rp {last_price:,.0f}")
    line(f"Sektor                 : {data.get('sector', 'N/A')}")
    line()

    # 1. SETUP SCORE & SIGNAL RECOMMENDATION
    subheader("1. RINGKASAN REKOMENDASI & SIGNAL OUTPUT")
    score = data.get("setup_score", {})
    line(f"Setup Score (0-100)    : {score.get('score', 0)} / 100 ({score.get('score_display', 'N/A')})")
    line(f"Rating                 : {score.get('rating', 'N/A')}")
    line(f"Rekomendasi (Signal)   : {data.get('recommendation', 'N/A')}")
    line(f"Alasan Sinyal          : {data.get('recommendation_reason', 'N/A')}")
    if score.get("details"):
        line("Detail Skor            :")
        for k, v in score.get("details", {}).items():
            line(f"  - {k}: {v}")
    line()

    # 2. PROFIL EMITEN & INFORMASI PERUSAHAAN
    profile = data.get("company_profile") or {}
    if profile:
        subheader("2. PROFIL EMITEN & INFORMASI PERUSAHAAN")
        line(f"Nama Perusahaan        : {profile.get('name', company_name)}")
        line(f"Sektor / Industri      : {profile.get('sector', 'N/A')} / {profile.get('industry', 'N/A')}")
        line(f"Alamat / Kota          : {profile.get('address', 'N/A')}, {profile.get('city', 'N/A')}")
        line(f"Situs Resmi            : {profile.get('website', 'N/A')}")
        line(f"Jumlah Karyawan        : {fmt_number(profile.get('employees'))}")
        line(f"Total Saham (Shares)   : {fmt_number(profile.get('shares_outstanding'))}")
        line(f"Free Float Shares      : {fmt_number(profile.get('float_shares'))}")
        line("\nDeskripsi Perusahaan:")
        line(f"  {profile.get('description', 'N/A')}")
        line()

    # 3. TREN & STRUKTUR PASAR (DAILY, 1H, 15M)
    subheader("3. TREN & STRUKTUR PASAR (MULTI TIMEFRAME)")
    trend = data.get("trend_analysis", {})
    ms = data.get("market_structure", {})
    mtf = data.get("multi_timeframe", {})

    line(f"Tren Utama (Daily)     : {trend.get('trend_besar', 'N/A')}")
    line(f"Alasan Tren            : {trend.get('reason', 'N/A')}")
    line(f"Market Structure       : {ms.get('structure', 'N/A')} ({ms.get('bias', 'N/A')})")
    line(f"Alignment Timeframe    : {mtf.get('alignment', 'N/A')}")
    line()
    line("Multi-Timeframe Breakdown:")
    line(f"  - Daily (1D)  : {mtf.get('daily', 'N/A')} — {mtf.get('daily_desc', '')}")
    line(f"  - 1 Hour (1H) : {mtf.get('h1', 'N/A')} — {mtf.get('h1_desc', '')}")
    line(f"  - 15 Min (15M): {mtf.get('m15', 'N/A')} — {mtf.get('m15_desc', '')}")
    line()

    # 4. INDIKATOR TEKNIKAL UTAMA
    subheader("4. INDIKATOR TEKNIKAL UTAMA")
    ind = data.get("indicators", {})
    line(f"EMA 20                 : {fmt_number(ind.get('ema20'))}")
    line(f"EMA 50                 : {fmt_number(ind.get('ema50'))}")
    line(f"EMA 200                : {fmt_number(ind.get('ema200'))}")
    line(f"RSI (14)               : {ind.get('rsi', 0):.2f}" if ind.get("rsi") else "RSI (14)               : N/A")
    line(f"Stochastic RSI         : {ind.get('stoch_rsi', 0):.2f}" if ind.get("stoch_rsi") else "Stochastic RSI         : N/A")
    line(f"MACD / Signal / Hist   : {ind.get('macd', 0):.2f} / {ind.get('macd_signal', 0):.2f} / {ind.get('macd_hist', 0):.2f}" if ind.get("macd") is not None else "MACD                   : N/A")
    line(f"ADX                    : {ind.get('adx', 0):.2f}" if ind.get("adx") else "ADX                    : N/A")
    line(f"ATR (14)               : {ind.get('atr', 0):.2f}" if ind.get("atr") else "ATR (14)               : N/A")
    line(f"VWAP                   : {fmt_number(ind.get('vwap'))}")
    line(f"Rata-rata Volume (20D) : {fmt_number(ind.get('avg_volume'))} Lot")
    line()

    # 5. SUPPORT & RESISTANCE ZONES
    subheader("5. AREA SUPPORT & RESISTANCE ZONES")
    sr = data.get("support_resistance", {})
    supports = sr.get("supports", [])
    resistances = sr.get("resistances", [])

    line("[SUPPORT ZONES]")
    if supports:
        for s in supports:
            line(f"  * {s.get('id', '')} | Zone: {s.get('zone', '')} | Strength: {s.get('strength', '')} | Score: {s.get('rating', 0)}/5")
            line(f"    Sebab/Konfluensi: {s.get('reason', '')}")
            if s.get("details"):
                line(f"    Detail Tag      : {s.get('details', '')}")
    else:
        line("  Tidak ada zona support terdeteksi.")

    line("\n[RESISTANCE ZONES]")
    if resistances:
        for r in resistances:
            line(f"  * {r.get('id', '')} | Zone: {r.get('zone', '')} | Strength: {r.get('strength', '')} | Score: {r.get('rating', 0)}/5")
            line(f"    Sebab/Konfluensi: {r.get('reason', '')}")
            if r.get("details"):
                line(f"    Detail Tag      : {r.get('details', '')}")
    else:
        line("  Tidak ada zona resistance terdeteksi.")
    line()

    # 6. ORDER FLOW & HAKA/HAKI ANALYSIS
    of = data.get("order_flow", {})
    if of:
        subheader("6. ANALISIS ORDER FLOW & AKUMULASI / DISTRIBUSI (HAKA/HAKI)")
        line(f"Status Order Flow      : {of.get('status', 'N/A')}")
        line(f"Deskripsi Status       : {of.get('status_desc', 'N/A')}")
        line(f"Dominasi Buy (HAKA)    : {of.get('buy_dominance_pct', 'N/A')}")
        line(f"Keterangan Dominasi    : {of.get('buy_dominance_desc', 'N/A')}")
        line(f"Kondisi HAKA/HAKI      : {of.get('haka_condition', 'N/A')}")
        line(f"Aktivitas Bandar       : {of.get('bandar_activity', 'N/A')}")
        line(f"Deskripsi Bandar       : {of.get('bandar_activity_desc', 'N/A')}")
        line(f"Area Transaksi Bandar  : {of.get('bandar_area', 'N/A')}")
        line()

    # 7. MARKET SCENARIOS OUTLOOK
    scenarios = data.get("scenarios", {})
    if scenarios:
        subheader("7. SKENARIO PROYEKSI PERGERAKAN HARGA (OUTLOOK)")
        for key, name in [("primary", "SKENARIO UTAMA"), ("alternative", "SKENARIO ALTERNATIF"), ("worst_case", "WORST CASE")]:
            sc = scenarios.get(key, {})
            if sc:
                line(f"[{name} — Probabilitas {sc.get('probability', 0)}%]")
                line(f"  Deskripsi : {sc.get('description', '')}")
                line(f"  Trigger   : {sc.get('trigger', '')}")
                line(f"  Target    : {sc.get('target', '')}")
                line()

    # 8. RISK & REWARD PLAN
    risk = data.get("risk_management", {})
    if risk:
        subheader("8. RENCANA MANAJEMEN RISIKO (RISK & REWARD PLAN)")
        line(f"Entry Zone             : {risk.get('entry_zone', 'N/A')}")
        line(f"Stop Loss (SL)         : Rp {round(risk.get('stop_loss', 0)):,.0f}" if risk.get("stop_loss") else "Stop Loss : N/A")
        line(f"Target Price 1 (R1)    : Rp {round(risk.get('target_1', 0)):,.0f}" if risk.get("target_1") else "Target 1  : N/A")
        line(f"Target Price 2 (R2)    : Rp {round(risk.get('target_2', 0)):,.0f}" if risk.get("target_2") else "Target 2  : N/A")
        line(f"Risk : Reward Ratio    : 1 : {risk.get('risk_reward_ratio', 'N/A')}")
        line(f"Status Setup Rejected  : {'YA (Ditolak karena R:R < 1:2)' if risk.get('is_rejected') else 'TIDAK (Setup Layak)'}")
        line()

    # 9. DETAILED TECHNICAL ANALYSIS SUB-VIEWS
    tech = data.get("technical_detail") or {}
    if tech:
        subheader("9. DETAIL ANALISIS TEKNIKAL (SUB-TAB SYSTEM)")

        # Trend sub-view
        tr = tech.get("trend", {})
        line("[ANALISIS TREN DETIL]")
        line(f"  Main Trend (EMA200)     : {tr.get('main_trend', 'N/A')}")
        line(f"  Short-term Trend (EMA20): {tr.get('short_term_trend', 'N/A')}")
        line(f"  Kekuatan ADX            : {tr.get('adx_status', 'N/A')}")

        # Momentum sub-view
        mo = tech.get("momentum", {})
        line("\n[ANALISIS MOMENTUM DETIL]")
        line(f"  Status RSI              : {mo.get('rsi_status', 'N/A')}")
        line(f"  Status Stochastic RSI   : {mo.get('stoch_rsi_status', 'N/A')}")
        line(f"  Status MACD             : {mo.get('macd_status', 'N/A')}")

        # Volatility sub-view
        vo = tech.get("volatility", {})
        line("\n[ANALISIS VOLATILITAS DETIL]")
        line(f"  Nilai ATR               : {vo.get('atr_value', 'N/A')}")
        line(f"  Status Bollinger Band   : {vo.get('bollinger_status', 'N/A')}")
        line(f"  Kondisi Volatilitas     : {vo.get('volatility_state', 'N/A')}")

        # Levels sub-view
        lv = tech.get("levels", {})
        if isinstance(lv, dict):
            line("\n[LEVEL-LEVEL HARGA KRUSIAL]")
            for k, v in lv.items():
                line(f"  {k}: {v}")

        # Strategy sub-view
        st = tech.get("strategies", {})
        if isinstance(st, dict):
            line("\n[REKOMENDASI STRATEGI & REKAYASA POSISI]")
            line(f"  Strategi Direkomendasikan: {st.get('recommended_strategy', 'N/A')}")
            line(f"  Position Sizing          : {st.get('position_size', 'N/A')}")
        line()

    # 10. VALUASI & KINERJA KEUANGAN (FINANCIALS)
    subheader("10. VALUASI METRICS & ANALISIS KEUANGAN")

    val = data.get("valuation") or {}
    line("[RINGKASAN VALUASI SAHAM]")
    line(f"  Market Cap             : {fmt_market_cap(val.get('market_cap'))}")
    line(f"  P/E Ratio (PER)        : {fmt_ratio(val.get('pe_ratio'))}")
    line(f"  P/B Ratio (PBV)        : {fmt_ratio(val.get('pb_ratio'))}")
    line(f"  P/S Ratio (PSR)        : {fmt_ratio(val.get('ps_ratio'))}")
    line(f"  Dividend Yield         : {fmt_pct(val.get('dividend_yield'))}")
    line()

    # Fair Value Analysis
    fv = data.get("fair_value_analysis") or {}
    if fv:
        line("[ANALISIS HARGA WAJAR / FAIR VALUE]")
        line(f"  Fair Value Rata-rata   : Rp {fv.get('fair_value_avg', 0):,.0f}" if fv.get("fair_value_avg") else "  Fair Value Avg : N/A")
        line(f"  Fair Value Min - Max   : Rp {fv.get('fair_value_min', 0):,.0f} - Rp {fv.get('fair_value_max', 0):,.0f}" if fv.get("fair_value_min") else "")
        line(f"  Potensi Upside/Downside: {fv.get('upside_pct', 0):+.1f}%")
        line(f"  Status Valuasi         : {fv.get('status', 'N/A')}")

        models = fv.get("models") or []
        if models:
            line("\n  Detail Model Valuasi:")
            for m in models:
                if isinstance(m, dict):
                    line(f"    - {m.get('name', 'Model')}: Rp {m.get('value', 0):,.0f} ({m.get('status', '')}) — {m.get('description', '')}")
        line()

    # Financial History Table
    financials = data.get("financials") or []
    if financials:
        line("[HISTORI KINERJA KEUANGAN TAHUNAN]")
        line(f"  {'Tahun':<8} {'Revenue':<18} {'Laba Bersih':<18} {'Net Margin':<12} {'EPS':<10}")
        line(f"  {'-'*66}")
        for f in financials:
            line(f"  {str(f.get('year', '')):<8} {str(f.get('revenue', '')):<18} {str(f.get('net_income', '')):<18} {str(f.get('net_margin', '')):<12} {str(f.get('eps', '')):<10}")
        line()

    # Growth & Health
    growth = data.get("growth_analysis") or {}
    health = data.get("financial_health") or {}
    if growth or health:
        line("[ANALISIS PERTUMBUHAN & KESEHATAN KEUANGAN]")
        if growth:
            line(f"  Revenue CAGR 3 Thn     : {fmt_pct(growth.get('revenue_cagr_3y_pct'))}")
            line(f"  Net Income CAGR 3 Thn  : {fmt_pct(growth.get('net_income_cagr_3y_pct'))}")
            line(f"  EPS Growth             : {fmt_pct(growth.get('eps_growth_pct'))}")
            line(f"  Ringkasan Pertumbuhan  : {growth.get('growth_summary', 'N/A')}")
        if health:
            line(f"  Status Kesehatan       : {health.get('health_status', 'N/A')}")
            line(f"  Debt to Equity (DER)   : {fmt_ratio(health.get('der'))}")
            line(f"  Return on Equity (ROE) : {fmt_pct(health.get('roe'))}")
        line()

    # Financial Analytics (Piotroski, Beneish, Outlook, Peers, Risk)
    fa = data.get("financials_analytics") or {}
    if fa:
        line("[FINANCIAL ANALYTICS DETAILED]")
        q = fa.get("quality") if isinstance(fa, dict) else getattr(fa, "quality", None)
        if q and isinstance(q, dict):
            line(f"  Piotroski F-Score      : {q.get('piotroski_f_score', 'N/A')}/9")
            line(f"  Beneish M-Score        : {q.get('beneish_m_score', 'N/A')} ({q.get('beneish_status', 'N/A')})")
            line(f"  Ringkasan Kualitas Laba: {q.get('summary_text', 'N/A')}")

        h_tab = fa.get("health") if isinstance(fa, dict) else getattr(fa, "health", None)
        if h_tab and isinstance(h_tab, dict):
            line(f"  Cash Score             : {h_tab.get('cash_score', 'N/A')}/5")
            line(f"  Interest Coverage      : {h_tab.get('interest_coverage', 'N/A')}")
            line(f"  Net Debt / EBITDA      : {h_tab.get('net_debt_ebitda', 'N/A')}")

        out = fa.get("outlook") if isinstance(fa, dict) else getattr(fa, "outlook", None)
        if out and isinstance(out, dict):
            line(f"\n  [PROYEKSI & OUTLOOK KONSENSUS]")
            line(f"  Forecast Revenue 2026F : {out.get('forecast_rev_2026f', 'N/A')}")
            line(f"  Forecast Revenue 2027F : {out.get('forecast_rev_2027f', 'N/A')}")
            line(f"  Estimasi EPS           : {out.get('eps_estimate', 'N/A')}")
            line(f"  Catatan Outlook        : {out.get('summary_text', 'N/A')}")
        line()

    # 11. DETECTED CHART & CANDLESTICK PATTERNS
    patterns = data.get("detected_patterns") or []
    subheader("11. POLA GRAFIK & CANDLESTICK TERDETEKSI")
    if patterns:
        for p in patterns:
            line(f"  * Pola          : {p.get('name', p.get('pattern_id', 'N/A'))}")
            line(f"    Tipe          : {p.get('type', 'N/A')}")
            line(f"    Status        : {p.get('status', 'N/A')}")
            line(f"    Neckline Level: Rp {p.get('neckline', 0):,.0f}" if p.get("neckline") else "    Neckline Level: N/A")
            line(f"    Target Price  : Rp {p.get('target', 0):,.0f}" if p.get("target") else "    Target Price  : N/A")
            line(f"    Key Confluence: {p.get('key_confluence', 'N/A')}")
            line()
    else:
        line("Tidak ada pola grafik mayor yang terdeteksi saat ini.")
        line()

    # 12. HISTORI CANDLESTICK OHLCV TERAKHIR
    daily_bars = data.get("ohlcv_daily") or []
    if daily_bars:
        subheader("12. HISTORI RINGKAS HARGA (5 BAR HARIAN TERAKHIR)")
        line(f"  {'Tanggal':<12} {'Open':<10} {'High':<10} {'Low':<10} {'Close':<10} {'Volume':<12}")
        line(f"  {'-'*66}")
        for b in daily_bars[-5:]:
            t_str = str(b.get("time", ""))
            line(f"  {t_str:<12} {b.get('open', 0):<10,.0f} {b.get('high', 0):<10,.0f} {b.get('low', 0):<10,.0f} {b.get('close', 0):<10,.0f} {fmt_volume(b.get('volume')):<12}")
        line()

    # 13. LATEST NEWS & CATALYSTS
    if news_list:
        subheader("13. BERITA TERBARU & KATALIS PASAR")
        for i, nw in enumerate(news_list[:10], start=1):
            line(f"  {i}. {nw.get('title', '')}")
            line(f"     Sumber : {nw.get('url', '')}")
            line(f"     Tanggal: {nw.get('date', 'N/A')}")
            line()

    # FOOTER & DISCLAIMER
    header("END OF REPORT — DISCLAIMER")
    line("Disclaimer: Laporan ini dihasilkan secara otomatis oleh sistem Algorithmic Technical")
    line("Analysis & Valuasi. Seluruh data bersifat edukasi dan sanjungan analisa teknikal/kuantitatif,")
    line("BUKAN rekomendasi mutlak untuk transaksi jual/beli saham. Harap lakukan riset mandiri (DYOR).")
    line("================================================================================")

    return "\n".join(lines)
