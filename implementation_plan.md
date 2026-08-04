# Rencana Implementasi Super Detail: Financials Tab & Analytics Dashboard (7 Sub-Tab Engine & Visual UI Overhaul)

Dokumen ini adalah rencana teknis komprehensif untuk merealisasikan **Product Requirements Document (PRD) Modul Financials Tab & Analytics Dashboard**. Modul ini mentransformasi tab *Financials* menjadi platform analisis fundamental tingkat lanjut (*Institutional Grade*) yang mencakup **7 Sub-Tab Navigasi Interaktif**: `History`, `Valuation`, `Health`, `Quality`, `Outlook`, `Peers`, dan `Risk`.

---

## User Review Required

> [!IMPORTANT]
> **1. Sub-Tab Navigasi & Arsitektur Modul Financials**
> Tab *Financials* akan dilengkapi dengan **Sub-Navigasi 7 Baris** yang responsif:
> - **`History`**: Circular Score Ring (0–100), AI Fundamental Summary, 3 Quick Health Badges (Cash Flow x/5, F-Score x/9, Beneish Safe/Risk), Key Metrics Row (P/E TTM, EPS QoQ %, EPS YoY %, Rev QoQ %), dan 3-Year Narrative Card.
> - **`Valuation`**: Valuasi pita **Standard Deviation Bands Chart** (P/E TTM & P/BV 3-Tahun dengan garis pita $+2\sigma, +1\sigma, \text{Mean}, -1\sigma, -2\sigma$), toggle metrik, serta ringkasan posisi valuasi historis.
> - **`Health`**: 4 Bar Horizontal Progress (ROE/Profitability, Cash/Liquidity, DER/Solvency, Quality), serta Grid 2x2 Kartu Detail (Cash Balance, Interest Coverage Ratio, Net Debt/EBITDA, ROIC).
> - **`Quality`**: Analisis kualitas laba (*Earnings Real?*), **Segmented Bar Piotroski F-Score (9 segmen)**, **Segmented Bar Cash-Flow Quality (5 segmen)**, dan Alert Box Peringatan **Beneish M-Score (Risiko Manipulasi Laporan)**.
> - **`Outlook`**: Proyeksi konsensus sell-side (Revenue 2026F vs 2027F Progress Bars, EPS & Net Income Forecast Grid 2x2, serta Sell-Side Consensus Disclaimer).
> - **`Peers`**: Perbandingan dengan emiten sejenis di sektornya (P/E, ROE, EV/EBITDA, PBV, Market Cap, Net Income, Revenue YoY), disajikan dalam **Horizontal Bar Chart Leaderboard** dengan highlight neon emiten utama.
> - **`Risk`**: Ringkasan *Biggest Worry* & Grid 2 Kolom untuk **8 Indikator Risiko Utama** (*Going concern*, *Litigation*, *Debt covenants*, *Pledged assets*, *Tax dispute*, *Unhedged FX*, *Related party*, *Impairment*) dengan status badge *Clear/Safe* vs *Material Risk*.

> [!TIP]
> **2. Engine Kalkulasi Kuantitatif & Skor Fundamental di Backend**
> Backend akan menambahkan `financial_analytics_engine.py` untuk menghitung:
> - **Piotroski F-Score (0–9)**: 9 kriteria kualitatif keuangan (Profitabilitas, Leverage/Liquidity, Efisiensi Operasional).
> - **Beneish M-Score**: Model deteksi risiko manipulasi keuangan berbasis 8 variabel finansial (DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA).
> - **Standard Deviation Bands (P/E & P/BV)**: Menghitung mean dan standar deviasi historis 3 tahun untuk membentuk pita $+2\sigma, +1\sigma, \text{Mean}, -1\sigma, -2\sigma$.
> - **Metrik Kesehatan Lanjutan**: ROIC (*Return on Invested Capital*), Net Debt / EBITDA, Interest Coverage Ratio ($\frac{\text{EBIT}}{\text{Beban Bunga}}$).

---

## Open Questions

