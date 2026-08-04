# IDX Technical Analysis & Screener CLI Terminal

Adaptasi versi CLI terminal dari IDX Technical Analysis Dashboard, didesain super ringan, responsif, dan siap digunakan di **Termux Android** maupun Terminal Desktop (Windows, Linux, macOS).

---

## 🚀 Panduan Instalasi di Termux (Android)

### 1. Install Dependencies di Termux
```bash
pkg update && pkg upgrade -y
pkg install python git -y
```

### 2. Clone Repository / Download Folder CLI
```bash
cd ~
# Copy atau clone folder cli ke Termux
cd cli
```

### 3. Install Package
```bash
pip install -e .
```

### 4. Setting Backend API URL (Jika Backend Berjalan di Laptop/Server)
Jika backend API FastAPI berjalan di laptop yang terhubung satu Wi-Fi dengan HP:
```bash
export IDX_API_URL=http://192.168.1.100:8000
```
*(Ganti `192.168.1.100` dengan IP laptop kamu)*

---

## 🛠 Panduan Penggunaan (CLI Commands)

### 1. Single Ticker Technical Analysis (`idx analyze`)
```bash
idx analyze BBCA                           # Default: overview tab
idx analyze BBCA --tab technical           # Detailed technical indicators
idx analyze BBCA --tab financial           # Valuation & financial health
idx analyze BBCA --tab news                # News & catalysts
idx analyze BBCA --tab patterns            # Detected chart patterns
idx analyze BBCA --tab all                 # Tampilkan semua tab sekaligus
idx analyze BBCA --mode session_1          # Mode Sesi 1
idx analyze BBCA --mode close_market       # Mode Close Market
```

### 2. Multi-Ticker Market Screener (`idx screener`)
```bash
idx screener BBCA,BBRI,BMRI,BBNI           # Scan multiple tickers
idx screener BBCA,BBRI,BMRI --min-score 60 # Filter score minimal 60
```

### 3. Category & Preset Strategy Hub (`idx category`)
```bash
idx category                               # Lihat daftar kategori
idx category bank                          # Sektor Bank (Big & Mid)
idx category bakrie                        # Bakrie Group
idx category prajogo                       # Prajogo Pangestu (Barito Group)
idx category bpjs                          # Strategi BPJS Daytrade (09.05 - 09.20)
idx category opening                       # Strategi Opening (08.58)
idx category bsjp                          # Strategi BSJP (Beli Sore Jual Pagi)
```

### 4. Real-time IHSG Monitor (`idx ihsg`)
```bash
idx ihsg                                   # Tampilkan IHSG saat ini
idx ihsg --watch                           # Live auto-refresh tiap 5 detik
```

### 5. News & Catalysts (`idx news`)
```bash
idx news BBCA                              # Berita terbaru saham BBCA
```

### 6. Company Profile & Valuasi (`idx profile`)
```bash
idx profile BBCA                           # Profil emiten, sektor, & valuasi
```

### 7. Export Analisis (`idx export`)
```bash
idx export BBCA --format json              # Export ke file JSON
idx export BBCA --format txt               # Export ke file TXT readable
```

---

## 🎨 Desain Aesthetics & Terminal UX
- Menggunakan library `rich` untuk perwarnaan ANSI 256-color yang responsif di Termux.
- Warna disesuaikan 100% dengan token web:
  - 🟢 **Bullish**: Green
  - 🔴 **Bearish**: Red
  - 🟡 **Neutral/Warning**: Yellow / Orange
  - 🔵 **Info**: Blue / Cyan
