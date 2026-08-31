# 3. Spesifikasi Algoritma Kuantitatif, SMC & Forensik Pasar Modal

Dokumen ini membedah seluruh fondasi matematis, formula kuantitatif, model skoring 10-faktor, aturan manajemen risiko, formula audit forensik laba (Piotroski & Beneish), level pivot multi-metode, serta logika eksekusi sinyal pada **IDX Terminal**.

---

## 1. Model Skoring Kuantitatif 10-Faktor (RELT 10-Factor Scoring Model)

Mesin `ReltSignalEngine` mengevaluasi kondisi teknikal emiten dengan rentang skor **0 hingga 100 poin** melalui akumulasi 10 faktor kuantitatif berbobot:

$$\text{Score} = \min\left(100.0, \max\left(0.0, \sum_{i=1}^{10} W_i \cdot C_i\right)\right)$$

| No | Faktor Analisis | Bobot ($W_i$) | Kriteria & Kondisi Evaluasi ($C_i$) |
| :---: | :--- | :---: | :--- |
| **1** | **Trend Alignment** | **+20** | `Close > EMA 50` AND (`Close > EMA 200` jika ada) AND `EMA 9 > EMA 21`. |
| **2** | **Supertrend Polarity** | **+15** | `Supertrend Trend == 'Bullish'` (Garis hijau di bawah harga). |
| **3** | **MACD Momentum** | **+15** | `MACD Line > Signal Line` (Histogram bernilai positif atau membesar). |
| **4** | **RSI Optimal Range** | **+10** | `50.0 <= RSI 14 <= 75.0` (Momentum bullish sehat, tidak *oversold* parah & tidak *extreme overbought*). |
| **5** | **Volume Surge / Liquidity** | **+10** | `Volume >= VolMA20 * 1.15` (Breakout) atau `Volume >= VolMA20 * 0.85` (Pullback). |
| **6** | **SMC Confirmation** | **+10** | Terdapat `Active Bullish FVG` di dekat harga ATAU `Active Bullish Order Block` yang belum tertembus. |
| **7** | **Candlestick Pattern** | **+5** | Pola pembalikan bullish: `Hammer`, `Bullish Engulfing`, atau `Morning Star`. |
| **8** | **Chart Pattern** | **+5** | Terdeteksi pola struktural `Double Bottom`, `Ascending Triangle`, atau `Channel Breakout`. |
| **9** | **Risk / Reward Ratio** | **+5** | Rasio reward-to-risk $\frac{\text{TP2} - \text{Entry}}{\text{Entry} - \text{SL}} \ge 2.0$. |
| **10**| **Low Volatility Risk** | **+5** | Risiko Stop Loss terukur $\le 6.0\%$ terhadap harga entry. |

---

## 2. Gerbang Tren Makro Ketat (Strict Trend Regime Gate)

Untuk mengatasi **Counter-Trend Trap** (membeli saham yang sedang jatuh bebas / *major bear trend*), mesin menerapkan gerbang validasi biner sebelum sinyal beli diperbolehkan:

$$\text{TrendRegimeOK} = \left(\text{Close} > \text{EMA}_{50}\right) \land \left(\text{Close} > \text{EMA}_{200} \lor \text{len} < 200\right) \land \left(\text{Supertrend} = \text{Bullish}\right)$$

> **Aturan Penalti Keras**: Jika $\text{TrendRegimeOK} = \text{False}$, skor total langsung dipotong secara agresif:
> $$\text{Score}_{\text{final}} = \min(\text{Score} \times 0.40, 45.0)$$
> Tindakan (*Action*) otomatis dipaksa menjadi **`WAIT`** atau **`RISK WARNING`**, sehingga saham yang sedang *downtrend* tidak akan pernah menghasilkan sinyal `BUY`.

---

## 3. Klasifikasi Rating & Aksi Sinyal (Action Badges)

