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

### B. Dual-Target Execution & Breakeven Lock
1. **Target 1 ($\text{TP}_1$)**: $\text{Entry} + 1.5 \times (\text{Entry} - \text{SL})$
   - Saat $\text{TP}_1$ tersentuh, 50% porsi posisi dilikuidasi untuk mengamankan profit.
   - Level Stop Loss untuk sisa porsi 50% otomatis digeser ke *Breakeven (+0.5%)* untuk menghilangkan risiko kerugian.
2. **Target 2 ($\text{TP}_2$)**: $\text{Entry} + 2.5 \times (\text{Entry} - \text{SL})$
   - Sebagai target *runner* untuk memaksimalkan keuntungan pada tren besar.

### C. Alokasi Lot Bulat Saham BEI (IDX 100-Shares Lot Math)
Untuk menjamin tidak ada kesalahan pecahan lot dalam eksekusi pasar nyata di Bursa Efek Indonesia:

$$\text{RiskPerShare} = \text{Entry} - \text{SL}$$

$$\text{MaxLossNominal} = \text{ModalPortofolio} \times \text{MaxRiskPct}$$

$$\text{Lots} = \left\lfloor \frac{\text{MaxLossNominal}}{\text{RiskPerShare} \times 100} \right\rfloor$$

$$\text{Shares} = \text{Lots} \times 100$$

$$\text{TotalInvestasi} = \text{Shares} \times \text{Entry}$$

---

## 5. Mesin Waktu Eksekusi 1-Jam Intraday (1H Intraday Entry Timing Engine)

Sinyal Daily di-breakdown ke grafik 1-Jam untuk menemukan jam eksekusi bursa terbaik:
1. **Area Entry 1H**:
   $$\text{ZoneLow} = \min(\text{EMA}_{9,\text{H1}}, \text{EMA}_{21,\text{H1}})$$
   $$\text{ZoneHigh} = \max(\text{EMA}_{9,\text{H1}}, \text{EMA}_{21,\text{H1}})$$
2. **Status Konfirmasi Entry**:
   - Jika $\text{CurrentPrice} \le \text{ZoneHigh} \times 1.01 \land \text{CurrentPrice} \ge \text{ZoneLow} \times 0.99$: **`ENTRY NOW`** (Harga berada tepat di area akumulasi).
   - Jika $\text{CurrentPrice} > \text{ZoneHigh} \times 1.01$: **`WAIT FOR PULLBACK`** (Harga sudah agak tinggi, tunggu retest).

---

## 6. Forensik Laba & Fundamental Kuantitatif

### A. 9-Kriteria Piotroski F-Score (Kualitas Fundamental)
Menilai profitabilitas, leverage, likuiditas, dan efisiensi operasional emiten (Skor 0-9):
- **Skor 8 - 9**: Fundamental Istimewa (*High Quality / Safe Value*).
- **Skor 5 - 7**: Fundamental Stabil / Moderat.
- **Skor 0 - 4**: Risiko Kerapuhan Finansial (*Financial Distress Risk*).

### B. 8-Rasio Beneish M-Score (Deteksi Manipulasi Laporan Keuangan)
Mendeteksi anomali laba akrual dan manipulasi pendapatan:
$$M = -4.84 + 0.920 \cdot \text{DSRI} + 0.528 \cdot \text{GMI} + 0.404 \cdot \text{AQI} + 0.892 \cdot \text{SGI} + 0.115 \cdot \text{DEPI} - 0.172 \cdot \text{SGAI} + 4.037 \cdot \text{TATA} + 0.0327 \cdot \text{LVGI}$$

- Jika $M < -1.78$: **`UNLIKELY MANIPULATOR`** (Laba bersih wajar dan kredibel).
- Jika $M \ge -1.78$: **`POTENTIAL MANIPULATOR`** (Waspada anomali akrual agresif).
