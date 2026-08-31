# 5. Frontend Design System & Institutional Aesthetics

Dokumen ini mendokumentasikan filosofi estetika, token desain baku (*Design Tokens*), standarisasi *Anti-Slop*, sistem tipografi, komponen interaktif (*Liquid Glass*), tata letak responsif, serta arsitektur frontend pada **IDX Terminal**.

---

## 1. Filosofi Desain: Anti-Slop Institutional Dark Tech

Platform mengadopsi standar desain profesional berbasis prinsip **`Leonxlnx/taste-skill`**:
- **Bebas Pola Generik AI (*Anti-Slop*)**: Menghindari teks bergradasi pelangi acak (*rainbow gradient slop*), emoji berlebihan pada badge teknikal, dan jarak padding/margin kosong yang boros.
- **Tipografi Solid & Tegas**: Menggunakan teks putih solid (`#ffffff`) dengan aksen warna fungsional terarah (`#38bdf8` untuk keyword, `#10b981` untuk bullish, `#f43f5e` untuk bearish).
- **Glassmorphism Presisi (*Liquid Glass*)**: Panel dengan `backdrop-filter: blur(16px)` dan border transparan `rgba(255, 255, 255, 0.08)` yang responsif terhadap hover micro-interaction.

---

## 2. Token Baku CSS (`globals.css`)

### A. Token Warna & Kedalaman
```css
:root {
  --bg-primary: #050505;
  --bg-card: rgba(15, 17, 23, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(255, 255, 255, 0.18);
  
  --bullish: #4ade80;
  --bullish-bg: rgba(74, 222, 128, 0.12);
  --bearish: #f43f5e;
  --bearish-bg: rgba(244, 63, 94, 0.12);
  --warning: #fbbf24;
  --info: #38bdf8;
  --stockbit: #34d399;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### B. 4 Token Border-Radius Terstandarisasi
Untuk menghindari inkonsistensi sudut visual, seluruh elemen antarmuka menggunakan 4 tingkatan radius baku:

```css
:root {
  --radius-sm: 10px;    /* Button filter kecil, badge status, pill preset */
  --radius-md: 14px;    /* KPI stats cards, input search, dropdown filter */
  --radius-lg: 20px;    /* Main containers, header banners, modal dialogs */
  --radius-full: 9999px; /* Live status dot, circular icons, round badges */
}
```

---

## 3. Utility Classes & Micro-Interactions

### A. Liquid Glass Hover (`.liquid-glass-hover`)
Memberikan umpan balik visual saat kartu di-hover tanpa menggeser tata letak:
```css
.liquid-glass-hover {
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.liquid-glass-hover:hover {
  background-color: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.liquid-glass-hover:active {
  transform: translateY(0) scale(0.98);
}
```

### B. Ambient Background Glow (`.glow-bg`)
Pencahayaan radial halus di sudut latar belakang:
```css
.glow-bg {
  position: fixed;
  top: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}
```

---

## 4. Pola Tata Letak Kunci (Key Layout Patterns)

### A. Responsive 2-Column Split Hero (`.hero-grid`)
Tata letak split screen yang menempatkan Headline + Omni-Search di sisi kiri dan 3D Radar Scanner di sisi kanan secara seimbang pada resolusi $\ge 860\text{px}$:

```css
.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: center;
}

@media (min-width: 860px) {
  .hero-grid {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 32px;
  }
}
```

### B. Clickable KPI Ribbon (4 Status Cards)
Ribbon 4 kartu metrik pasar kuantitatif di homepage yang interaktif dan langsung mengarah ke rute terfilter:
- **RADAR SCAN** $\rightarrow$ `/signals`
- **BUY SIGNALS** $\rightarrow$ `/signals?type=BUY`
- **WIN RATE AVG** $\rightarrow$ `/signals?minScore=75`
- **TP TERCAPAI** $\rightarrow$ `/signals?status=HIT_TP`

### C. Server-Side Pagination Bar
Ditempatkan di bawah `SignalTable` dengan navigasi cerdas:
- Indikator posisi data: `"Menampilkan 1-50 dari 2.860 sinyal"`.
- Pilihan baris per halaman: `25 / 50 / 100 / 200`.
- Kontrol halaman: `« Awal`, `‹ Prev`, angka halaman aktif `[1] [2] [3]`, `Next ›`, `Akhir »`.

### D. Precision Calendar Datepicker
Input tanggal kalender berformat ISO `YYYY-MM-DD` terintegrasi dengan shortcut sesi transaksi BEI teraktif.
