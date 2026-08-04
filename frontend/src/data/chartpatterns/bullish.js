export const BULLISH_PATTERNS = [
  {
    id: 'ascending-triangle',
    name: 'Ascending Triangle',
    category: 'bullish',
    type: 'continuation',
    successRate: 'High',
    reliability: 4,
    risk: 'Medium',
    badges: ['Best for Breakout', 'Need Volume Confirmation'],
    illustration: 'ascending-triangle',
    shortDescription: 'Breakout Confirmation',
    description: 'Pattern bullish continuation yang menunjukkan buyer semakin agresif mendorong harga naik sementara resistance tetap berada pada level yang sama. Pattern ini menunjukkan konsolidasi harga sebelum melanjutkan tren naik.',
    psychology: [
      'Seller masih mempertahankan resistance di level harga tertentu.',
      'Namun setiap koreksi menghasilkan level bottom yang lebih tinggi (Higher Low).',
      'Artinya kekuatan buyer semakin dominan dan agresif.',
      'Tekanan beli terus meningkat hingga akhirnya pertahanan resistance berhasil ditembus.'
    ],
    formation: {
      rules: [
        'Harga harus menyentuh resistance minimal 2 kali.',
        'Harga harus membentuk Higher Low minimal 2 kali.',
        'Garis resistance horizontal dan garis support naik membentuk segitiga siku-siku naik.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi pada fase uptrend yang jelas.', 'Konsolidasi berlangsung antara 3-4 minggu.']
    },
    confirmation: [
      'Pattern BELUM VALID apabila harga masih bergerak di dalam area segitiga.',
      'Pattern baru VALID ketika harga berhasil breakout dan candle close di atas garis resistance.',
      'Breakout yang kuat wajib didukung oleh lonjakan volume.'
    ],
    volume: {
      consolidation: 'Volume cenderung menurun selama fase pembentukan segitiga.',
      breakout: 'Volume meningkat signifikan saat harga menembus resistance.',
      falseBreak: 'Jika breakout terjadi dengan volume kecil, risiko False Break jauh lebih besar.'
    },
    entry: {
      aggressive: 'Entry saat candle sedang menembus (breakout) resistance dengan volume besar.',
      conservative: 'Menunggu harga retest atau pullback kembali ke bekas resistance (yang kini menjadi support baru) setelah breakout.'
    },
    stopLoss: 'Pasang Stop Loss sedikit di bawah garis support miring, atau di bawah swing low terakhir sebelum breakout.',
    takeProfit: 'Target kenaikan diukur berdasarkan ketinggian maksimal dari pangkal segitiga, kemudian diproyeksikan ke atas dari titik breakout.',
    targetFormula: 'Target = Breakout Price + (Resistance Price - Lowest Support Price)',
    commonMistakes: [
      'Menganggap pattern sudah valid padahal belum breakout.',
      'Entry tanpa konfirmasi volume.',
      'Tidak menunggu candle close, sehingga terjebak pada false breakout intraday.',
      'Mengabaikan trend besar (trading melawan trend).'
    ],
    checklist: [
      'Trend sebelumnya adalah Uptrend',
      'Resistance horizontal jelas',
      'Terdapat deretan Higher Low',
      'Volume turun saat konsolidasi',
      'Breakout resistance',
      'Volume naik tajam saat breakout',
      'Candle close di atas resistance'
    ],
    tips: [
      'Lebih akurat jika muncul pada kondisi pasar uptrend secara keseluruhan.',
      'Semakin lama konsolidasi dan semakin rapat segitiga (harga menyempit), biasanya breakout akan semakin eksplosif.',
      'Lebih kuat jika EMA200 berada di bawah area harga.'
    ]
  },
  {
    id: 'inverted-head-and-shoulders',
    name: 'Inverted Head & Shoulders',
    category: 'bullish',
    type: 'reversal',
    successRate: 'High',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Reversal', 'High Accuracy'],
    illustration: 'inverted-head-and-shoulders',
    shortDescription: 'Major Reversal Pattern',
    description: 'Pattern bullish reversal yang sangat kuat, sering terbentuk di dasar sebuah downtrend. Terdiri dari tiga lembah, dengan lembah tengah (Head) sebagai titik terendah dan dua lembah di samping (Left & Right Shoulders) berada di posisi yang lebih tinggi.',
    psychology: [
      'Pada Left Shoulder, seller mendominasi namun buyer mulai masuk saat harga dirasa murah.',
      'Pada Head, seller membuat dorongan kuat terakhir yang mencetak Lower Low, lalu buyer bereaksi lebih agresif membawa harga naik lagi.',
      'Pada Right Shoulder, seller mencoba menekan kembali namun gagal mencapai level Head (membentuk Higher Low). Ini menandakan seller telah kehabisan tenaga.',
      'Ketika neckline ditembus, ini adalah titik balik di mana buyer sepenuhnya memegang kendali.'
    ],
    formation: {
      rules: [
        'Terdapat 3 lembah (low).',
        'Lembah tengah (Head) harus lebih rendah dari bahu kiri (Left Shoulder).',
        'Bahu kanan (Right Shoulder) harus lebih tinggi dari Head, idealnya sejajar dengan bahu kiri.',
        'Puncak antara bahu dan kepala dihubungkan menjadi Neckline (garis leher).'
      ],
      minSwings: 3,
      idealConditions: ['Terbentuk setelah downtrend yang panjang.', 'Bahu kiri dan kanan relatif simetris.']
    },
    confirmation: [
      'Pattern baru VALID ketika harga berhasil breakout dan candle close di atas garis Neckline.',
      'Sering terjadi pullback/retest ke Neckline sebelum harga benar-benar melesat naik.'
    ],
    volume: {
      consolidation: 'Volume biasanya paling tinggi saat penurunan menuju Head, dan menurun pada pembentukan Right Shoulder.',
      breakout: 'Wajib terjadi lonjakan volume besar saat menembus Neckline.',
      falseBreak: 'Volume yang sepi saat breakout Neckline mengindikasikan potensi kegagalan pattern.'
    },
    entry: {
      aggressive: 'Entry saat candle menembus Neckline dengan dukungan volume.',
      conservative: 'Entry saat harga kembali turun (retest) ke Neckline setelah breakout sukses.'
    },
    stopLoss: 'Pasang Stop Loss di bawah Right Shoulder (bahu kanan).',
    takeProfit: 'Ukur jarak vertikal dari titik terbawah Head ke Neckline, dan tambahkan jarak tersebut ke titik breakout pada Neckline.',
    targetFormula: 'Target = Breakout Price + (Neckline Price - Head Price)',
    commonMistakes: [
      'Mencari pattern ini di area sideways atau uptrend (seharusnya di dasar downtrend).',
      'Mengambil posisi beli terlalu dini sebelum Neckline tembus.',
      'Bahu kanan terlalu rendah (menandakan seller masih kuat).'
    ],
    checklist: [
      'Muncul setelah Downtrend',
      'Terbentuk Left Shoulder',
      'Terbentuk Head (lebih rendah dari bahu kiri)',
      'Terbentuk Right Shoulder (lebih tinggi dari Head)',
      'Garis Neckline bisa ditarik jelas',
      'Breakout Neckline dengan Volume'
    ],
    tips: [
      'Bentuk Neckline tidak harus lurus horizontal, bisa sedikit miring ke atas atau ke bawah. Namun Neckline mendatar atau sedikit miring ke atas biasanya lebih baik.',
      'Pattern ini sangat andal untuk menentukan titik perubahan tren jangka panjang.'
    ]
  },
  {
    id: 'cup-and-handle',
    name: 'Cup and Handle',
    category: 'bullish',
    type: 'continuation',
    successRate: 'Medium',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Swing', 'High Accuracy'],
    illustration: 'cup-and-handle',
    shortDescription: 'Rounding Consolidation',
    description: 'Pattern bullish continuation yang bentuknya menyerupai cangkir dan gagangnya. Menandakan konsolidasi yang membentuk dasar melengkung (Cup) diikuti konsolidasi kecil menurun (Handle) sebelum melanjutkan tren naik.',
    psychology: [
      'Cup merepresentasikan fase akumulasi secara bertahap (rounding bottom), di mana tekanan jual perlahan habis dan digantikan tekanan beli.',
      'Gagang (Handle) adalah koreksi terakhir atau "shakeout" untuk menyingkirkan weak hands (trader ritel yang tidak sabar).',
      'Volume yang menyusut saat Handle menandakan minimnya tekanan jual sebelum harga bersiap meroket.'
    ],
    formation: {
      rules: [
        'Bagian Cup harus berbentuk "U" melengkung halus, bukan "V" yang tajam.',
        'Handle harus terkoreksi di paruh atas dari cangkir (biasanya tidak jatuh lebih dari 50% kedalaman Cup).',
        'Kedua ujung atas cangkir membentuk area resistance utama.'
      ],
      minSwings: 3,
      idealConditions: ['Didahului oleh uptrend kuat (kenaikan minimal 30%).', 'Bentuk Cup dangkal dan melengkung rapi.', 'Handle miring ke bawah seperti Bull Flag.']
    },
    confirmation: [
      'Valid ketika harga breakout menembus resistance dari Handle atau bibir Cup.',
      'Harus ditutup dengan candle close yang mantap.'
    ],
    volume: {
      consolidation: 'Bentuk U pada volume: tinggi di kedua sisi cup, sepi di dasar cup. Sangat sepi saat Handle.',
      breakout: 'Lonjakan volume yang sangat kuat saat breakout dari Handle/Bibir Cup.',
      falseBreak: 'Handle yang terlalu dalam dengan volume besar menandakan tekanan jual yang belum habis.'
    },
    entry: {
      aggressive: 'Entry saat harga menembus trendline atas pada area Handle.',
      conservative: 'Entry saat harga menembus resistance horizontal pada ujung atas bibir Cup.'
    },
    stopLoss: 'Pasang Stop Loss sedikit di bawah titik terendah gagang (Handle).',
    takeProfit: 'Ukur kedalaman maksimal dari Cup, dan proyeksikan ke atas dari titik breakout.',
    targetFormula: 'Target = Breakout Price + (Cup Resistance Price - Cup Bottom Price)',
    commonMistakes: [
      'Bentuk Cup berupa "V" shape yang terlalu tajam (lebih berisiko).',
      'Handle jatuh terlalu dalam melebihi pertengahan Cup.',
      'Tidak ada tren naik yang mendahului terbentuknya pattern.'
    ],
    checklist: [
      'Didahului Uptrend yang kuat',
      'Membentuk Cup (U-shape bottom)',
      'Membentuk Handle (koreksi ringan)',
      'Volume kering saat Handle',
      'Breakout dengan volume besar'
    ],
    tips: [
      'Cup and Handle adalah salah satu setup favorit trader legendaris William O\'Neil (CANSLIM).',
      'Semakin panjang dan melengkung dasar Cup, biasanya pattern semakin kuat karena akumulasi lebih solid.'
    ]
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom',
    category: 'bullish',
    type: 'reversal',
    successRate: 'High',
    reliability: 5,
    risk: 'Low',
    badges: ['Best for Reversal', 'High Accuracy'],
    illustration: 'double-bottom',
    shortDescription: 'W-Shape Reversal',
    description: 'Pattern bullish reversal berbentuk huruf "W". Terjadi ketika harga gagal menembus level support yang sama untuk kedua kalinya, menunjukkan penolakan kuat dari buyer dan potensi pembalikan arah dari downtrend menjadi uptrend.',
    psychology: [
      'Harga sedang turun, lalu mencapai suatu titik murah dan buyer bereaksi memantulkannya (Bottom pertama).',
      'Harga naik sebentar, lalu turun kembali untuk menguji dasar sebelumnya.',
      'Ketika harga tertahan di Bottom kedua, seller menyadari mereka kehabisan barang. Buyer masuk lebih masif.',
      'Breakout Neckline mengkonfirmasi bahwa buyer telah sepenuhnya mengalahkan seller.'
    ],
    formation: {
      rules: [
        'Terdiri dari dua lembah (Bottom) pada level harga yang kurang lebih sama.',
        'Puncak di antara kedua lembah menjadi Neckline.',
        'Harga harus menembus Neckline untuk validasi pattern.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi setelah downtrend yang signifikan.', 'Bottom kedua sedikit lebih tinggi dari Bottom pertama atau persis sama rata.']
    },
    confirmation: [
      'Valid ketika harga breakout menembus Neckline ke atas.',
      'Close candle harus berada di atas Neckline.'
    ],
    volume: {
      consolidation: 'Volume biasanya lebih tinggi di Bottom pertama, dan lebih rendah di Bottom kedua.',
      breakout: 'Dibutuhkan peningkatan volume saat menembus Neckline untuk menghindari jebakan.',
      falseBreak: 'Breakout tanpa kenaikan volume rentan kembali turun masuk ke area support.'
    },
    entry: {
      aggressive: 'Entry saat candle breakout Neckline.',
      conservative: 'Entry saat harga retest kembali ke area Neckline setelah breakout sukses.'
    },
    stopLoss: 'Pasang Stop Loss di bawah Bottom kedua, atau di bawah pertengahan formasi jika stop loss terlalu lebar.',
    takeProfit: 'Ukur ketinggian dari Bottom ke Neckline, lalu proyeksikan ke atas dari garis Neckline.',
    targetFormula: 'Target = Breakout Price + (Neckline Price - Bottom Price)',
    commonMistakes: [
      'Memaksakan bentuk W di tengah-tengah area sideways, padahal pattern ini harusnya muncul di akhir downtrend.',
      'Entry terlalu cepat di Bottom kedua tanpa menunggu Neckline ditembus.'
    ],
    checklist: [
      'Terjadi di ujung Downtrend',
      'Bottom pertama terbentuk',
      'Pantulan naik membuat Neckline',
      'Bottom kedua menguji support',
      'Breakout Neckline dengan konfirmasi Volume'
    ],
    tips: [
      'Jika Bottom kedua sedikit lebih rendah (false breakdown) lalu berbalik naik drastis membentuk "Spring", probabilitas pattern ini menjadi sangat kuat.',
      'Double Bottom klasik adalah salah satu pattern paling handal dengan tingkat reliabilitas 5 bintang.'
    ]
  },
  {
    id: 'bullish-flag',
    name: 'Bullish Flag',
    category: 'bullish',
    type: 'continuation',
    successRate: 'Medium',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Trend Following', 'Need Volume Confirmation'],
    illustration: 'bullish-flag',
    shortDescription: 'Short Term Pullback',
    description: 'Pattern bullish continuation jangka pendek yang bentuknya menyerupai bendera. Terdiri dari tiang kuat (Flagpole) diikuti channel penurunan kecil dan paralel (Flag) yang menandakan profit taking sementara.',
    psychology: [
      'Dorongan harga vertikal yang sangat kuat (Flagpole) memicu sebagian buyer awal untuk merealisasikan keuntungan (take profit).',
      'Akibatnya harga terkoreksi perlahan dalam sebuah channel kecil.',
      'Namun tekanan jual tidak besar, dan trader yang tertinggal kereta menunggu kesempatan masuk.',
      'Begitu resistance bendera tembus, pembeli baru masuk secara agresif melanjutkan tiang kedua.'
    ],
    formation: {
      rules: [
        'Harus didahului pergerakan naik yang kuat dan cepat (Flagpole/Tiang Bendera).',
        'Koreksi membentuk dua garis paralel miring ke bawah (Flag).',
        'Koreksi idealnya tidak menembus ke bawah 50% dari tiang bendera.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi pada trend yang sangat kuat dan momentum tinggi.', 'Durasi Flag singkat, biasanya 1-3 minggu saja.']
    },
    confirmation: [
      'Valid ketika harga breakout menembus garis trend atas dari bendera.',
      'Harus ditutup dengan candle close.'
    ],
    volume: {
      consolidation: 'Volume HARUS turun signifikan dan mengering selama pembentukan bendera.',
      breakout: 'Volume naik tajam saat harga meledak keluar dari bendera.',
      falseBreak: 'Koreksi yang diiringi volume tinggi berarti tekanan jual kuat dan membatalkan setup.'
    },
    entry: {
      aggressive: 'Entry saat candle sedang breakout resistance miring bendera.',
      conservative: 'Menunggu candle close di atas garis resistance bendera.'
    },
    stopLoss: 'Pasang Stop Loss di bawah titik support terendah dari bendera tersebut.',
    takeProfit: 'Ukur ketinggian tiang bendera awal, dan proyeksikan sepenuhnya ke atas dari titik breakout.',
    targetFormula: 'Target = Breakout Price + Height of Flagpole',
    commonMistakes: [
      'Bentuk tiang bendera tidak jelas atau tidak cukup impulsif.',
      'Koreksi bendera memakan waktu terlalu lama (lebih dari 4 minggu biasanya sudah menjadi channel biasa, bukan bendera impulsif).',
      'Volume tidak mengering selama fase pullback.'
    ],
    checklist: [
      'Impulsive Up-move (Tiang terbentuk)',
      'Pullback dalam channel paralel kecil',
      'Volume mengering selama pullback',
      'Koreksi kurang dari 50% tiang',
      'Breakout trendline atas dengan Volume'
    ],
    tips: [
      'Sangat efektif saat market sedang dalam kondisi strong uptrend atau euphoria.',
      'Pola bendera yang koreksinya hampir datar (mendekati Rectangle kecil) biasanya menghasilkan breakout yang lebih ganas.'
    ]
  },
  {
    id: 'bullish-pennant',
    name: 'Bullish Pennant',
    category: 'bullish',
    type: 'continuation',
    successRate: 'High',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Trend Following'],
    illustration: 'bullish-pennant',
    shortDescription: 'Symmetrical Short Pause',
    description: 'Sangat mirip dengan Bullish Flag, perbedaannya hanya pada bentuk koreksinya yang berupa segitiga simetris kecil (Pennant) bukan channel paralel. Mengindikasikan jeda sejenak sebelum harga melesat lagi.',
    psychology: [
      'Setelah rally impulsif, keseimbangan sementara antara buyer yang masih dominan dan seller yang take profit membentuk penyempitan rentang harga.',
      'Semakin ujung, tekanan semakin menumpuk layaknya per. Ketika dilepaskan menembus ke atas, energi lama kembali muncul melanjutkan trend.'
    ],
    formation: {
      rules: [
        'Harus didahului pergerakan naik tajam vertikal (Flagpole).',
        'Koreksi membentuk dua garis tren konvergen (menyempit seperti segitiga simetris kecil).',
        'Area konsolidasi sangat pendek dan sempit.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi setelah breakout resisten penting dengan momentum kuat.', 'Durasi sangat singkat (beberapa hari hingga 2 minggu).']
    },
    confirmation: [
      'Valid ketika breakout garis trend turun sebelah atas.',
      'Close di atas batas konvergen atas.'
    ],
    volume: {
      consolidation: 'Volume mengecil secara drastis saat membentuk pennant (menyempit).',
      breakout: 'Volume meledak tinggi saat breakout menuju ke atas.',
      falseBreak: 'Gagal breakout jika pennant terlalu panjang sehingga kehilangan momentum awalnya.'
    },
    entry: {
      aggressive: 'Entry langsung di dalam pennant saat dekat support, antisipasi breakout (sangat berisiko).',
      conservative: 'Entry saat breakout valid melewati resistance segitiga kecil.'
    },
    stopLoss: 'Pasang Stop Loss tepat di bawah titik ujung paling bawah pennant.',
    takeProfit: 'Ukur jarak Flagpole dan tambahkan pada ujung breakout.',
    targetFormula: 'Target = Breakout Price + Height of Flagpole',
    commonMistakes: [
      'Mencampuradukkan dengan Symmetrical Triangle biasa. Pennant jauh lebih kecil dan durasinya lebih pendek (kurang dari sebulan), dengan Flagpole yang curam.',
      'Entry ketika belum terjadi penyempitan yang matang.'
    ],
    checklist: [
      'Tiang tajam terbentuk di awal',
      'Konsolidasi segitiga menyempit',
      'Volume drop signifikan',
      'Breakout dengan volume besar kembali'
    ],
    tips: [
      'Pennant sering kali menjadi penanda pertengahan jalan (halfway point) dari sebuah tren pergerakan besar.'
    ]
  },
  {
    id: 'falling-wedge',
    name: 'Falling Wedge',
    category: 'bullish',
    type: 'reversal/continuation',
    successRate: 'Medium',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Swing', 'High Accuracy'],
    illustration: 'falling-wedge',
    shortDescription: 'Narrowing Downward Channel',
    description: 'Pattern bullish yang terbentuk dari dua garis tren menurun yang saling mendekat (konvergen). Menunjukkan seller semakin sulit mendorong harga turun lebih dalam.',
    psychology: [
      'Harga terus turun mencetak Lower High dan Lower Low, namun kecepatan/sudut penurunannya semakin melemah.',
      'Garis support lebih landai dari garis resistance, artinya seller kehabisan bensin untuk menekan tajam ke bawah.',
      'Begitu resistance tertembus, terjadi short-squeeze yang kuat dari seller yang terpaksa cut-loss, mendorong harga naik tajam.'
    ],
    formation: {
      rules: [
        'Dua garis tren miring ke bawah.',
        'Garis atas (resistance) lebih curam daripada garis bawah (support).',
        'Semakin lama, rentang pergerakan semakin sempit (Wedge/Baji).'
      ],
      minSwings: 3,
      idealConditions: ['Bisa bertindak sebagai Reversal (jika di akhir downtrend besar) atau Continuation (jika sebagai pullback di dalam uptrend).']
    },
    confirmation: [
      'Valid ketika harga menembus ke atas dari trendline resistance yang curam tersebut.',
      'Sering kali didahului bullish divergence pada indikator MACD atau RSI di bagian dasar.'
    ],
    volume: {
      consolidation: 'Volume mengecil saat harga tertekan mendekati ujung wedge.',
      breakout: 'Dibutuhkan lonjakan volume saat breakout ke atas untuk validasi momentum buyer.',
      falseBreak: 'Jika tembus ke bawah support (breakdown), pattern ini otomatis gagal.'
    },
    entry: {
      aggressive: 'Entry dekat garis support saat muncul bullish candlestick pattern (seperti Hammer atau Engulfing) dibarengi divergence.',
      conservative: 'Entry saat resistance wedge berhasil di-breakout dengan close yang kuat.'
    },
    stopLoss: 'Pasang Stop Loss di bawah swing low terbawah di dalam ujung wedge.',
    takeProfit: 'Target konservatif berada pada titik asal terbentuknya wedge di bagian atas.',
    targetFormula: 'Target = Titik Swing High pertama dari formasi wedge',
    commonMistakes: [
      'Salah mengira Falling Wedge sebagai Descending Triangle (perbedaannya pada wedge garis support ikut turun menyempit, sedangkan triangle datar).',
      'Masuk terlalu cepat tanpa melihat indikasi penyempitan volatilitas.'
    ],
    checklist: [
      'Harga turun membentuk Lower Low',
      'Garis support lebih landai dari resistance',
      'Muncul indikasi Bullish Divergence (opsional tapi disarankan)',
      'Volume mengering di ujung',
      'Breakout ke atas'
    ],
    tips: [
      'Kombinasi Falling Wedge dengan Bullish Divergence pada Oscillator (RSI/MACD) adalah salah satu setup dengan probabilitas sangat tinggi.',
      'Pattern ini sangat efektif mendeteksi kelelahan dari sebuah fase koreksi harga.'
    ]
  }
];
