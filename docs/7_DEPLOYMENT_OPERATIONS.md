# 7. Panduan Deployment & Operasional (Deployment & Operations Guide)

Dokumen ini memberikan panduan operasional lengkap untuk instalasi lokal, pengujian otomatis, kompilasi produksi, serta pemeliharaan sistem **IDX Terminal**.

---

## 1. Persyaratan Lingkungan (System Requirements)

- **Operating System**: Windows 10/11, macOS (Apple Silicon / Intel), atau Linux (Ubuntu 22.04+ / Debian).
- **Python**: Versi `3.10`, `3.11`, atau `3.12` (dilengkapi pip).
- **Node.js**: Versi `18.18+` atau `20.x+` LTS (dilengkapi npm).
- **TA-Lib**: Binary C library TA-Lib (untuk Windows, gunakan precompiled wheel di `backend/wheels/` jika tersedia, atau install via pip/conda).

---

## 2. Instalasi & Menjalankan Mode Pengembangan (Local Dev)

### Langkah 1: Persiapan Backend (FastAPI)
```bash
# Pindah ke direktori backend
cd c:\technical-automatic\backend

# Buat virtual environment (jika belum ada)
python -m venv venv

# Aktifkan virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install seluruh dependensi
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Server FastAPI siap di `http://localhost:8000`.*

---

### Langkah 2: Persiapan Frontend (Next.js)
```bash
# Buka jendela terminal baru dan pindah ke direktori frontend
cd c:\technical-automatic\frontend

# Install dependencies Node.js
npm install

# Jalankan server pengembangan Turbopack
npm run dev
```
*Aplikasi frontend siap di `http://localhost:3000`.*

---

## 3. Kompilasi Produksi (Production Build)

### Kompilasi Frontend Next.js
```bash
cd c:\technical-automatic\frontend

# Build optimized production bundle
npm run build

# Jalankan server produksi Next.js
npm start -p 3000
```

### Menjalankan Backend Produksi (FastAPI / Gunicorn)
Untuk lingkungan server Linux produksi dengan multi-workers:
```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 4. Menjalankan Automated Test Suite (16 Tests)

Suite pengujian backend memverifikasi seluruh komponen kritis (database SQLite WAL, endpoint API, algoritma kuantitatif RELT, filter tren, presisi lot sizing, dan screener custom):

```bash
cd c:\technical-automatic\backend

# Jalankan seluruh test suite
venv\Scripts\python.exe -m unittest test_signal_db.py test_signal_api.py test_relt_signal.py test_relt_total_audit.py test_screener.py test_bpjs_screener.py test_system_optimizations.py
```

*Output yang diharapkan: `Ran 16 tests in ~3.3s ... OK`.*

---

## 5. Pemecahan Masalah Umum (Troubleshooting)

| Gejala Masalah | Penyebab Umum | Solusi yang Disarankan |
| :--- | :--- | :--- |
| **Error `TA-Lib import error` saat startup backend** | Library C TA-Lib belum terpasang di OS. | Pasang TA-Lib precompiled wheel untuk Python 3.12, atau sistem akan otomatis menggunakan fallback TA-Lib di `utils/ta_fallback.py`. |
| **Peringatan `Delisted ticker` dari yfinance** | Ticker saham telah suspensi / delisting dari BEI. | Scanner secara otomatis mendeteksi dan melewati ticker tersebut tanpa menghentikan pemindaian emiten lainnya. |
| **Chart Lightweight tidak muncul** | Data OHLCV kosong untuk ticker baru IPO (< 5 bar). | Sistem secara otomatis menampilkan fallback pesan informatif pada antarmuka pengguna. |
| **Port 8000 atau 3000 sedang digunakan** | Terdapat proses instance sebelumnya yang masih aktif. | Hentikan proses lama melalui Task Manager / `kill` atau ganti port melalui parameter `--port 8001` / `-p 3001`. |
