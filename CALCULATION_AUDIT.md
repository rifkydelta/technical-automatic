# Technical Automatic Backend: Calculation Audit

Dokumen ini berisi dokumentasi 100% parameter perhitungan, rumus, ambang batas (threshold), dan logika keputusan yang digunakan di dalam engine `backend` proyek **Technical Automatic**. 

Dokumen ini diperuntukkan bagi keperluan audit manual agar tidak ada rumus atau angka "magic" yang terlewat. Semua tautan di dokumen ini mengarah langsung ke kode sumber (source code) yang relevan.

---

## 1. Data Fetcher (`data_fetcher.py`)
Modul ini bertugas mengambil data pasar dan fundamental dari Yahoo Finance (`yfinance`).

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Ticker Format** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L13) | `f"{ticker}.JK"` | `.JK` | Semua data diambil untuk bursa saham Indonesia (IHSG). |
| **Daily Period** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L49) | `period="1y", interval="1d"` | 1 tahun, 1 hari | Menyediakan setidaknya ~252 bar untuk perhitungan EMA 200. |
| **1H Period** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L55) | `period="730d", interval="1h"` | 730 hari, 1 jam | Maksimal hari untuk data intraday per jam dari YF. |
| **15M Period** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L58) | `period="60d", interval="15m"` | 60 hari, 15 menit | Maksimal hari untuk data 15 menit. |
| **1M Period** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L61) | `period="5d", interval="1m"` | 5 hari, 1 menit | Digunakan secara spesifik untuk perhitungan Order Flow (HAKA/HAKI). |
| **Financial Years** | [data_fetcher.py](file:///c:/technical-automatic/backend/services/data_fetcher.py#L115) | `dates[:3]` | 3 | Mengambil maksimal 3 tahun laporan keuangan terakhir. |

---

## 2. Indicator Engine (`indicator_engine.py`)
Modul ini menggunakan library `talib` (dan beberapa rumus manual) untuk menghitung indikator teknikal. 

| Indikator / Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Minimum Data Required** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L16) | `len(df) < 200` | 200 | Mencegah error perhitungan EMA 200 jika data historis kurang dari 200 candle. |
| **EMA 20, 50, 200** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L26-L28) | `talib.EMA(close, timeperiod=N)` | 20, 50, 200 | Menentukan Major Trend, Market Structure, dan Support/Resistance Dinamis. |
| **SMA 5, 10, 20, 50, 100, 200** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L121-L126) | `talib.SMA(close, timeperiod=N)` | 5, 10, 20, 50, 100, 200 | Data extended untuk ditabelkan pada tab "Technical Detail". |
| **RSI** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L31) | `talib.RSI(close, timeperiod=14)` | 14 | Menentukan Momentum (Overbought/Oversold). |
| **MACD** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L34) | `talib.MACD(fast=12, slow=26, signal=9)` | 12, 26, 9 | Menentukan persilangan (crossover) Momentum. |
| **Stoch RSI** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L39) | `STOCHRSI(t=14, fastk=14, fastd=3)` | 14, 14, 3 | Extended technical detail untuk zona jenuh. |
| **ATR** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L45) | `talib.ATR(timeperiod=14)` | 14 | Penentu jarak Stop Loss (SL) & Take Profit (TP) harian/scalping, pengukur Volatilitas. |
| **ADX & +/- DI** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L48) | `talib.ADX(timeperiod=14)` | 14 | Mengukur kekuatan (kekuatan) dari sebuah tren (Technical Detail). |
| **Bollinger Bands** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L51) | `BBANDS(timeperiod=20, up=2, dn=2)` | 20, 2σ | Sebagai Support/Resistance Dinamis dan filter Volatilitas. |
| **Average Volume** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L54) | `talib.SMA(volume, timeperiod=20)` | 20 | Menentukan apakah volume saat ini "Unusual" (Lonjakan volume). |
| **VWAP** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L87-L106) | `Cum(TP * Vol) / Cum(Vol)` | TP = (H+L+C)/3 | Menghitung harga rata-rata tertimbang berdasarkan volume historis. |
| **MFI** | [indicator_engine.py](file:///c:/technical-automatic/backend/services/indicator_engine.py#L133) | `talib.MFI(timeperiod=14)` | 14 | Menentukan arus masuk (inflow) uang ke dalam saham. |

---

## 3. Step 1: Trend Analysis (`analysis_engine.py`)
Menganalisis tren dasar pasar dengan membandingkan harga terhadap EMA20, EMA50, dan EMA200.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Strong Bullish** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L17-L19) | `Price > EMA20 > EMA50 > EMA200` | N/A | Confidence = 100%. |
| **Bullish** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L20-L22) | `Price > EMA200` AND (`EMA20 <= EMA50`) | N/A | Tren membaik tetapi struktur EMA jangka pendek belum sejajar. Confidence = 75%. |
| **Neutral (Tolerance)** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L23-L25) | `abs(Price - EMA200) / EMA200 <= 0.02` | `±2%` | Jika harga menempel sangat dekat dengan EMA 200, dianggap *Sideways*/Neutral. Confidence = 50%. |
| **Bearish** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L26-L28) | `Price < EMA200` | N/A | Confidence = 100% jika `Price < EMA50 < EMA200`, jika tidak Confidence = 75%. |
| **Trend Periodik** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L34-L36) | Jangka Pendek (`Price > EMA20`), Menengah (`> EMA50`), Besar (`> EMA200`) | N/A | Atribut individual yang ditampilkan dalam tab Technical Detail. |

