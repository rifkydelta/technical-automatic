export const INDICATORS = [
  {
    id: 'ma',
    name: 'Moving Average (MA)',
    type: 'lagging',
    category: 'Trend Indicator',
    reliability: 4,
    description: 'Rata-rata pergerakan harga historis dalam periode waktu tertentu untuk menyaring fluktuasi jangka pendek.',
    psychology: 'Menunjukkan konsensus nilai rata-rata pelaku pasar selama periode tertentu. Kemiringan MA mencerminkan dominasi trend bullish atau bearish.',
    formation: 'Dihitung dengan menjumlahkan harga penutupan selama N periode lalu membaginya dengan N. EMA (Exponential) memberikan bobot lebih pada harga terbaru.',
    confirmation: 'Konfirmasi trend uptrend terjadi saat harga bertahan di atas MA200 dan MA pendek berada di atas MA panjang (Golden Cross).',
    volume: 'Golden Cross yang valid harus disertai peningkatan volume transaksi untuk membuktikan partisipasi institusi.',
    entry: 'Entry buy saat harga pullback mendekati MA jangka pendek/menengah (misal MA20) pada trend naik yang kuat, atau saat terjadi Golden Cross.',
    stoploss: 'Beberapa poin di bawah MA support dinamis yang dijadikan acuan entry.',
    target: 'Level resistance terdekat berikutnya atau trailing stop mengikuti MA.',
    commonMistakes: 'Membeli saat Golden Cross di pasar sideways/ranging, yang memicu sinyal palsu (whipsaw) berulang.',
    tips: 'Gunakan MA200 untuk menentukan trend utama (major trend) dan MA20/50 sebagai support/resistance dinamis.'
  },
  {
    id: 'macd',
    name: 'MACD (Moving Average Convergence Divergence)',
    type: 'lagging',
    category: 'Momentum Indicator',
    reliability: 4,
    description: 'Indikator momentum pengikut tren yang menunjukkan hubungan antara dua moving average harga saham.',
    psychology: 'Mengukur percepatan atau perlambatan momentum pasar. Hubungan jarak antar rata-rata harga menggambarkan apakah kekuatan tren sedang memuncak atau jenuh.',
    formation: 'Terdiri dari MACD Line (selisih EMA 12 dan 26), Signal Line (EMA 9 dari MACD Line), Zero Line, dan Histogram (selisih MACD Line dan Signal Line).',
    confirmation: 'Bullish Crossover (MACD Line memotong ke atas Signal Line) mengonfirmasi momentum naik baru.',
    volume: 'Crossover di bawah Zero Line (oversold) yang disertai volume tinggi memiliki probabilitas pembalikan arah lebih besar.',
    entry: 'Buy setelah terjadi Bullish Crossover, idealnya di dekat atau di bawah Zero Line, didukung oleh bullish divergence.',
    stoploss: 'Di bawah Swing Low terakhir yang terbentuk pada chart harga.',
    target: 'Level resistance terdekat atau saat terjadi Bearish Crossover (MACD memotong ke bawah Signal Line).',
    commonMistakes: 'Langsung entry begitu terjadi divergence tanpa menunggu konfirmasi price action (candlestick reversal atau breakout).',
    tips: 'Divergence (perbedaan arah harga dengan MACD) adalah sinyal peringatan dini terbaik akan potensi pembalikan arah tren.'
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    type: 'lagging',
    category: 'Volatility Indicator',
    reliability: 4,
    description: 'Indikator volatilitas yang membentuk saluran harga berdasarkan deviasi standar dari rata-rata pergerakannya.',
    psychology: 'Menunjukkan batas normal fluktuasi harga (95% pergerakan harga berada di dalam band). Band menyempit berarti pasar sedang konsensus ketat (tenang sebelum badai).',
    formation: 'Terdiri dari Middle Band (SMA 20) serta Upper Band dan Lower Band yang berjarak 2 standard deviasi dari Middle Band.',
    confirmation: 'Breakout dari periode Squeeze (penyempitan band) dikonfirmasi jika candle ditutup di luar Upper/Lower Band didukung volume besar.',
    volume: 'Squeeze breakout yang valid harus memicu lonjakan volume signifikan. Breakout dengan volume tipis cenderung memicu false breakout.',
    entry: 'Buy saat terjadi pantulan di Lower Band (mean reversion) di pasar sideways, atau entry buy searah breakout di atas Upper Band setelah fase Squeeze.',
    stoploss: 'Di bawah Middle Band (jika buy di Lower Band) atau di bawah batas Squeeze (jika entry breakout).',
    target: 'Upper Band (jika buy di Lower Band) atau trailing target mengikuti Upper Band yang melebar.',
    commonMistakes: 'Menganggap harga menyentuh Upper Band selalu berarti sinyal sell otomatis. Pada tren kuat, harga bisa merambat naik sepanjang Upper Band ("riding the bands").',
    tips: 'Gunakan Bollinger Bands Squeeze untuk bersiap menghadapi pergerakan breakout agresif setelah konsolidasi panjang.'
  },
  {
    id: 'rsi',
    name: 'RSI (Relative Strength Index)',
    type: 'leading',
    category: 'Momentum Oscillator',
    reliability: 4,
    description: 'Oscillator momentum yang mengukur kecepatan dan perubahan arah pergerakan harga antara skala 0 hingga 100.',
    psychology: 'Mengukur kekuatan relatif dari hari-hari naik dibanding hari-hari turun untuk melihat kejenuhan beli (overbought) atau kejenuhan jual (oversold).',
    formation: 'Dihitung berdasarkan rasio rata-rata kenaikan harga terhadap rata-rata penurunan harga dalam periode tertentu (standar 14 hari).',
    confirmation: 'Konfirmasi pembalikan arah terjadi saat RSI kembali keluar dari zona ekstrem (misal memotong kembali level 30 dari bawah, atau level 70 dari atas).',
    volume: 'Pembalikan arah RSI dari area ekstrem lebih valid jika diiringi peningkatan volume akumulasi/distribusi pada chart harga.',
    entry: 'Buy saat RSI memotong ke atas level 30 setelah mengalami oversold ekstrem, dikonfirmasi oleh pola candlestick bullish di area support.',
    stoploss: 'Di bawah swing low terdekat di chart harga.',
    target: 'Saat RSI mencapai area overbought (di atas 70) atau mendekati level resistance kunci.',
    commonMistakes: 'Melakukan short/sell hanya karena RSI masuk ke area overbought pada tren naik yang kuat (RSI bisa tetap overbought dalam waktu lama saat tren solid).',
    tips: 'Divergence pada RSI di area jenuh (overbought/oversold) memiliki tingkat keakuratan sinyal pembalikan arah yang sangat tinggi.'
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Retracement',
    type: 'tool',
    category: 'Drawing Tool (Support/Resistance)',
    reliability: 5,
    description: 'Alat bantu analisis untuk memetakan potensi level support dan resistance berdasarkan rasio matematis deret Fibonacci.',
    psychology: 'Mencerminkan memori kolektif trader tentang batas koreksi wajar (pullback) sebelum melanjutkan tren utama.',
    formation: 'Dibuat dengan menarik garis tren dari titik terendah (Swing Low) ke tertinggi (Swing High) untuk mengidentifikasi rasio penting (38.2%, 50%, 61.8%).',
    confirmation: 'Level Fibonacci terkonfirmasi sebagai support kuat jika terjadi penolakan harga (rejection/shadow bawah panjang) saat harga menguji level tersebut.',
    volume: 'Pullback ke level Fibonacci harus disertai volume yang mengecil (penurunan minat jual), dan memantul naik kembali dengan volume besar.',
    entry: 'Buy limit atau buy konfirmasi saat harga pullback ke area Golden Ratio (50% - 61.8%) dan membentuk candle konfirmasi bullish.',
    stoploss: 'Di bawah level retracement berikutnya (misalnya di bawah level 78.6% atau di bawah Swing Low awal).',
    target: 'Level Fibonacci Extension (161.8%) atau swing high sebelumnya.',
    commonMistakes: 'Menarik garis Fibonacci secara sembarangan tanpa menentukan swing point (high & low) yang jelas dan valid.',
    tips: 'Fibonacci bekerja paling akurat pada pasar yang sedang trending kuat, bukan pada pasar yang bergerak menyamping (sideways).'
  }
];

