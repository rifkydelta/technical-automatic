# 4. Spesifikasi REST API Lengkap (API Specification)

Dokumen ini mendokumentasikan seluruh endpoint REST API yang disediakan oleh server **FastAPI** backend pada port `8000`.

- **Base URL**: `http://localhost:8000` (atau sesuai konfigurasi `NEXT_PUBLIC_API_URL`)
- **Format Pertukaran Data**: JSON (`application/json`)
- **Autentikasi**: Tidak diperlukan untuk deployment lokal / public endpoints.
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## 1. Analisis Emiten Tunggal (`/api/analyze`)

### `POST /api/analyze`
Melakukan analisis kuantitatif dan teknikal mendalam pada 1 kode saham IDX (termasuk grafik OHLCV harian/intraday, sinyal RELT, Smart Money Concepts, valuasi, dan backtest).

#### Request Body
```json
{
  "ticker": "BBCA",
  "mode": "live"
}
```

#### Response Body (200 OK)
```json
{
  "ticker": "BBCA",
  "company_name": "Bank Central Asia Tbk",
  "last_price": 10250.0,
  "change_pct": 1.48,
  "session_info": {
    "mode": "live",
    "mode_label": "Live",
    "market_phase": "SESI_2",
    "current_time": "31 August 2026 - 10:15:00"
  },
  "trend": {
    "trend_besar": "BULLISH",
    "keterangan": "Harga di atas EMA 20, EMA 50, dan EMA 200."
  },
  "score": {
    "score": 85,
    "score_display": "85/100",
    "grade": "A+",
    "summary": "Setup momentum sangat kuat dengan konfirmasi volume."
  },
  "recommendation": {
    "action": "ULTRA BUY",
    "action_color": "#10b981",
    "confidence_level": "High Confidence",
    "reasons": [
      "Harga berada di atas seluruh EMA utama (9, 21, 50, 200).",
      "Supertrend berstatus Bullish.",
      "Terdapat Bullish Order Block aktif di level 10100."
    ]
  },
  "relt_signal": {
    "score": 85,
    "rating": "Grade A+",
    "action": "ULTRA BUY",
    "trade_setup": {
      "entry_price": 10250.0,
      "stop_loss": 9750.0,
      "tp1": 11000.0,
      "tp2": 11500.0,
      "risk_percent": 4.88,
      "recommended_lots": 20,
      "recommended_shares": 2000,
      "max_risk_amount": 1000000.0,
      "estimated_tp_range": "3-5 Hari"
    },
    "direction_prediction": {
      "direction": "UP",
      "predicted_price": 11200.0,
      "upside_pct": 9.27
    }
  },
  "financials": [...],
  "fair_value_analysis": {
    "consensus_fair_value": 11450.0,
    "overall_status": "Undervalued",
    "upside_potential_pct": 11.71,
    "models": [...]
  },
  "detected_patterns": [...]
}
```

---

## 2. AI Prompt Intelligence Hub (`/api/ai-prompt/*`)

### `GET /api/ai-prompt/generate/{ticker}`
Mengekstrak 100% data intelijen pasar 360° (Finansial 4-tahun, 9-poin Piotroski, Beneish M-Score, Order Blocks, Pivot Fibonacci/Woodie/Camarilla, dan 15 berita) dan mengemasnya ke dalam master prompt siap salin untuk LLM.

#### Path & Query Parameters
- `ticker` *(string, required)*: Kode saham (misal: `BBCA`, `JATI`).
- `mode` *(string, optional, default: `"live"`)*: Mode pasar (`"live"` atau `"eod"`).
- `persona` *(string, optional, default: `"Institutional Hedge Fund"`)*: Pilihan persona analisa (`"Institutional Hedge Fund"`, `"Swing & Momentum Trader"`, `"Deep Value & Quality Investor"`, `"Forensic Accounting & Short Auditor"`).
- `user_avg_price` *(float, optional, default: `0`)*: Harga beli rata-rata pengguna untuk analisis portofolio personal.
- `provider` *(string, optional, default: `"generic"`)*: Provider target (`"chatgpt"`, `"claude"`, `"deepseek"`, `"gemini"`, `"perplexity"`, `"generic"`).

#### Response Body (200 OK)
```json
{
  "status": "success",
  "ticker": "BBCA",
  "persona": "Institutional Hedge Fund",
  "provider": "chatgpt",
  "user_avg_price": 9800.0,
  "floating_pnl_pct": 4.59,
  "prompt": "### 🎯 PERAN DAN IDENTITAS ANDA\nAnda adalah Kepala Riset Kuantitatif Institusional...",
  "meta_summary": {
    "financials_years_count": 4,
    "piotroski_f_score": 9,
    "beneish_m_score": -2.95,
    "news_count": 15,
    "order_blocks_count": 3
  }
}
```

---

### `GET /api/ai-prompt/sample`
Mengembalikan payload JSON contoh analisis lengkap standar institusi untuk keperluan demo dan pratinjau cepat dashboard tanpa harus menunggu respon eksternal LLM.

