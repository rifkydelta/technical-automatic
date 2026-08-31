# 6. Skema Database & Konkurensi WAL (Database Schema & Storage Engine)

Dokumen ini mendokumentasikan skema database SQLite, tipe data, indeks pencarian, optimasi konkurensi *Write-Ahead Logging (WAL)*, logika *idempotent upsert*, serta pola query paginasi server-side pada **IDX Terminal**.

---

## 1. Skema Tabel Database (`signals`)

Database berlokasi di: `backend/data/signals.db`.

```sql
CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,                                -- Kode saham BEI (e.g. 'BBCA', 'VKTR')
    company_name TEXT,                                   -- Nama resmi emiten
    signal_type TEXT NOT NULL,                           -- 'BUY' | 'SELL'
    signal_date TEXT DEFAULT '',                         -- Tanggal bar (YYYY-MM-DD)
    signal_time TEXT NOT NULL,                           -- Timestamp eksekusi (YYYY-MM-DD HH:MM:SS)
    backtest_winrate REAL DEFAULT 0.0,                   -- Persentase win rate historis (0-100%)
    backtest_total_trades INTEGER DEFAULT 0,             -- Total trade backtest 1 tahun
    backtest_total_pnl REAL DEFAULT 0.0,                 -- Total akumulasi return % backtest
    relt_score INTEGER DEFAULT 0,                        -- Skor komposit RELT (0-100)
    relt_rating TEXT DEFAULT '',                         -- 'Grade A+', 'Grade A', 'Grade B'
    relt_action TEXT DEFAULT '',                         -- 'ULTRA BUY', 'STRONG BUY', 'PULLBACK BUY'
    entry_price REAL NOT NULL,                           -- Harga acuan beli / eksekusi
    stop_loss REAL DEFAULT 0.0,                          -- Level harga Stop Loss adaptif
    tp1 REAL DEFAULT 0.0,                                -- Level Take Profit 1 (1.5R)
    tp2 REAL DEFAULT 0.0,                                -- Level Take Profit 2 (2.5R)
    h1_entry_zone_low REAL DEFAULT 0.0,                  -- Batas bawah area entry 1H
    h1_entry_zone_high REAL DEFAULT 0.0,                 -- Batas atas area entry 1H
    h1_entry_status TEXT DEFAULT '',                     -- 'ENTRY NOW' | 'WAIT FOR PULLBACK'
    h1_confirmation TEXT DEFAULT '',                     -- Catatan konfirmasi intraday 1H
    minute_bar_open REAL DEFAULT 0.0,                    -- Harga pembukaan bar menit eksekusi
    projected_pnl_pct REAL DEFAULT 0.0,                  -- Proyeksi gain % saat TP1 tercapai
    projected_pnl_nominal REAL DEFAULT 0.0,              -- Proyeksi gain nominal rupiah per 1 lot
    direction TEXT DEFAULT 'SIDEWAYS',                   -- 'UP' | 'DOWN' | 'SIDEWAYS'
    status TEXT DEFAULT 'OPEN',                          -- 'OPEN' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_SL' | 'CLOSED'
    actual_exit_price REAL DEFAULT 0.0,                  -- Harga penutupan posisi nyata
    actual_pnl_pct REAL DEFAULT 0.0,                     -- Realized PnL % posisi tertutup
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Waktu pencatatan pertama ke DB
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Waktu pembaruan status terakhir
    UNIQUE(ticker, signal_date, signal_type)             -- Constraint pencegah duplikasi baris
);
```

---

## 2. Indeks Performa Tinggi (Index Strategy)

Untuk memastikan query `SELECT`, `ORDER BY`, filter multi-kolom, dan server-side pagination berjalan dalam waktu `< 2ms` bahkan pada puluhan ribu baris data:

```sql
CREATE INDEX IF NOT EXISTS idx_signals_ticker ON signals(ticker);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(signal_time);
CREATE INDEX IF NOT EXISTS idx_signals_date ON signals(signal_date);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_pagination ON signals(signal_date DESC, id DESC);
```

---

## 3. Definisi Status Siklus Hidup Sinyal (Signal Lifecycle States)

Setiap trade signal memiliki siklus hidup yang tervalidasi secara deterministik:

| Status Code | Label UI | Deskripsi Kondisi |
|---|---|---|
| `OPEN` | `🟢 Aktif / Entry` | Sinyal baru dihasilkan dari scanner, harga masih berada dalam area entry atau sedang berjalan menuju target TP1/TP2. |
| `HIT_TP1` | `🎯 HIT TP1` | Harga telah menyentuh target Take Profit 1 (1.5R). 50% lot diamankan dan Stop Loss otomatis digeser ke *Breakeven (+0.5%)*. |
| `HIT_TP2` | `🚀 HIT TP2` | Harga sukses mencapai target Take Profit 2 (2.5R Runner). Posisi ditutup penuh dengan profit maksimal. |
| `HIT_SL` | `🛑 STOP LOSS` | Harga menyentuh level Stop Loss adaptif. Posisi ditutup untuk membatasi risiko kerugian sesuai koridor proteksi `[3%, 8%]`. |
| `CLOSED` | `✨ PROFIT EXIT` / `⏳ EXIT AT CLOSE` | Posisi ditutup pada akhir sesi bursa atau penutupan tren (Chandelier/Supertrend breakdown). Jika `actual_pnl_pct > 0`, ditandai sebagai *Profit Exit*. |

---

## 4. Konfigurasi SQLite WAL Mode (Concurrency & Reliability)

Aplikasi mengaktifkan mode **WAL (Write-Ahead Logging)** secara otomatis saat backend FastAPI dinyalakan:

```python
# backend/services/signal_repository.py
conn.execute("PRAGMA journal_mode = WAL;")
conn.execute("PRAGMA synchronous = NORMAL;")
conn.execute("PRAGMA busy_timeout = 5000;")
```

### Keunggulan WAL Mode:
1. **Non-Blocking Reads & Writes**: Operasi pembacaan (dashboard, pagination, charts) tidak pernah terblokir oleh operasi penulisan background scanner yang sedang memproses 800+ saham.
2. **ACID Compliant**: Transaksi batch dilindungi dengan rollback otomatis jika terjadi gangguan daya atau crash tak terduga.
3. **Low Write Amplification**: Penulisan dilakukan secara sequential ke file `.db-wal` sebelum di-checkpoint secara otomatis ke database utama.

---

## 5. Pola Query Paginasi Server-Side

Query yang digunakan oleh endpoint `GET /api/signals/paginated`:

```sql
-- 1. Hitung total filtered records untuk total halaman
SELECT COUNT(*) as total FROM signals 
WHERE 1=1 
  AND signal_type = :signal_type 
  AND status = :status 
  AND signal_date = :signal_date;

-- 2. Ambil baris data per halaman dengan OFFSET
SELECT * FROM signals 
WHERE 1=1 
  AND signal_type = :signal_type 
  AND status = :status 
  AND signal_date = :signal_date
ORDER BY signal_date DESC, id DESC 
LIMIT :page_size OFFSET :offset;
```
