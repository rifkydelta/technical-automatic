# 3. Spesifikasi Algoritma Kuantitatif & Matematika (Quantitative Algorithms & Risk Math)

Dokumen ini membedah seluruh fondasi matematis, formula kuantitatif, model skoring 10-faktor, aturan manajemen risiko, serta logika eksekusi sinyal pada **IDX Terminal**.

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

Berdasarkan skor akhir dan tipe setup pergerakan harga:

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
Stop Loss tidak menggunakan persentase kaku (-10%), melainkan dihitung berdasarkan titik terendah ayunan 5 bar terakhir dikurangi buffer volatilitas ATR:

$$\text{RawSL} = \min\left(\text{Entry} - 1.5 \times \text{ATR}_{14}, \min_{i=0..4}(\text{Low}_{-i}) - 0.2 \times \text{ATR}_{14}\right)$$

Kemudian dibatasi oleh koridor protektif:
$$\text{SL} = \min\left(\text{Entry} \times 0.97, \max\left(\text{RawSL}, \text{Entry} \times 0.92\right)\right)$$

*Hasil: Risiko risiko per trade selalu terkunci secara ketat di antara **3.0% hingga 8.0%**.*

---

### B. Eksekusi Dual-Target (1.5R & 2.5R Multi-Tier Profit Taking)
Didefinisikan besaran risiko moneter per lembar saham:
$$\text{PriceRisk} = \text{Entry} - \text{SL}$$

Maka target profit dihitung secara matematis:
$$\text{TP1} = \text{Entry} + (1.5 \times \text{PriceRisk})$$
$$\text{TP2} = \text{Entry} + (2.5 \times \text{PriceRisk})$$

#### Logika Penguncian Breakeven pada Backtest:
- **Kondisi 1**: Saat harga mencapai $\text{High} \ge \text{TP1}$, ambil untung 50% posisi dan **pindahkan Stop Loss posisi tersisa ke $\text{Entry} \times 1.005$ (Breakeven +0.5%)**.
- **Kondisi 2**: Posisi *runner* (50% tersisa) dibiarkan berjalan hingga menyentuh $\text{TP2}$ atau keluar saat terjadi pembalikan tren Supertrend (*Chandelier Exit*).

---

### C. Formula Alokasi Lot Bursa Efek Indonesia (IDX Lot Sizing)
Di BEI, 1 Lot setara dengan 100 lembar saham. Untuk memastikan alokasi modal tidak pernah melebihi batas risiko yang diizinkan (*Risk Budget*), alokasi lot dihitung dengan pembulatan ke bawah ketat (`math.floor`):

$$\text{RiskBudget} = \text{AccountSize} \times \left(\frac{\text{RiskPerTradePct}}{100}\right)$$
$$\text{RawShares} = \left\lfloor \frac{\text{RiskBudget}}{\text{PriceRisk}} \right\rfloor$$
$$\text{RecommendedLots} = \left\lfloor \frac{\text{RawShares}}{100} \right\rfloor$$
$$\text{AllocatedCapital} = \text{RecommendedLots} \times 100 \times \text{EntryPrice}$$

---

## 5. Algoritma Smart Money Concepts (SMC Engine)

### A. Fair Value Gap (FVG)
Dideteksi pada pola 3-bar berurutan:
- **Bullish FVG**: Terjadi saat $\text{Low}_{\text{bar 3}} > \text{High}_{\text{bar 1}}$.
  $$\text{Area FVG} = [\text{High}_{\text{bar 1}}, \text{Low}_{\text{bar 3}}]$$
- **Mitigasi**: FVG dianggap *Mitigated / Inactive* saat harga di bar selanjutnya menembus area FVG ke bawah.

### B. Order Block (OB)
- **Bullish Order Block**: Candle *bearish* (merah) terakhir sebelum terjadi gelombang impulsif hijau yang menembus *swing high* sebelumnya (*Break of Structure*).
  $$\text{Area OB} = [\text{Low}_{\text{candle merah}}, \text{High}_{\text{candle merah}}]$$

### C. Break of Structure (BOS) & Change of Character (CHOCH)
- **BOS**: Penutupan harga (`Close`) menembus *Swing High* sebelumnya dalam arah tren utama.
- **CHOCH**: Penutupan harga menembus *Swing Low* terdekat saat tren naik (indikasi awal pembalikan tren).

---

## 6. Model Valuasi Fundamental Multi-Dimensi (Valuation Engine)

### A. Benjamin Graham Number
Menentukan harga wajar defensif berdasarkan nilai buku dan laba per saham:
$$\text{GrahamNumber} = \sqrt{22.5 \times \text{EPS} \times \text{BVPS}}$$

### B. Peter Lynch Fair Value Model
Berdasarkan rasio PEG wajar:
$$\text{LynchFairValue} = \text{EPS} \times \min(25.0, \max(5.0, \text{RevenueCAGR}_{3\text{y}}))$$

### C. Discounted Cash Flow (DCF - 2 Stage Model)
$$\text{DCF} = \sum_{t=1}^{5} \frac{\text{FCF}_0 \times (1 + g)^t}{(1 + r)^t} + \frac{\text{TerminalValue}}{(1 + r)^5}$$
Di mana:
- $g = \text{Tingkat pertumbuhan proyeksi (3-5 tahun)}$
- $r = \text{Discount Rate (WACC wajar: 10% - 12%)}$
- $\text{TerminalValue} = \frac{\text{FCF}_5 \times (1 + g_{\text{terminal}})}{r - g_{\text{terminal}}}$ dengan $g_{\text{terminal}} = 3.0\%$.
