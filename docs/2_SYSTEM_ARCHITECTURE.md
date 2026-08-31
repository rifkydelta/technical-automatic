# 2. Arsitektur Sistem & Aliran Data (System Architecture & Data Flow)

Dokumen ini menjelaskan rancang bangun arsitektur tingkat tinggi (*high-level architecture*), aliran data end-to-end, pipeline analisis multi-tahap, integrasi orkestrasi AI, mekanisme caching memori, dan konkurensi database pada **IDX Terminal**.

---

## 1. Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)

```mermaid
flowchart TB
    subgraph Clients["🖥️ Klien & Antarmuka Pengguna (Next.js 16 App Router)"]
        WebBrowser["🌐 Web Browser (Desktop / Tablet / Mobile)"]
        NextJS["⚡ Next.js 16 Turbopack (Port: 3000)<br/>App Router • React 19 • Glassmorphism"]
        WebBrowser <-->|HTTP / JSON| NextJS
    end

    subgraph FrontendComponents["🧩 Komponen Frontend & Modul Riset"]
        HeaderComp["Header & Stockbit Bridge<br/>(Header.js)"]
        OverviewComp["Overview & TopCards<br/>(TopCards.js, ReltSignalCard.js)"]
        AiPromptComp["AI Prompt Generator Modal<br/>(AiPromptModal.js)"]
        AiPasteComp["AI Importer & Live Schema Validator<br/>(AiPasteModal.js)"]
        AiReportComp["Executive Research Dashboard<br/>(AiReportView.js)"]
        ChartComp["TradingView Lightweight Charts v4<br/>(CandlestickChart.js)"]
    end

    NextJS --> HeaderComp
    NextJS --> OverviewComp
    NextJS --> AiPromptComp
    NextJS --> AiPasteComp
    NextJS --> AiReportComp
    NextJS --> ChartComp

    subgraph BackendGateway["🚀 Backend API Gateway (FastAPI Port: 8000)"]
        FastAPIApp["FastAPI Server<br/>CORS Middleware • Route Handlers • Pydantic V2"]
        AnalyzeEndpoint["/api/analyze<br/>(Deep-Dive Analysis)"]
        AiPromptEndpoint["/api/ai-prompt/generate<br/>(360° Prompt Extractor)"]
        ScreenerEndpoint["/api/screener<br/>(Multi-Ticker & Presets)"]
        SignalEndpoint["/api/signals/scan<br/>(Live Signal Scanner)"]
        MarketEndpoint["/api/market/ihsg & /api/price/{ticker}"]
        NewsEndpoint["/api/news/{ticker}"]
        
        FastAPIApp --> AnalyzeEndpoint
        FastAPIApp --> AiPromptEndpoint
        FastAPIApp --> ScreenerEndpoint
        FastAPIApp --> SignalEndpoint
        FastAPIApp --> MarketEndpoint
        FastAPIApp --> NewsEndpoint
    end

    NextJS <-->|REST API Async HTTP| FastAPIApp

    subgraph ServiceLayer["⚙️ Lapisan Layanan & Mesin Kuantitatif"]
        DataFetcher["📦 DataFetcher<br/>(In-Memory TTL 30s Caching)"]
        AiPromptService["🤖 AiPromptService<br/>(Piotroski, Beneish, Pivot, 4Y Fin)"]
        AnalysisEngine["🔍 AnalysisEngine<br/>(7-Step Technical Pipeline)"]
        ReltEngine["⚡ ReltSignalEngine<br/>(10-Factor Scoring & SL/TP)"]
        SMCEngine["🧠 SMCEngine<br/>(FVG, OB, BOS, CHOCH)"]
        SupertrendEngine["📈 SupertrendEngine<br/>(True Pine Script Factor 3.0)"]
        HourlyEngine["⏰ HourlyEntryEngine<br/>(1H Timing & Minute Bar)"]
        Backtester["🔄 HistoricalBacktester<br/>(Dual-Target Simulation)"]
        ValuationEngine["💎 ValuationEngine<br/>(DCF, Graham, Lynch, Forensics)"]
        PatternEngine["📐 PatternEngine<br/>(Chart & Candlestick Patterns)"]
    end

    AnalyzeEndpoint --> DataFetcher
    AnalyzeEndpoint --> AnalysisEngine
    AnalyzeEndpoint --> ReltEngine
    AnalyzeEndpoint --> ValuationEngine
    AnalyzeEndpoint --> PatternEngine

    AiPromptEndpoint --> DataFetcher
    AiPromptEndpoint --> AiPromptService
    AiPromptService --> SMCEngine
    AiPromptService --> ValuationEngine

    SignalEndpoint --> DataFetcher
    SignalEndpoint --> Backtester
    SignalEndpoint --> HourlyEngine
    SignalEndpoint --> ReltEngine

    ReltEngine --> SMCEngine
    ReltEngine --> SupertrendEngine
    Backtester --> ReltEngine

    subgraph ExternalSources["☁️ Sumber Data & Provider Eksternal"]
        YahooFinance["📈 Yahoo Finance API<br/>(OHLCV Daily, 1H, 15M, Financials)"]
        StockbitCommunity["💬 Stockbit IDX Platform<br/>(Direct Symbol Stream Bridge)"]
        AIProviders["🧠 External LLMs<br/>(ChatGPT, Claude, DeepSeek, Gemini, Perplexity)"]
    end

    DataFetcher <-->|HTTP Scraping / yfinance| YahooFinance
    HeaderComp -.->|1-Click External Tab| StockbitCommunity
    AiPromptComp -.->|1-Click Auto Copy & Launch| AIProviders
    AIProviders -.->|Paste JSON Output| AiPasteComp

    subgraph Persistence["💾 Database & Penyimpanan"]
        SQLiteDB[("🗄️ SQLite 3 Database (WAL Mode)<br/>backend/data/signals.db<br/>Indexes: ticker, signal_date, status")]
        SignalRepo["SignalRepository<br/>(Async/Sync with Timeout 30s)"]
        SignalEndpoint <--> SignalRepo
        SignalRepo <--> SQLiteDB
    end
```