export const COMPARISONS = {
  'ma-macd': {
    metric: 'Trend vs Momentum',
    A: 'Moving Average mengidentifikasi arah tren secara absolut dengan menghitung rata-rata historis (Lagging).',
    B: 'MACD mengukur kekuatan momentum tren tersebut menggunakan hubungan jarak antara dua Moving Average.',
    synergy: 'Gunakan MA200 untuk menentukan arah tren utama, lalu gunakan crossover MACD untuk presisi waktu masuk posisi searah tren.'
  },
  'rsi-macd': {
    metric: 'Leading Momentum vs Lagging Trend',
    A: 'RSI adalah leading oscillator yang mendeteksi batas kejenuhan harga (overbought/oversold) secara cepat.',
    B: 'MACD adalah lagging indicator yang lebih lambat namun memberikan konfirmasi tren yang solid lewat crossover.',
    synergy: 'Ketika RSI menunjukkan kondisi oversold, tunggu crossover bullish pada MACD sebagai konfirmasi momentum sebelum entry.'
  },
  'bb-ma': {
    metric: 'Volatilitas Dinamis vs Rata-Rata Stabil',
    A: 'Bollinger Bands beradaptasi secara otomatis dengan volatilitas pasar melalui standard deviasi (melebar/menyempit).',
    B: 'Moving Average tetap stabil dan tidak dipengaruhi secara langsung oleh tingkat volatilitas harga harian.',
    synergy: 'Gunakan MA200 untuk memfilter arah tren jangka panjang, lalu manfaatkan Bollinger Bands Squeeze untuk mendeteksi awal lonjakan tren baru.'
  },
  'rsi-bb': {
    metric: 'Kejenuhan Momentum vs Batas Saluran Harga',
    A: 'RSI mendeteksi kejenuhan momentum murni berdasarkan rasio kenaikan dan penurunan harga.',
    B: 'Bollinger Bands memetakan batas deviasi harga secara spasial di chart.',
    synergy: 'Sinyal pembalikan arah paling kuat terjadi ketika harga menembus Upper/Lower Band bersamaan dengan RSI yang berada di zona overbought/oversold ekstrem.'
  }
};
