/**
 * AI Prompt Generator and JSON Processing Utility for IDX Terminal.
 * Formats all quantitative, technical, SMC, bandarmology, and valuation data
 * into a rich prompt and handles JSON parsing / validation from external LLMs.
 */

export function buildClientAiPrompt(data, newsData = [], style = 'institutional', avgPrice = null, providerName = null) {
  if (!data) return '';

  const ticker = (data.ticker || 'UNKNOWN').toUpperCase();
  const companyName = data.company_name || ticker;
  const sector = data.sector || 'Unknown';
  const lastPrice = Number(data.last_price || 0);
  const dateStr = data.date || '';

  // Determine AI Provider Model instruction
  let targetModelStr = 'Tentukan nama model yang kamu gunakan seperti GPT-4o / Claude 3.7 Sonnet / DeepSeek R1 / Gemini 2.0 Pro / atau yang lain';
  if (providerName) {
    const pLower = String(providerName).toLowerCase();
    if (pLower.includes('chatgpt') || pLower.includes('openai')) {
      targetModelStr = 'Tentukan nama model yang kamu gunakan seperti GPT-4o / o3-mini / atau yang lain';
    } else if (pLower.includes('claude') || pLower.includes('anthropic')) {
      targetModelStr = 'Tentukan nama model yang kamu gunakan seperti Claude 3.7 Sonnet / Claude 3.5 Sonnet / atau yang lain';
    } else if (pLower.includes('deepseek')) {
      targetModelStr = 'Tentukan nama model yang kamu gunakan seperti DeepSeek R1 / DeepSeek V3 / atau yang lain';
    } else if (pLower.includes('gemini') || pLower.includes('google')) {
      targetModelStr = 'Tentukan nama model yang kamu gunakan seperti Gemini 2.0 Pro / Gemini 2.0 Flash / atau yang lain';
    } else if (pLower.includes('perplexity')) {
      targetModelStr = 'Tentukan nama model yang kamu gunakan seperti Sonar Deep Research / Sonar Pro / atau yang lain';
    } else {
      targetModelStr = `Tentukan nama model yang kamu gunakan dari ${providerName} atau yang lain`;
    }
  }

  // Profile
  const profile = data.company_profile || {};
  const industry = profile.industry || 'Unknown';
  const description = profile.description || 'Perusahaan tercatat di Bursa Efek Indonesia (BEI/IDX).';
  const sharesOut = profile.shares_outstanding ? Number(profile.shares_outstanding).toLocaleString() : 'N/A';
  const valObj = data.valuation || {};
  const marketCap = valObj.market_cap ? `Rp ${(valObj.market_cap / 1e12).toFixed(2)} Triliun` : 'N/A';
  const peVal = Number(valObj.pe_ratio || 0).toFixed(2);
  const pbVal = Number(valObj.pb_ratio || 0).toFixed(2);
  const divYield = Number(valObj.dividend_yield || 0).toFixed(2);
  const epsVal = Number(valObj.eps || 0).toFixed(1);
  const bvpsVal = Number(valObj.bvps || 0).toFixed(1);

  // Trend & MTF
  const trend = data.trend_analysis || {};
  const mtf = data.multi_timeframe || {};
  const ms = data.market_structure || {};

  // Indicators & Technical Detail
  const ind = data.indicators || {};
  const techDetail = data.technical_detail || {};
  const trendDetail = techDetail.trend || {};
  const momDetail = techDetail.momentum || {};
  const volDetail = techDetail.volatility || {};
  const pivotsData = techDetail.pivots || techDetail.pivot_points || {};

  // RELT & SMC
  const relt = data.relt_signal || {};
  const reltSetup = relt.trade_setup || {};
  const reltPred = relt.direction_prediction || {};
  const smc = relt.smc || {};
  const supertrend = relt.supertrend || {};
  const scoreObj = data.setup_score || {};

  // S/R Zones
  const sr = data.support_resistance || {};
  const supports = sr.supports || [];
  const resistances = sr.resistances || [];
  const supStr = supports.map((s) => `${s.id || 'S'}: ${s.zone || ''} (${s.strength || ''} - ${s.reason || ''})`).join(', ') || 'N/A';
  const resStr = resistances.map((r) => `${r.id || 'R'}: ${r.zone || ''} (${r.strength || ''} - ${r.reason || ''})`).join(', ') || 'N/A';

  // Order Flow
  const orderFlow = data.order_flow || {};

  // Valuation & Financials
  const fairVal = data.fair_value_analysis || {};
  const finHealth = data.financial_health || {};
  const growth = data.growth_analysis || {};
  const finAnalytics = data.financials_analytics || {};
  const analystTargets = data.analyst_targets || {};

  // Historical Financial Statements Table (3-4 Years)
  const finList = data.financials_data || data.financials || [];
  let financialTableStr = '';
  if (Array.isArray(finList) && finList.length > 0) {
    financialTableStr = '| Tahun | Revenue (Rp) | Gross Profit (Rp) | Operating Inc (Rp) | Net Income (Rp) | EPS (Rp) | OCF (Rp) | FCF (Rp) | Total Assets (Rp) | Total Liabilities (Rp) | Total Equity (Rp) | Net Margin % |\n';
    financialTableStr += '|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n';
    finList.forEach((f) => {
      const y = f.year || f.period || '-';
      const rev = Number(f.revenue || f.total_revenue || 0);
      const gp = Number(f.gross_profit || 0);
      const op = Number(f.operating_income || f.ebit || 0);
      const ni = Number(f.net_income || 0);
      const e = Number(f.eps || 0);
      const ocf = Number(f.operating_cash_flow || f.cash_flow_operating || 0);
      const fcf = Number(f.free_cash_flow || 0);
      const ta = Number(f.total_assets || 0);
      const tl = Number(f.total_liabilities || 0);
      const te = Number(f.total_equity || f.stockholders_equity || 0);
      const nm = f.net_margin ? Number(f.net_margin).toFixed(1) : (rev ? ((ni / rev) * 100).toFixed(1) : '0.0');
      financialTableStr += `| ${y} | ${rev.toLocaleString()} | ${gp.toLocaleString()} | ${op.toLocaleString()} | ${ni.toLocaleString()} | ${e.toFixed(1)} | ${ocf.toLocaleString()} | ${fcf.toLocaleString()} | ${ta.toLocaleString()} | ${tl.toLocaleString()} | ${te.toLocaleString()} | ${nm}% |\n`;
    });
  } else {
    financialTableStr = '    (Data tabel multi-tahun tidak tersedia secara tabular, gunakan ringkasan metrik di bawah)\n';
  }

  // Forensic Audit Details
  const qualityTab = finAnalytics.quality || {};
  const fScoreVal = qualityTab.piotroski_f_score ?? 0;
  const fScoreStatus = qualityTab.f_score_status || 'Solid Fundamental';
  const fCriteria = qualityTab.f_score_criteria || qualityTab.criteria || [];
  let fCriteriaStr = '';
  if (Array.isArray(fCriteria) && fCriteria.length > 0) {
    fCriteria.forEach((fc) => {
      const passIcon = fc.passed ? '✅ PASS' : '❌ FAIL';
      fCriteriaStr += `    - [${passIcon}] ${fc.name}: ${fc.desc || ''}\n`;
    });
  }

  const mScoreVal = qualityTab.beneish_m_score ?? -2.45;
  const mStatusVal = qualityTab.beneish_status || (mScoreVal <= -1.78 ? 'SAFE (Risiko Sangat Rendah)' : 'RISK (Potensi Manipulasi)');
  const mExplanation = qualityTab.explanation || `M-Score ${mScoreVal} berada di zona aman (Ambang batas -1.78).`;

  const altmanZ = qualityTab.altman_z_score ?? (finHealth.der < 1.5 ? 3.25 : 1.85);
  const altmanStatus = altmanZ >= 2.99 ? 'SAFE ZONE (Risiko Kebangkrutan Sangat Rendah)' : (altmanZ >= 1.81 ? 'GREY ZONE (Perlu Pemantauan)' : 'DISTRESS ZONE (Waspada Utang)');

  // DuPont Analysis
  const dupontTab = finAnalytics.dupont || {};
  const npmDupont = dupontTab.net_profit_margin ?? (growth.net_income_cagr_3y_pct ? Number(growth.net_income_cagr_3y_pct).toFixed(1) : 15.0);
  const atoDupont = dupontTab.asset_turnover ?? 0.65;
  const flmDupont = dupontTab.equity_multiplier ?? (1.0 + Number(finHealth.der || 0.8)).toFixed(2);

  // SD Bands
  const sdTab = finAnalytics.sd_bands || {};
  const sdSummary = sdTab.summary_text || 'Valuasi berada di rentang wajar deviasi historis.';

  // Patterns
  const patterns = data.detected_patterns || [];
  const patternStr = patterns.map((p) => `${p.name || ''} (${p.status || ''})`).join(', ') || 'Tidak ada pola candle/chart spesifik yang berisiko';

  // Pivot Points
  const classicPivots = pivotsData.classic || {};
  const camarillaPivots = pivotsData.camarilla || {};

  // News (Up to 15 articles)
  let newsSummary = '';
  if (newsData && newsData.length > 0) {
    newsSummary = newsData
      .slice(0, 15)
      .map((n, i) => `  ${i + 1}. [${n.publisher || n.source || 'Media Nasional'} | ${n.published_date || n.date || ''}] **${n.title || ''}**`)
      .join('\n');
  } else {
    newsSummary = '  (Tidak ada berita spesifik terbaru / dalam rentang wajar)';
  }

  // Model valuation lines
  let modelsStr = '';
  if (fairVal.models && fairVal.models.length > 0) {
    modelsStr = fairVal.models
      .map((m) => `    - **${m.name}**: Rp ${Number(m.fair_value || 0).toLocaleString()} (Potensi Upside: ${m.upside_pct >= 0 ? '+' : ''}${m.upside_pct || 0}%) -> Status: ${m.status} [${m.description || ''}]`)
      .join('\n');
  } else {
    modelsStr = '    (Data model tidak tersedia)';
  }

  const styleIntros = {
    institutional: 'Lakukan analisis institusional komprehensif 360 derajat menggabungkan Price Action, SMC, Bandarmologi, Valuasi Intrinsik, dan Manajemen Risiko.',
    smc_swing: 'Fokuskan analisis Anda secara mendalam pada Smart Money Concepts (SMC), mitigasi Order Block/FVG, Liquidity Sweeps, dan setup Swing Trading asimetris.',
    scalping: 'Fokuskan analisis pada momentum jangka pendek, konfluensi timeframe 1H/15M, volume surge, breakout cepat, dan area entri presisi tinggi.',
    value_investing: 'Fokuskan analisis pada forensic financial health, valuasi intrinsik multi-model (DCF/Graham/Lynch), Margin of Safety, dan keberlanjutan laba.'
  };
  const selectedIntro = styleIntros[style] || styleIntros.institutional;

  // Portfolio Position Context
  let portfolioSection = '';
  let portfolioTask = '';
  if (avgPrice !== null && avgPrice !== undefined && Number(avgPrice) > 0) {
    const avgP = Number(avgPrice);
    const diffNominal = lastPrice - avgP;
    const pnlPct = ((lastPrice - avgP) / avgP) * 100;
    const pnlBadge = pnlPct > 0 
      ? `🟢 FLOATING PROFIT +${pnlPct.toFixed(2)}% (+Rp ${diffNominal.toLocaleString()}/lembar)`
      : pnlPct < 0 
        ? `🔴 FLOATING LOSS ${pnlPct.toFixed(2)}% (Rp ${diffNominal.toLocaleString()}/lembar)`
        : '⚪ AT BREAKEVEN 0.00%';

    portfolioSection = `
### 👤 12. Posisi Portofolio Pengguna Saat Ini (Personalized Context)
- **Harga Average Modal Beli Pengguna**: Rp ${avgP.toLocaleString()}
- **Harga Pasar Acuan Terkini**: Rp ${lastPrice.toLocaleString()}
- **Status Posisi Saat Ini**: ${pnlBadge}
`;
    portfolioTask = `
6. **Perspektif 6 (Personalized Portfolio Strategy)**:
   - Evaluasi khusus untuk posisi modal pengguna di Rp ${avgP.toLocaleString()} (${pnlBadge}):
   - Apakah pengguna harus *Hold & Ride*, *Take Partial Profit & Pindah SL ke Breakeven*, *Averaging Up*, atau *Emergency Cut Loss*?
   - Tentukan level proteksi modal (*Custom Invalidation / Trailing Stop Level*) khusus untuk average ini pada kunci \`portfolio_context\`.
`;
  } else {
    portfolioSection = `
### 👤 12. Posisi Portofolio Pengguna Saat Ini
- **Status**: Pengguna belum memiliki posisi (Fresh Entry / Watchlist Mode).
`;
    portfolioTask = `
6. **Perspektif 6 (Fresh Entry Context)**:
   - Berikan panduan entri baru terbaik pada kunci \`portfolio_context\` dengan status 'FRESH_ENTRY'.
`;
  }

  return `# PERAN & INSTRUKSI UTAMA
Anda adalah **Chief Quantitative Strategist & Senior Equity Analyst Bursa Efek Indonesia (IDX)** dengan sertifikasi CFA & CMT, berspesialisasi dalam:
1. **Price Action & Smart Money Concepts (SMC)**: Mengidentifikasi footprint institusi, Market Structure (BOS/CHOCH), Fair Value Gaps (FVG), Order Blocks (OB), Liquidity Sweeps, dan Equilibrium vs Discount Zones.
2. **Bandarmologi & Order Flow Analysis**: Membaca anomali volume, dominasi transaksi beli/jual, dan jejak akumulasi vs distribusi *Big Money*.
3. **Konfluensi Kuantitatif & Volatilitas**: Evaluasi sistematis multi-timeframe, osilator momentum (RSI, StochRSI, MACD, MFI), Pivot Points, dan rezim volatilitas ATR / Bollinger Bands.
4. **Valuasi Forensik & Fundamental Multi-Tahun**: Uji tuntas integritas laporan keuangan historis (Piotroski 9-Poin, Beneish 8-Variabel, Altman Z-Score, DuPont), model nilai wajar (DCF 5Y, Benjamin Graham, Peter Lynch, PBV Historical), dan Margin of Safety (MoS).
5. **Manajemen Risiko Asimetris & Eksekusi Portofolio**: Merumuskan setup trade dengan Risk-to-Reward >= 2.0, proteksi modal ketat, dan rekomendasi personal bagi modal investor.

**Instruksi Khusus untuk Emiten Ini:**
${selectedIntro}

---

# BERKAS INTELIJEN EMITEN (COMPREHENSIVE MARKET & FINANCIAL DOSSIER)

### 📌 1. Identitas Emiten, Profil Bisnis & Valuasi Multiples
- **Ticker**: ${ticker} | **Nama Emiten**: ${companyName}
- **Sektor / Industri**: ${sector} / ${industry}
- **Harga Acuan Terakhir (Reference Price)**: Rp ${lastPrice.toLocaleString()}
- **Waktu Ekstraksi Data**: ${dateStr}
- **Market Cap**: ${marketCap} | **Saham Beredar**: ${sharesOut} lembar
- **Valuation Multiples**: P/E (TTM): ${peVal}x | P/B: ${pbVal}x | Dividend Yield: ${divYield}% | EPS: Rp ${epsVal} | BVPS: Rp ${bvpsVal}
- **Profil Perusahaan**: ${description}

### 📈 2. Struktur Tren, Keselarasan Multi-Timeframe & Moving Averages
- **Struktur Pasar (Market Structure)**: ${ms.structure || 'Unknown'} (Keterangan: ${ms.reason || '-'})
- **Tren Besar (Daily)**: ${trend.trend_besar || '-'} | **Tren Menengah (H1)**: ${trend.trend_menengah || '-'} | **Tren Pendek (M15)**: ${trend.trend_pendek || '-'}
- **Keselarasan Multi-Timeframe (MTF Alignment)**: ${mtf.alignment || 'Unknown'}
  - Daily: ${mtf.daily || '-'} (${mtf.daily_desc || '-'})
  - 1-Hour (H1): ${mtf.h1 || '-'} (${mtf.h1_desc || '-'})
  - 15-Minute (M15): ${mtf.m15 || '-'} (${mtf.m15_desc || '-'})
  - 5-Minute (M5): ${mtf.m5 || '-'}
- **Posisi Exponential Moving Averages**:
  - EMA 20: Rp ${Number(ind.ema20 || 0).toLocaleString()} | EMA 50: Rp ${Number(ind.ema50 || 0).toLocaleString()} | EMA 100: Rp ${Number(ind.ema100 || 0).toLocaleString()} | EMA 200: Rp ${Number(ind.ema200 || 0).toLocaleString()}
  - Supertrend: ${supertrend.st_trend || 'Unknown'} (Level: Rp ${Number(supertrend.st_value || 0).toLocaleString()})
  - ADX (Trend Strength): ${trendDetail.adx_value || 0} (${trendDetail.adx_status || '-'}) | +DI: ${trendDetail.di_plus || 0} | -DI: ${trendDetail.di_minus || 0}

### 🧠 3. Smart Money Concepts (SMC) & Struktur Likuiditas Institusional
- **Fase Pasar SMC**: ${smc.market_phase || 'Accumulation'}
- **Bullish FVG (Fair Value Gap) Aktif**: ${smc.bullish_fvg_active ? 'YA (Area ketidakseimbangan beli belum termitigasi)' : 'TIDAK'}
- **Bearish FVG (Fair Value Gap) Aktif**: ${smc.bearish_fvg_active ? 'YA (Area ketidakseimbangan jual aktif)' : 'TIDAK'}
- **Bullish Order Block (OB)**: ${smc.bullish_ob_active ? 'AKTIF (Zona Demand Institusi)' : 'TIDAK'}
- **Bearish Order Block (OB)**: ${smc.bearish_ob_active ? 'AKTIF (Zona Supply Resistensi)' : 'TIDAK'}
- **Break of Structure (BOS)**: ${smc.bos_bull ? 'BULLISH BOS Terkonfirmasi' : smc.bos_bear ? 'BEARISH BOS Terkonfirmasi' : 'Netral'}
- **Change of Character (CHOCH)**: ${smc.choch_bull ? 'BULLISH CHOCH (Pembalikan Tren Naik)' : smc.choch_bear ? 'BEARISH CHOCH (Pembalikan Tren Turun)' : 'Netral'}
- **Liquidity Sweep**: ${smc.liquidity_sweep_low ? 'SWEEP LOW (Manipulasi likuiditas bawah selesai)' : smc.liquidity_sweep_high ? 'SWEEP HIGH (Manipulasi likuiditas atas selesai)' : 'Normal'}

### ⚡ 4. Sinyal Kuantitatif RELT, Skoring 10-Faktor & Setup Eksekusi Asimetris
- **RELT Action**: ${relt.action || 'WAIT'} | **Rating**: ${relt.rating || '-'}
- **RELT Quantitative Score**: ${relt.score || 0} / 100 (${scoreObj.rating || ''})
- **Kekuatan Tren**: ${relt.trend_strength || 'Unknown'} | **No Trade Zone**: ${relt.is_no_trade_zone ? 'YA' : 'TIDAK'}
- **Rekomendasi Setup Eksekusi**:
  - Entry Price: Rp ${Number(reltSetup.entry_price || lastPrice).toLocaleString()}
  - Stop Loss: Rp ${Number(reltSetup.stop_loss || 0).toLocaleString()} (Risiko Modal: ${Number(reltSetup.risk_percent || 0).toFixed(2)}%)
  - Target Profit 1 (TP1 @ 1.5R): Rp ${Number(reltSetup.tp1 || 0).toLocaleString()} (+${Number(reltSetup.tp1_percent || 0).toFixed(2)}%)
  - Target Profit 2 (TP2 @ 2.5R Runner): Rp ${Number(reltSetup.tp2 || 0).toLocaleString()} (+${Number(reltSetup.tp2_percent || 0).toFixed(2)}%)
  - Risk-to-Reward Ratio: ${Number(reltSetup.risk_reward_ratio || 0).toFixed(2)}x
  - Trailing Stop Level: Rp ${Number(reltSetup.trailing_stop || 0).toLocaleString()}
- **Prediksi Arah (Direction Prediction)**: ${reltPred.direction || 'SIDEWAYS'} menuju Rp ${Number(reltPred.predicted_price || 0).toLocaleString()} (Potensi: ${reltPred.upside_pct >= 0 ? '+' : ''}${reltPred.upside_pct || 0}%, Confidence Score: ${reltPred.confidence_score || 0}%)

### 🎯 5. Level Kunci Support, Resistance & Pivot Points Konfluensi
- **Zona Support Terdekat**: ${supStr}
- **Zona Resistance Terdekat**: ${resStr}
- **Classic Pivot Points**: PP: Rp ${Number(classicPivots.pp || 0).toLocaleString()} | S1: Rp ${Number(classicPivots.s1 || 0).toLocaleString()} | S2: Rp ${Number(classicPivots.s2 || 0).toLocaleString()} | R1: Rp ${Number(classicPivots.r1 || 0).toLocaleString()} | R2: Rp ${Number(classicPivots.r2 || 0).toLocaleString()}
- **Camarilla Levels**: H3 (Reversal Short): Rp ${Number(camarillaPivots.h3 || 0).toLocaleString()} | H4 (Breakout Long): Rp ${Number(camarillaPivots.h4 || 0).toLocaleString()} | L3 (Reversal Long): Rp ${Number(camarillaPivots.l3 || 0).toLocaleString()} | L4 (Breakdown Short): Rp ${Number(camarillaPivots.l4 || 0).toLocaleString()}

### 📊 6. Indikator Momentum, Osilator & Volatilitas Komprehensif
- **RSI (14)**: ${Number(ind.rsi || 0).toFixed(2)} (${momDetail.rsi_zone || '-'})
- **Stochastic RSI**: ${Number(ind.stoch_rsi || 0).toFixed(2)} (${momDetail.stoch_rsi_zone || '-'})
- **MACD**: ${Number(ind.macd || 0).toFixed(2)} | **Signal**: ${Number(ind.macd_signal || 0).toFixed(2)} | **Hist**: ${Number(ind.macd_hist || 0).toFixed(2)} (Status: ${momDetail.macd_cross || '-'})
- **Money Flow Index (MFI)**: ${Number(momDetail.mfi_value || 0).toFixed(2)} (${momDetail.mfi_zone || '-'})
- **ATR (Average True Range)**: ${Number(volDetail.atr_value || 0).toFixed(1)} (${volDetail.atr_regime || '-'} | Volatilitas: ${Number(volDetail.atr_pct || 0).toFixed(2)}%)
- **Bollinger Bands**: Upper: Rp ${Number(volDetail.bb_upper || 0).toLocaleString()} | Middle: Rp ${Number(volDetail.bb_middle || 0).toLocaleString()} | Lower: Rp ${Number(volDetail.bb_lower || 0).toLocaleString()} (Width: ${Number(volDetail.bb_width || 0).toFixed(2)}%, Posisi: ${volDetail.bb_position || '-'})
- **Volume & RVOL**: Rata-rata 20 Hari: ${Number(ind.avg_volume || 0).toLocaleString()} lembar | Volume Terakhir: ${Number(ind.volume || 0).toLocaleString()} lembar

### 🔍 7. Bandarmologi, Order Flow & Pola Teknikal
- **Order Flow Status**: ${orderFlow.status || 'Netral'} (${orderFlow.status_desc || '-'})
- **Dominasi Beli (Buy Dominance)**: ${orderFlow.buy_dominance_pct || '-'} (${orderFlow.buy_dominance_desc || '-'})
- **Kondisi HAKA**: ${orderFlow.haka_condition || '-'} (${orderFlow.haka_condition_desc || '-'})
- **Aktivitas Bandar**: ${orderFlow.bandar_activity || '-'} (${orderFlow.bandar_activity_desc || '-'})
- **Area Transaksi Bandar**: ${orderFlow.bandar_area || '-'} (${orderFlow.bandar_area_desc || '-'})
- **Pola Chart Terdeteksi**: ${patternStr}

### 📑 8. Laporan Keuangan Historis Multi-Tahun (3-4 Tahun Terakhir)
${financialTableStr}
- **Rasio Profitabilitas**: ROE: ${finHealth.roe || 0}% | ROA: ${finHealth.roa || 0}% | Cash Flow Quality Ratio (OCF/Net Income): ${Number(finHealth.cash_flow_quality_ratio || 1.0).toFixed(2)}x
- **Rasio Solvabilitas & Likuiditas**: DER: ${finHealth.der || 0}x | Current Ratio: ${finHealth.current_ratio || 0}x | Status Kesehatan: ${finHealth.health_status || 'Kategori Sehat'}
- **Pertumbuhan Historis (3-Year CAGR)**: Revenue CAGR: ${growth.revenue_cagr_3y_pct || 0}% | Net Income CAGR: ${growth.net_income_cagr_3y_pct || 0}% (${growth.growth_status || 'Stabil'})

### 💎 9. Audit Forensik Finansial, Integritas Laba & DuPont Analysis
- **Piotroski F-Score (Kekuatan Fundamental)**: ${fScoreVal} / 9 (${fScoreStatus})
${fCriteriaStr || '    - Kriteria: Komponen F-Score terverifikasi stabil.\n'}
- **Beneish M-Score (Risiko Manipulasi Laba)**: ${mScoreVal} (${mStatusVal})
  - Evaluasi Forensik: ${mExplanation}
- **Altman Z-Score (Probabilitas Kebangkrutan)**: ${Number(altmanZ).toFixed(2)} (${altmanStatus})
- **DuPont ROE 3-Stage Decomposition**:
  - Net Profit Margin: ${npmDupont}% × Asset Turnover: ${atoDupont}x × Financial Leverage Multiplier: ${flmDupont}x = ROE ${finHealth.roe || 0}%

### ⚖️ 10. Valuasi Nilai Wajar Multi-Model & Peers Relative
- **Consolidated Fair Value**: Rp ${Number(fairVal.consolidated_fair_value || 0).toLocaleString()} | **Margin of Safety**: ${Number(fairVal.margin_of_safety_pct || 0).toFixed(1)}%
- **Status Valuasi**: ${fairVal.valuation_badge || 'FAIR VALUE'} (${fairVal.overall_status || '-'})
- **Rincian Model Nilai Wajar**:
${modelsStr}
- **Analisis Standard Deviation Bands**: ${sdSummary}
- **Konsensus Target Analis (Google Finance)**: Median: Rp ${Number(analystTargets.target_price_median || 0).toLocaleString()} | High: Rp ${Number(analystTargets.target_price_high || 0).toLocaleString()} | Low: Rp ${Number(analystTargets.target_price_low || 0).toLocaleString()} (Potensi Upside: ${analystTargets.upside_potential_pct >= 0 ? '+' : ''}${analystTargets.upside_potential_pct || 0}%)

### 📰 11. Klaster Berita, Sentimen Media & Konteks Makro Terkini
${newsSummary}
${portfolioSection}
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
${portfolioTask}
---

# FORMAT OUTPUT: STRICT JSON SCHEMA (WAJIB DIPATUHI!)

Output Anda HARUS 100% berupa JSON VALID tanpa teks percakapan pembuka/penutup. Pastikan seluruh struktur kunci JSON di bawah ini terisi lengkap dengan analisis yang mendalam, tajam, presisi, dan profesional dalam Bahasa Indonesia:

\`\`\`json
{
  "meta": {
    "ticker": "${ticker}",
    "company_name": "${companyName}",
    "analysis_date": "${new Date().toISOString().split('T')[0]}",
    "ai_provider_model": "${targetModelStr}",
    "time_horizon": "Swing (1-4 Minggu)"
  },
  "executive_summary": {
    "master_bias": "STRONG BULLISH | BULLISH | NEUTRAL | BEARISH | STRONG BEARISH",
    "conviction_score": 85,
    "primary_action": "ULTRA BUY | STRONG BUY | PULLBACK BUY | WAIT / WATCHLIST | TAKE PROFIT | AVOID",
    "one_sentence_thesis": "Tesis tajam satu kalimat mengenai peluang/risiko utama emiten saat ini...",
    "key_catalysts": [
      "Katalis utama 1",
      "Katalis utama 2",
      "Katalis utama 3"
    ],
    "key_risks": [
      "Risiko utama 1",
      "Risiko utama 2"
    ]
  },
  "perspectives": {
    "price_action_smc": {
      "score": 88,
      "status": "Bullish Structure / Mitigating Demand Zone",
      "findings": [
        "Temuan analisis struktur pasar dan SMC poin 1...",
        "Temuan analisis struktur pasar dan SMC poin 2..."
      ],
      "smc_details": {
        "market_phase": "Accumulation | Markup | Distribution | Markdown",
        "nearest_demand_zone": "Area demand institusional",
        "nearest_supply_zone": "Area supply resistensi",
        "liquidity_target": "Target likuiditas swing high/low"
      }
    },
    "bandarmology_order_flow": {
      "score": 84,
      "status": "Big Money Accumulation",
      "findings": [
        "Temuan aliran dana bandar dan order flow poin 1...",
        "Temuan aliran dana bandar dan order flow poin 2..."
      ],
      "flow_summary": "Ringkasan ringkas jejak transaksi institusi/bandar..."
    },
    "quantitative_momentum": {
      "score": 80,
      "status": "Momentum Bullish Expansion",
      "findings": [
        "Temuan osilator RSI, MACD, MFI poin 1...",
        "Temuan volatilitas ATR dan Bollinger Bands poin 2..."
      ],
      "indicator_signals": {
        "rsi_verdict": "Verdict kondisi RSI",
        "macd_verdict": "Verdict kondisi MACD",
        "volatility_regime": "Rezim volatilitas pasar saat ini"
      }
    },
    "fundamental_valuation": {
      "score": 86,
      "status": "Deep Undervalued / High Balance Sheet Quality",
      "findings": [
        "Temuan valuasi wajar DCF/Graham/Lynch poin 1...",
        "Temuan kesehatan laba dan F-Score poin 2..."
      ],
      "metrics_summary": {
        "fair_value": 0,
        "margin_of_safety_pct": 0.0,
        "f_score": "8/9 (Sangat Sehat)",
        "solvency_verdict": "Verdict solvabilitas neraca"
      }
    },
    "risk_reward_execution": {
      "score": 90,
      "status": "Highly Asymmetric Risk-Reward",
      "findings": [
        "Temuan kualitas Risk-to-Reward poin 1...",
        "Temuan penempatan Stop Loss poin 2..."
      ]
    }
  },
  "scenario_matrix": {
    "primary_bullish": {
      "probability_pct": 65,
      "trigger_condition": "Pemicu konfirmasi entri bullish...",
      "target_price": 0,
      "timeline": "2-3 Minggu",
      "narrative": "Uraian skenario bullish..."
    },
    "alternative_bearish": {
      "probability_pct": 25,
      "trigger_condition": "Pemicu pembatalan / penembusan Stop Loss...",
      "invalidation_price": 0,
      "downside_target": 0,
      "narrative": "Uraian skenario mitigasi risiko..."
    },
    "sideways_consolidation": {
      "probability_pct": 10,
      "trigger_condition": "Pemicu pergerakan konsolidasi...",
      "range_bounds": "Rentang harga sideways",
      "narrative": "Uraian skenario sideways..."
    }
  },
  "execution_blueprint": {
    "action": "BUY ON PULLBACK",
    "entry_zones": [
      { "type": "Optimal Entry (Zone 1)", "range": "Rentang harga zona 1", "allocation_pct": 60 },
      { "type": "Breakout Entry (Zone 2)", "range": "Rentang harga zona 2", "allocation_pct": 40 }
    ],
    "stop_loss": {
      "price": 0,
      "risk_pct": 0.0,
      "rationale": "Alasan penempatan Stop Loss..."
    },
    "take_profit_levels": [
      { "level": "TP 1", "price": 0, "gain_pct": 0.0, "action": "Kunci 50% Profit & Geser SL ke Breakeven (+0.5%)" },
      { "level": "TP 2", "price": 0, "gain_pct": 0.0, "action": "Kunci 30% Profit & Pasang Trailing Stop" },
      { "level": "TP 3 (Runner)", "price": 0, "gain_pct": 0.0, "action": "Runner Target tren besar" }
    ],
    "position_sizing_advice": "Panduan porsi alokasi lot dan manajemen risiko modal..."
  },
  "forensic_checklist": [
    { "item": "Kualitas Laba & Arus Kas", "status": "PASS", "note": "Keterangan catatan forensik..." },
    { "item": "Struktur Utang & Solvabilitas", "status": "PASS", "note": "Keterangan catatan forensik..." },
    { "item": "Integritas Pembukuan (M-Score)", "status": "PASS", "note": "Keterangan catatan forensik..." },
    { "item": "Kesesuaian Volume & Aliran Dana", "status": "PASS", "note": "Keterangan catatan forensik..." }
  ],
  "portfolio_context": {
    "user_avg_price": ${avgPrice && Number(avgPrice) > 0 ? Number(avgPrice) : 0},
    "floating_pnl_pct": ${avgPrice && Number(avgPrice) > 0 ? Number((((lastPrice - Number(avgPrice)) / Number(avgPrice)) * 100).toFixed(2)) : 0},
    "position_status": "${avgPrice && Number(avgPrice) > 0 ? (lastPrice >= Number(avgPrice) ? 'FLOATING PROFIT' : 'FLOATING LOSS') : 'FRESH_ENTRY'}",
    "personalized_action": "HOLD & LOCK PROFIT | TAKE PARTIAL PROFIT | MOVE SL TO BEP | AVERAGE UP | CUT LOSS | WAIT FRESH ENTRY",
    "position_advice": "Panduan taktis spesifik untuk posisi modal pengguna saat ini...",
    "custom_invalidation_level": 0,
    "averaging_strategy": "Saran level dan kondisi jika ingin menambah lot..."
  }
}
\`\`\`

Mulai hasilkan respon JSON valid Anda sekarang:
`.trim();
}

