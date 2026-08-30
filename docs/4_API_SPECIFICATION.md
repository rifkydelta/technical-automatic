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

## 2. Pemindai Sinyal Realtime (`/api/signals/*`)

### `POST /api/signals/scan`
Menjalankan pemindaian sinyal kuantitatif realtime secara multi-threaded di latar belakang untuk seluruh emiten IDX (atau daftar ticker tertentu) dan menyinkronkan data ke SQLite.

#### Request Body (Opsional)
```json
{
  "tickers": ["BBCA", "BBRI", "BMRI", "VKTR", "AUTO", "DSSA", "PTBA", "TLKM"]
}
```
*Jika `tickers` kosong atau tidak disertakan, scanner akan memindai seluruh semesta saham BEI.*

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
      "signal_time": "2026-08-28 09:00:00",
      "backtest_winrate": 62.5,
      "backtest_total_trades": 8,
      "backtest_total_pnl": 76.0,
      "relt_score": 85,
      "relt_rating": "Grade A+",
      "relt_action": "ULTRA BUY",
      "entry_price": 965.0,
      "stop_loss": 907.1,
      "tp1": 1051.85,
      "tp2": 1109.75,
      "h1_entry_zone_low": 945.0,
      "h1_entry_zone_high": 970.0,
      "h1_entry_status": "ENTRY NOW",
      "minute_bar_open": 960.0,
      "projected_pnl_pct": 8.95,
      "projected_pnl_nominal": 8635.0,
      "direction": "UP",
      "status": "OPEN",
      "actual_exit_price": 0.0,
      "actual_pnl_pct": 0.0
    }
  ]
}
```

---

### `GET /api/signals/latest`
Mengambil daftar sinyal terbaru dari database SQLite tanpa memicu pemindaian ulang berat.

#### Query Parameters
- `limit` (int, default: 50, max: 200): Jumlah sinyal maksimum yang dikembalikan.
- `status` (string, opsional): Filter status (`OPEN`, `HIT_TP1`, `HIT_TP2`, `HIT_SL`, `CLOSED`).

#### Response Body (200 OK)
```json
{
  "status": "success",
  "count": 50,
  "data": [ ... ]
}
```

---

### `GET /api/signals/stats`
Mengambil ringkasan statistik performa seluruh sinyal dalam database.

#### Response Body (200 OK)
```json
{
  "total_signals": 150,
  "active_open_signals": 42,
  "completed_trades": 108,
  "overall_winrate": 68.52,
  "profit_factor": 2.45,
  "total_net_pnl_pct": 342.8
}
```

---

## 3. Multi-Strategy Screener (`/api/screener/*`)

### `POST /api/screener`
Memindai daftar ticker saham untuk menghasilkan tabel ringkasan teknikal, momentum, dan rekomendasi.

#### Request Body
```json
{
  "tickers": ["BBCA", "BBRI", "BMRI", "BBNI", "ASII", "TLKM"],
  "mode": "live"
}
```

#### Response Body (200 OK)
```json
{
  "data": [
    {
      "ticker": "BBCA",
      "company_name": "Bank Central Asia Tbk",
      "last_price": 10250.0,
      "change_pct": 1.48,
      "volume": 78500000,
      "avg_volume": 62000000.0,
      "volume_change_pct": 26.6,
      "volume_trend": "UP",
      "volume_ratio": 1.27,
      "trend": "BULLISH",
      "recommendation": "ULTRA BUY",
      "score": 85,
      "score_display": "85%",
      "risk_status": "Good Setup",
      "tp1": 11000.0,
      "tp1_percent": 7.32,
      "tp2": 11500.0,
      "estimated_tp_days": 3,
      "estimated_tp_range": "3-5 Hari"
    }
  ],
  "session_info": { ... }
}
```

---

### `POST /api/screener/custom-preset`
Mengeksekusi preset strategi tertentu (misal: BPJS Daytrade, BSJP 15:30, Rebound MA20, Breakout 52W).

#### Request Body
```json
{
  "screener_id": "bpjs_daytrade",
  "custom_tickers": []
}
```

---

## 4. Indeks Pasar & Berita Pasar (`/api/market/*` & `/api/news/*`)

### `GET /api/market/ihsg`
Mengembalikan data indeks harga saham gabungan (IHSG / `^JKSE`) realtime.

#### Response Body (200 OK)
```json
{
  "price": 7642.30,
  "change": 62.15,
  "change_pct": 0.82,
  "high": 7660.10,
  "low": 7590.20,
  "open": 7580.15,
  "previous_close": 7580.15,
  "timestamp": "31 August 2026 - 10:35:00",
  "status": "OPEN",
  "currency": "IDR"
}
```

---

### `GET /api/news/{ticker}`
Mengambil ringkasan sentimen berita dan daftar berita terkini emiten dari berbagai portal finansial terverifikasi.
