export const SIDEWAYS_PATTERNS = [
  {
    id: 'symmetrical-triangle',
    name: 'Symmetrical Triangle',
    category: 'sideways',
    type: 'bilateral',
    successRate: 'Medium',
    reliability: 3,
    risk: 'Medium',
    badges: ['Best for Breakout', 'Need Volume Confirmation'],
    illustration: 'symmetrical-triangle',
    shortDescription: 'Neutral Compression',
    description: 'Pattern konsolidasi netral berupa segitiga sama kaki/simetris. Garis resistance semakin menurun dan garis support semakin naik, menunjukkan tekanan beli dan jual sama-sama kuat. Penembusannya bisa mengarah ke mana saja (Bilateral).',
    psychology: [
      'Market sedang berada dalam kondisi kebingungan (indecision).',
      'Trader yang membeli di support mengambil profit lebih cepat, menyebabkan Lower High.',
      'Trader yang short-sell juga covering lebih cepat di bawah, menyebabkan Higher Low.',
      'Volatilitas menyempit ekstrem hingga salah satu kubu (buyer atau seller) menyerah dan memicu ledakan breakout.'
    ],
    formation: {
      rules: [
        'Harus memiliki minimum 2 titik puncak Lower High.',
        'Harus memiliki minimum 2 titik lembah Higher Low.',
        'Kedua garis konvergen simetris (kemiringan sudut berhadapan relatif sama).'
      ],
      minSwings: 4,
      idealConditions: ['Harga semakin mendekati ujung apeks/pucuk segitiga.', 'Sering beroperasi sebagai pola penerusan trend, meski bisa pula berbalik.']
    },
    confirmation: [
      'Pattern BELUM VALID hingga batas resistance/support patah.',
      'Valid Breakout Atas: Candle menembus dan close di atas garis resistance turun.',
      'Valid Breakdown Bawah: Candle menembus dan close di bawah garis support naik.'
    ],
    volume: {
      consolidation: 'Volume wajib terus menurun seiring menyempitnya harga.',
      breakout: 'Ledakan volume sangat krusial. Tanpa ledakan volume, breakout berisiko sangat besar menjadi false break.',
      falseBreak: 'Segitiga simetris paling rentan terkena fakeout (tipuan breakout) di kedua sisinya.'
    },
    entry: {
      aggressive: 'Tunggu di luar garis support/resistance. Entry searah jarum breakout saat harga mulai lompat.',
      conservative: 'Wajib tunggu retest. Setelah breakout (misal ke atas), tunggu harga memantul di bekas resistance sebelum terbang lagi.'
    },
    stopLoss: 'Jika beli (breakout atas): Stop Loss di bawah garis bawah support terbaru. Jika short: di atas resistance terbaru.',
    takeProfit: 'Ukur tinggi pangkal area segitiga terlebar. Lalu aplikasikan ke titik tembus breakout (baik atas maupun bawah).',
    targetFormula: 'Target Atas = Breakout Price + Base Height | Target Bawah = Breakdown Price - Base Height',
    commonMistakes: [
      'Mencoba menebak arah sebelum harga breakout (gambling).',
      'Tertipu oleh shadow candle intraday yang panjang.',
      'Entry di bagian paling ujung (apeks) segitiga di mana harga cenderung "mati" dan breakout sering kurang bertenaga.'
    ],
    checklist: [
      'Trend menyempit jadi titik pertemuan',
      'Garis atas turun (Lower High)',
      'Garis bawah naik (Higher Low)',
      'Volume perlahan sepi drastis',
      'Menunggu pihak menang (Breakout)',
      'Volume mengkonfirmasi Breakout'
    ],
    tips: [
      'Breakout idealnya terjadi pada rentang waktu ke-2/3 hingga 3/4 panjang segitiga total. Jika tembus di ujung paling mentok, dayanya biasanya tidak impulsif lagi.',
      'Bilateral artinya bebas arah. Bersikaplah netral, jangan melawan kemana arah harga menjebol formasi.'
    ]
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    category: 'sideways',
    type: 'bilateral',
    successRate: 'Medium',
    reliability: 3,
    risk: 'Low',
    badges: ['Best for Swing', 'Need Volume Confirmation'],
    illustration: 'rectangle',
    shortDescription: 'Sideways Box Consolidation',
    description: 'Pattern konsolidasi kotak datar. Harga mondar-mandir tertahan di area resistance atas yang sejajar dan support bawah yang sejajar. Ini adalah area ekuilibrium kuat antar institusi tarik menarik keseimbangan.',
    psychology: [
      'Baik pembeli dan penjual merasa harga ini sudah pantas nilainya.',
      'Setiap menyentuh atap (Resistance), penjual rutin ambil alih kendali (take profit/short).',
      'Setiap menyentuh lantai (Support), pembeli masuk mengumpulkan barang kembali.',
      'Bentuk "kotak/box" ini adalah fase akumulasi atau distribusi panjang. Siapa yang kehabisan stok duluan akan kalah.'
    ],
    formation: {
      rules: [
        'Harga membentur level resistance mendatar yang paralel minimal 2 kali.',
        'Harga membentur level support mendatar bawah minimal 2 kali.',
        'Trend seolah menghilang, hanya bermain di zona tersebut (ranging).'
      ],
      minSwings: 4,
      idealConditions: ['Kotak datar membentang horizontal yang sangat presisi harganya.', 'Durasi mingguan hingga bulanan.']
    },
    confirmation: [
      'Pattern valid sebagai Rectangle selama belum ada level yang tertembus.',
      'Akan jadi setup ledakan trend ketika Resistance jebol mantap ke atas (Buy), atau Support bobol mantap ke bawah (Sell).'
    ],
    volume: {
      consolidation: 'Volume berfluktuasi datar, kadang tinggi saat dekat dengan area support/resist batas namun sepi di tengah.',
      breakout: 'Harus ada anomali lonjakan volume masif mengkonfirmasi tembusan level batas kotak abadi itu.',
      falseBreak: 'Batas yang kuat ini wajar dipalsukan sesaat untuk berburu Stop Loss trader (Stop Hunt).'
    },
    entry: {
      aggressive: 'Entry "Ping-Pong": Beli saat menyentuh dasar kotak support, Jual saat di atap resisten (swing trading biasa).',
      conservative: 'Entry "Breakout": Tunggu harga kabur (breakout) dari kotak diiringi volume tebal.'
    },
    stopLoss: 'Jika main breakout atas, stop loss dipasang sedikit di bawah bekas garis resisten atau tengah kotak. Jika swing, taruh tipis saja di luar kotak abadi.',
    takeProfit: 'Proyeksikan ketinggian selisih atas-bawah kotak tersebut, lepaskan mulai dari poin penembusan.',
    targetFormula: 'Target Atas = Box Resistance + (Resistance - Support)',
    commonMistakes: [
      'Lupa untuk bersabar. Terburu nafsu main tembus padahal harga hanya menjilat batas dan mundur balik.',
      'Gagal melihat gambaran besar bahwa ini bukan tren, tapi perang stagnan antar institusi.'
    ],
    checklist: [
      'Resistance Atap jelas teruji',
      'Support Lantai teruji sejajar',
      'Harga mengayun rata (Ping-Pong)',
      'Sideways tanpa dominasi mutlak',
      'Lonjakan arah keluar menentukan pergerakan baru (Breakout)'
    ],
    tips: [
      'Ini adalah strategi andalan Nicolas Darvas (Darvas Box). Beliau hanya mencari fase break out kotak ini pada tren saham bullish ekstrem masa lampau.',
      'Semakin panjang dan lama periode pembentukan kotak, ledakan arahnya akan semakin hebat (The longer the base, the higher in space).'
    ]
  }
];