#### Response Body (200 OK)
```json
{
  "meta": {
    "ticker": "BBCA",
    "company_name": "Bank Central Asia Tbk",
    "current_price": 10250,
    "persona_used": "Institutional Hedge Fund",
    "ai_provider_model": "ChatGPT (GPT-4o)"
  },
  "executive_summary": {
    "conviction_score": 88,
    "master_bias": "STRONG_BULLISH",
    "primary_action": "PULLBACK_BUY",
    "one_sentence_thesis": "Fundamental defensif berpadu dengan akumulasi order block 1H..."
  },
  "perspectives": {...},
  "scenario_matrix": {...},
  "execution_blueprint": {...},
  "forensic_checklist": [...]
}
```

---

## 3. Pemindai Sinyal Realtime (`/api/signals/*`)

### `POST /api/signals/scan`
Menjalankan pemindaian sinyal kuantitatif realtime secara multi-threaded di latar belakang untuk seluruh emiten IDX (atau daftar ticker tertentu) dan menyinkronkan data ke SQLite.

#### Request Body (Opsional)
```json
{
  "tickers": ["BBCA", "BBRI", "BMRI", "VKTR", "AUTO", "DSSA", "PTBA", "TLKM"]
}
```

#### Response Body (200 OK)
```json
{
  "scan_time": "31 Aug 2026 10:30 WIB",
  "total_scanned": 8,
  "signals_found": 8,
  "signals": [
    {
      "id": 1,
      "ticker": "VKTR",
      "company_name": "VKTR Teknologi Mobilitas Tbk",
      "signal_type": "BUY",
      "signal_date": "2026-08-28",
      "relt_score": 85,
      "relt_rating": "Grade A+",
      "relt_action": "ULTRA BUY",
      "entry_price": 965.0,
      "stop_loss": 907.1,
      "tp1": 1051.85,
      "tp2": 1109.75,
      "status": "OPEN"
    }
  ]
}
```

---

### `GET /api/signals/latest`
Mengambil daftar sinyal terbaru dari database SQLite tanpa memicu pemindaian ulang berat.

#### Query Parameters
- `limit` *(int, default: 100)*: Jumlah maksimal data sinyal yang diambil.
- `status` *(string, optional)*: Filter status sinyal (`OPEN`, `TP1_HIT`, `TP2_HIT`, `SL_HIT`).

---

## 4. Multi-Strategy Screener (`/api/screener`)

### `POST /api/screener`
Memindai daftar saham berdasarkan strategi preset yang dipilih atau kustomisasi filter teknikal.

#### Request Body
```json
{
  "preset": "bluechip_lq45",
  "custom_tickers": []
}
```
*Pilihan preset yang tersedia*: `"bluechip_lq45"`, `"high_dividend"`, `"bpjs_daytrade"`, `"bsjp_1530"`, `"rebound_ma20"`, `"breakout_52w"`.

#### Response Body (200 OK)
```json
{
  "preset": "bluechip_lq45",
  "total_matches": 12,
  "results": [
    {
      "ticker": "BBCA",
      "last_price": 10250.0,
      "score": 85,
      "rating": "Grade A+",
      "action": "ULTRA BUY",
      "volume_ratio": 1.45,
      "pe_ratio": 24.2,
      "pb_ratio": 4.8
    }
  ]
}
```

---

## 5. Layanan Harga, Berita & Profil Perusahaan

### `GET /api/price/{ticker}`
Mengambil harga terkini dan status sesi bursa secara instan (digunakan untuk realtime poller di frontend).

#### Response Body (200 OK)
```json
{
  "ticker": "BBCA",
  "price": 10250.0,
  "label": "Live SESI_2",
  "timestamp": 1756611300
}
```

---

### `GET /api/news/{ticker}`
Mengambil 15 berita bursa dan sentimen pasar terkini dari berbagai portal keuangan.

#### Response Body (200 OK)
```json
{
  "ticker": "BBCA",
  "news_count": 15,
  "articles": [
    {
      "title": "BCA Cetak Laba Bersih Rp45 Triliun di Kuartal III",
      "publisher": "Bisnis.com",
      "link": "https://...",
      "published_date": "2026-08-30",
      "sentiment": "POSITIVE"
    }
  ]
}
```

---

### `GET /api/ticker/ticker-info/{ticker}`
Mengambil data profil perusahaan, industri, situs resmi, dan statistik saham untuk popup modal profil.

#### Response Body (200 OK)
```json
{
  "ticker": "JATI",
  "name": "PT Informasi Teknologi Indonesia Tbk",
  "sector": "Technology",
  "industry": "Software & IT Services",
  "website": "https://jati.id",
  "city": "Jakarta",
  "description": "PT Informasi Teknologi Indonesia Tbk (JATI) bergerak di bidang solusi komunikasi digital...",
  "shares_outstanding": 3250000000
}
```
