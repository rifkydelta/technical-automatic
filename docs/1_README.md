# IDX Terminal | Pro Algorithmic Market Intelligence

> **Platform Analisis Kuantitatif, Smart Money Concepts (SMC), dan Pemindai Sinyal Realtime (1H & Daily) untuk Pasar Saham Indonesia (Bursa Efek Indonesia / IDX).**

---

## 🌟 Ringkasan Eksekutif (Executive Summary)

**IDX Terminal** adalah platform intelijen pasar saham canggih yang dirancang untuk mentransformasi analisis teknikal tradisional menjadi sistem keputusan kuantitatif institusional (*high-probability quantitative decision system*). 

Dibangun dengan arsitektur modern berkecepatan tinggi (**FastAPI** di sisi backend dan **Next.js 16 App Router + Turbopack** di sisi frontend), platform ini menyajikan analisis multi-dimensi instan dalam 1-klik untuk seluruh emiten yang terdaftar di Bursa Efek Indonesia (BEI / IDX).

---

## ⚡ 1-Click Quickstart Guide (Windows)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🚀 CARA PALING CEPAT (1-KLIK)                       │
│                                                                             │
│   1. Double-Click berkas: setup.bat   (Hanya jika pertama kali menginstall)  │
│   2. Double-Click berkas: run.bat     (Untuk menjalankan seluruh aplikasi)   │
│                                                                             │
│   👉 Web Browser akan siap di: http://localhost:3000                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Instalasi Otomatis (`setup.bat`)**:
   - Skrip membuat `backend/venv`, menginstall library Python (`requirements.txt`), dan `npm install` pada frontend.
2. **Jalankan Aplikasi (`run.bat`)**:
   - Skrip membersihkan port lama (:8000 & :3000), menyalakan backend FastAPI di port 8000 dan frontend Next.js di port 3000 dalam 2 jendela terpisah.

---

## 🚀 Fitur Unggulan (Core Features)

### 1. 📡 Live Signal Scanner (Realtime 1H Intraday & Daily Parity)
- Pemindai otomatis 800+ emiten bursa dengan filter tren ketat (*Strict Trend Regime Gate*).
- Deteksi jam eksekusi bursa presisi pada grafik 1-Jam (*1H Entry Area & Confirmation Status*).
- Riwayat performa dan *backtest win rate* transparan untuk setiap trade signal (Grade A+, A, B).
- Toolbar interaktif dengan pencarian kode saham instan dan filter status (*Hanya OPEN, Ultra/Strong Buy, TP Hit, SL Hit*).

### 2. ⚡ High-Probability RELT Quantitative Trading Engine
- **10-Factor Scoring Model**: Evaluasi komprehensif dari 0 hingga 100 berdasarkan tren makro, momentum, volume surge, order block, FVG, dan rasio risiko.
- **Dynamic Swing-Low Invalidation (SL)**: Kalkulasi Stop Loss adaptif berbasis titik kritis struktur pasar $\min(\text{Swing Low 5-Bars}, \text{Entry} - 1.5\times\text{ATR})$ dalam koridor aman `[3.0%, 8.0%]`.
- **Dual-Target Execution (1.5R & 2.5R)**: TP1 mengunci profit 50% porsi dan otomatis memindahkan SL ke *Breakeven (+0.5%)*; TP2 sebagai target *runner* tren besar.
- **IDX Lot Sizing Math**: Perhitungan alokasi lot bulat pasti menggunakan `math.floor` ketat (1 Lot = 100 Lembar).

### 3. 🧠 Smart Money Concepts (SMC) & Deteksi Pola Grafik
- Deteksi otomatis Fair Value Gaps (*Bullish & Bearish FVG*), Order Blocks (OB), Break of Structure (BOS), Change of Character (CHOCH), dan Liquidity Sweeps.
- Pengenalan pola grafik klasik (*Double Bottom, Head & Shoulders, Ascending Triangle, Channel*) dan pola candlestick impulsif (*Hammer, Bullish Engulfing, Morning Star*).

### 4. 🔍 Multi-Strategy Screener & Preset Hub
- Preset bawaan: **Bluechip LQ45**, **High Dividend Yield**, **BPJS Daytrade**, **BSJP 15:30 (Beli Sore Jual Pagi)**, **Rebound MA20**, dan **Breakout 52-Week High**.
- Kemampuan pemindaian kustom multi-emiten secara paralel dengan komparasi volume 20-hari dan target hari pencapaian TP.

### 5. 💎 Multi-Model Fundamental Valuation & 3-Year CAGR
- Evaluasi nilai wajar (*Fair Value*) emiten menggunakan model:
  - **Discounted Cash Flow (DCF)**
  - **Benjamin Graham Number** ($\sqrt{22.5 \times \text{EPS} \times \text{BVPS}}$)
  - **Peter Lynch Fair Value Model**
  - **PBV Historical Band & Trailing PE**
- Analisis pertumbuhan 3-tahun: Revenue CAGR, Net Income CAGR, ROE, ROA, DER, dan Cash Flow Quality Ratio.

### 6. 📚 Learning Center & Strategy Knowledge Hub
- 8 modul edukasi terstruktur mengenai SMC, Order Flow, ATR Volatilitas, Risk Management, Psikologi Trading, dan Panduan Praktis Stop Loss.

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND APPLICATION                          │
│     Next.js 16 (Turbopack) • React 19 • Vanilla CSS Design System      │
│     Lightweight Charts v4 • TradingView Widgets • Lucide Icons         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (REST API / Async HTTP)
┌───────────────────────────────────▼────────────────────────────────────┐
│                           BACKEND ENGINE                               │
│     FastAPI • Python 3.12 • Pandas • NumPy • TA-Lib • yfinance         │
│     In-Memory TTL Caching (30s) • Multi-Threaded Concurrent Workers     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         PERSISTENT STORAGE                             │
│     SQLite 3 in High-Concurrency WAL Mode (signals.db)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Navigasi Berkas Dokumentasi Lengkap

1. [🏛️ **Arsitektur Sistem & Aliran Data** (`docs/2_SYSTEM_ARCHITECTURE.md`)](./2_SYSTEM_ARCHITECTURE.md)
2. [📐 **Spesifikasi Algoritma Kuantitatif & Matematika** (`docs/3_QUANTITATIVE_ALGORITHMS.md`)](./3_QUANTITATIVE_ALGORITHMS.md)
3. [🌐 **Spesifikasi REST API Lengkap** (`docs/4_API_SPECIFICATION.md`)](./4_API_SPECIFICATION.md)
4. [🎨 **Frontend Design System & Charting Engine** (`docs/5_FRONTEND_DESIGN_SYSTEM.md`)](./5_FRONTEND_DESIGN_SYSTEM.md)
5. [💾 **Database Schema & SQLite WAL Concurrency** (`docs/6_DATABASE_SCHEMA_WAL.md`)](./6_DATABASE_SCHEMA_WAL.md)
6. [🚀 **Panduan Deployment & Operasional** (`docs/7_DEPLOYMENT_OPERATIONS.md`)](./7_DEPLOYMENT_OPERATIONS.md)

---

## 👨‍💻 Pengembang & Lisensi
- **Lead Developer**: [@rifkydelta](https://github.com/rifkydelta)
- **Lisensi**: Proprietary / Hak Cipta Dilindungi Undang-Undang.