| Skor Akhir | Status Setup | Action Badge | Rating Kategori | Rekomendasi |
| :---: | :---: | :---: | :---: | :---: |
| **$\ge 80$** | Breakout / Pullback Sehat | **`ULTRA BUY`** | **Grade A+** | Beli Agresif / Swing Trade Prioritas |
| **$65 - 79$** | Konfirmasi Tren Kuat | **`STRONG BUY`** | **Grade A** | Beli Bertahap / Akumulasi |
| **$50 - 64$** | Retracement ke EMA 9/21 | **`PULLBACK BUY`** | **Grade B+** | Beli di Area Support |
| **$45 - 49$** | Konsolidasi / Netral | **`WATCH BUY`** | **Grade B** | Pantau Konfirmasi Volume |
| **$< 45$** | Di Bawah EMA 50 / Downtrend | **`WAIT`** | **Grade D (Avoid)** | Hindari / Tunggu Reversal Valid |

---

## 4. Manajemen Risiko Adaptif (Adaptive Risk Management Math)

### A. Stop Loss Berbasis Struktur Pasar (Dynamic Swing-Low Invalidation)
$$\text{RawSL} = \min\left(\text{Entry} - 1.5 \times \text{ATR}_{14}, \min_{i=0..4}(\text{Low}_{-i}) - 0.2 \times \text{ATR}_{14}\right)$$

Dibatasi oleh koridor protektif:
$$\text{SL} = \min\left(\text{Entry} \times 0.97, \max\left(\text{RawSL}, \text{Entry} \times 0.92\right)\right)$$

*Hasil: Risiko per trade selalu terkunci secara ketat di antara **3.0% hingga 8.0%**.*

---

### B. Eksekusi Dual-Target (1.5R & 2.5R Multi-Tier Profit Taking)
$$\text{PriceRisk} = \text{Entry} - \text{SL}$$
$$\text{TP1} = \text{Entry} + (1.5 \times \text{PriceRisk})$$
$$\text{TP2} = \text{Entry} + (2.5 \times \text{PriceRisk})$$

- **Kondisi 1**: Saat harga mencapai $\text{High} \ge \text{TP1}$, ambil untung 50% porsi dan **pindahkan Stop Loss ke $\text{Entry} \times 1.005$ (Breakeven +0.5%)**.
- **Kondisi 2**: Posisi *runner* (50% tersisa) dibiarkan berjalan hingga menyentuh $\text{TP2}$ atau keluar saat terjadi pembalikan tren Supertrend (*Chandelier Exit*).

---

### C. Formula Alokasi Lot Bursa Efek Indonesia (IDX Lot Sizing)
Di BEI, 1 Lot setara dengan 100 lembar saham. Alokasi lot dihitung dengan pembulatan ke bawah ketat (`math.floor`):

$$\text{RiskBudget} = \text{AccountSize} \times \left(\frac{\text{RiskPerTradePct}}{100}\right)$$
$$\text{RawShares} = \left\lfloor \frac{\text{RiskBudget}}{\text{PriceRisk}} \right\rfloor$$
$$\text{RecommendedLots} = \left\lfloor \frac{\text{RawShares}}{100} \right\rfloor$$
$$\text{AllocatedCapital} = \text{RecommendedLots} \times 100 \times \text{EntryPrice}$$

---

## 5. Algoritma Smart Money Concepts (SMC Engine)

### A. Fair Value Gap (FVG)
Dideteksi pada pola 3-bar berurutan:
- **Bullish FVG**: Terjadi saat $\text{Low}_{\text{bar 3}} > \text{High}_{\text{bar 1}}$ dengan $\text{Area FVG} = [\text{High}_{\text{bar 1}}, \text{Low}_{\text{bar 3}}]$.
- **Mitigasi**: FVG dianggap *Mitigated / Inactive* saat harga di bar selanjutnya menembus area FVG ke bawah.

