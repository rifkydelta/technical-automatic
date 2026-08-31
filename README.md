<div align="center">

# ⚡ IDX TERMINAL
### *Pro Algorithmic Market Intelligence, Smart Money Concepts & AI Multi-Model Research Hub*

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2_(Turbopack)-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![SQLite WAL](https://img.shields.io/badge/SQLite_3-WAL_Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Market](https://img.shields.io/badge/Market-IDX_/_BEI_(Indonesia)-0052CC?style=for-the-badge&logo=tether&logoColor=white)](https://www.idx.co.id/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

<br/>

**Platform Intelijen Pasar Finansial Kuantitatif Generasi Baru untuk Seluruh Emiten di Bursa Efek Indonesia (BEI / IDX).**  
*Menggabungkan Analisis Multi-Timeframe, Smart Money Concepts (SMC), Pemindai Sinyal Realtime (Server-Side Pagination & Precision Datepicker), Model Skoring 10-Faktor, Forensik Laba (Piotroski & Beneish), Jembatan Komunitas Stockbit, serta Engine Prompt AI 360° dengan Dashboard Riset Standar Institusi.*

---

[⚡ 1-Click Quickstart](#-1-click-quickstart-cara-menjalankan-termudah) •
[🌟 Fitur Unggulan](#-fitur-unggulan-key-features) •
[🤖 AI Analyst Engine](#-ai-analyst--prompt-intelligence-hub) •
[📐 Algoritma Kuantitatif](#-algoritma-kuantitatif--manajemen-risiko) •
[🏛️ Arsitektur Sistem](#️-arsitektur-sistem) •
[📚 Dokumentasi Lengkap](#-dokumentasi-lengkap-documentation-suite)

</div>

---

## ⚡ 1-Click Quickstart (Cara Menjalankan Termudah)

Anda dapat langsung menjalankan **IDX Terminal** dalam hitungan detik menggunakan script otomatis di Windows:

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

<details>
<summary><b>🔍 Penjelasan Detail Langkah Demi Langkah (Klik untuk membuka)</b></summary>

### Opsi A: Menggunakan Batch Script Windows (Otomatis & Direkomendasikan)
1. **Instalasi Pertama Kali**:
   - *Double-click* [`setup.bat`](file:///c:/technical-automatic/setup.bat).
   - Skrip akan otomatis memeriksa Python & Node.js, membuat environment `backend/venv`, menginstall seluruh dependensi `requirements.txt`, dan menjalankan `npm install` pada frontend.
2. **Menjalankan Aplikasi**:
   - *Double-click* [`run.bat`](file:///c:/technical-automatic/run.bat).
   - Skrip akan otomatis membersihkan port lama (:8000 & :3000), mengaktifkan server backend FastAPI di port 8000, dan menyalakan frontend Next.js di port 3000 dalam 2 jendela terpisah.
   - Buka browser Anda di: **`http://localhost:3000`**.

---

### Opsi B: Menjalankan Manual via Terminal CLI
```bash
# Terminal 1: Backend (FastAPI)
cd c:\technical-automatic\backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend (Next.js 16 Turbopack)
cd c:\technical-automatic\frontend
npm run dev
```

</details>

---

## 🌟 Fitur Unggulan (Key Features)

### 1. 📡 Live Signal Radar (Server-Side Pagination & Precision Datepicker)
- **Akses Penuh 2.860+ Rekam Jejak Sinyal**: Sistem pagination server-side berbasis SQLite WAL (`LIMIT` & `OFFSET`) dengan pilihan 25, 50, 100, atau 200 baris per halaman.
- **Precision Calendar Datepicker**: Filter tanggal transaksi spesifik berformat ISO `YYYY-MM-DD` atau pilih dari shortcut sesi perdagangan teraktif di database.
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

## 📚 Dokumentasi Lengkap (Documentation Suite)

Seluruh spesifikasi teknis platform didokumentasikan dalam 8 berkas panduan di direktori `docs/`:

| No | Dokumen | Fokus & Isi Pembahasan |
|---|---|---|
| 1 | [**`1_README.md`**](file:///c:/technical-automatic/docs/1_README.md) | Ringkasan Proyek & Fitur Lengkap |
| 2 | [**`2_SYSTEM_ARCHITECTURE.md`**](file:///c:/technical-automatic/docs/2_SYSTEM_ARCHITECTURE.md) | Arsitektur Sistem, Aliran Data & Diagram Sequence |
| 3 | [**`3_QUANTITATIVE_ALGORITHMS.md`**](file:///c:/technical-automatic/docs/3_QUANTITATIVE_ALGORITHMS.md) | Rumus Kuantitatif RELT, SL/TP Bounds & Forensik Laba |
| 4 | [**`4_API_SPECIFICATION.md`**](file:///c:/technical-automatic/docs/4_API_SPECIFICATION.md) | Spesifikasi REST API Lengkap & Skema JSON |
| 5 | [**`5_FRONTEND_DESIGN_SYSTEM.md`**](file:///c:/technical-automatic/docs/5_FRONTEND_DESIGN_SYSTEM.md) | Design Tokens, Anti-Slop Principles & Komponen UI |
| 6 | [**`6_DATABASE_SCHEMA_WAL.md`**](file:///c:/technical-automatic/docs/6_DATABASE_SCHEMA_WAL.md) | Skema SQLite WAL, Indexing & Query Paginasi |
| 7 | [**`7_DEPLOYMENT_OPERATIONS.md`**](file:///c:/technical-automatic/docs/7_DEPLOYMENT_OPERATIONS.md) | Panduan Deployment 1-Klik, CLI & Operasional |
| 8 | [**`8_AI_ANALYST_ENGINE.md`**](file:///c:/technical-automatic/docs/8_AI_ANALYST_ENGINE.md) | Arsitektur Prompt Generator AI 360° & JSON Parser |

---

<div align="center">
  <sub>Dibangun untuk Trader & Analis Pasar Modal Indonesia • IDX Terminal 2026</sub>
</div>