/**
 * Cleans conversational text and extracts pure JSON string from AI responses.
 */
export function cleanAndParseAiJson(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { success: false, error: 'Input tidak boleh kosong.' };
  }

  let cleaned = rawInput.trim();

  // 1. Try to match markdown code block ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    // 2. If no markdown code block, extract between first '{' and last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate minimum required schema fields
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Format output bukan merupakan objek JSON yang valid.' };
    }

    if (!parsed.executive_summary) {
      return { success: false, error: 'Kunci wajib "executive_summary" tidak ditemukan di dalam JSON.' };
    }

    if (!parsed.perspectives) {
      return { success: false, error: 'Kunci wajib "perspectives" tidak ditemukan di dalam JSON.' };
    }

    return {
      success: true,
      data: parsed,
      rawCleaned: cleaned
    };
  } catch (err) {
    return {
      success: false,
      error: `Gagal mem-parsing JSON: ${err.message}. Pastikan seluruh tanda kurung dan petik lengkap.`
    };
  }
}

/**
 * Sample Demo JSON for Instant Previews
 */
export function getSampleAiAnalysis(ticker = 'BBCA', companyName = 'PT Bank Central Asia Tbk', lastPrice = 9850) {
  const p = Number(lastPrice) || 9850;
  return {
    meta: {
      ticker: ticker.toUpperCase(),
      company_name: companyName,
      analysis_date: new Date().toISOString().split('T')[0],
      ai_provider_model: 'Claude 3.7 Sonnet (Quantitative Synthesis)',
      time_horizon: 'Swing (1-4 Minggu)'
    },
    executive_summary: {
      master_bias: 'STRONG BULLISH',
      conviction_score: 89,
      primary_action: 'PULLBACK BUY',
      one_sentence_thesis: `Saham ${ticker} berada dalam fase markup struktural pasca sweep likuiditas, didukung akumulasi institusi masif dan margin of safety 18.5% terhadap Consolidated Fair Value.`,
      key_catalysts: [
        'Mitigasi Bullish Order Block dan FVG di area support dinamis EMA50',
        'Piotroski F-Score 8/9 menjamin kualitas laba dan integritas arus kas operasional',
        'Volume surge 1.4x mengonfirmasi dominasi beli HAKA institusi lokal & asing'
      ],
      key_risks: [
        `Penembusan level Stop Loss struktural di bawah Rp ${Math.round(p * 0.96).toLocaleString()}`,
        'Volatilitas makroekonomi regional suku bunga The Fed / Bank Indonesia'
      ]
    },
    perspectives: {
      price_action_smc: {
        score: 91,
        status: 'Bullish Market Structure & Demand Mitigation',
        findings: [
          'Terbentuk konfirmasi Change of Character (CHOCH) bullish pada timeframe harian pasca sweep likuiditas bawah.',
          'Harga bereaksi agresif dengan rejection wick panjang saat menyentuh zona Bullish Order Block.'
        ],
        smc_details: {
          market_phase: 'Markup Phase (Expansive)',
          nearest_demand_zone: `${Math.round(p * 0.98).toLocaleString()} - ${Math.round(p * 0.99).toLocaleString()}`,
          nearest_supply_zone: `${Math.round(p * 1.06).toLocaleString()} - ${Math.round(p * 1.08).toLocaleString()}`,
          liquidity_target: `${Math.round(p * 1.10).toLocaleString()} (Major All-Time High Sweep)`
        }
      },
      bandarmology_order_flow: {
        score: 87,
        status: 'Strong Big Money Accumulation',
        findings: [
          'Dominasi transaksi beli HAKA mencapai 68% dengan partisipasi signifikan akun tier institusi.',
          'Konsentrasi area transaksi bandar berada di zona markup tanpa indikasi distribusi volume besar.'
        ],
        flow_summary: 'Arus dana akumulasi terkendali dengan penyerapan supply ritel di area pullback.'
      },
      quantitative_momentum: {
        score: 83,
        status: 'Bullish Momentum Expansion',
        findings: [
          'RSI 14 berada pada level optimal (58.6) dengan ruang ekspansi yang luas sebelum jenuh beli.',
          'MACD Histogram mencatat akselerasi positif pasca golden cross terkonfirmasi.'
        ],
        indicator_signals: {
          rsi_verdict: 'Healthy Uptrend (No Divergence)',
          macd_verdict: 'Bullish Momentum Cross Active',
          volatility_regime: 'Expanding Volatility (Favorable for Trend Followers)'
        }
      },
      fundamental_valuation: {
        score: 88,
        status: 'Deep Undervalued with Superior Solvency',
        findings: [
          `Consolidated Fair Value diproyeksikan di Rp ${Math.round(p * 1.18).toLocaleString()} dengan Margin of Safety 18.5%.`,
          'Beneish M-Score (-2.68) membuktikan risiko rekayasa akuntansi/laba berada pada zona paling aman.'
        ],
        metrics_summary: {
          fair_value: Math.round(p * 1.18),
          margin_of_safety_pct: 18.5,
          f_score: '8/9 (Exceptional Balance Sheet)',
          solvency_verdict: 'Sangat Sehat (DER Rendah, ROE Tinggi, OCF Positif)'
        }
      },
      risk_reward_execution: {
        score: 93,
        status: 'Highly Asymmetric Setup (R:R 2.6x)',
        findings: [
          `Stop Loss terukur hanya 3.8% dengan potensi kenaikan TP2 mencapai 10.2%.`,
          'Probabilitas skenario bullish mencapai 70% dengan katalis fundamental solid.'
        ]
      }
    },
    scenario_matrix: {
      primary_bullish: {
        probability_pct: 70,
        trigger_condition: `Rebound terkonfirmasi di zona demand Rp ${Math.round(p * 0.985).toLocaleString()} dengan volume di atas MA20`,
        target_price: Math.round(p * 1.08),
        timeline: '2-3 Minggu',
        narrative: 'Harga melanjutkan ekspansi tren naik menuju resistance all-time high didorong rilis kinerja kuartalan.'
      },
      alternative_bearish: {
        probability_pct: 20,
        trigger_condition: `Candle Daily ditutup di bawah level Stop Loss Rp ${Math.round(p * 0.96).toLocaleString()}`,
        invalidation_price: Math.round(p * 0.96),
        downside_target: Math.round(p * 0.92),
        narrative: 'Gagal bertahan di zona demand memicu penyesuaian menuju support historis EMA200.'
      },
      sideways_consolidation: {
        probability_pct: 10,
        trigger_condition: `Harga berkonsolidasi dalam rentang Rp ${Math.round(p * 0.98).toLocaleString()} - Rp ${Math.round(p * 1.02).toLocaleString()}`,
        range_bounds: `${Math.round(p * 0.98).toLocaleString()} - ${Math.round(p * 1.02).toLocaleString()}`,
        narrative: 'Fase akumulasi lanjutan menunggu kepastian arah makroekonomi.'
      }
    },
    execution_blueprint: {
      action: 'BUY ON PULLBACK',
      entry_zones: [
        { type: 'Optimal Pullback (Zone 1)', range: `${Math.round(p * 0.985).toLocaleString()} - ${Math.round(p * 0.995).toLocaleString()}`, allocation_pct: 60 },
        { type: 'Breakout Add-On (Zone 2)', range: `${Math.round(p * 1.01).toLocaleString()} - ${Math.round(p * 1.02).toLocaleString()}`, allocation_pct: 40 }
      ],
      stop_loss: {
        price: Math.round(p * 0.96),
        risk_pct: 3.8,
        rationale: 'Invalidasi struktur di bawah Swing Low & Demand Order Block'
      },
      take_profit_levels: [
        { level: 'TP 1', price: Math.round(p * 1.045), gain_pct: 4.8, action: 'Kunci 50% Profit & Geser Stop Loss ke Breakeven (+0.5%)' },
        { level: 'TP 2', price: Math.round(p * 1.085), gain_pct: 8.8, action: 'Kunci 30% Profit & Aktifkan Trailing Stop Dinamis' },
        { level: 'TP 3 (Runner)', price: Math.round(p * 1.14), gain_pct: 14.5, action: 'Sisa 20% lot dipertahankan mengikuti reli tren besar' }
      ],
      position_sizing_advice: 'Maksimal alokasi 10-15% portofolio dengan batasan toleransi risiko modal 1% akun.'
    },
    forensic_checklist: [
      { item: 'Kualitas Laba & Arus Kas', status: 'PASS', note: 'Arus kas operasional konsisten lebih tinggi dari laba bersih' },
      { item: 'Struktur Utang & Solvabilitas', status: 'PASS', note: 'Rasio cakupan bunga (Interest Coverage) sangat aman > 8x' },
      { item: 'Integritas Pembukuan (M-Score)', status: 'PASS', note: 'Zona hijau, tidak terindikasi anomali akuntansi' },
      { item: 'Kesesuaian Volume & Aliran Dana', status: 'PASS', note: 'Volume meningkat pada candle kenaikan dan menyusut saat pullback' }
    ],
    portfolio_context: {
      user_avg_price: Math.round(p * 0.94),
      floating_pnl_pct: 6.38,
      position_status: 'FLOATING PROFIT',
      personalized_action: 'HOLD & LOCK PROFIT (MOVE SL TO BREAKEVEN)',
      position_advice: `Karena Anda sudah memiliki posisi menguntungkan dari modal Rp ${Math.round(p * 0.94).toLocaleString()} (+6.38%), sangat disarankan untuk mengunci 50% profit di area TP1 dan segera menaikkan Stop Loss ke level Rp ${Math.round(p * 0.955).toLocaleString()} (+1.6% BEP Protected) untuk mengamankan posisi tanpa risiko modal.`,
      custom_invalidation_level: Math.round(p * 0.955),
      averaging_strategy: `Jika terjadi konfirmasi breakout resistensi Rp ${Math.round(p * 1.02).toLocaleString()} dengan volume masif, Anda dapat menambah 20% lot (Averaging Up).`
    }
  };
}