### B. Order Block (OB)
- **Bullish Order Block**: Candle *bearish* (merah) terakhir sebelum terjadi gelombang impulsif hijau yang menembus *swing high* sebelumnya (*Break of Structure*). $\text{Area OB} = [\text{Low}_{\text{candle merah}}, \text{High}_{\text{candle merah}}]$.

### C. Break of Structure (BOS) & Change of Character (CHOCH)
- **BOS**: Penutupan harga (`Close`) menembus *Swing High* sebelumnya dalam arah tren utama.
- **CHOCH**: Penutupan harga menembus *Swing Low* terdekat saat tren naik (indikasi awal pembalikan tren).

---

## 6. Model Forensik Laba & Kualitas Keuangan

### A. Piotroski 9-Point F-Score
Mengukur kekuatan finansial fundamental dengan skor diskrit 0 hingga 9:

$$\text{F\_Score} = \sum_{k=1}^{9} F_k$$

1. **Profitabilitas (4 Poin)**:
   - $F_1 = 1$ jika $\text{ROA} > 0$
   - $F_2 = 1$ jika $\text{CFO} > 0$
   - $F_3 = 1$ jika $\Delta\text{ROA} > 0$ (ROA tahun ini > ROA tahun lalu)
   - $F_4 = 1$ jika $\text{CFO} > \text{Net Income}$ (Kualitas akrual sehat)
2. **Leverage & Likuiditas (3 Poin)**:
   - $F_5 = 1$ jika $\Delta\text{Long-Term Debt} \le 0$ (Utang jangka panjang tidak membengkak)
   - $F_6 = 1$ jika $\Delta\text{Current Ratio} > 0$ (Likuiditas lancar membaik)
   - $F_7 = 1$ jika Tidak ada penerbitan saham baru / dilusi ekuitas
3. **Efisiensi Operasional (2 Poin)**:
   - $F_8 = 1$ jika $\Delta\text{Gross Margin} > 0$
   - $F_9 = 1$ jika $\Delta\text{Asset Turnover} > 0$

*Interpretasi: `8-9 (Sangat Sehat / Pristine)`, `5-7 (Stabil / Wajar)`, `0-4 (Risiko Finansial Tinggi)`.*

---

### B. Beneish 8-Variable M-Score (Deteksi Manipulasi Laba)
$$\text{M-Score} = -4.84 + 0.920 \cdot \text{DSRI} + 0.528 \cdot \text{GMI} + 0.404 \cdot \text{AQI} + 0.892 \cdot \text{SGI} + 0.115 \cdot \text{DEPI} - 0.172 \cdot \text{SGAI} + 4.037 \cdot \text{TATA} + 0.0327 \cdot \text{LVGI}$$

Di mana:
- $\text{DSRI} = \frac{\text{Receivables}_t / \text{Sales}_t}{\text{Receivables}_{t-1} / \text{Sales}_{t-1}}$ (Days Sales in Receivables Index)
- $\text{GMI} = \frac{\text{Gross Margin}_{t-1}}{\text{Gross Margin}_t}$ (Gross Margin Index)
- $\text{AQI} = \frac{1 - (\text{Current Assets}_t + \text{PP\&E}_t + \text{Securities}_t)/\text{Total Assets}_t}{1 - (\text{Current Assets}_{t-1} + \text{PP\&E}_{t-1} + \text{Securities}_{t-1})/\text{Total Assets}_{t-1}}$ (Asset Quality Index)
- $\text{SGI} = \frac{\text{Sales}_t}{\text{Sales}_{t-1}}$ (Sales Growth Index)
- $\text{DEPI} = \frac{\text{Depr Rate}_{t-1}}{\text{Depr Rate}_t}$ (Depreciation Index)
- $\text{SGAI} = \frac{\text{SG\&A}_t / \text{Sales}_t}{\text{SG\&A}_{t-1} / \text{Sales}_{t-1}}$ (Sales, General & Admin Expense Index)
- $\text{TATA} = \frac{\text{Net Income}_t - \text{CFO}_t}{\text{Total Assets}_t}$ (Total Accruals to Total Assets)
- $\text{LVGI} = \frac{\text{Total Long-Term Debt}_t / \text{Total Assets}_t}{\text{Total Long-Term Debt}_{t-1} / \text{Total Assets}_{t-1}}$ (Leverage Index)

