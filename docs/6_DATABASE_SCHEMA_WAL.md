# 6. Skema Database & Konkurensi WAL (Database Schema & SQLite WAL)

Dokumen ini mendokumentasikan skema database SQLite, tipe data, indeks pencarian, optimasi konkurensi *Write-Ahead Logging (WAL)*, serta logika *idempotent upsert* pada **IDX Terminal**.

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

Untuk memastikan query `SELECT`, `ORDER BY`, dan `FILTER` berjalan dalam waktu `< 5ms` bahkan pada ribuan baris data:

```sql
CREATE INDEX IF NOT EXISTS idx_signals_ticker ON signals(ticker);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(signal_time);
CREATE INDEX IF NOT EXISTS idx_signals_date ON signals(signal_date);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
```

---

## 3. Optimasi Konkurensi WAL (Write-Ahead Logging Pragmas)

Setiap koneksi database diinisialisasi dengan konfigurasi berikut:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
```

### Manfaat Konfigurasi WAL:
1. **Zero Database Locking**: Operasi pembacaan sinyal dari frontend tidak pernah terhalang oleh proses pemindaian multi-threaded background scanner.
2. **Durabilitas Tinggi**: Transaksi dituliskan ke berkas *Write-Ahead Log* (`signals.db-wal`) sebelum digabungkan ke berkas utama secara aman.

---

## 4. Logika Idempotent Upsert (`ON CONFLICT`)

Saat pemindaian sinyal dijalankan berulang kali, data tidak akan bertumpuk berlebihan melainkan diperbarui secara atomik:

```sql
INSERT INTO signals (
    ticker, company_name, signal_type, signal_date, signal_time,
    backtest_winrate, backtest_total_trades, backtest_total_pnl,
    relt_score, relt_rating, relt_action,
    entry_price, stop_loss, tp1, tp2,
    h1_entry_zone_low, h1_entry_zone_high, h1_entry_status, h1_confirmation,
    minute_bar_open, projected_pnl_pct, projected_pnl_nominal,
    direction, status, actual_exit_price, actual_pnl_pct,
    created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(ticker, signal_date, signal_type) DO UPDATE SET
    status = excluded.status,
    actual_exit_price = excluded.actual_exit_price,
    actual_pnl_pct = excluded.actual_pnl_pct,
    relt_score = excluded.relt_score,
    relt_action = excluded.relt_action,
    relt_rating = excluded.relt_rating,
    backtest_winrate = excluded.backtest_winrate,
    backtest_total_trades = excluded.backtest_total_trades,
    backtest_total_pnl = excluded.backtest_total_pnl,
    h1_entry_status = excluded.h1_entry_status,
    h1_confirmation = excluded.h1_confirmation,
    projected_pnl_pct = excluded.projected_pnl_pct,
    projected_pnl_nominal = excluded.projected_pnl_nominal,
    stop_loss = excluded.stop_loss,
    tp1 = excluded.tp1,
    tp2 = excluded.tp2,
    updated_at = CURRENT_TIMESTAMP;
```