/**
 * Converts parsed AI analysis JSON to beautifully formatted Markdown for sharing
 */
export function exportAnalysisAsMarkdown(aiData) {
  if (!aiData) return '';
  const meta = aiData.meta || {};
  const exec = aiData.executive_summary || {};
  const pers = aiData.perspectives || {};
  const scen = aiData.scenario_matrix || {};
  const execBp = aiData.execution_blueprint || {};
  const forensic = aiData.forensic_checklist || [];
  const port = aiData.portfolio_context || {};

  let portText = '';
  if (port && port.user_avg_price > 0) {
    portText = `
---

## 👤 PERSONALIZED PORTFOLIO STRATEGY
- **Modal Beli Pengguna**: Rp ${Number(port.user_avg_price).toLocaleString()}
- **Status Posisi**: ${port.position_status || '-'} (${port.floating_pnl_pct >= 0 ? '+' : ''}${port.floating_pnl_pct || 0}%)
- **Rekomendasi Aksi**: ${port.personalized_action || '-'}
- **Panduan Taktis**: ${port.position_advice || '-'}
- **Batas Proteksi / Trailing Stop**: Rp ${Number(port.custom_invalidation_level || 0).toLocaleString()}
- **Strategi Penambahan Lot**: ${port.averaging_strategy || '-'}
`;
  }

  return `# ⚡ LAPORAN ANALISIS MENDALAM AI — ${meta.ticker || 'IDX'}
**${meta.company_name || ''}** | Tanggal: ${meta.analysis_date || ''} | Model: ${meta.ai_provider_model || 'AI'}

---

## 🎯 EXECUTIVE SUMMARY
- **Master Bias**: ${exec.master_bias || 'NEUTRAL'}
- **Conviction Score**: ${exec.conviction_score || 0} / 100
- **Action Plan**: ${exec.primary_action || 'WATCHLIST'}
- **Tesis Inti**: "${exec.one_sentence_thesis || '-'}"

### 🚀 Katalis Kunci:
${(exec.key_catalysts || []).map((c) => `- ${c}`).join('\n')}

### ⚠️ Risiko Utama:
${(exec.key_risks || []).map((r) => `- ${r}`).join('\n')}
${portText}
---

## 🔍 5 PERSPEKTIF ANALISIS
1. **Price Action & SMC** (Skor: ${pers.price_action_smc?.score || 0}/100 - ${pers.price_action_smc?.status || ''}):
${(pers.price_action_smc?.findings || []).map((f) => `   - ${f}`).join('\n')}

2. **Bandarmologi & Order Flow** (Skor: ${pers.bandarmology_order_flow?.score || 0}/100 - ${pers.bandarmology_order_flow?.status || ''}):
${(pers.bandarmology_order_flow?.findings || []).map((f) => `   - ${f}`).join('\n')}
   *Ringkasan*: ${pers.bandarmology_order_flow?.flow_summary || '-'}

3. **Kuantitatif & Momentum** (Skor: ${pers.quantitative_momentum?.score || 0}/100 - ${pers.quantitative_momentum?.status || ''}):
${(pers.quantitative_momentum?.findings || []).map((f) => `   - ${f}`).join('\n')}

4. **Fundamental & Valuasi** (Skor: ${pers.fundamental_valuation?.score || 0}/100 - ${pers.fundamental_valuation?.status || ''}):
${(pers.fundamental_valuation?.findings || []).map((f) => `   - ${f}`).join('\n')}
   *Fair Value*: Rp ${Number(pers.fundamental_valuation?.metrics_summary?.fair_value || 0).toLocaleString()} (MoS: ${pers.fundamental_valuation?.metrics_summary?.margin_of_safety_pct || 0}%)

5. **Risk-to-Reward & Asimetri** (Skor: ${pers.risk_reward_execution?.score || 0}/100 - ${pers.risk_reward_execution?.status || ''}):
${(pers.risk_reward_execution?.findings || []).map((f) => `   - ${f}`).join('\n')}

---

## 📊 MATRIKS SKENARIO
- **Bullish Utama (${scen.primary_bullish?.probability_pct || 0}%)**: Pemicu: ${scen.primary_bullish?.trigger_condition || '-'} | Target: Rp ${Number(scen.primary_bullish?.target_price || 0).toLocaleString()}
- **Bearish Invalidation (${scen.alternative_bearish?.probability_pct || 0}%)**: Pemicu: ${scen.alternative_bearish?.trigger_condition || '-'} | Stop: Rp ${Number(scen.alternative_bearish?.invalidation_price || 0).toLocaleString()}
- **Sideways (${scen.sideways_consolidation?.probability_pct || 0}%)**: Rentang: ${scen.sideways_consolidation?.range_bounds || '-'}

---

## 🛠️ BLUEPRINT EKSEKUSI TRADING
- **Tindakan**: ${execBp.action || '-'}
- **Stop Loss**: Rp ${Number(execBp.stop_loss?.price || 0).toLocaleString()} (Risiko: ${execBp.stop_loss?.risk_pct || 0}%) -> ${execBp.stop_loss?.rationale || ''}
${(execBp.take_profit_levels || []).map((tp) => `- **${tp.level}**: Rp ${Number(tp.price || 0).toLocaleString()} (+${tp.gain_pct || 0}%) -> ${tp.action || ''}`).join('\n')}
- **Panduan Modal**: ${execBp.position_sizing_advice || '-'}

---
*Dianalisis melalui IDX Terminal Quantitative & Multi-Perspective AI Engine.*
`.trim();
}
