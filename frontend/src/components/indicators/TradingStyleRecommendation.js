import React, { useState } from 'react';
import { Clock, Sliders, Shield, Layers } from 'lucide-react';

const STYLES = [
  {
    id: 'scalping',
    title: 'Scalping',
    timeframe: '1 Menit - 5 Menit',
    indicators: ['MA5', 'MA20', 'RSI (14)'],
    description: 'Trading sangat cepat mencari keuntungan kecil berkali-kali dalam sehari. Membutuhkan indikator sangat responsif untuk mendeteksi momentum mikro.',
    setup: 'Ploting MA5 dan MA20 di chart. Gunakan RSI untuk melihat momentum overbought/oversold mikro.',
    rules: [
      'Hanya buy jika harga berada di atas MA20 (tren mikro naik).',
      'Masuk posisi saat MA5 memotong ke atas MA20 (Golden Cross mikro) bersamaan dengan RSI memantul dari level 30 (oversold).',
      'Exit segera jika MA5 memotong balik ke bawah MA20 atau RSI mencapai level 70.'
    ],
    diagram: (
      <svg viewBox="0 0 300 130" style={{ background: '#070a13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <path d="M 10 110 L 40 100 L 70 120 L 100 80 L 130 90 L 160 55 L 190 70 L 220 30 L 250 45 L 290 15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {/* MA20 */}
        <path d="M 10 115 Q 100 95 200 55 T 290 28" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" />
        {/* MA5 */}
        <path d="M 10 120 C 60 115 120 85 160 62 C 200 40 240 35 290 20" fill="none" stroke="#10b981" strokeWidth="2.5" />
        {/* Highlight crossover */}
        <circle cx="150" cy="67" r="5" fill="#10b981" stroke="#fff" strokeWidth="1" />
        <text x="150" y="52" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle">Entry Crossover</text>
      </svg>
    )
  },
  {
    id: 'intraday',
    title: 'Intraday Trading',
    timeframe: '15 Menit - 1 Jam',
    indicators: ['MA20', 'MACD', 'RSI (14)'],
    description: 'Membuka dan menutup posisi dalam hari yang sama. Meminimalkan risiko gap pembukaan esok hari. Membutuhkan konfirmasi tren intraday dan oscillator momentum.',
    setup: 'Gunakan MA20 untuk menentukan arah intraday trend, didukung oleh crossover MACD di bawah zero line.',
    rules: [
      'Pastikan harga bergerak stabil di atas MA20 pada timeframe 15 menit.',
      'Tunggu MACD Line melakukan crossover bullish terhadap Signal Line di bawah level nol.',
      'Konfirmasikan bahwa RSI berada di area netral naik (di atas 50) untuk memastikan momentum akumulasi kuat.'
    ],
    diagram: (
      <svg viewBox="0 0 300 130" style={{ background: '#070a13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {/* Price path */}
        <path d="M 10 90 L 70 100 L 130 75 L 190 85 L 250 50 L 290 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* MA20 */}
        <path d="M 10 95 Q 130 90 250 55 T 290 45" fill="none" stroke="#3b82f6" strokeWidth="2" />
        {/* MACD line drawing below */}
        <line x1="0" y1="110" x2="300" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <path d="M 10 115 Q 100 125 150 110 T 250 100" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <path d="M 10 120 Q 100 123 150 110 T 250 105" fill="none" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="150" cy="110" r="4" fill="#60a5fa" stroke="#fff" strokeWidth="1" />
        <text x="150" y="100" fill="#60a5fa" fontSize="7" fontFamily="monospace" textAnchor="middle">MACD Buy</text>
      </svg>
    )
  },
  {
    id: 'swing',
    title: 'Swing Trading',
    timeframe: 'Harian (Daily)',
    indicators: ['MA20', 'MA50', 'MA200', 'MACD'],
    description: 'Menahan posisi selama beberapa hari hingga beberapa minggu untuk menangkap gelombang pergerakan harga (swing). Menghindari noise pasar jangka pendek.',
    setup: 'Ploting MA200 untuk menyaring trend jangka panjang, MA50 & MA20 untuk support dinamis swing, dan MACD untuk membaca pembalikan momentum.',
    rules: [
      'Hanya lakukan buy jika harga saham berada di atas MA200 (uptrend jangka panjang).',
      'Tunggu harga terkoreksi (pullback) mendekati support MA50 atau MA20.',
      'Entry buy saat muncul candlestick bullish rejection di dekat MA dan histogram MACD mulai memendek merah menuju area hijau.'
    ],
    diagram: (
      <svg viewBox="0 0 300 130" style={{ background: '#070a13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {/* MA200 line - long trend */}
        <path d="M 10 110 Q 150 105 290 85" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.6" />
        {/* MA50 line - medium support */}
        <path d="M 10 100 Q 150 85 290 60" fill="none" stroke="#f59e0b" strokeWidth="2" />
        {/* Price rebounding off MA50 */}
        <path d="M 10 70 L 60 50 L 110 90 L 160 81 L 210 50 L 290 30" fill="none" stroke="#fff" strokeWidth="1.5" />
        <circle cx="150" cy="83" r="5" fill="#10b981" stroke="#fff" strokeWidth="1" />
        <text x="150" y="100" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle">Pullback Buy @MA50</text>
      </svg>
    )
  },
  {
    id: 'trend-following',
    title: 'Trend Following',
    timeframe: 'Harian / Mingguan',
    indicators: ['MA200', 'MACD (Zero Line)'],
    description: 'Membeli aset yang sedang naik kuat dan menahannya selama tren naik tersebut terus berlangsung. "Let your profits run".',
    setup: 'Gunakan MA200 sebagai penentu tren absolut. Gunakan MACD Zero line crossover untuk validasi tren.',
    rules: [
      'Buy saat harga berhasil breakout di atas MA200 dengan volume yang besar.',
      'Pastikan garis MACD berada di atas level nol (mengonfirmasi fase akumulasi bullish).',
      'Tahan posisi selama harga terus ditutup di atas MA200. Exit hanya jika harga menembus ke bawah MA200.'
    ],
    diagram: (
      <svg viewBox="0 0 300 130" style={{ background: '#070a13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {/* MA200 - strong uptrend line */}
        <path d="M 10 120 Q 150 90 290 40" fill="none" stroke="#3b82f6" strokeWidth="3" />
        {/* Price riding the MA200 */}
        <path d="M 10 125 L 50 115 L 90 80 L 140 95 L 190 60 L 240 70 L 290 25" fill="none" stroke="#fff" strokeWidth="1.5" />
        <text x="35" y="100" fill="#3b82f6" fontSize="8" fontFamily="monospace">MA200</text>
        <text x="210" y="50" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">Riding the Trend</text>
      </svg>
    )
  },
  {
    id: 'pullback',
    title: 'Pullback Trading',
    timeframe: 'Harian (Daily)',
    indicators: ['Fibonacci Retracement', 'RSI (14)', 'MA20'],
    description: 'Mencari entry buy saat harga saham sedang mengalami koreksi sementara di dalam tren naik utama. Memaksimalkan rasio risk/reward.',
    setup: 'Tarik garis Fibonacci dari Swing Low ke Swing High tren utama untuk memetakan level koreksi potensial.',
    rules: [
      'Pastikan tren utama sedang naik (harga di atas MA20).',
      'Tarik Fibonacci retracement dan tunggu harga turun menyentuh level 50% atau 61.8% (Golden Ratio).',
      'Masuk posisi jika harga memantul dari area Golden Ratio disertai RSI memantul dari area oversold (level 30-40).'
    ],
    diagram: (
      <svg viewBox="0 0 300 130" style={{ background: '#070a13', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {/* Fibonacci horizontal levels */}
        <line x1="20" y1="30" x2="280" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="20" y1="80" x2="280" y2="80" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="20" y1="110" x2="280" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="250" y="25" fill="var(--text-muted)" fontSize="6" fontFamily="monospace">0% (High)</text>
        <text x="235" y="75" fill="#f59e0b" fontSize="6" fontFamily="monospace" fontWeight="bold">61.8% (Golden Ratio)</text>
        <text x="250" y="105" fill="var(--text-muted)" fontSize="6" fontFamily="monospace">100% (Low)</text>
        
        {/* Price pullback and bounce */}
        <path d="M 30 110 L 100 30 L 170 80 L 270 20" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="170" cy="80" r="5" fill="#10b981" stroke="#fff" strokeWidth="1" />
        <text x="170" y="95" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle">Golden Ratio Rebound</text>
      </svg>
    )
  }
];

export default function TradingStyleRecommendation() {
  const [activeStyle, setActiveStyle] = useState('swing');

  const currentStyle = STYLES.find(style => style.id === activeStyle);

  return (
    <div className="flex-col w-full" style={{ gap: '20px' }}>
      
      {/* Selector Tabs Row */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', gap: '8px', overflowX: 'auto' }}>
        {STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => setActiveStyle(style.id)}
            style={{
              padding: '10px 16px',
              background: activeStyle === style.id ? 'rgba(96,165,250,0.08)' : 'transparent',
              border: 'none',
              borderBottom: activeStyle === style.id ? '2px solid var(--info)' : '2px solid transparent',
              borderRadius: '6px 6px 0 0',
              color: activeStyle === style.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeStyle === style.id ? 600 : 400,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {style.title}
          </button>
        ))}
      </div>

      {/* Main Details Panel */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Info Panel */}
        <div style={{ flex: '1.2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Timeframe & Indicators Profile Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="ide-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} color="var(--info)" />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIMEFRAME UTAMA</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{currentStyle.timeframe}</span>
              </div>
            </div>

            <div className="ide-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sliders size={20} color="var(--warning)" />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KONFIGURASI</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {currentStyle.indicators.map((ind, i) => (
                    <span key={i} style={{ fontSize: '9px', fontWeight: 600, background: 'rgba(251,191,36,0.1)', color: 'var(--warning)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(251,191,36,0.15)' }}>
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>PENGANTAR GAYA</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {currentStyle.description}
            </p>
          </div>

          {/* Setup Instructions */}
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>SETUP METODE</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {currentStyle.setup}
            </p>
          </div>
        </div>

        {/* Right Rules & Diagram Panel */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Visual Setup Diagram */}
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>VISUAL PLOT SETUP</span>
            {currentStyle.diagram}
          </div>

          {/* Golden Entry Rules */}
          <div className="ide-panel" style={{ padding: '20px', borderLeft: '2px solid var(--info)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Shield size={14} /> Aturan Baku Entry (Rules)
            </span>
            <ol style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentStyle.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
