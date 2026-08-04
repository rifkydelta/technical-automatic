export const PATTERN_VOLUME_RULES = {
  'cup-and-handle': {
    name: "Cup and Handle",
    rules: [
      { step: 1, title: "Volume mengecil", desc: "selama pembentukan handle." },
      { step: 2, title: "Volume naik", desc: "saat harga naik." },
      { step: 3, title: "Volume paling besar", desc: "saat Breakout Neckline." }
    ],
    checklist: [
      "Volume kecil saat koreksi",
      "Volume naik saat rally",
      "Volume terbesar saat breakout",
      "Breakout di neckline",
      "Close di atas resistance"
    ]
  },
  'ascending-triangle': {
    name: "Ascending Triangle",
    rules: [
      { step: 1, title: "Volume mengecil", desc: "selama konsolidasi atau pembentukan segitiga." },
      { step: 2, title: "Spike Volume", desc: "kadang terjadi saat harga menyentuh resistance sebelum breakout." },
      { step: 3, title: "Volume meledak", desc: "saat harga berhasil menembus (breakout) resistance." }
    ],
    checklist: [
      "Volume turun saat konsolidasi",
      "Kenaikan volume saat mendekati resistance",
      "Volume tinggi saat breakout",
      "Close di atas resistance"
    ]
  },
  'double-bottom': {
    name: "Double Bottom",
    rules: [
      { step: 1, title: "Volume tinggi", desc: "saat pembentukan bottom pertama (panic selling)." },
      { step: 2, title: "Volume rendah", desc: "saat pembentukan bottom kedua (tekanan jual melemah)." },
      { step: 3, title: "Volume meningkat", desc: "saat breakout neckline." }
    ],
    checklist: [
      "Volume bottom 1 > Volume bottom 2",
      "Volume naik saat menuju neckline",
      "Volume tinggi saat breakout neckline",
      "Close di atas neckline"
    ]
  },
  'bullish-flag': {
    name: "Bullish Flag",
    rules: [
      { step: 1, title: "Volume sangat tinggi", desc: "saat pembentukan tiang bendera (flag pole)." },
      { step: 2, title: "Volume mengering", desc: "secara perlahan selama pembentukan bendera (konsolidasi)." },
      { step: 3, title: "Volume kembali besar", desc: "saat harga breakout dari area bendera." }
    ],
    checklist: [
      "Volume besar di tiang bendera",
      "Volume menurun saat pola bendera",
      "Volume besar saat breakout",
      "Breakout dari upper trendline"
    ]
  },
  'bullish-pennant': {
    name: "Bullish Pennant",
    rules: [
      { step: 1, title: "Volume masif", desc: "pada pergerakan awal (pole)." },
      { step: 2, title: "Volume menyusut", desc: "drastis saat pergerakan harga menyempit (konsolidasi)." },
      { step: 3, title: "Lonjakan volume", desc: "saat harga menembus batas atas pennant." }
    ],
    checklist: [
      "Volume besar di tiang (pole)",
      "Volume menyusut tajam saat konsolidasi",
      "Spike volume saat breakout",
      "Breakout mengarah ke atas"
    ]
  },
  'inverted-head-and-shoulders': {
    name: "Inverted Head & Shoulders",
    rules: [
      { step: 1, title: "Volume tinggi", desc: "saat pembentukan Left Shoulder dan Head (bottom)." },
      { step: 2, title: "Volume sangat kecil", desc: "saat pembentukan Right Shoulder (seller kehabisan tenaga)." },
      { step: 3, title: "Volume meledak", desc: "saat menembus neckline." }
    ],
    checklist: [
      "Volume turun pada Right Shoulder",
      "Volume naik signifikan saat rally dari Right Shoulder ke Neckline",
      "Volume besar saat breakout Neckline",
      "Harga close di atas Neckline"
    ]
  },
  'falling-wedge': {
    name: "Falling Wedge",
    rules: [
      { step: 1, title: "Volume mengecil", desc: "seiring pergerakan harga yang semakin menyempit ke bawah." },
      { step: 2, title: "Volume mendatar", desc: "menjelang ujung wedge, menandakan seller berhenti menjual." },
      { step: 3, title: "Volume membesar", desc: "saat harga menembus upper resistance line." }
    ],
    checklist: [
      "Volume terus menurun seiring tren turun (konvergen)",
      "Kekeringan volume di ujung wedge",
      "Lonjakan volume yang signifikan saat breakout",
      "Close di atas garis resistensi atas"
    ]
  }
};