> [!NOTE]
> **1. Sumber Data Proyeksi Konsensus (Outlook)**
> Data konsensus estimasi analis (2026F/2027F) diambil dari agregasi data Yahoo Finance Analyst Estimates & Google Finance. Jika emiten memiliki cakupan analis terbatas (misal emiten *small-cap*), sistem akan menampilkan *Fallback Consensus Estimate* berbasis CAGR historis 3-tahun dengan badge *Historical Projection*.

---

## Proposed Changes

### Backend Services & Schemas

#### [NEW] [financial_analytics_engine.py](file:///c:/technical-automatic/backend/services/financial_analytics_engine.py)
Modul kalkulasi tingkat lanjut untuk mendukung 7 Sub-Tab:
- `calculate_piotroski_f_score(inc_stmt, bs, cf)`: Mengkalkulasi 9 poin F-Score Piotroski.
- `calculate_beneish_m_score(inc_stmt, bs)`: Mengkalkulasi Beneish M-Score & menentukan status (`SAFE` / `POSSIBLE MANIPULATION RISK`).
- `calculate_sd_bands(df_price, eps_history, bvps_history)`: Menghitung deret waktu P/E & P/BV 3-tahun serta garis $\text{Mean}, \pm 1\sigma, \pm 2\sigma$.
- `calculate_health_metrics(inc_stmt, bs, cf)`: ROIC, Net Debt/EBITDA, Interest Coverage Ratio, Cash Balance.
- `get_sector_peers_comparison(ticker, sector, metric)`: Menghasilkan data perbandingan emiten sejenis di sektor IDX.
- `evaluate_risk_matrix(inc_stmt, bs, info)`: Mengevaluasi 8 matriks risiko perusahaan.

#### [MODIFY] [models/response.py](file:///c:/technical-automatic/backend/models/response.py)
Menambahkan schema Pydantic baru untuk 7 Sub-Tab:
- `HistoryTabData`: `score_overall`, `score_status`, `ai_summary`, `cash_flow_score`, `f_score`, `beneish_status`, `pe_ttm`, `eps_qoq_pct`, `eps_yoy_pct`, `rev_qoq_pct`, `narrative_3y`, `rev_ttm`, `net_profit_ttm`.
- `ValuationBandsData`: `metric_type` (`PE` / `PBV`), `history_points`, `mean`, `sd_plus_1`, `sd_plus_2`, `sd_minus_1`, `sd_minus_2`, `min_val`, `avg_val`, `max_val`, `summary_text`.
- `HealthTabData`: `summary_text`, `roe`, `cash_score`, `der`, `quality_score`, `cash_balance`, `interest_coverage`, `net_debt_ebitda`, `roic`.
- `QualityTabData`: `summary_text`, `piotroski_f_score` (0-9), `cash_flow_quality_score` (0-5), `beneish_m_score`, `beneish_status`, `alert_warning_box`.
- `OutlookTabData`: `summary_text`, `forecast_rev_2026f`, `forecast_rev_2027f`, `eps_estimate`, `net_income_estimate`, `growth_pct`, `disclaimer`.
- `PeersTabData`: `summary_text`, `selected_metric`, `peer_list` (`ticker`, `name`, `value`, `is_target`).
- `RiskTabData`: `biggest_worry_text`, `risk_grid` (`indicator_name`, `status`, `is_risk`, `description`).
- `FinancialsAnalyticsResponse`: Menampung ketujuh struktur data sub-tab di atas.

#### [MODIFY] [analyze.py](file:///c:/technical-automatic/backend/api/endpoints/analyze.py)
- Mengintegrasikan `FinancialAnalyticsEngine` ke dalam pipeline `/api/analyze`.

---

### Frontend UI Components

#### [MODIFY] [FinancialCard.js](file:///c:/technical-automatic/frontend/src/components/FinancialCard.js)
Perombakan total antarmuka menjadi **Dashboard Navigasi 7 Sub-Tab Liquid Glass**:

1. **Sub-Navigasi Pill Bar (7 Sub-Tabs)**:
   - Header Navigasi: `[History]` `[Valuation]` `[Health]` `[Quality]` `[Outlook]` `[Peers]` `[Risk]`.
   - Smooth active state tab transition & ambient glow.

