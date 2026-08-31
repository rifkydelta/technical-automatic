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
  "financials": [],
  "fair_value_analysis": {
    "consensus_fair_value": 11450.0,
    "overall_status": "Undervalued",
    "upside_potential_pct": 11.71,
    "models": []
  },
  "detected_patterns": []
}
```

---

## 2. Pemindai Sinyal & Radar Kuantitatif (`/api/signals/*`)

### `POST /api/signals/scan`
Menjalankan pemindaian sinyal kuantitatif realtime secara multi-threaded di latar belakang untuk seluruh emiten IDX (atau daftar ticker tertentu) dan menyinkronkan data ke SQLite WAL database.

#### Request Body (Opsional)
```json
{
  "tickers": ["BBCA", "BBRI", "BMRI", "VKTR", "AUTO", "DSSA", "PTBA", "TLKM"],
  "max_workers": 6
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
      "signal_time": "2026-08-28 15:00:00",
      "relt_score": 85,
      "relt_rating": "Grade A+",
      "relt_action": "ULTRA BUY",
      "entry_price": 965.0,
      "stop_loss": 907.1,
      "tp1": 1051.85,
      "tp2": 1109.75,
      "status": "OPEN",
      "backtest_winrate": 68.5
    }
  ]
}
```

---

### `GET /api/signals/paginated`
Mengambil data sinyal dengan sistem **Server-Side Pagination** dan filter multi-dimensi (tanggal, status, tipe sinyal, skor minimum, dan pencarian teks).

#### Query Parameters
- `page` *(int, default: `1`)*: Nomor halaman (1-indexed).
- `page_size` *(int, default: `50`, max: `200`)*: Jumlah baris data per halaman.
- `signal_type` *(string, optional)*: Filter tipe sinyal (`"BUY"`, `"SELL"`, atau `"ALL"`).
- `status` *(string, optional)*: Filter siklus trade (`"OPEN"`, `"HIT_TP"`, `"HIT_SL"`, `"CLOSED"`, atau `"ALL"`).
- `signal_date` *(string, optional)*: Filter tanggal spesifik dalam format ISO `YYYY-MM-DD` (misal: `"2026-08-28"`).
- `start_date` / `end_date` *(string, optional)*: Filter rentang tanggal.
- `min_score` *(int, optional, 0-100)*: Filter skor minimum RELT.
- `search` *(string, optional)*: Filter pencarian kode emiten atau nama perusahaan.

#### Response Body (200 OK)
```json
{
  "items": [
    {
      "id": 2860,
      "ticker": "BFIN",
      "company_name": "BFI Finance Indonesia Tbk",
      "signal_type": "BUY",
      "signal_date": "2026-08-28",
      "signal_time": "2026-08-28 15:00:00",
      "backtest_winrate": 60.0,
      "backtest_total_trades": 5,
      "backtest_total_pnl": 12.4,
      "relt_score": 70,
      "relt_rating": "Grade A",
      "relt_action": "WATCH BUY",
      "entry_price": 920.0,
      "stop_loss": 870.0,
      "tp1": 995.0,
      "tp2": 1045.0,
      "minute_bar_open": 920.0,
      "h1_entry_zone_low": 910.0,
      "h1_entry_zone_high": 930.0,
      "h1_entry_status": "ENTRY NOW",
      "projected_pnl_pct": 8.15,
      "direction": "UP",
      "status": "OPEN",
      "actual_exit_price": 0.0,
      "actual_pnl_pct": 0.0
    }
  ],
  "total_items": 2860,
  "total_pages": 58,
  "current_page": 1,
  "page_size": 50,
  "has_next": true,
  "has_prev": false,
  "available_dates": [
    { "date": "2026-08-28", "count": 40 },
    { "date": "2026-08-27", "count": 41 },
    { "date": "2026-08-26", "count": 46 }
  ]
}
```

---

### `GET /api/signals/dates`
Mengambil daftar tanggal sesi transaksi BEI yang memiliki data sinyal tersimpan di database beserta frekuensi kemunculannya.

#### Query Parameters
- `limit` *(int, default: `30`)*: Batas jumlah tanggal terbaru yang dikembalikan.

#### Response Body (200 OK)
```json
[
  { "date": "2026-08-28", "count": 40 },
  { "date": "2026-08-27", "count": 41 },
  { "date": "2026-08-26", "count": 46 },
  { "date": "2026-08-25", "count": 1 },
  { "date": "2026-08-24", "count": 40 }
]
```

---

### `GET /api/signals/stats`
Mengembalikan ringkasan statistik agregat pasar kuantitatif yang akurat dan real-time dari database.

#### Response Body (200 OK)
```json
{
  "total_signals": 2860,
  "total_emiten": 171,
  "buy_count": 171,
  "sell_count": 0,
  "hit_tp_count": 748,
  "hit_sl_count": 1499,
  "open_signals_count": 591,
  "closed_count": 2269,
  "avg_winrate": 56.9,
  "top_winrate": 56.9,
  "avg_proj_pnl": 40.52,
  "best_performer": "MDIA",
  "best_pnl": 153.21
}
```

---

### `GET /api/signals/latest`
Mengambil daftar sinyal terbaru (legacy compatible endpoint).

#### Query Parameters
- `limit` *(int, default: `100`, max: `500`)*
- `signal_type` *(string, optional)*
- `status` *(string, optional)*

---

## 3. Stock Screener & Preset Hub (`/api/screener`)

### `POST /api/screener`
Memindai kumpulan kode emiten (preset kategori atau custom input) dan mengembalikan matriks analisis fundamental & teknikal multi-faktor.

#### Request Body
```json
{
  "tickers": ["BBCA", "BBRI", "BMRI", "BBNI"],
  "mode": "live"
}
```

#### Response Body (200 OK)
```json
{
  "mode": "live",
  "count": 4,
  "data": [
    {
      "ticker": "BBCA",
      "company_name": "Bank Central Asia Tbk",
      "price": 10250,
      "change_pct": 1.48,
      "score": 85,
      "action": "ULTRA BUY",
      "pe_ratio": 22.4,
      "pbv_ratio": 4.8,
      "roe": 21.5,
      "trend": "BULLISH",
      "relt_status": "ENTRY NOW"
    }
  ]
}
```

---

## 4. AI Prompt Intelligence Hub (`/api/ai-prompt/*`)

### `GET /api/ai-prompt/generate/{ticker}`
Mengekstrak data intelijen pasar 360° (Finansial 4-tahun, 9-poin Piotroski, Beneish M-Score, Order Blocks, Pivot Fibonacci/Woodie/Camarilla, dan 15 berita) dan mengemasnya ke dalam master prompt siap salin untuk LLM.

#### Path & Query Parameters
- `ticker` *(string, required)*: Kode saham (misal: `BBCA`).
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