---

## 4. Step 2: Market Structure (`analysis_engine.py`)
Menganalisis struktur pergerakan HH/HL atau LL/LH terbaru.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Lookback Window** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L52) | `recent = df.tail(10)` | 10 Hari Terakhir | Rentang pengamatan utama untuk struktur harga. |
| **Uptrend Threshold** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L56) | `end_price > start_price * 1.02` | `> +2%` | Menandakan *Higher High / Higher Low*. |
| **Downtrend Threshold** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L58) | `end_price < start_price * 0.98` | `< -2%` | Menandakan *Lower High / Lower Low*. |
| **Sideways Threshold** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L60-L61) | Else dari Uptrend/Downtrend | Antara `-2%` dan `+2%` | Harga berkonsolidasi. |

---

## 5. Step 3: Support & Resistance (`support_engine.py`)
Engine ini merupakan implementasi deteksi support resistance otomatis dari Prompt asli, mencari area pertemuan/konfluensi harga.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Swing Low / High** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L43-L45) | `Low == rolling_min(window=11, center=True)` | Jendela ±5 Bar (11) | Titik pantul historis (Fraktal). |
| **Margin/Toleransi Kluster** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L80) | `margin = price * 0.015` | `±1.5%` | Dinamis (EMA/BB) digabungkan menjadi satu "Zone" jika jaraknya ≤ 1.5% dari harga Swing. |
| **Score: Candlestick** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L115-L120) | Bullish/Bearish pattern `max(0, i-1)` ke `min(len, i+2)` | Jarak ±1 Bar | +1 Poin jika ada *Reversal Pattern* di sekitar Swing. |
| **Score: BB Bands** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L122-L126) | `Low <= Lowerband` atau `High >= Upperband` | Sentuhan / Breakout | +1 Poin. |
| **Score: Margin EMA** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L128-L139) | `abs(Price - EMA) <= Price * 0.01` | Jarak `≤ 1%` | +1 Poin jika Swing sangat berdekatan dengan EMA50 / EMA200. |
| **Score: RSI** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L141-L145) | Support: `RSI < 30`, Resistance: `RSI > 70` | 30 & 70 | +1 Poin jika tren memantul dari area Jenuh (*Oversold/Overbought*). |
| **Score: MACD** | [support_engine.py](file:///c:/technical-automatic/backend/services/support_engine.py#L147-L151) | MACD Crossover terjadi pada rentang waktu dekat | Jarak 3 Bar Terakhir | +1 Poin. |
| **S&R Limit** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L79) | `valid_supports[:3]`, `valid_resistances[:3]` | Maksimal 3 Level | Hanya 3 Support terkuat dan 3 Resistance terkuat yang diekspor. |
| **S&R Strength Rating** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L80) | Strong (Score ≥ 4), Medium (Score ≥ 2), Weak (<2) | 4, 2, <2 | Klasifikasi *Badge* di antarmuka (UI). |