---

## 2. Aliran Data Analisis Emiten Tunggal (`/api/analyze`)

Saat pengguna mengetik kode saham (misalnya `BBCA` atau `JATI`) pada kotak pencarian, urutan eksekusi berlangsung sebagai berikut:

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
    
    DF-->>API: Return data OHLCV & Laporan Keuangan 4 Tahun
    
    API->>Engines: Step 1-7 Technical Analysis (Trend, SR, MTF, Momentum, Risk)
    API->>Engines: Deteksi Pola Grafik & Candlestick (PatternEngine)
    API->>Engines: Evaluasi Kuantitatif RELT (ReltSignalEngine + SMCEngine + Supertrend)
    API->>Engines: Evaluasi Nilai Wajar & Forensik Laba (Piotroski & Beneish)
    
    Engines-->>API: Gabungan Hasil Analisis Terpadu (AnalyzeResponse)
    API-->>UI: Return JSON Payload (< 200ms jika cached)
    UI-->>User: Tampilkan Dashboard Visual (Overview, Chart, SMC, Valuasi, Berita, AI Analyst)
```

---

## 3. Aliran Data AI Analyst & Executive Dashboard

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Pengguna
    participant UI as 🖥️ AiPromptModal (Next.js)
    participant Backend as 🚀 FastAPI (/api/ai-prompt/generate)
    participant AISvc as 🤖 AiPromptService
    participant LLM as 🧠 Provider AI (ChatGPT/Claude/DeepSeek/Gemini/Perplexity)
    participant PasteModal as 📋 AiPasteModal
    participant ReportView as 📊 AiReportView
    
    User->>UI: Buka Modal AI Prompt & Pilih Persona + Input Harga Modal
    UI->>Backend: GET /api/ai-prompt/generate/BBCA?persona=HedgeFund&user_avg_price=9800&provider=chatgpt
    Backend->>AISvc: extract_360_market_intelligence()
    AISvc-->>Backend: Dataset Lengkap (4Y Finansial, 9-Poin Piotroski, Beneish, Pivots, SMC, News)
    Backend-->>UI: Return Master Prompt String + JSON Contract Schema
    
    User->>UI: Klik Tombol Provider (misal "ChatGPT")
    UI->>UI: Auto-Copy Prompt ke Clipboard
    UI->>LLM: Buka Tab Baru ke Provider URL
    
    User->>LLM: Paste Prompt & Eksekusi Reasoning
    LLM-->>User: Return Output Murni Format JSON
    
    User->>PasteModal: Buka Modal Import & Paste JSON Respon
    PasteModal->>PasteModal: Auto-Cleaner Regex Strip Markdown
    PasteModal->>PasteModal: Validasi 6 Skema Integritas Realtime
    PasteModal->>ReportView: Simpan ke State / LocalStorage & Render
    ReportView-->>User: Tampilkan Executive Dashboard (Radial Conviction, Trailing SL, 5 Perspektif, Roadmap TP)
```

---

## 4. Aliran Pemindaian Sinyal Realtime (`/api/signals/scan`)

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

## 5. Mekanisme Caching Memori & Keandalan (TTL Cache)

1. **In-Memory TTL Cache (30 Detik)**:
   - Data pasar bursa (OHLCV) disimpan dalam cache memori dengan masa berlaku 30 detik untuk menghindari *rate-limiting* API eksternal dan menjamin latensi respon di bawah 20 milidetik saat multi-request.
2. **SQLite Write-Ahead Logging (WAL)**:
   - Pembacaan (*read*) dan penulisan (*write*) berjalan independen tanpa saling mengunci (*lock contention*).
   - Pengaturan `PRAGMA synchronous = NORMAL;` dan `PRAGMA busy_timeout = 5000;` memastikan pemindaian ratusan emiten tidak pernah mengalami database locked.
3. **Pemberhentian & Pembersihan Port Otomatis**:
   - Skrip launcher `run.bat` otomatis mendeteksi dan menghentikan proses lama pada port `:8000` dan `:3000` sebelum menyalakan server baru.
