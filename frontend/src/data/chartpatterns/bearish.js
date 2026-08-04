export const BEARISH_PATTERNS = [
  {
    id: 'descending-triangle',
    name: 'Descending Triangle',
    category: 'bearish',
    type: 'continuation',
    successRate: 'High',
    reliability: 4,
    risk: 'Medium',
    badges: ['Best for Breakout', 'Need Volume Confirmation'],
    illustration: 'descending-triangle',
    shortDescription: 'Breakdown Confirmation',
    description: 'Pattern bearish continuation yang menunjukkan seller semakin agresif menekan harga turun, sementara support tertahan di level yang sama hingga akhirnya jebol ke bawah.',
    psychology: [
      'Buyer masih mencoba mempertahankan support di level harga tertentu.',
      'Namun setiap tarikan naik (rebound) menghasilkan level puncak yang makin rendah (Lower High).',
      'Artinya kekuatan buyer makin lemah dan seller lebih dominan menekan harga ke bawah.',
      'Tekanan jual terus menumpuk hingga level psikologis support hancur.'
    ],
    formation: {
      rules: [
        'Harga harus menyentuh support horizontal minimal 2 kali.',
        'Harga harus membentuk Lower High minimal 2 kali.',
        'Garis support horizontal dan garis resistance turun membentuk segitiga siku-siku menurun.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi pada fase downtrend yang jelas.', 'Konsolidasi berlangsung beberapa minggu.']
    },
    confirmation: [
      'Pattern BELUM VALID apabila harga masih memantul di dalam segitiga.',
      'Pattern baru VALID ketika harga breakdown dan candle close di bawah garis support horizontal.',
      'Penembusan support kuat (support jebol) sering memicu panic selling.'
    ],
    volume: {
      consolidation: 'Volume cenderung menurun selama fase segitiga menyempit.',
      breakout: 'Volume idealnya meningkat saat harga menjebol support, tapi kadang panic selling bisa membesar sesudahnya.',
      falseBreak: 'Harga pura-pura jebol support lalu tiba-tiba berbalik arah ke atas membentuk false breakdown/bear trap.'
    },
    entry: {
      aggressive: 'Entry short (jual) saat candle breakdown support kuat.',
      conservative: 'Menunggu retest support yang kini menjadi resistance baru setelah breakdown.'
    },
    stopLoss: 'Pasang Stop Loss di atas garis resistance turun, atau di atas swing high terakhir sebelum breakdown.',
    takeProfit: 'Ukur bagian terlebar dari segitiga (pangkal), dan proyeksikan ke bawah dari titik breakdown.',
    targetFormula: 'Target = Breakdown Price - (Highest Resistance Price - Support Price)',
    commonMistakes: [
      'Mendahului entry sebelum konfirmasi close di bawah support.',
      'Tertipu oleh ekor candle (shadow) yang tembus support, namun close tetap di atas.',
      'Menerapkan pattern ini pada uptrend kuat (bisa berbalik menjadi pola pembalikan arah naik).'
    ],
    checklist: [
      'Trend sebelumnya Downtrend',
      'Support mendatar yang kuat',
      'Puncak yang semakin merendah (Lower High)',
      'Breakdown di bawah level Support',
      'Close candle mantap di bawah Support'
    ],
    tips: [
      'Sering kali terjadi di ujung fase distribusi harga sebelum anjlok lebih parah.',
      'Jika breakdown menembus Moving Average utama seperti MA200 secara bersamaan, kejatuhan harga akan sangat cepat.'
    ]
  },
  {
    id: 'head-and-shoulders',
    name: 'Head & Shoulders',
    category: 'bearish',
    type: 'reversal',
    successRate: 'High',
    reliability: 5,
    risk: 'Low',
    badges: ['Best for Reversal', 'High Accuracy'],
    illustration: 'head-and-shoulders',
    shortDescription: 'Major Trend Reversal',
    description: 'Pattern bearish reversal yang sangat ikonik, sering terbentuk di puncak sebuah uptrend. Terdiri dari tiga puncak, dengan puncak tengah (Head) sebagai titik tertinggi dan dua puncak di samping (Left & Right Shoulders) berada di posisi lebih rendah.',
    psychology: [
      'Pada Left Shoulder, trend masih kuat naik dan membentuk Higher High.',
      'Pada Head, buyer masih mampu membuat Higher High baru, namun koreksi jatuh ke dasar yang sama dengan bahu kiri.',
      'Pada Right Shoulder, buyer mencoba reli kembali namun kehabisan tenaga dan gagal melampaui puncak Head (membentuk Lower High).',
      'Gagalnya menciptakan Higher High adalah sinyal pertama, ditembusnya Neckline adalah konfirmasi matinya uptrend.'
    ],
    formation: {
      rules: [
        'Terdapat 3 puncak (high).',
        'Puncak tengah (Head) harus lebih tinggi dari bahu kiri (Left Shoulder).',
        'Bahu kanan (Right Shoulder) harus lebih rendah dari Head, idealnya sejajar dengan bahu kiri.',
        'Lembah antara bahu dan kepala dihubungkan menjadi garis support (Neckline).'
      ],
      minSwings: 3,
      idealConditions: ['Terbentuk setelah uptrend panjang yang euforia.', 'Bahu kiri dan kanan simetris.']
    },
    confirmation: [
      'Pattern baru VALID ketika harga breakdown dan candle close di bawah garis Neckline.',
      'Penembusan Neckline merubah bias psikologi market secara masif.'
    ],
    volume: {
      consolidation: 'Volume biasanya paling tinggi saat Left Shoulder, kemudian menurun perlahan di puncak Head dan sangat sepi saat Right Shoulder terbentuk.',
      breakout: 'Dibutuhkan volume yang meningkat saat mematahkan Neckline.',
      falseBreak: 'Bahu kanan yang menyamai tinggi Head merusak struktur dan membatalkan pattern.'
    },
    entry: {
      aggressive: 'Entry short saat breakdown garis Neckline.',
      conservative: 'Menunggu harga rebound menguji kembali (retest) garis Neckline (yang jadi resisten) sebelum meluncur lebih jauh.'
    },
    stopLoss: 'Pasang Stop Loss di atas Right Shoulder (bahu kanan).',
    takeProfit: 'Ukur tinggi vertikal dari ujung puncak Head ke Neckline, lalu kurangkan jarak itu dari titik breakdown.',
    targetFormula: 'Target = Breakdown Price - (Head Price - Neckline Price)',
    commonMistakes: [
      'Memaksakan formasi di tengah chart sideways.',
      'Terlalu agresif sell di Right Shoulder padahal Neckline belum tentu jebol.',
      'Neckline terlalu miring curam ke atas/bawah.'
    ],
    checklist: [
      'Muncul setelah fase Uptrend',
      'Puncak kiri (Left Shoulder)',
      'Puncak puncak (Head)',
      'Puncak kanan lebih rendah (Right Shoulder)',
      'Penembusan Neckline support',
      'Konfirmasi close di bawah Neckline'
    ],
    tips: [
      'Volume yang semakin kering di pembentukan bahu kanan adalah konfirmasi terbaik bahwa buyer ritel sudah menyerah membeli.',
      'Semakin lebar jarak antar bahu, biasanya penurunan yang diakibatkan akan semakin lambat, namun pasti.'
    ]
  },
  {
    id: 'inverted-cup-and-handle',
    name: 'Inverted Cup and Handle',
    category: 'bearish',
    type: 'continuation',
    successRate: 'Medium',
    reliability: 4,
    risk: 'Medium',
    badges: ['Best for Swing', 'Need Volume Confirmation'],
    illustration: 'inverted-cup-and-handle',
    shortDescription: 'Rounding Top Reversal',
    description: 'Versi kebalikan dari Cup and Handle. Berbentuk kubah melengkung ke atas (Inverted Cup) diikuti rebound kecil ke atas (Handle). Mengindikasikan distribusi perlahan di area puncak dan persiapan harga untuk jatuh.',
    psychology: [
      'Kubah terbalik menunjukkan proses hilangnya momentum uptrend (rounding top), di mana dominasi beralih perlahan dari pembeli ke penjual secara diam-diam (distribusi).',
      'Gagang (Handle) adalah pantulan harapan terakhir bagi para buyer yang mencoba mengangkat harga, namun sangat rentan ditekan kembali.',
      'Jebolnya dasar Cup menjadi sinyal panic selling.'
    ],
    formation: {
      rules: [
        'Kubah berbentuk seperti huruf "U" terbalik.',
        'Handle harus berada di paruh bawah dari kubah, memantul naik tapi tidak terlalu kuat.',
        'Kedua dasar kubah membentuk support utama.'
      ],
      minSwings: 3,
      idealConditions: ['Terjadi di ujung fase uptrend atau sebagai kelanjutan dalam downtrend.', 'Handle membentuk pola miring kecil (bear flag).']
    },
    confirmation: [
      'Valid ketika harga breakdown menembus support bawah (bibir Inverted Cup).',
      'Candle close yang meyakinkan tanpa shadow panjang di bawah.'
    ],
    volume: {
      consolidation: 'Bentuk U terbalik pada volume: tinggi di awal pembentukan kubah dan tinggi di akhir (tekanan jual), namun volume sepi saat di puncak kubah dan di Handle.',
      breakout: 'Ledakan volume transaksi saat menembus titik support terendah.',
      falseBreak: 'Handle yang naik terlalu tajam membatalkan sentimen bearish.'
    },
    entry: {
      aggressive: 'Entry saat jebol dari trendline bawah (support) Handle.',
      conservative: 'Entry saat breakdown mematahkan garis lurus dasar Inverted Cup.'
    },
    stopLoss: 'Pasang Stop Loss tepat di atas puncak pantulan Handle.',
    takeProfit: 'Ukur jarak maksimal kedalaman dari puncak Cup sampai dasar bibir Cup, proyeksikan ke bawah.',
    targetFormula: 'Target = Breakdown Price - (Cup Top Price - Cup Bottom Price)',
    commonMistakes: [
      'Bentuk kubah terlalu tajam (A-shape), karena ini adalah tipe rounding yang butuh proses distribusi lama.',
      'Handle rally menembus titik pertengahan Inverted Cup.'
    ],
    checklist: [
      'Proses distribusi melengkung',
      'Pantulan Handle yang lemas',
      'Volume kecil saat harga naik di Handle',
      'Breakdown konfirmasi support'
    ],
    tips: [
      'Pola ini cukup jarang dibandingkan pattern lainnya, tetapi tingkat akurasinya untuk menjatuhkan harga sangat tajam karena menguras emosi para holder yang terjebak di area kubah.'
    ]
  },
  {
    id: 'double-top',
    name: 'Double Top',
    category: 'bearish',
    type: 'reversal',
    successRate: 'High',
    reliability: 5,
    risk: 'Low',
    badges: ['Best for Reversal', 'High Accuracy'],
    illustration: 'double-top',
    shortDescription: 'M-Shape Reversal',
    description: 'Pattern bearish reversal berbentuk huruf "M". Terjadi ketika harga dua kali gagal menembus area resistance yang sama di fase puncak, menandakan batas toleransi buyer sudah maksimal dan siap dilanda aksi jual masif.',
    psychology: [
      'Pada puncak pertama, harga melesat kemudian dihentikan oleh aksi take profit.',
      'Harga turun sebentar, lalu mencoba naik kembali dengan sisa tenaga untuk menembus resistance.',
      'Gagal di puncak kedua membuktikan tidak ada lagi aliran dana besar (institusi) yang mau beli di pucuk.',
      'Market berbalik dari kondisi rakus menjadi takut (fear) saat support Neckline dibobol.'
    ],
    formation: {
      rules: [
        'Terdiri dari dua puncak (Top) pada level resistance horizontal yang berdekatan.',
        'Lembah di antara kedua puncak menjadi Neckline penyangga.',
        'Harga harus memotong Neckline ke bawah untuk menyatakan pattern ini valid.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi di fase akhir uptrend kuat.', 'Puncak kedua disertai pelemahan indikator oscillator (Bearish Divergence).']
    },
    confirmation: [
      'Valid ketika candle menembus dan close di bawah garis leher (Neckline).',
      'Reversal trend dikonfirmasi kuat.'
    ],
    volume: {
      consolidation: 'Volume puncak pertama selalu lebih masif daripada puncak kedua (menggambarkan hilangnya partisipan di puncak kedua).',
      breakout: 'Dibutuhkan volume tekanan jual yang nyata saat breakdown Neckline.',
      falseBreak: 'Sering terjadi spike/jarum panjang di puncak kedua (bull trap) lalu harga dibanting tajam ke bawah.'
    },
    entry: {
      aggressive: 'Entry tepat saat garis Neckline dijebol kuat secara intraday.',
      conservative: 'Entry saat pullback retest menuju resisten (bekas Neckline) setelah jebol.'
    },
    stopLoss: 'Pasang Stop Loss di atas Neckline pertengahan, atau idealnya di atas puncak Top kedua.',
    takeProfit: 'Ambil selisih vertikal dari Puncak hingga Neckline, dan kurangkan ke bawah dari letak breakdown.',
    targetFormula: 'Target = Breakdown Price - (Top Price - Neckline Price)',
    commonMistakes: [
      'Masuk sell di pucuk kedua (meski menguntungkan, sangat berisiko karena belum ada konfirmasi tren berbalik).',
      'Mengira konsolidasi sideways kecil sebagai Double Top padahal trend masih kuat naik.'
    ],
    checklist: [
      'Trend awal Uptrend',
      'Pembentukan dua puncak identik (M-shape)',
      'Adanya Bearish Divergence (MACD/RSI)',
      'Penembusan Neckline',
      'Konfirmasi breakdown candle close'
    ],
    tips: [
      'Kehadiran Bearish Divergence pada Oscillator sangat menyempurnakan keandalan formasi Double Top ini.',
      'Jarak antar puncak sebaiknya jangan terlalu mepet dalam waktu hitungan hari, berikan ruang beberapa minggu agar struktur reversal matang.'
    ]
  },
  {
    id: 'bearish-flag',
    name: 'Bearish Flag',
    category: 'bearish',
    type: 'continuation',
    successRate: 'Medium',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Trend Following'],
    illustration: 'bearish-flag',
    shortDescription: 'Short Term Bounce',
    description: 'Pattern bearish continuation jangka pendek yang mirip bendera terbalik. Terdiri dari tiang terjun kuat (Flagpole) diikuti channel kenaikan kecil sejajar (Flag) yang bersifat menipu (dead cat bounce) sebelum melanjutkan kejatuhan harga.',
    psychology: [
      'Kejatuhan drastis (Flagpole) memicu sebagian seller untuk cover short atau trader spekulan mencoba menangkap pisau jatuh.',
      'Harga naik lambat membentuk channel bendera. Namun karena hanya pantulan spekulatif, daya belinya lemah.',
      'Segera setelah support bendera miring ditekan tembus, kepanikan fase kedua dimulai dan tren turun besar berlanjut.'
    ],
    formation: {
      rules: [
        'Harus didahului oleh penurunan harga yang vertikal drastis (Flagpole / Tiang Bawah).',
        'Koreksi pull up membentuk channel kemiringan paralel ke atas (Flag).',
        'Pantulan harga tidak lebih dari 50% jarak turun tiangnya.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi pada panic selling / downtrend tajam.', 'Bendera terbentuk rapi 1-3 minggu maksimal.']
    },
    confirmation: [
      'Valid ketika terjadi penembusan level support / trendline miring dari bendera.',
      'Konfirmasi berlanjutnya siklus penurunan.'
    ],
    volume: {
      consolidation: 'Volume mengering drastis saat fase pantulan harga bendera.',
      breakout: 'Volume seller memuncak tajam lagi sesaat setelah breakdown support.',
      falseBreak: 'Jika bendera ditarik naik bersama volume beli masif, maka itu bukan flag namun pembalikan tren V-shape.'
    },
    entry: {
      aggressive: 'Sell saat harga breakout garis support bawah dari channel bendera miring.',
      conservative: 'Menunggu konfirmasi closing candle merah mantap di bawah batas support channel.'
    },
    stopLoss: 'Pasang Stop Loss di batas atas resistance bendera tersebut.',
    takeProfit: 'Ukur jarak total penurunan dari tiang, lalu pindahkan selisih ukurannya mulai dari titik breakdown.',
    targetFormula: 'Target = Breakdown Price - Height of Flagpole',
    commonMistakes: [
      'Membeli saham saat Flag terbentuk, mengira bahwa pergerakan naik ini adalah sinyal reversal (terjebak Bull Trap).',
      'Tiang penurunan sebelumnya miring, tidak berbentuk vertikal drastis.'
    ],
    checklist: [
      'Tiang kejatuhan dalam & cepat',
      'Channel pantulan naiknya kecil dan pelan',
      'Volume mengering saat pantulan naik',
      'Breakdown dari support Flag',
      'Volume meningkat lagi'
    ],
    tips: [
      'Bearish Flag sangat sering menyapu bersih (liquidate) para ritel yang berusaha mencari harga diskon dasar pada kejatuhan beruntun.',
      'Struktur bendera miring ke atas secara paradoks berarti kecenderungan menukik ke bawah jauh lebih kuat.'
    ]
  },
  {
    id: 'bearish-pennant',
    name: 'Bearish Pennant',
    category: 'bearish',
    type: 'continuation',
    successRate: 'High',
    reliability: 4,
    risk: 'Low',
    badges: ['Best for Trend Following'],
    illustration: 'bearish-pennant',
    shortDescription: 'Symmetrical Short Pause',
    description: 'Pola kelanjutan tren turun yang ditandai dengan penurunan agresif awal lalu berhenti sebentar dalam formasi segitiga menyempit (Pennant) kecil sebelum harga kembali runtuh menukik lebih dalam.',
    psychology: [
      'Jatuhnya harga dihentikan sementara (jeda) ketika sisa buyer berusaha menahan di support tetapi dengan amunisi sangat sedikit, lalu seller mulai mengambil nafas.',
      'Rentang harga main-main secara ketat dan menyempit karena tekanan jual dan beli berhimpitan tipis.',
      'Seringkali menyempit sampai ujung, ledakan akan mengikuti arah tiang semula, menerjunkan harga tak terbendung.'
    ],
    formation: {
      rules: [
        'Ada tiang terjun tajam awal (Drop Flagpole).',
        'Koreksinya adalah segitiga simetris (konvergen) dalam durasi super pendek (Pennant).',
        'Maksimum memakan waktu beberapa hari hingga dua pekan.'
      ],
      minSwings: 2,
      idealConditions: ['Terjadi saat momentum bearish ekstrem.', 'Pembentukan di tengah ruang harga kosong tanpa history support kuat.']
    },
    confirmation: [
      'Pattern valid saat penembusan level support batas bawah pennant.',
      'Bentuk candle penerusan turun (long red body candle).'
    ],
    volume: {
      consolidation: 'Drop volume signifikan dalam masa konsolidasi segitiga (kontraksi volatilitas).',
      breakout: 'Ledakan transaksi saat breakdown.',
      falseBreak: 'Batas segitiga tidak tegas memicu whipsaw sideways berkepanjangan (Pennant batal).'
    },
    entry: {
      aggressive: 'Entry saat sedang proses menembus keluar batas bawah.',
      conservative: 'Menunggu candle frame pendek close penuh di luar pola segitiga.'
    },
    stopLoss: 'Pasang Stop Loss di atas titik ujung tertinggi pola segitiga Pennant tersebut.',
    takeProfit: 'Ambil jarak penuh dari tiang jatuh pertama, pasangkan lurus kebawah di ujung jatuhnya pennant.',
    targetFormula: 'Target = Breakdown Price - Height of Flagpole',
    commonMistakes: [
      'Melihatnya sebagai Symmetrical Triangle reversal biasa.',
      'Tidak mengukur curamnya penurunan asli. Pennant mewajibkan pergerakan sebelumnya yang nyaris 90 derajat jatuh.',
      'Masuk terlalu terburu-buru sebelum ada candle arah nyata.'
    ],
    checklist: [
      'Drop vertikal sangat curam (Tiang)',
      'Sideways di formasi segitiga mengerucut sempit',
      'Volatilitas hilang sementara',
      'Harga jebol dari segitiga',
      'Tren turun diteruskan'
    ],
    tips: [
      'Breakout pada pola Pennant ibarat melepas per spiral yang ditekan kuat-kuat, larinya akan super cepat tanpa memberi banyak kesempatan kabur.'
    ]
  }
];