---

## 6. Step 4: Multi-Timeframe (`analysis_engine.py`)
Mengecek kesejajaran arah tren antara Daily, 1H (1 Jam), dan 15M (15 Menit). Parameter penentuan trennya meminjam versi ringan dari logika Step 1 (EMA 20, 50, 200).

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Alignment: Confirmed** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L167-L170) | Semua indikator menunjukkan "Bullish" atau "Bearish". | 3 Timeframe Selaras | Setup Score +15 Poin. |
| **Alignment: Mixed** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L171-L172) | D, 1H, dan 15M bertabrakan. | N/A | Tren sedang tidak stabil / bergejolak. |
| **Pullback Override** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L174-L176) | `Mixed` AND `h1_trend` == Bearish AND `d_trend` == Bullish | N/A | Trend 1H akan dilabeli **Pullback** bukan sekadar "Mixed", mengindikasikan peluang entry sehat (koreksi). |

---

## 7. Step 5: Momentum (`analysis_engine.py`)
Memverifikasi kelanjutan tren melalui dua indikator dasar secara absolut.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **RSI Condition** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L190-L191) | `RSI > 50` (+1 poin) atau `RSI < 50` (-1 poin) | 50 (Garis Tengah) | Secara mentah menandakan Buyer (>50) vs Seller (<50). |
| **MACD Condition** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L193-L194) | `MACD > Signal` (+1 poin) atau `MACD < Signal` (-1 poin) | Crossover | Momentum sedang meningkat (Divergen). |
| **Final Status** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L196-L200) | Bullish (Total > 0), Bearish (Total < 0), Neutral (Total = 0) | N/A | Setup Score +15 Poin (jika Bullish). |

---

## 8. Step 6-7: Entry & Risk Management (`analysis_engine.py`)
Menentukan zona entri, Stop Loss (SL), dan Target (TP), serta kalkulasi *Risk-to-Reward Ratio (RRR)*.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **ATR Fallback** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L203-L204) | `ATR = Price * 0.02` | 2% | Digunakan jika data indikator ATR gagal dikalkulasi/tidak tersedia. |
| **Entry Jauh S1** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L234-L242) | `(Entry - S1) / Entry > 0.05` | Jarak > 5% ke S1 | Entri dilakukan di *minor pullback* (-1% ke -3%), SL di -4%. |
| **Entry Dekat S1** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L243-L253) | Jarak 0% hingga 5% | 0% - 5% | Entri `[S1] s.d. [Current]`, SL ditaruh *3% di bawah S1* (`S1 * 0.97`) sebagai buffer. |
| **Entry Breakdown** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L254-L259) | Jarak < 0% (Current < S1) | Harga di bawah S1 | SL Default -5% dari harga saat ini. |
| **Fallback Take Profit** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L261-L263) | TP1=1.05, TP2=1.10, TP3=1.15 | +5%, +10%, +15% | Secara default digunakan jika Resistensi Dinamis gagal ditemukan. |
| **S&R Take Profit** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L265-L270) | TP diset berdasarkan R1, R2, R3. | Area R1, R2, R3 | Target sesuai area harga penolakan (Swing High) masa lalu. |
| **TP Override** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L272-L278) | Jika `TP(n) <= Harga Bawahnya` | +5% incremental | Mencegah anomali logika perhitungan (SL/TP tertukar atau Target yang lebih rendah dari Entri). Dipaksa kelipatan +5%. |
| **RR Rejection** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L291) | `RR < 2.0` | 2.0x RRR | Strategi *Swing* otomatis ditandai *Rejected* di backend (menentukan Rekomendasi). |

---

