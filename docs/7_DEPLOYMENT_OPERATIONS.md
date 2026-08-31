# 7. Panduan Deployment & Operasional (Deployment & Operations Guide)

Dokumen ini memberikan panduan operasional lengkap untuk instalasi lokal, pengujian otomatis, kompilasi produksi, pemeliharaan sistem, serta pengoperasian batch script otomatis pada **IDX Terminal**.

---

## 1. Persyaratan Lingkungan (System Requirements)

- **Operating System**: Windows 10/11, macOS (Apple Silicon / Intel), atau Linux (Ubuntu 22.04+ / Debian).
- **Python**: Versi `3.10`, `3.11`, atau `3.12` (dilengkapi pip).
- **Node.js**: Versi `18.18+` atau `20.x+` LTS (dilengkapi npm).
- **TA-Lib**: Binary C library TA-Lib (tersedia fallback otomatis jika binary belum terpasang).

---

## 2. Instalasi 1-Klik Otomatis (Windows Batch Script)

Untuk pengguna Windows, tersedia dua skrip batch otomatis yang mengurus seluruh konfigurasi:

1. **`setup.bat`**:
   - Memeriksa instalasi Python dan Node.js.
   - Membuat virtual environment `backend/venv`.
   - Menginstall seluruh pustaka Python dari `backend/requirements.txt`.
   - Menjalankan `npm install` pada direktori `frontend/`.
2. **`run.bat`**:
   - Membersihkan port lama (`:8000` dan `:3000`) jika terdapat proses sebelumnya yang masih berjalan.
   - Menyalakan server FastAPI backend pada port 8000 di jendela terpisah.
   - Menyalakan server Next.js frontend pada port 3000 di jendela terpisah.
   - Membuka browser secara otomatis ke `http://localhost:3000`.

---

## 3. Instalasi & Menjalankan Manual via Terminal CLI

### Langkah 1: Persiapan Backend (FastAPI)
```bash
# Pindah ke direktori backend
cd c:\technical-automatic\backend

# Buat virtual environment
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
*Server FastAPI siap di `http://localhost:8000` dengan dokumentasi Swagger di `http://localhost:8000/docs`.*

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

## 4. Kompilasi Produksi (Production Build)

### Kompilasi Frontend Next.js
```bash
cd c:\technical-automatic\frontend

# Build optimized production bundle dengan Turbopack
npm run build

# Jalankan server produksi Next.js
npm start -p 3000
```

### Menjalankan Backend Produksi (FastAPI / Gunicorn)
Untuk server Linux produksi dengan multi-workers:
```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 5. Menjalankan Automated Test Suite (22 Tests)

Suite pengujian backend memverifikasi database SQLite WAL, kontrak API, algoritma kuantitatif RELT, filter tren, presisi lot sizing, screener, dan engine AI Prompt Intelligence:

```bash
cd c:\technical-automatic\backend

# Jalankan seluruh test suite
venv\Scripts\python.exe -m unittest test_ai_prompt_engine.py test_signal_db.py test_signal_api.py test_relt_signal.py test_relt_total_audit.py test_screener.py test_bpjs_screener.py test_system_optimizations.py
```

*Output yang diharapkan: `Ran 22 tests ... OK` (100% Passed).*

---

## 6. Pemecahan Masalah Umum (Troubleshooting)

| Gejala Masalah | Penyebab Umum | Solusi yang Disarankan |
| :--- | :--- | :--- |
| **Error `TA-Lib import error` saat startup backend** | Library C TA-Lib belum terpasang di OS. | Pasang TA-Lib precompiled wheel untuk Python 3.12, atau sistem akan otomatis menggunakan fallback TA-Lib di `utils/ta_fallback.py`. |
| **Peringatan `Delisted ticker` dari yfinance** | Ticker saham telah suspensi / delisting dari BEI. | Scanner secara otomatis mendeteksi dan melewati ticker tersebut tanpa menghentikan pemindaian emiten lainnya. |
| **Chart Lightweight tidak muncul** | Data OHLCV kosong untuk ticker baru IPO (< 5 bar). | Sistem secara otomatis menampilkan fallback pesan informatif pada antarmuka pengguna. |
| **Port 8000 atau 3000 sedang digunakan** | Terdapat proses instance sebelumnya yang masih aktif. | Jalankan `run.bat` (yang otomatis membersihkan port) atau hentikan manual proses melalui Task Manager. |
| **Format JSON AI tidak valid saat di-paste** | Respon LLM mengandung teks pembuka/penutup. | `AiPasteModal` telah dilengkapi **Auto-Cleaner Regex** yang otomatis membersihkan teks dan mengambil payload JSON murni. |
