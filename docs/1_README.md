# 1. IDX Terminal | Ringkasan Proyek & Fitur Lengkap

> **Platform Analisis Kuantitatif, Smart Money Concepts (SMC), Pemindai Sinyal Realtime (1H & Daily), Forensik Laba, serta AI Market Intelligence Hub untuk Seluruh Saham Bursa Efek Indonesia (BEI / IDX).**

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
   - Skrip membuat `backend/venv`, menginstall library Python (`requirements.txt`), dan menjalankan `npm install` pada frontend.
2. **Jalankan Aplikasi (`run.bat`)**:
   - Skrip membersihkan port lama (:8000 & :3000), menyalakan backend FastAPI di port 8000 dan frontend Next.js di port 3000 dalam 2 jendela terpisah.

---

## 🚀 8 Pilar Fitur Utama (Core Pillars)

### 1. 📡 Live Signal Radar (Server-Side Pagination & Precision Datepicker)
- **Akses Lengkap 2.860+ Sinyal**: Navigasi data tanpa batas menggunakan pagination server-side (`LIMIT` & `OFFSET`) dengan pilihan 25, 50, 100, atau 200 baris per halaman.
- **Precision Calendar Datepicker**: Filter tanggal transaksi spesifik berformat ISO `YYYY-MM-DD` atau pilih dari shortcut sesi perdagangan teraktif.
- **Siklus Hidup Terkonfirmasi**: Filter transparan untuk status `🟢 Aktif / Entry`, `🚀 Hit TP (TP1/TP2)`, `🛑 Stop Loss`, dan `🏁 Closed Trade`.
- **4 Clickable Live KPI Cards**: Ribbon metrik beranda interaktif yang langsung membuka tabel sinyal terfilter.

### 2. ⚡ High-Probability RELT Quantitative Trading Engine
- **10-Factor Scoring Model**: Evaluasi komprehensif dari 0 hingga 100 berdasarkan tren makro, momentum, volume surge, order block, FVG, dan rasio risiko.
- **Dynamic Swing-Low Invalidation (SL)**: Kalkulasi Stop Loss adaptif berbasis titik kritis struktur pasar $\min(\text{Swing Low 5-Bars}, \text{Entry} - 1.5\times\text{ATR})$ dalam koridor aman `[3.0%, 8.0%]`.
- **Dual-Target Execution (1.5R & 2.5R)**: TP1 mengunci profit 50% porsi dan otomatis memindahkan SL ke *Breakeven (+0.5%)*; TP2 sebagai target *runner* tren besar.
- **IDX Lot Sizing Math**: Perhitungan alokasi lot bulat pasti menggunakan `math.floor` ketat (1 Lot = 100 Lembar).

### 3. 🧠 Smart Money Concepts (SMC) & Deteksi Pola Grafik
- Deteksi otomatis Fair Value Gaps (*Bullish & Bearish FVG*), Order Blocks (OB), Break of Structure (BOS), Change of Character (CHOCH), dan Liquidity Sweeps.
- Pengenalan 10 pola grafik klasik (*Double Bottom, Cup & Handle, Ascending Triangle, Head & Shoulders, Flags, Wedges*) dengan visualisasi target harga.

### 4. ⏰ Mesin Waktu Eksekusi 1-Jam Intraday (1H Entry Timing Engine)
- Memetakan sinyal Daily ke grafik 1-Jam untuk menemukan jam eksekusi bursa terbaik.
- Penentuan area entry presisi (`ZoneLow` — `ZoneHigh`) dan status `ENTRY NOW` vs `WAIT FOR PULLBACK`.

### 5. 🔍 Forensik Laba & Valuasi Multi-Model
- **Piotroski 9-Point F-Score**: Evaluasi kekuatan fundamental dan efisiensi operasional.
- **Beneish 8-Ratio M-Score**: Deteksi dini potensi manipulasi laporan keuangan akrual.
- **5 Model Valuasi Konsensus**: DCF 2-Stage, Graham Formula, PBV vs ROE Fair Band, PE Multiple, dan Nilai Buku Berwujud Bersih.

### 6. 🌐 Jembatan Komunitas Saham Stockbit Terintegrasi
- Tombol akses cepat 1-klik menuju forum diskusi publik, stream berita, dan feeds emiten terkait di Stockbit.

### 7. 🤖 AI Market Intelligence & Prompt Engine 360°
- Ekstraksi 100% data pasar dan fundamental menjadi master prompt siap salin untuk ChatGPT, Claude, DeepSeek R1, Gemini, dan Perplexity.
- Importer respon JSON dengan 6 Schema Integrity Badges dan Executive Research Dashboard interaktif.

### 8. 🎨 Anti-Slop Institutional Liquid-Glass Design System
- Dibangun dengan standar estetika `taste-skill`: tipografi solid bebas gradasi pelangi acak, 4 token border-radius baku, micro-interactions cair, dan tata letak responsif 2-kolom split hero.

---

## 📚 Daftar Dokumentasi Lengkap (Documentation Suite)

Seluruh aspek teknis terdokumentasi lengkap dalam 8 berkas panduan di direktori `docs/`:

1. [**`1_README.md`**](file:///c:/technical-automatic/docs/1_README.md): Ringkasan Proyek & Fitur Lengkap *(Dokumen ini)*.
2. [**`2_SYSTEM_ARCHITECTURE.md`**](file:///c:/technical-automatic/docs/2_SYSTEM_ARCHITECTURE.md): Arsitektur Sistem, Aliran Data & Diagram Sequence Paginasi.
3. [**`3_QUANTITATIVE_ALGORITHMS.md`**](file:///c:/technical-automatic/docs/3_QUANTITATIVE_ALGORITHMS.md): Rumus Kuantitatif RELT, SL/TP Bounds & Forensik Laba.
4. [**`4_API_SPECIFICATION.md`**](file:///c:/technical-automatic/docs/4_API_SPECIFICATION.md): Spesifikasi Endpoint REST API & Skema JSON.
5. [**`5_FRONTEND_DESIGN_SYSTEM.md`**](file:///c:/technical-automatic/docs/5_FRONTEND_DESIGN_SYSTEM.md): Design Tokens, Anti-Slop Principles & Komponen UI.
6. [**`6_DATABASE_SCHEMA_WAL.md`**](file:///c:/technical-automatic/docs/6_DATABASE_SCHEMA_WAL.md): Skema SQLite WAL, Indexing & Query Paginasi.
7. [**`7_DEPLOYMENT_OPERATIONS.md`**](file:///c:/technical-automatic/docs/7_DEPLOYMENT_OPERATIONS.md): Panduan Deployment 1-Klik, CLI & Operasional.
8. [**`8_AI_ANALYST_ENGINE.md`**](file:///c:/technical-automatic/docs/8_AI_ANALYST_ENGINE.md): Arsitektur Prompt Generator AI 360° & JSON Parser.