2. **Render Sub-Tab 1: History**:
   - Circular SVG Progress Ring (Skor 0-100, misal `71 Healthy`).
   - AI Narrative Summary Card (Highlight neraca, utang, kas).
   - 3 Quick Health Badges (`Cash Flow 4/5`, `F-Score 7/9`, `Beneish SAFE`).
   - 4 Cards Key Metrics Row (P/E TTM, EPS QoQ %, EPS YoY %, Rev QoQ %).
   - 3-Year History Narrative Card & Data Pendukung (Revenue TTM, Net Profit TTM).

3. **Render Sub-Tab 2: Valuation (SD Bands Chart)**:
   - Valuation Position Summary.
   - Metrik Toggle Pills (`P/E TTM` vs `PBV`).
   - **Interactive Standard Deviation Bands Chart** (Garis historis 3 tahun + Area Pita SD $+2\sigma, +1\sigma, \text{Mean}, -1\sigma, -2\sigma$).
   - Min, Avg, Max Footer Bar.

4. **Render Sub-Tab 3: Health**:
   - Health Now Executive Summary.
   - 4 Horizontal Progress Bars (Profitability/ROE, Liquidity/Cash, Solvency/DER, Earnings Quality).
   - Grid 2x2 Detailed Health Cards (Cash Balance, Interest Coverage, Net Debt/EBITDA, ROIC).

5. **Render Sub-Tab 4: Quality**:
   - *Earnings Real?* Narrative Summary.
   - **Segmented Bar Piotroski F-Score (9 segmen terpisah)**.
   - **Segmented Bar Cash-Flow Quality (5 segmen terpisah)**.
   - Beneish M-Score Warning Box (Penjelasan threshold manipulasi).

6. **Render Sub-Tab 5: Outlook**:
   - Consensus Future Projections Narrative.
   - Forecast Progress Bars (Revenue 2026F vs 2027F).
   - Grid 2x2 Forecast Cards (EPS Estimasi, Net Income Estimasi, % Growth) + Disclaimer.

7. **Render Sub-Tab 6: Peers**:
   - Vs Peers Sector Summary.
   - Metric Filter Pills (P/E, ROE, EV/EBITDA, PBV, Mkt Cap, Net Income, Rev YoY).
   - **Horizontal Bar Chart Leaderboard** (Daftar emiten sektor sejenis dengan neon highlight untuk emiten target).

8. **Render Sub-Tab 7: Risk**:
   - *Biggest Worry* Highlight Card.
   - **Grid 2-Kolom 8 Indikator Risiko** (*Going concern*, *Litigation*, *Debt covenants*, *Pledged assets*, *Tax dispute*, *Unhedged FX*, *Related party*, *Impairment*) dengan Ikon Status (*Green Check SAFE* vs *Red/Yellow WARNING*).

---

## Verification Plan

### Automated Tests
1. **Unit Test Analytics Engine** (`test_financial_analytics.py`):
   - Verifikasi kalkulasi Piotroski F-Score (0-9).
   - Verifikasi kalkulasi Beneish M-Score.
   - Verifikasi pembentukan deret Standard Deviation Bands ($+2\sigma, +1\sigma, \text{Mean}, -1\sigma, -2\sigma$).
   - Verifikasi kalkulasi ROIC, Net Debt/EBITDA, dan Interest Coverage.
2. **Next.js Production Build**:
   - `npx next build` untuk memastikan 0 error JSX/TypeScript.

### Manual Verification
1. **Uji Coba 7 Sub-Tab pada Emiten IDX Utama**:
   - Pengujian navigasi dan rendering data pada emiten `ANTM`, `BBCA`, `TLKM`, `ASII`, `BUMI`.
2. **Visual Verification**:
   - Memastikan Circular Score Ring, SD Bands Chart, Segmented Progress Bars, Peer Leaderboard, dan Risk Grid tampil sempurna dengan tema Liquid Glass Dark Mode.
