# 2. Arsitektur Sistem & Aliran Data (System Architecture & Data Flow)

Dokumen ini menjelaskan rancang bangun arsitektur tingkat tinggi (*high-level architecture*), aliran data end-to-end, pipeline analisis multi-tahap, mekanisme caching memori, dan konkurensi database pada **IDX Terminal**.

---

## 1. Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)

```mermaid
flowchart TB
    subgraph Clients["🖥️ Klien & Antarmuka Pengguna"]
        WebBrowser["🌐 Web Browser (Desktop / Tablet / Mobile)"]
        NextJS["⚡ Next.js 16 App Router (Turbopack)<br/>Port: 3000"]
        WebBrowser <-->|HTTP / JSON| NextJS
    end

    subgraph BackendGateway["🚀 Backend API Gateway (FastAPI)"]
        FastAPIApp["FastAPI Server (Port: 8000)<br/>CORS Middleware • Route Handlers"]
        AnalyzeEndpoint["/api/analyze<br/>(Deep-Dive Analysis)"]
        ScreenerEndpoint["/api/screener<br/>(Multi-Ticker & Presets)"]
        SignalEndpoint["/api/signals/scan<br/>(Live Signal Scanner)"]
        MarketEndpoint["/api/market/ihsg<br/>(Realtime Composite)"]
        
        FastAPIApp --> AnalyzeEndpoint
        FastAPIApp --> ScreenerEndpoint
        FastAPIApp --> SignalEndpoint
        FastAPIApp --> MarketEndpoint
    end

    NextJS <-->|REST API Async HTTP| FastAPIApp

    subgraph ServiceLayer["⚙️ Lapisan Layanan & Mesin Kuantitatif"]
        DataFetcher["📦 DataFetcher<br/>(In-Memory TTL 30s Caching)"]
        AnalysisEngine["🔍 AnalysisEngine<br/>(7-Step Technical Pipeline)"]
        ReltEngine["⚡ ReltSignalEngine<br/>(10-Factor Scoring & SL/TP)"]
        SMCEngine["🧠 SMCEngine<br/>(FVG, OB, BOS, CHOCH)"]
        SupertrendEngine["📈 SupertrendEngine<br/>(True Pine Script Factor 3.0)"]
        HourlyEngine["⏰ HourlyEntryEngine<br/>(1H Timing & Minute Bar)"]
        Backtester["🔄 HistoricalBacktester<br/>(Dual-Target Simulation)"]
        ValuationEngine["💎 ValuationEngine<br/>(DCF, Graham, Lynch)"]
        PatternEngine["📐 PatternEngine<br/>(Chart & Candlestick Patterns)"]
    end

    AnalyzeEndpoint --> DataFetcher
    AnalyzeEndpoint --> AnalysisEngine
    AnalyzeEndpoint --> ReltEngine
    AnalyzeEndpoint --> ValuationEngine
    AnalyzeEndpoint --> PatternEngine

    SignalEndpoint --> DataFetcher
    SignalEndpoint --> Backtester
    SignalEndpoint --> HourlyEngine
    SignalEndpoint --> ReltEngine

    ReltEngine --> SMCEngine
    ReltEngine --> SupertrendEngine
    Backtester --> ReltEngine

    subgraph ExternalSources["☁️ Sumber Data Eksternal"]
        YahooFinance["📈 Yahoo Finance API<br/>(OHLCV Daily, 1H, 15M, 1M, Financials)"]
        GoogleFinance["📊 Google Finance Data<br/>(Market Quotes Fallback)"]
    end

    DataFetcher <-->|HTTP Scraping / yfinance| YahooFinance
    DataFetcher <-->|Async Requests| GoogleFinance

    subgraph Persistence["💾 Database & Penyimpanan"]
        SQLiteDB[("🗄️ SQLite 3 Database (WAL Mode)<br/>backend/data/signals.db<br/>Indexes: ticker, signal_date, status")]
        SignalRepo["SignalRepository<br/>(Async/Sync with Timeout 30s)"]
        SignalEndpoint <--> SignalRepo
        SignalRepo <--> SQLiteDB
    end
```

---

## 2. Aliran Data Analisis Emiten Tunggal (`/api/analyze`)

