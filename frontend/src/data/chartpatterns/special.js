export const SPECIAL_PATTERNS = [
  {
    id: 'false-break',
    name: 'False Break',
    category: 'special',
    type: 'trap',
    successRate: 'Variable',
    reliability: 0,
    risk: 'High',
    badges: ['Need Volume Confirmation', 'High Accuracy'],
    illustration: 'false-break',
    shortDescription: 'Fakeout Trap Reversal',
    description: 'Sebuah fenomena khusus/Spesial di mana harga menembus level krusial (Support atau Resistance) seakan-akan akan lanjut, namun secara mengejutkan berbalik tajam kembali ke zona awalnya. Memakan banyak korban trader (Bull/Bear Trap).',
    psychology: [
      'Level jebol menarik perhatian seluruh penganut teori penembusan konvensional, institusi raksasa "menyerap" order mereka (Stop Hunt) mencari likuiditas.',
      'Ritel beramai-ramai beli saat Resistance tembus.',
      'Institusi membanting harga dengan brutal mengamankan panen. Kepanikan berlipat ganda karena Cut Loss dari para trader ritel memacu pergerakan yang sangat agresif ke arah berlawanan.'
    ],
    formation: {
      rules: [
        'Ada level Support/Resistance kuat sebelumnya yang jelas.',
        'Terjadi penembusan (Breakout/Breakdown) palsu yang singkat (hanya berupa sumbu ekor panjang / 1-2 candle tipis).',
        'Harga tertolak telak, closing berbalik arah masuk jauh kembali melintasi level tersebut (Engulfing / Pinbar).'
      ],
      minSwings: 0,
      idealConditions: ['Terjadi di atas/bawah ekstrim fase channel / masa ranging kuat.', 'Ekor lilin harian sangat kentara panjang dari titik tipuan.']
    },
    confirmation: [
      'Konfirmasi utama: Muncul formasi candle Pinbar berekor sangat panjang atau pola Engulfing kejam yang kembali merangsek level sebelumnya secara telak.'
    ],
    volume: {
      consolidation: 'Tidak ada pakem, hanya mengawasi dinamika level.',
      breakout: 'Sangat sering volume tampak loncat (Bulls terjerat dalam posisi nyangkut tertinggi di False Breakout atas, atau Bears yang short di paling bawah).',
      falseBreak: 'Ini inti esensi pattern, ini adalah fakeout itu sendiri.'
    },
    entry: {
      aggressive: 'Counter-Trend Langsung: Short/Sell seketika begitu melihat resistance gagal ditahan & bentuk sumbu tajam rejection.',
      conservative: 'Tunggu closing hari tersebut benar-benar gagal konfirm/balik jeblok (bearish) di bawah garis.'
    },
    stopLoss: 'Sangat ketat. Segera pasang di ujung absolut / sumbu ekor harga palsu (ekstremum). Tidak boleh bergeser.',
    takeProfit: 'Pembalikan kuat ini dapat mengembalikan harga menyeberang menuju batas arah zona batas level sisi berlawanannya. (Misal: palsu di Resistance Atas, meluncur target ke Support Bawah).',
    targetFormula: 'Target = Batas ekstrem yang berlawanan di dalam range trading sebelumnya.',
    commonMistakes: [
      'Terlalu ngotot posisi awal tanpa antisipasi bahwa breakout di awal itu ternyata gagal.',
      'Kurang disiplin memasang Stop Loss, karena False Break membawa bias pergerakan kuat sekali berlawanan.',
      'Tidak bisa membedakan retest breakout asli vs false break mematikan.'
    ],
    checklist: [
      'Ada level S/R Krusial',
      'Harga terlihat tembus sekilas',
      'Kena jebakan sentimen likuiditas instan',
      'Pembalikan sangat tajam berbentuk jarum / ekor',
      'Harga gagal closing dengan nyaman, kembali masuk zona lama'
    ],
    tips: [
      'Sering juga disebut "Spring" dalam Teori Metode Wyckoff jika False Break terjadi pada Support terbawah kotak.',
      'Di pasar dengan perputaran kencang instrumen besar, fenomena "sapu bersih likuiditas" palsu ini menjadi andalan setup entry institusional modern.'
    ]
  }
];
