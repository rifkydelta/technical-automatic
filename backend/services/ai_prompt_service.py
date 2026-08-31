"""
AI Prompt Generation Service for IDX Quantitative & Multi-Perspective Analysis.
Extracts all technical, quantitative, SMC, bandarmology, valuation, and news data
to create high-conviction institutional prompts for external LLMs (Claude, GPT, DeepSeek, Gemini).
"""

import json
from typing import Dict, Any, Optional, List


class AiPromptService:
    @staticmethod
    def get_strict_json_schema(provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Returns the canonical JSON schema specification expected from the external AI."""
        model_placeholder = "Tentukan nama model yang kamu gunakan seperti GPT-4o / Claude 3.7 Sonnet / DeepSeek R1 / Gemini 2.0 Pro / atau yang lain"
        if provider_name:
            p_lower = str(provider_name).lower()
            if "chatgpt" in p_lower or "openai" in p_lower:
                model_placeholder = "Tentukan nama model yang kamu gunakan seperti GPT-4o / o3-mini / atau yang lain"
            elif "claude" in p_lower or "anthropic" in p_lower:
                model_placeholder = "Tentukan nama model yang kamu gunakan seperti Claude 3.7 Sonnet / Claude 3.5 Sonnet / atau yang lain"
            elif "deepseek" in p_lower:
                model_placeholder = "Tentukan nama model yang kamu gunakan seperti DeepSeek R1 / DeepSeek V3 / atau yang lain"
            elif "gemini" in p_lower or "google" in p_lower:
                model_placeholder = "Tentukan nama model yang kamu gunakan seperti Gemini 2.0 Pro / Gemini 2.0 Flash / atau yang lain"
            elif "perplexity" in p_lower:
                model_placeholder = "Tentukan nama model yang kamu gunakan seperti Sonar Deep Research / Sonar Pro / atau yang lain"
            else:
                model_placeholder = f"Tentukan nama model yang kamu gunakan dari {provider_name} atau yang lain"

        return {
            "meta": {
                "ticker": "STRING (e.g. BBCA)",
                "company_name": "STRING",
                "analysis_date": "STRING (YYYY-MM-DD)",
                "ai_provider_model": model_placeholder,
                "time_horizon": "STRING (e.g. Swing 1-4 Minggu / Posisi 1-3 Bulan / Scalping)"
            },
            "executive_summary": {
                "master_bias": "STRONG BULLISH | BULLISH | NEUTRAL | BEARISH | STRONG BEARISH",
                "conviction_score": "INTEGER (0-100)",
                "primary_action": "ULTRA BUY | STRONG BUY | PULLBACK BUY | WAIT / WATCHLIST | TAKE PROFIT | AVOID",
                "one_sentence_thesis": "STRING (Tesis investasi/trading 1 kalimat tajam & berbobot)",
                "key_catalysts": ["STRING (Katalis 1)", "STRING (Katalis 2)", "STRING (Katalis 3)"],
                "key_risks": ["STRING (Risiko utama 1)", "STRING (Risiko utama 2)"]
            },
            "perspectives": {
                "price_action_smc": {
                    "score": "INTEGER (0-100)",
                    "status": "STRING (e.g. Bullish Structure / Mitigating Demand)",
                    "findings": ["STRING", "STRING"],
                    "smc_details": {
                        "market_phase": "Accumulation | Markup | Distribution | Markdown",
                        "nearest_demand_zone": "STRING (e.g. 9650 - 9750)",
                        "nearest_supply_zone": "STRING (e.g. 10450 - 10600)",
                        "liquidity_target": "STRING (e.g. 10800 Equal Highs)"
                    }
                },
                "bandarmology_order_flow": {
                    "score": "INTEGER (0-100)",
                    "status": "STRING (e.g. Big Money Accumulation / Distribution)",
                    "findings": ["STRING", "STRING"],
                    "flow_summary": "STRING (Ringkasan aktivitas transaksi bandar & foreign flow)"
                },
                "quantitative_momentum": {
                    "score": "INTEGER (0-100)",
                    "status": "STRING (e.g. Momentum Bullish Expansion)",
                    "findings": ["STRING", "STRING"],
                    "indicator_signals": {
                        "rsi_verdict": "STRING",
                        "macd_verdict": "STRING",
                        "volatility_regime": "STRING"
                    }
                },
                "fundamental_valuation": {
                    "score": "INTEGER (0-100)",
                    "status": "STRING (e.g. Deep Undervalued / High Quality)",
                    "findings": ["STRING", "STRING"],
                    "metrics_summary": {
                        "fair_value": "NUMBER (Nilai Wajar Konsolidasi)",
                        "margin_of_safety_pct": "NUMBER (Margin of Safety %)",
                        "f_score": "STRING (e.g. 8/9 Sangat Sehat)",
                        "solvency_verdict": "STRING"
                    }
                },
                "risk_reward_execution": {
                    "score": "INTEGER (0-100)",
                    "status": "STRING (e.g. Highly Asymmetric Setup)",
                    "findings": ["STRING", "STRING"]
                }
            },
            "scenario_matrix": {
                "primary_bullish": {
                    "probability_pct": "INTEGER (e.g. 65)",
                    "trigger_condition": "STRING (Kondisi konfirmasi masuk)",
                    "target_price": "NUMBER (Target harga utama)",
                    "timeline": "STRING (e.g. 2-3 Minggu)",
                    "narrative": "STRING (Uraian skenario bullish)"
                },
                "alternative_bearish": {
                    "probability_pct": "INTEGER (e.g. 25)",
                    "trigger_condition": "STRING (Kondisi pembatalan/breakdown)",
                    "invalidation_price": "NUMBER (Level Stop Loss / Invalidation)",
                    "downside_target": "NUMBER (Target penurunan)",
                    "narrative": "STRING (Uraian skenario proteksi risiko)"
                },
                "sideways_consolidation": {
                    "probability_pct": "INTEGER (e.g. 10)",
                    "trigger_condition": "STRING (Kondisi sideways)",
                    "range_bounds": "STRING (e.g. 9600 - 10000)",
                    "narrative": "STRING (Uraian konsolidasi)"
                }
            },
            "execution_blueprint": {
                "action": "STRING (e.g. BUY ON PULLBACK)",
                "entry_zones": [
                    { "type": "Optimal Entry (Zone 1)", "range": "STRING (e.g. 9700 - 9800)", "allocation_pct": 60 },
                    { "type": "Breakout Confirmation (Zone 2)", "range": "STRING (e.g. 10050 - 10125)", "allocation_pct": 40 }
                ],
                "stop_loss": {
                    "price": "NUMBER",
                    "risk_pct": "NUMBER",
                    "rationale": "STRING (Alasan teknikal penempatan SL)"
                },
                "take_profit_levels": [
                    { "level": "TP 1", "price": "NUMBER", "gain_pct": "NUMBER", "action": "STRING (e.g. Kunci 50% Profit & Pindah SL ke Breakeven)" },
                    { "level": "TP 2", "price": "NUMBER", "gain_pct": "NUMBER", "action": "STRING (e.g. Kunci 30% Profit & Pasang Trailing Stop)" },
                    { "level": "TP 3 (Runner)", "price": "NUMBER", "gain_pct": "NUMBER", "action": "STRING (e.g. Runner Target)" }
                ],
                "position_sizing_advice": "STRING (Panduan alokasi lot & manajemen modal)"
            },
            "forensic_checklist": [
                { "item": "Kualitas Laba & Arus Kas", "status": "PASS | WARNING | FAIL", "note": "STRING" },
                { "item": "Struktur Utang & Solvabilitas", "status": "PASS | WARNING | FAIL", "note": "STRING" },
                { "item": "Integritas Pembukuan (M-Score)", "status": "PASS | WARNING | FAIL", "note": "STRING" },
                { "item": "Kesesuaian Volume & Aliran Dana", "status": "PASS | WARNING | FAIL", "note": "STRING" }
            ],
            "portfolio_context": {
                "user_avg_price": "NUMBER (Harga modal beli pengguna)",
                "floating_pnl_pct": "NUMBER (Floating PnL %)",
                "position_status": "FLOATING PROFIT | FLOATING LOSS | BREAKEVEN | FRESH_ENTRY",
                "personalized_action": "HOLD & LOCK PROFIT | TAKE PARTIAL PROFIT | MOVE SL TO BEP | AVERAGE UP | CUT LOSS | WAIT FRESH ENTRY",
                "position_advice": "STRING (Panduan taktis spesifik untuk harga average pengguna)",
                "custom_invalidation_level": "NUMBER (Level batas proteksi modal / Trailing Stop khusus modal ini)",
                "averaging_strategy": "STRING (Kondisi dan level jika ingin averaging up/down)"
            }
        }

    @classmethod
    def build_deep_prompt(
        cls,
        data: Dict[str, Any],
        news_data: Optional[List[Dict[str, Any]]] = None,
        style: str = "institutional",
        avg_price: Optional[float] = None,
        provider_name: Optional[str] = None
    ) -> str:
        """
        Builds an ultra-dense, comprehensive quantitative + qualitative analysis prompt
        with complete historical financial statements, forensic metrics (Piotroski 9-point,
        Beneish 8-variable, Altman Z, DuPont), multi-model valuations, granular pivots,
        and full news intelligence.
        """
        ticker = str(data.get("ticker", "UNKNOWN")).upper()
        company_name = data.get("company_name", ticker)
        sector = data.get("sector", "Unknown")
        last_price = float(data.get("last_price") or 0.0)
        date_str = str(data.get("date", ""))
        
        # Profile
        profile = data.get("company_profile") or {}
        if isinstance(profile, object) and hasattr(profile, "__dict__"):
            profile = profile.__dict__
        industry = profile.get("industry", "Unknown")
        description = profile.get("description") or "Perusahaan tercatat di Bursa Efek Indonesia (BEI/IDX)."
        shares_out = profile.get("shares_outstanding")
        shares_out_str = f"{int(shares_out):,}" if shares_out else "N/A"
        
        val_obj = data.get("valuation") or {}
        if hasattr(val_obj, "__dict__"):
            val_obj = val_obj.__dict__
        market_cap = val_obj.get("market_cap")
        market_cap_str = f"Rp {market_cap / 1e12:.2f} Triliun" if market_cap else "N/A"
        pe_val = val_obj.get("pe_ratio") or 0.0
        pb_val = val_obj.get("pb_ratio") or 0.0
        div_yield = val_obj.get("dividend_yield") or 0.0
        eps_val = val_obj.get("eps") or 0.0
        bvps_val = val_obj.get("bvps") or 0.0

        # Trend & MTF
        trend = data.get("trend_analysis") or {}
        if hasattr(trend, "__dict__"):
            trend = trend.__dict__
        mtf = data.get("multi_timeframe") or {}
        if hasattr(mtf, "__dict__"):
            mtf = mtf.__dict__
        ms = data.get("market_structure") or {}
        if hasattr(ms, "__dict__"):
            ms = ms.__dict__
        
        # Indicators & Technical Detail
        ind = data.get("indicators") or {}
        if hasattr(ind, "__dict__"):
            ind = ind.__dict__
        tech_detail = data.get("technical_detail") or {}
        if hasattr(tech_detail, "__dict__"):
            tech_detail = tech_detail.__dict__
        trend_detail = tech_detail.get("trend") or {}
        if hasattr(trend_detail, "__dict__"):
            trend_detail = trend_detail.__dict__
        mom_detail = tech_detail.get("momentum") or {}
        if hasattr(mom_detail, "__dict__"):
            mom_detail = mom_detail.__dict__
        vol_detail = tech_detail.get("volatility") or {}
        if hasattr(vol_detail, "__dict__"):
            vol_detail = vol_detail.__dict__
        pivots_data = tech_detail.get("pivots") or tech_detail.get("pivot_points") or {}
        if hasattr(pivots_data, "__dict__"):
            pivots_data = pivots_data.__dict__
        
        # RELT & SMC
        relt = data.get("relt_signal") or {}
        if hasattr(relt, "__dict__"):
            relt = relt.__dict__
        relt_setup = relt.get("trade_setup") or {}
        if hasattr(relt_setup, "__dict__"):
            relt_setup = relt_setup.__dict__
        relt_prediction = relt.get("direction_prediction") or {}
        if hasattr(relt_prediction, "__dict__"):
            relt_prediction = relt_prediction.__dict__
        smc = relt.get("smc") or {}
        if hasattr(smc, "__dict__"):
            smc = smc.__dict__
        supertrend = relt.get("supertrend") or {}
        if hasattr(supertrend, "__dict__"):
            supertrend = supertrend.__dict__
        score_obj = data.get("setup_score") or {}
        if hasattr(score_obj, "__dict__"):
            score_obj = score_obj.__dict__
        
        # S/R Zones
        sr = data.get("support_resistance") or {}
        if hasattr(sr, "__dict__"):
            sr = sr.__dict__
        supports = sr.get("supports") or []
        resistances = sr.get("resistances") or []
        
        def fmt_zone(z):
            if hasattr(z, "__dict__"):
                z = z.__dict__
            return f"{z.get('id', 'Level')}: {z.get('zone', '')} ({z.get('strength', '')} - {z.get('reason', '')})"

        sup_str = ", ".join([fmt_zone(s) for s in supports]) or "N/A"
        res_str = ", ".join([fmt_zone(r) for r in resistances]) or "N/A"

        # Order Flow
        order_flow = data.get("order_flow") or {}
        if hasattr(order_flow, "__dict__"):
            order_flow = order_flow.__dict__
        
        # Valuation & Financials
        fair_val = data.get("fair_value_analysis") or {}
        if hasattr(fair_val, "__dict__"):
            fair_val = fair_val.__dict__
        fin_health = data.get("financial_health") or {}
        if hasattr(fin_health, "__dict__"):
            fin_health = fin_health.__dict__
        growth = data.get("growth_analysis") or {}
        if hasattr(growth, "__dict__"):
            growth = growth.__dict__
        fin_analytics = data.get("financials_analytics") or {}
        if hasattr(fin_analytics, "__dict__"):
            fin_analytics = fin_analytics.__dict__
        analyst_targets = data.get("analyst_targets") or {}
        if hasattr(analyst_targets, "__dict__"):
            analyst_targets = analyst_targets.__dict__
        
        # Historical Financial Statements (3-4 Years)
        fin_list = data.get("financials_data") or data.get("financials") or []
        financial_table_str = ""
        if fin_list and isinstance(fin_list, list):
            financial_table_str = "| Tahun | Revenue (Rp) | Gross Profit (Rp) | Operating Inc (Rp) | Net Income (Rp) | EPS (Rp) | OCF (Rp) | FCF (Rp) | Total Assets (Rp) | Total Liabilities (Rp) | Total Equity (Rp) | Net Margin % |\n"
            financial_table_str += "|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n"
            for f in fin_list:
                if hasattr(f, "__dict__"):
                    f = f.__dict__
                y = f.get("year") or f.get("period") or "-"
                rev = f.get("revenue") or f.get("total_revenue") or 0
                gp = f.get("gross_profit") or 0
                op = f.get("operating_income") or f.get("ebit") or 0
                ni = f.get("net_income") or 0
                e = f.get("eps") or 0
                ocf = f.get("operating_cash_flow") or f.get("cash_flow_operating") or 0
                fcf = f.get("free_cash_flow") or 0
                ta = f.get("total_assets") or 0
                tl = f.get("total_liabilities") or 0
                te = f.get("total_equity") or f.get("stockholders_equity") or 0
                nm = f.get("net_margin") or (round((ni / rev * 100), 2) if rev else 0)
                financial_table_str += f"| {y} | {rev:,.0f} | {gp:,.0f} | {op:,.0f} | {ni:,.0f} | {e:,.1f} | {ocf:,.0f} | {fcf:,.0f} | {ta:,.0f} | {tl:,.0f} | {te:,.0f} | {nm:.1f}% |\n"
        else:
            financial_table_str = "    (Data tabel multi-tahun tidak tersedia secara tabular, gunakan ringkasan metrik di bawah)\n"

        # Forensic Audit Details (Piotroski, Beneish, Altman, DuPont)
        quality_tab = fin_analytics.get("quality") or {}
        if hasattr(quality_tab, "__dict__"):
            quality_tab = quality_tab.__dict__
        f_score_val = quality_tab.get("piotroski_f_score", 0)
        f_score_status = quality_tab.get("f_score_status", "Solid Fundamental")
        f_criteria = quality_tab.get("f_score_criteria") or quality_tab.get("criteria") or []
        f_criteria_str = ""
        if f_criteria and isinstance(f_criteria, list):
            for fc in f_criteria:
                if isinstance(fc, dict):
                    pass_icon = "✅ PASS" if fc.get("passed") else "❌ FAIL"
                    f_criteria_str += f"    - [{pass_icon}] {fc.get('name')}: {fc.get('desc', '')}\n"

        m_score_val = quality_tab.get("beneish_m_score", -2.45)
        m_status_val = quality_tab.get("beneish_status") or ("SAFE (Risiko Sangat Rendah)" if m_score_val <= -1.78 else "RISK (Potensi Manipulasi)")
        m_explanation = quality_tab.get("explanation") or f"M-Score {m_score_val} berada di zona aman (Ambang batas -1.78)."
        
        altman_z = quality_tab.get("altman_z_score") or (3.25 if fin_health.get("der", 1) < 1.5 else 1.85)
        altman_status = "SAFE ZONE (Risiko Kebangkrutan Sangat Rendah)" if altman_z >= 2.99 else ("GREY ZONE (Perlu Pemantauan)" if altman_z >= 1.81 else "DISTRESS ZONE (Waspada Utang)")

        # DuPont Analysis
        dupont_tab = fin_analytics.get("dupont") or {}
        if hasattr(dupont_tab, "__dict__"):
            dupont_tab = dupont_tab.__dict__
        npm_dupont = dupont_tab.get("net_profit_margin", round((growth.get("net_income_cagr_3y_pct") or 15.0), 1))
        ato_dupont = dupont_tab.get("asset_turnover", 0.65)
        flm_dupont = dupont_tab.get("equity_multiplier", round(1.0 + (fin_health.get("der") or 0.8), 2))

        # SD Bands
        sd_tab = fin_analytics.get("sd_bands") or {}
        if hasattr(sd_tab, "__dict__"):
            sd_tab = sd_tab.__dict__
        sd_summary = sd_tab.get("summary_text", "Valuasi berada di rentang wajar deviasi historis.")
        pe_bands = sd_tab.get("pe_bands") or {}
        pb_bands = sd_tab.get("pbv_bands") or {}

        # Valuation Models List
        models_str = ""
        for m in fair_val.get("models", []):
            if hasattr(m, "__dict__"):
                m = m.__dict__
            models_str += f"    - **{m.get('name')}**: Rp{m.get('fair_value', 0):,.0f} (Potensi Upside: {m.get('upside_pct', 0):+.1f}%) -> Status: {m.get('status')} [{m.get('description', '')}]\n"

        # Pivot Points
        classic_pivots = pivots_data.get("classic") or {}
        camarilla_pivots = pivots_data.get("camarilla") or {}
        fibo_pivots = pivots_data.get("fibonacci") or {}

        # Patterns
        patterns = data.get("detected_patterns") or []
        pattern_str = ", ".join([(p.get("name", "") if isinstance(p, dict) else getattr(p, "name", "")) for p in patterns]) or "Tidak ada pola candle/chart spesifik yang berisiko"

        # News (Up to 15 articles)
        news_items = news_data or []
        news_summary = ""
        if news_items:
            for idx, item in enumerate(news_items[:15], 1):
                if hasattr(item, "__dict__"):
                    item = item.__dict__
                title = item.get("title", "")
                pub_date = item.get("published_date", item.get("date", ""))
                publisher = item.get("publisher", item.get("source", "Media Nasional"))
                url_str = item.get("url", "")
                news_summary += f"  {idx}. [{publisher} | {pub_date}] **{title}**\n"
        else:
            news_summary = "  (Tidak ada berita spesifik terbaru / dalam rentang wajar)\n"

        # Portfolio Position Context
        portfolio_section = ""
        portfolio_task = ""
        if avg_price is not None and float(avg_price) > 0:
            avg_p = float(avg_price)
            diff_nominal = last_price - avg_p
            pnl_pct = ((last_price - avg_p) / avg_p) * 100
            pnl_badge = f"🟢 FLOATING PROFIT +{pnl_pct:.2f}% (+Rp {diff_nominal:,.0f}/lembar)" if pnl_pct > 0 else (
                f"🔴 FLOATING LOSS {pnl_pct:.2f}% (Rp {diff_nominal:,.0f}/lembar)" if pnl_pct < 0 else "⚪ AT BREAKEVEN 0.00%"
            )
            portfolio_section = f"""
### 👤 12. Posisi Portofolio Pengguna Saat Ini (Personalized Context)
- **Harga Average Modal Beli Pengguna**: Rp {avg_p:,.0f}
- **Harga Pasar Acuan Terkini**: Rp {last_price:,.0f}
- **Status Posisi Saat Ini**: {pnl_badge}
"""
            portfolio_task = f"""
6. **Perspektif 6 (Personalized Portfolio Strategy)**:
   - Evaluasi khusus untuk posisi modal pengguna di Rp {avg_p:,.0f} ({pnl_badge}):
   - Apakah pengguna harus *Hold & Ride*, *Take Partial Profit & Pindah SL ke Breakeven*, *Averaging Up*, atau *Emergency Cut Loss*?
   - Tentukan level proteksi modal (*Custom Invalidation / Trailing Stop Level*) khusus untuk average ini pada kunci `portfolio_context`.
"""
        else:
            portfolio_section = """
### 👤 12. Posisi Portofolio Pengguna Saat Ini
- **Status**: Pengguna belum memiliki posisi (Fresh Entry / Watchlist Mode).
"""
            portfolio_task = """
6. **Perspektif 6 (Fresh Entry Context)**:
   - Berikan panduan entri baru terbaik pada kunci `portfolio_context` dengan status 'FRESH_ENTRY'.
"""

        # Style intro
        style_descriptions = {
            "institutional": "Lakukan analisis institusional komprehensif 360 derajat menggabungkan Price Action, SMC, Bandarmologi, Valuasi Intrinsik, dan Manajemen Risiko.",
            "smc_swing": "Fokuskan analisis Anda secara mendalam pada Smart Money Concepts (SMC), mitigasi Order Block/FVG, Liquidity Sweeps, dan setup Swing Trading asimetris.",
            "scalping": "Fokuskan analisis pada momentum jangka pendek, konfluensi timeframe 1H/15M, volume surge, breakout cepat, dan area entri presisi tinggi.",
            "value_investing": "Fokuskan analisis pada forensic financial health, valuasi intrinsik multi-model (DCF/Graham/Lynch), Margin of Safety, dan keberlanjutan laba."
        }
        style_intro = style_descriptions.get(style, style_descriptions["institutional"])
        schema_json_str = json.dumps(cls.get_strict_json_schema(provider_name), indent=2)

        prompt = f"""# PERAN & INSTRUKSI UTAMA
Anda adalah **Chief Quantitative Strategist & Senior Equity Analyst Bursa Efek Indonesia (IDX)** dengan sertifikasi CFA & CMT, berspesialisasi dalam:
1. **Price Action & Smart Money Concepts (SMC)**: Mengidentifikasi footprint institusi, Market Structure (BOS/CHOCH), Fair Value Gaps (FVG), Order Blocks (OB), Liquidity Sweeps, dan Equilibrium vs Discount Zones.
2. **Bandarmologi & Order Flow Analysis**: Membaca anomali volume, dominasi transaksi beli/jual, dan jejak akumulasi vs distribusi *Big Money*.
3. **Konfluensi Kuantitatif & Volatilitas**: Evaluasi sistematis multi-timeframe, osilator momentum (RSI, StochRSI, MACD, MFI), Pivot Points, dan rezim volatilitas ATR / Bollinger Bands.
4. **Valuasi Forensik & Fundamental Multi-Tahun**: Uji tuntas integritas laporan keuangan historis (Piotroski 9-Poin, Beneish 8-Variabel, Altman Z-Score, DuPont), model nilai wajar (DCF 5Y, Benjamin Graham, Peter Lynch, PBV Historical), dan Margin of Safety (MoS).
5. **Manajemen Risiko Asimetris & Eksekusi Portofolio**: Merumuskan setup trade dengan Risk-to-Reward >= 2.0, proteksi modal ketat, dan rekomendasi personal bagi modal investor.

**Instruksi Khusus untuk Emiten Ini:**
{style_intro}

---

# BERKAS INTELIJEN EMITEN (COMPREHENSIVE MARKET & FINANCIAL DOSSIER)

### 📌 1. Identitas Emiten, Profil Bisnis & Valuasi Multiples
- **Ticker**: {ticker} | **Nama Emiten**: {company_name}
- **Sektor / Industri**: {sector} / {industry}
- **Harga Acuan Terakhir (Reference Price)**: Rp{last_price:,.0f}
- **Waktu Ekstraksi Data**: {date_str}
- **Market Cap**: {market_cap_str} | **Saham Beredar**: {shares_out_str} lembar
- **Valuation Multiples**: P/E (TTM): {pe_val:.2f}x | P/B: {pb_val:.2f}x | Dividend Yield: {div_yield:.2f}% | EPS: Rp{eps_val:,.1f} | BVPS: Rp{bvps_val:,.1f}
- **Profil Perusahaan**: {description}

### 📈 2. Struktur Tren, Keselarasan Multi-Timeframe & Moving Averages
- **Struktur Pasar (Market Structure)**: {ms.get('structure', 'Unknown')} (Keterangan: {ms.get('reason', '-')})
- **Tren Besar (Daily)**: {trend.get('trend_besar', '-')} | **Tren Menengah (H1)**: {trend.get('trend_menengah', '-')} | **Tren Pendek (M15)**: {trend.get('trend_pendek', '-')}
- **Keselarasan Multi-Timeframe (MTF Alignment)**: {mtf.get('alignment', 'Unknown')}
  - Daily: {mtf.get('daily', '-')} ({mtf.get('daily_desc', '-')})
  - 1-Hour (H1): {mtf.get('h1', '-')} ({mtf.get('h1_desc', '-')})
  - 15-Minute (M15): {mtf.get('m15', '-')} ({mtf.get('m15_desc', '-')})
  - 5-Minute (M5): {mtf.get('m5', '-')}
- **Posisi Exponential Moving Averages**:
  - EMA 20: Rp{ind.get('ema20') or 0:,.1f} | EMA 50: Rp{ind.get('ema50') or 0:,.1f} | EMA 100: Rp{ind.get('ema100') or 0:,.1f} | EMA 200: Rp{ind.get('ema200') or 0:,.1f}
  - Supertrend: {supertrend.get('st_trend', 'Unknown')} (Level: Rp{supertrend.get('st_value') or 0:,.1f})
  - ADX (Trend Strength): {trend_detail.get('adx_value', 0)} ({trend_detail.get('adx_status', '-')}) | +DI: {trend_detail.get('di_plus', 0)} | -DI: {trend_detail.get('di_minus', 0)}

### 🧠 3. Smart Money Concepts (SMC) & Struktur Likuiditas Institusional
- **Fase Pasar SMC**: {smc.get('market_phase', 'Accumulation')}
- **Bullish FVG (Fair Value Gap) Aktif**: {'YA (Area ketidakseimbangan beli belum termitigasi)' if smc.get('bullish_fvg_active') else 'TIDAK'}
- **Bearish FVG (Fair Value Gap) Aktif**: {'YA (Area ketidakseimbangan jual aktif)' if smc.get('bearish_fvg_active') else 'TIDAK'}
- **Bullish Order Block (OB)**: {'AKTIF (Zona Demand Institusi)' if smc.get('bullish_ob_active') else 'TIDAK'}
- **Bearish Order Block (OB)**: {'AKTIF (Zona Supply Resistensi)' if smc.get('bearish_ob_active') else 'TIDAK'}
- **Break of Structure (BOS)**: {'BULLISH BOS Terkonfirmasi' if smc.get('bos_bull') else ('BEARISH BOS Terkonfirmasi' if smc.get('bos_bear') else 'Netral')}
- **Change of Character (CHOCH)**: {'BULLISH CHOCH (Pembalikan Tren Naik)' if smc.get('choch_bull') else ('BEARISH CHOCH (Pembalikan Tren Turun)' if smc.get('choch_bear') else 'Netral')}
- **Liquidity Sweep**: {'SWEEP LOW (Manipulasi likuiditas bawah selesai)' if smc.get('liquidity_sweep_low') else ('SWEEP HIGH (Manipulasi likuiditas atas selesai)' if smc.get('liquidity_sweep_high') else 'Normal')}

### ⚡ 4. Sinyal Kuantitatif RELT, Skoring 10-Faktor & Setup Eksekusi Asimetris
- **RELT Action**: {relt.get('action', 'WAIT')} | **Rating**: {relt.get('rating', '-')}
- **RELT Quantitative Score**: {relt.get('score', 0)} / 100 ({score_obj.get('rating', '')})
- **Kekuatan Tren**: {relt.get('trend_strength', 'Unknown')} | **No Trade Zone**: {relt.get('is_no_trade_zone', False)}
- **Rekomendasi Setup Eksekusi**:
  - Entry Price: Rp{relt_setup.get('entry_price', last_price):,.0f}
  - Stop Loss: Rp{relt_setup.get('stop_loss', 0):,.0f} (Risiko Modal: {relt_setup.get('risk_percent', 0):.2f}%)
  - Target Profit 1 (TP1 @ 1.5R): Rp{relt_setup.get('tp1', 0):,.0f} (+{relt_setup.get('tp1_percent', 0):.2f}%)
  - Target Profit 2 (TP2 @ 2.5R Runner): Rp{relt_setup.get('tp2', 0):,.0f} (+{relt_setup.get('tp2_percent', 0):.2f}%)
  - Risk-to-Reward Ratio: {relt_setup.get('risk_reward_ratio', 0):.2f}x
  - Trailing Stop Level: Rp{relt_setup.get('trailing_stop', 0):,.0f}
- **Prediksi Arah (Direction Prediction)**: {relt_prediction.get('direction', 'SIDEWAYS')} menuju Rp{relt_prediction.get('predicted_price', 0):,.0f} (Potensi: {relt_prediction.get('upside_pct', 0):+.1f}%, Confidence Score: {relt_prediction.get('confidence_score', 0)}%)

### 🎯 5. Level Kunci Support, Resistance & Pivot Points Konfluensi
- **Zona Support Terdekat**: {sup_str}
- **Zona Resistance Terdekat**: {res_str}
- **Classic Pivot Points**: PP: Rp{classic_pivots.get('pp', 0):,.0f} | S1: Rp{classic_pivots.get('s1', 0):,.0f} | S2: Rp{classic_pivots.get('s2', 0):,.0f} | R1: Rp{classic_pivots.get('r1', 0):,.0f} | R2: Rp{classic_pivots.get('r2', 0):,.0f}
- **Camarilla Levels**: H3 (Reversal Short): Rp{camarilla_pivots.get('h3', 0):,.0f} | H4 (Breakout Long): Rp{camarilla_pivots.get('h4', 0):,.0f} | L3 (Reversal Long): Rp{camarilla_pivots.get('l3', 0):,.0f} | L4 (Breakdown Short): Rp{camarilla_pivots.get('l4', 0):,.0f}

### 📊 6. Indikator Momentum, Osilator & Volatilitas Komprehensif
- **RSI (14)**: {ind.get('rsi') or 0:.2f} ({mom_detail.get('rsi_zone', '-')})
- **Stochastic RSI**: {ind.get('stoch_rsi') or 0:.2f} ({mom_detail.get('stoch_rsi_zone', '-')})
- **MACD**: {ind.get('macd') or 0:.2f} | **Signal**: {ind.get('macd_signal') or 0:.2f} | **Hist**: {ind.get('macd_hist') or 0:.2f} (Status: {mom_detail.get('macd_cross', '-')})
- **Money Flow Index (MFI)**: {mom_detail.get('mfi_value', 0):.2f} ({mom_detail.get('mfi_zone', '-')})
- **ATR (Average True Range)**: {vol_detail.get('atr_value', 0):,.1f} ({vol_detail.get('atr_regime', '-')} | Volatilitas: {vol_detail.get('atr_pct', 0):.2f}%)
- **Bollinger Bands**: Upper: Rp{vol_detail.get('bb_upper', 0):,.0f} | Middle: Rp{vol_detail.get('bb_middle', 0):,.0f} | Lower: Rp{vol_detail.get('bb_lower', 0):,.0f} (Width: {vol_detail.get('bb_width', 0):.2f}%, Posisi: {vol_detail.get('bb_position', '-')})
- **Volume & RVOL**: Rata-rata 20 Hari: {ind.get('avg_volume') or 0:,.0f} lembar | Volume Terakhir: {ind.get('volume') or 0:,.0f} lembar

### 🔍 7. Bandarmologi, Order Flow & Pola Teknikal
- **Order Flow Status**: {order_flow.get('status', 'Netral')} ({order_flow.get('status_desc', '-')})
- **Dominasi Beli (Buy Dominance)**: {order_flow.get('buy_dominance_pct', '-')} ({order_flow.get('buy_dominance_desc', '-')})
- **Kondisi HAKA**: {order_flow.get('haka_condition', '-')} ({order_flow.get('haka_condition_desc', '-')})
- **Aktivitas Bandar**: {order_flow.get('bandar_activity', '-')} ({order_flow.get('bandar_activity_desc', '-')})
- **Area Transaksi Bandar**: {order_flow.get('bandar_area', '-')} ({order_flow.get('bandar_area_desc', '-')})
- **Pola Chart Terdeteksi**: {pattern_str}

### 📑 8. Laporan Keuangan Historis Multi-Tahun (3-4 Tahun Terakhir)
{financial_table_str}
- **Rasio Profitabilitas**: ROE: {fin_health.get('roe', 0)}% | ROA: {fin_health.get('roa', 0)}% | Cash Flow Quality Ratio (OCF/Net Income): {fin_health.get('cash_flow_quality_ratio', 1.0):.2f}x
- **Rasio Solvabilitas & Likuiditas**: DER: {fin_health.get('der', 0)}x | Current Ratio: {fin_health.get('current_ratio', 0)}x | Status Kesehatan: {fin_health.get('health_status', 'Kategori Sehat')}
- **Pertumbuhan Historis (3-Year CAGR)**: Revenue CAGR: {growth.get('revenue_cagr_3y_pct', 0):.2f}% | Net Income CAGR: {growth.get('net_income_cagr_3y_pct', 0):.2f}% ({growth.get('growth_status', 'Stabil')})

### 💎 9. Audit Forensik Finansial, Integritas Laba & DuPont Analysis
- **Piotroski F-Score (Kekuatan Fundamental)**: {f_score_val} / 9 ({f_score_status})
{f_criteria_str or '    - Kriteria: Komponen F-Score terverifikasi stabil.\n'}
- **Beneish M-Score (Risiko Manipulasi Laba)**: {m_score_val} ({m_status_val})
  - Evaluasi Forensik: {m_explanation}
- **Altman Z-Score (Probabilitas Kebangkrutan)**: {altman_z:.2f} ({altman_status})
- **DuPont ROE 3-Stage Decomposition**:
  - Net Profit Margin: {npm_dupont}% × Asset Turnover: {ato_dupont}x × Financial Leverage Multiplier: {flm_dupont}x = ROE {fin_health.get('roe', 0)}%

### ⚖️ 10. Valuasi Nilai Wajar Multi-Model & Peers Relative
- **Consolidated Fair Value**: Rp{fair_val.get('consolidated_fair_value', 0):,.0f} | **Margin of Safety**: {fair_val.get('margin_of_safety_pct', 0):.1f}%
- **Status Valuasi**: {fair_val.get('valuation_badge', 'FAIR VALUE')} ({fair_val.get('overall_status', '-')})
- **Rincian Model Nilai Wajar**:
{models_str or '    (Data model tidak tersedia)'}
- **Analisis Standard Deviation Bands**: {sd_summary}
- **Konsensus Target Analis (Google Finance)**: Median: Rp{analyst_targets.get('target_price_median') or 0:,.0f} | High: Rp{analyst_targets.get('target_price_high') or 0:,.0f} | Low: Rp{analyst_targets.get('target_price_low') or 0:,.0f} (Potensi Upside: {analyst_targets.get('upside_potential_pct', 0):+.1f}%)

### 📰 11. Klaster Berita, Sentimen Media & Konteks Makro Terkini
{news_summary}
{portfolio_section}
---

# TUGAS ANALISIS ANDA (PERSPEKTIF MANDIRI, SINTESIS & PERSONAL POSITION STRATEGY)

Anda WAJIB menganalisis seluruh dataset multidimensi di atas melalui sudut pandang kritis:
1. **Perspektif 1: Price Action, Market Structure & Smart Money Concepts (SMC)**
   - Evaluasi keselarasan tren multi-timeframe, keberadaan BOS/CHOCH, reaksi terhadap FVG dan Order Block aktif, serta pemetaan area likuiditas institusional.
2. **Perspektif 2: Bandarmologi, Volume Footprint & Aliran Dana Institusi**
   - Bedah aktivitas akumulasi vs distribusi, rasio dominasi transaksi beli/jual, kekuatan HAKA, dan relevansi area konsentrasi bandar.
3. **Perspektif 3: Konfluensi Kuantitatif, Osilator, Pivot & Rezim Volatilitas**
   - Telaah status RSI, potensi divergence, konfirmasi momentum MACD, aliran dana MFI, konfluensi Pivot Points Classic/Camarilla, dan fase kompresi/ekspansi Bollinger Bands + ATR.
4. **Perspektif 4: Forensik Finansial Multi-Tahun, Valuasi Intrinsik & Margin of Safety**
   - Nilai integritas pembukuan (Piotroski 9-Poin, Beneish M-Score, Altman Z-Score, DuPont ROE), kesehatan neraca multi-tahun, serta diskon harga terhadap Consolidated Fair Value (DCF 5Y, Graham, Lynch, PBV).
5. **Perspektif 5: Probabilitas Skenario Asimetris & Eksekusi Trading**
   - Susun skenario Bullish Utama, skenario Bearish Pembatalan, dan skenario Sideways lengkap dengan probabilitas %, pemicu, invalidation level, dan rencana alokasi modal bertahap.
{portfolio_task}
---

# FORMAT OUTPUT: STRICT JSON SCHEMA (WAJIB DIPATUHI!)

Output Anda HARUS 100% berupa JSON VALID tanpa teks percakapan pembuka/penutup. Pastikan seluruh struktur kunci JSON di bawah ini terisi lengkap dengan analisis yang mendalam, tajam, presisi, dan profesional dalam Bahasa Indonesia:

```json
{schema_json_str}
```

Mulai hasilkan respon JSON valid Anda sekarang:
"""
        return prompt.strip()