Saat pengguna mengetik kode saham (misalnya `BBCA` atau `VKTR`) pada kotak pencarian, urutan eksekusi berlangsung sebagai berikut:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Pengguna
    participant UI as 🖥️ Next.js Frontend
    participant API as 🚀 FastAPI (/api/analyze)
    participant DF as 📦 DataFetcher (TTL Cache)
    participant Engines as ⚙️ Technical, SMC, & Valuation Engines
    
    User->>UI: Input Ticker & Klik "Analisis"
    UI->>API: POST /api/analyze { ticker: "BBCA", mode: "live" }
    
    API->>DF: fetch_ticker_info("BBCA")
    DF-->>API: Info dasar, market cap, nama perusahaan
    
    par Eksekusi Paralel (ThreadPoolExecutor)
        API->>DF: fetch_stock_data("BBCA") -> (Daily, 1H, 15M, 1M)
        API->>DF: fetch_comprehensive_financials("BBCA")
        API->>DF: fetch_google_finance_data("BBCA")
    end
    
    DF-->>API: Return data OHLCV & Laporan Keuangan 3 Tahun
    
    API->>Engines: Step 1-7 Technical Analysis (Trend, SR, MTF, Momentum, Risk)
    API->>Engines: Deteksi Pola Grafik & Candlestick (PatternEngine)
    API->>Engines: Evaluasi Kuantitatif RELT (ReltSignalEngine + SMCEngine + Supertrend)
    API->>Engines: Evaluasi Nilai Wajar (DCF, Graham Number, Peter Lynch)
    
    Engines-->>API: Gabungan Hasil Analisis Terpadu (AnalyzeResponse)
    API-->>UI: Return JSON Payload (< 200ms jika cached)
    UI-->>User: Tampilkan Dashboard Visual (Chart, Sinyal, Valuasi, Berita, Backtest)
```

---

## 3. Aliran Pemindaian Sinyal Realtime (`/api/signals/scan`)

Pemindai sinyal live bursa beroperasi secara multi-threaded untuk memindai ratusan saham secara bersamaan:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Pengguna / Scheduler
    participant API as 🚀 FastAPI (/api/signals/scan)
    participant Scanner as 📡 SignalScannerService
    participant Backtester as 🔄 HistoricalBacktester
    participant Hourly as ⏰ HourlyEntryEngine
    participant Repo as 💾 SignalRepository
    participant DB as 🗄️ SQLite (WAL Mode)

    User->>API: Trigger POST /api/signals/scan
    API->>Scanner: scan_signals(tickers, max_workers=6)
    
    loop Setiap Emiten (Secara Paralel di ThreadPool)
        Scanner->>Backtester: extract_all_relt_signals(daily_df, lookback=365)
        Backtester-->>Scanner: Daftar Sinyal Terverifikasi (OPEN & CLOSED)
        Scanner->>Backtester: run_relt_daily_backtest(daily_df)
        Backtester-->>Scanner: Win Rate %, Total Trades, Total PnL %
        Scanner->>Hourly: detect_realtime_entry_hour(h1_df, signal_date)
        Hourly-->>Scanner: Jam Eksekusi 1H Presisi & 1H Entry Area
    end
    
    Scanner->>Repo: insert_signal(data) -> ON CONFLICT UPDATE
    Repo->>DB: Eksekusi Query Upsert (WAL Mode, Non-blocking)
    DB-->>Repo: Saved / Updated
    
    Scanner->>Repo: get_latest_signals(limit=150)
    Repo-->>Scanner: 150 Sinyal Terbaru
    Scanner-->>API: SignalScanResponse JSON
    API-->>User: Update Tabel Sinyal & Statistik Live
```

---

## 4. Mekanisme In-Memory TTL Caching (`DataFetcher`)

Untuk mengatasi pembatasan laju (*rate limiting*) dari penyedia data eksternal dan memangkas latensi jaringan, `DataFetcher` mengimplementasikan *Time-To-Live (TTL) In-Memory Cache*:

- **Durasi TTL**: `30.0 detik`.
- **Kunci Cache (Cache Keys)**:
  - `info_{TICKER}`: Profil emiten, market cap, dan rasio PE/PBV.
  - `stock_{TICKER}`: DataFrame OHLCV lengkap (Daily, 1H, 15M, 1M).
  - `daily_{TICKER}`: DataFrame Daily OHLCV khusus screener.
  - `fin_{TICKER}`: Laporan keuangan 3 tahun & pertumbuhan CAGR.
- **Kebijakan Penggusuran (Eviction Policy)**: Saat `time.time() - ts > cache_ttl`, data kadaluarsa dihapus otomatis dari memori saat diakses kembali.

---

## 5. Arsitektur Konkurensi Database (SQLite WAL Mode)

Database `signals.db` dikonfigurasi secara khusus dengan mode **Write-Ahead Logging (WAL)**:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
```

### Keunggulan WAL Mode pada IDX Terminal:
1. **Pembaca Tidak Memblokir Penulis (Readers do not block Writers)**: UI dapat membaca daftar sinyal live tanpa jeda meskipun scanner sedang memperbarui ribuan baris di background.
2. **Penulis Tidak Memblokir Pembaca (Writers do not block Readers)**: Pemindaian live bursa berlangsung mulus tanpa memicu error `database is locked`.
3. **Peningkatan Performa I/O**: Operasi tulis disimpan ke berkas WAL terpisah sebelum digabungkan secara efisien (*checkpointing*).