## 9. Step 8: Order Flow (`analysis_engine.py`)
Mendeteksi apakah *smart money/bandar* sedang mengakumulasi atau mendistribusikan barang berdasarkan grafik intraday per 1-menit.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **HAKA vs HAKI Volume** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L323-L328) | Posisi = `(Close - Low) / (High - Low)`. HAKA Vol += `Vol * Posisi` | N/A | Fraksi candle (atas/bawah) menentukan proporsi volume yang dianggap sebagai Agresif Beli vs Jual. |
| **Unusual Volume Spike** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L315) | `vol > (avg_vol * 4)` | > 4x Rata-rata 5 Hari | Menandai area harga krusial pertempuran Bandar (Accum/Distrib Area). |
| **Status: Accumulation** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L335) | `HAKA_PCT > 55` | > 55% Beli | Status "Buyer Mendominasi", Setup Score +5 Poin. |
| **Status: Distribution** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L342) | `HAKA_PCT < 45` | < 45% Beli | Status "Seller Mendominasi". |
| **Status: Neutral** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L349) | `45 <= HAKA_PCT <= 55` | 45% - 55% | Konsolidasi transaksi. |

---

## 10. Step 9: Scenarios (`analysis_engine.py`)
Membuat 3 probabilitas jalan harga ke depan berdasarkan *Trend Besar*.

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **Probabilitas Absolut** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L428-L439) | Primary (50%), Alternative (35%), Worst Case (15%) | 50, 35, 15 | Nilai statis persentase bobot kemungkinan skenario. |
| **Fallback S&R Skala** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L418-L421) | `S1 = Price * 0.95`, `S2 = S1 * 0.95`, `R1 = Price * 1.05`, `R2 = R1 * 1.05` | ±5%, ±9.75%, ±10.25% | Jika saham tidak memiliki historikal S/R di database, gunakan S1/R1 kelipatan 5%. |

---

## 11. Step 10: Technical Detail (`analysis_engine.py`)
Informasi extended, klasifikasi status *regime* harga, dan Strategi 3 Waktu (Scalping, Intraday, Swing).