> **Ambang Batas Manipulasi**:
> - Jika $\text{M-Score} > -1.78 \implies$ **High Probability of Earnings Manipulation (Bahaya)**.
> - Jika $\text{M-Score} \le -1.78 \implies$ **Low Probability of Manipulation (Laporan Keuangan Wajar)**.

---

### C. DuPont 3-Way ROE Decomposition
$$\text{ROE} = \underbrace{\left(\frac{\text{Net Income}}{\text{Revenue}}\right)}_{\text{Net Profit Margin}} \times \underbrace{\left(\frac{\text{Revenue}}{\text{Total Assets}}\right)}_{\text{Asset Turnover}} \times \underbrace{\left(\frac{\text{Total Assets}}{\text{Equity}}\right)}_{\text{Financial Leverage Multiplier}}$$

---

## 7. Model Valuasi Fundamental Multi-Dimensi

### A. Benjamin Graham Number
$$\text{GrahamNumber} = \sqrt{22.5 \times \text{EPS} \times \text{BVPS}}$$

### B. Peter Lynch Fair Value Model
$$\text{LynchFairValue} = \text{EPS} \times \min(25.0, \max(5.0, \text{RevenueCAGR}_{3\text{y}}))$$

### C. Discounted Cash Flow (DCF - 2 Stage Model)
$$\text{DCF} = \sum_{t=1}^{5} \frac{\text{FCF}_0 \times (1 + g)^t}{(1 + r)^t} + \frac{\text{TerminalValue}}{(1 + r)^5}$$
Dengan $r = 10\% - 12\%$ dan $g_{\text{terminal}} = 3.0\%$.

---

## 8. Formula Level Pivot Dinamis (Dynamic Pivot Levels)

Dihitung berdasarkan bar Harian sebelumnya ($\text{High}_H, \text{Low}_L, \text{Close}_C, \text{Open}_O$):

### A. Classic Floor Pivot
$$\text{Pivot } P = \frac{H + L + C}{3}$$
$$R_1 = (2 \times P) - L, \quad S_1 = (2 \times P) - H$$
$$R_2 = P + (H - L), \quad S_2 = P - (H - L)$$

### B. Fibonacci Pivot Levels
$$R_3 = P + 1.000 \times (H - L), \quad S_3 = P - 1.000 \times (H - L)$$
$$R_2 = P + 0.618 \times (H - L), \quad S_2 = P - 0.618 \times (H - L)$$
$$R_1 = P + 0.382 \times (H - L), \quad S_1 = P - 0.382 \times (H - L)$$

### C. Camarilla Equation Levels
$$R_4 = C + 1.1 \times \frac{H - L}{2}, \quad S_4 = C - 1.1 \times \frac{H - L}{2}$$
$$R_3 = C + 1.1 \times \frac{H - L}{4}, \quad S_3 = C - 1.1 \times \frac{H - L}{4}$$

---

## 9. Kalkulasi Floating PnL & Trailing SL Personal

Bila pengguna memasukkan harga modal beli rata-rata ($\text{AvgPrice}$):

$$\text{Floating PnL \%} = \left(\frac{\text{LastPrice} - \text{AvgPrice}}{\text{AvgPrice}}\right) \times 100\%$$

$$\text{Trailing SL (Profit Lock)} = \begin{cases} 
\max(\text{AvgPrice} \times 1.01, \text{Low}_{3\text{d}}), & \text{jika Floating PnL } \ge +5.0\% \\
\text{AvgPrice} \times 1.005 \text{ (BEP)}, & \text{jika Floating PnL } \in [2.0\%, 5.0\%) \\
\text{Standard RELT SL}, & \text{jika Floating PnL } < 2.0\%
\end{cases}$$