| Parameter | File & Baris | Formula / Logika | Nilai / Threshold | Pengaruh |
| --- | --- | --- | --- | --- |
| **ADX (Trend Strength)** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L446-L450) | Strong (>25), Emerging (>20), Weak (<20) | 25, 20 | Menentukan kekuatan tren untuk kualifikasi Setup Grade. |
| **Trend Grading (A-E)** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L467-L478) | *Grade A*: Bullish, ADX>25, Harga > Semua SMA. *Grade B*: Bullish, ADX>20. *Grade D*: Bearish, ADX>20. *Grade E*: Bearish, ADX>25, Harga < Semua SMA. *Grade C*: Fallback. | N/A | Tampilan Kualitas *Grade* (*Overall Trend Score*). |
| **RSI & MFI Zone** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L496,L506) | Overbought (>70/>80), Oversold (<30/<20) | 70/30 (RSI), 80/20 (MFI) | Indikator Jenuh Beli / Jual. |
| **Stochastic RSI Zone** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L501) | Overbought (>80), Oversold (<20) | 80, 20 | Indikator Jenuh Beli / Jual. |
| **MACD Cross Type** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L513-L519) | Golden Cross (`MACD > Sig` di area minus), Death Cross (`MACD < Sig` di area plus) | < 0 , > 0 | Menandakan persilangan tren positif/negatif yang tervalidasi area 0. |
| **ATR Volatility Regime** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L539-L542) | Low (<1%), Normal (<2%), Elevated (<3%), Extreme (≥3%) | 1%, 2%, 3% | Mengkategorikan level kebisingan/pergerakan harga instrumen harian. |
| **BB Position** | [analysis_engine.py](file:///c:/technical-automatic/backend/services/analysis_engine.py#L556-L558) | Upper (`Price > U`), Lower (`Price < L`), Middle | N/A | Identifikasi status ekstensi pita pergerakan Bollinger Bands. |

### 12. Strategi Parameter
| Timeframe Strategi | Parameter Internal | Formula / Logika | Nilai (Multiplier) | Pengaruh |
| --- | --- | --- | --- | --- |
| **Swing** (Hari-Minggu) | Trigger Price | Bullish: `High * 1.015`, Else: `High * 1.01` | +1.5%, +1.0% | Harga konfirmasi entri yang aman. |
| **Intraday** (1 Hari) | TP1, TP2, SL | `TP1 = P + 1.5 ATR`, `TP2 = P + 2 ATR`, `SL = P - 1 ATR` | 1.5x, 2.0x, -1.0x | Pergerakan harian diatur murni berdasarkan ATR. |
| **Intraday** (1 Hari) | TP1 Cap | Jika `TP1 > (Swing R1 * 1.02)`, kurangi multiplier. | TP1=1.0x, TP2=1.5x | Mencegah Intraday TP melangkahi Swing S&R di aset highly volatile. |
| **Intraday** (1 Hari) | Trigger Price | Breakout: `High * 1.005`, Else: `High * 1.002` | +0.5%, +0.2% | Momentum jangka pendek. |
| **Scalping** (< Jam) | TP1, TP2, SL | `TP1 = P + 0.8 ATR`, `TP2 = P + 1.2 ATR`, `SL = P - 0.5 ATR` | 0.8x, 1.2x, -0.5x | Entri ber-risiko ketat dengan margin pergerakan sempit. |
| **Strategy Grading** | [Grade Mapping](file:///c:/technical-automatic/backend/services/analysis_engine.py#L609-L611) | A (RR ≥ 3), B (RR ≥ 2), C (RR ≥ 1), D (RR < 1) | 3, 2, 1 | Grade *Risk-to-Reward Ratio (RR)* per strategi (bukan Grade tren). |

---

## 13. Scoring Engine (`scoring_engine.py`)
Mesin persentase bobot konfluensi dari keseluruhan variabel di dalam sistem, ditotal menghasilkan skor mutlak (Maks 100).

| Bagian Parameter | File & Baris | Logika Kriteria | Poin |
| --- | --- | --- | --- |
| **1. Trend Besar** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L19-L20) | Jika `Trend Besar == "Bullish"` | +30 |
| **2. Support Resistance** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L22-L23) | Jika ada area Support valid yang dikalkulasi | +20 |
| **3. Multi Timeframe** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L25-L26) | Jika tren Daily, 1H, 15M selaras ("Confirmed") | +15 |
| **4. Momentum** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L28-L29) | Jika RSI + MACD positif ("Bullish") | +15 |
| **5. Volume Base** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L31-L32) | Jika Volume terakhir > SMA20 Volume (Unusual / Elevated) | +10 |
| **6. Risk Reward** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L34-L35) | Jika Target (TP) lebih dari 2x SL (`is_rejected == False`) | +5 |
| **7. Order Flow** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L37-L38) | Jika pertempuran dikuasai HAKA ("Accumulation") | +5 |
| **Display Score (1-5)** | [scoring_engine.py](file:///c:/technical-automatic/backend/services/scoring_engine.py#L50) | `max(1, round(Score / 20))` | 1-5 Bintang |

**Score Ratings Classification:**
- `≥ 90`: "Strong Bullish Setup"
- `≥ 80`: "Bullish Setup"
- `≥ 70`: "Cautious Bullish Bounce"
- `≥ 60`: "Weak Setup"
- `< 60`: "Bearish Setup"

---

## 14. Recommendation Engine (`recommendation.py`)
Menerjemahkan *Setup Score* dan struktur risiko/tren ke dalam sebuah rekomendasi absolut untuk Action (Buy/Sell).

| Rekomendasi | File & Baris | Logika Trigger (*Waterfall Rules*) |
| --- | --- | --- |
| **NOT BUY** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L13-L14) | `Trend Besar == "Bearish"` AND `Score < 50` |
| **WAIT (1)** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L15) | `Trend Besar == "Bearish"` AND `Score >= 50` (Risiko trend besar turun). |
| **WAIT (2)** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L18) | `is_rejected == True` (Risk Reward Ratio kurang dari 1:2). |
| **STRONG BUY** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L21) | Kondisi aman + `Score >= 90` |
| **BUY** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L23) | Kondisi aman + `Score >= 70` |
| **WATCHLIST** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L25) | Kondisi aman + `Score >= 60` |
| **WAIT (3)** | [recommendation.py](file:///c:/technical-automatic/backend/services/recommendation.py#L27) | `Score < 60` (Kondisi pasar lemah). |

---

*Dokumen ini menjabarkan seluruh kerangka logika teknikal yang mendasari analisis backend Technical Automatic.* 
*Dibuat untuk mempermudah pengecekan dan tuning akurasi pergerakan algoritmik bot perdagangan/analis.*
