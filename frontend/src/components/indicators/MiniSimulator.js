import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

export default function MiniSimulator() {
  const [step, setStep] = useState(1); // 1 = Trend, 2 = Golden Cross, 3 = Divergence, 4 = Fibonacci Support, 5 = Complete
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  const handleAnswerTrend = (answer) => {
    if (answer === 'downtrend') {
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
  };

  const handleHotspotClick = (clickedStep, event) => {
    event.stopPropagation();
    if (step !== clickedStep) return;

    setStatus('correct');
  };

  const handleNextStep = () => {
    setStatus('idle');
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      setStep(5);
      setBadgeUnlocked(true);
      // Unlock badge in localStorage
      localStorage.setItem('indicators_simulator_badge', 'true');
      
      // Update completed modules
      const savedProgress = localStorage.getItem('indicators_learning_progress');
      let progress = savedProgress ? JSON.parse(savedProgress) : { completed: [] };
      if (!progress.completed.includes('simulator')) {
        progress.completed.push('simulator');
        localStorage.setItem('indicators_learning_progress', JSON.stringify(progress));
      }
    }
  };

  const handleReset = () => {
    setStep(1);
    setStatus('idle');
    setBadgeUnlocked(false);
  };

  return (
    <div className="flex-col w-full" style={{ gap: '20px' }}>
      
      {/* Simulation Box Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Mini Simulator</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pahami indikator melalui latihan chart interaktif.</span>
        </div>

        {step <= 4 && (
          <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
            Misi {step} / 4 <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span> Tantangan Interaktif
          </div>
        )}
      </div>

      {step === 5 ? (
        /* Completion Screen */
        <div className="ide-panel fade-in" style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, transparent 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={48} color="var(--bullish)" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Selamat! Misi Simulator Selesai</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
              Anda telah berhasil menerapkan konsep Moving Average, crossover, divergence, dan level Fibonacci langsung pada skenario chart pasar yang sesungguhnya.
            </p>
          </div>

          <div style={{ padding: '16px 24px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px dashed rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '360px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bullish)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>🏆</div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LENCANA DIPIROLEH</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Master of Technical Indicators</span>
            </div>
          </div>

          <button 
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '8px 16px',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={12} /> Ulangi Simulator
          </button>
        </div>
      ) : (
        /* Active Quiz Steps */
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
          
          {/* Left Side: Interactive Price Chart (SVG) */}
          <div style={{ flex: '1.3 1 360px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <svg 
              viewBox="0 0 450 250" 
              style={{ 
                background: '#070a13', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.05)',
                width: '100%',
                height: 'auto',
                cursor: step > 1 ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (step > 1 && status !== 'correct') {
                  setStatus('wrong');
                }
              }}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="simGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                </pattern>
                <linearGradient id="upGreen" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#simGrid)" />

              {/* Step 1: Initial Downtrend Background Highlight */}
              {step === 1 && (
                <rect x="10" y="20" width="130" height="155" fill="rgba(239,68,68,0.02)" stroke="rgba(239,68,68,0.1)" strokeWidth="1" strokeDasharray="3,3" />
              )}

              {/* Fibonacci support line overlay in Step 4 */}
              {step === 4 && (
                <>
                  <line x1="30" y1="180" x2="430" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="30" y1="145" x2="430" y2="145" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="35" y="140" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">61.8% Fibonacci Support Level</text>
                </>
              )}

              {/* Moving Averages (Drawn through the chart) */}
              {/* Slow MA (Orange) */}
              <path 
                d="M 20 60 Q 80 140 160 135 T 260 90 T 360 150 T 430 80" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                opacity="0.7"
              />
              {/* Fast MA (Blue) */}
              <path 
                d="M 20 85 Q 80 150 160 135 T 260 80 T 360 148 T 430 65" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                opacity="0.8"
              />

              {/* Main Price Line */}
              <path 
                d="M 20 50 L 50 90 L 80 120 L 110 140 L 140 142 L 160 135 L 200 90 L 230 75 L 260 65 L 290 85 L 320 80 L 350 145 L 390 100 L 430 45" 
                fill="none" 
                stroke="#fff" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* HOTSPOT 2: Golden Cross Point (Intersection of Blue and Orange lines around x=148, y=135) */}
              <circle 
                cx="148" 
                cy="135" 
                r="18" 
                fill="transparent" 
                stroke={step === 2 && status === 'correct' ? '#10b981' : 'transparent'} 
                strokeWidth="1.5"
                onClick={(e) => handleHotspotClick(2, e)}
              />
              {step === 2 && status === 'correct' && (
                <circle cx="148" cy="135" r="5" fill="#10b981" />
              )}

              {/* HOTSPOT 3: Bearish Divergence Area (x=200 to 260, y=50 to 100) */}
              <rect 
                x="195" 
                y="50" 
                width="70" 
                height="50" 
                fill="transparent" 
                stroke={step === 3 && status === 'correct' ? '#10b981' : 'transparent'} 
                strokeWidth="1.5"
                strokeDasharray="2,2"
                onClick={(e) => handleHotspotClick(3, e)}
              />
              {step === 3 && (
                <>
                  {/* Price peaks line */}
                  <line x1="200" y1="90" x2="260" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="200" cy="90" r="3" fill="#fff" />
                  <circle cx="260" cy="65" r="3" fill="#fff" />
                </>
              )}

              {/* HOTSPOT 4: Fibonacci Support Rebound Point (x=350, y=145) */}
              <circle 
                cx="350" 
                cy="145" 
                r="18" 
                fill="transparent" 
                stroke={step === 4 && status === 'correct' ? '#10b981' : 'transparent'} 
                strokeWidth="1.5"
                onClick={(e) => handleHotspotClick(4, e)}
              />
              {step === 4 && status === 'correct' && (
                <circle cx="350" cy="145" r="5" fill="#10b981" />
              )}

              {/* Oscillator Panel below (separating indicator) */}
              <line x1="0" y1="185" x2="450" y2="185" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              {/* Step 3: Divergence Oscillator view */}
              {step === 3 ? (
                <>
                  <text x="15" y="200" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">MACD OSCILLATOR</text>
                  {/* MACD peaks making lower highs */}
                  <path d="M 120 220 Q 150 200 180 220" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  {/* Crossover Peak 1 */}
                  <path d="M 180 220 Q 200 195 220 220" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
                  {/* Crossover Peak 2 (Lower High) */}
                  <path d="M 220 220 Q 245 208 270 220" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
                  
                  {/* Trendline on MACD peaks */}
                  <line x1="200" y1="200" x2="245" y2="210" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="200" cy="200" r="2.5" fill="#ef4444" />
                  <circle cx="245" cy="210" r="2.5" fill="#ef4444" />
                  
                  {/* Label on chart price peaks */}
                  <line x1="200" y1="90" x2="260" y2="65" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" />
                </>
              ) : (
                <>
                  {/* Standby RSI grid */}
                  <text x="15" y="200" fill="var(--text-muted)" fontSize="7" fontFamily="monospace">MOMENTUM OSCILLATOR (RSI)</text>
                  <line x1="20" y1="205" x2="430" y2="205" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                  <line x1="20" y1="235" x2="430" y2="235" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                  {/* RSI Line */}
                  <path d="M 20 220 L 70 238 L 140 215 L 210 200 L 260 212 L 310 225 L 350 238 L 390 212 L 430 203" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                </>
              )}
            </svg>

            {/* Tap Hotspot instruction overlay */}
            {step > 1 && status === 'idle' && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                Ketuk target pada grafik di atas
              </div>
            )}
          </div>

          {/* Right Side: Quest Details & Actions */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Quest Instructions Card */}
            <div className="ide-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Mission Label */}
              <div style={{ fontSize: '10px', color: 'var(--info)', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MISI AKTIF
              </div>

              {/* Step Question Header */}
              {step === 1 && (
                <div className="flex-col" style={{ gap: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Tentukan Arah Tren Awal</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    Perhatikan pergerakan harga di dalam kotak bergaris merah sebelah kiri. Harga bergerak membentuk serangkaian puncak dan lembah yang semakin rendah. Gaya pergerakan tren ini adalah:
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="flex-col" style={{ gap: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Temukan Golden Cross</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    Ketika tren berbalik arah dari turun ke naik, rata-rata harga jangka pendek memotong ke atas rata-rata harga jangka panjang.
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--info)', fontWeight: 600, margin: 0 }}>
                    Misi: Klik titik pertemuan di mana garis Blue MA memotong garis Orange MA dari bawah ke atas.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="flex-col" style={{ gap: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Identifikasi Bearish Divergence</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    Di area kanan tengah, perhatikan dua puncak harga yang naik semakin tinggi (Higher High), sedangkan indikator momentum MACD di bawahnya justru menunjukkan puncak yang menurun (Lower High).
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--info)', fontWeight: 600, margin: 0 }}>
                    Misi: Klik kotak pembatas area di mana divergence harga dan indikator tersebut terjadi.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="flex-col" style={{ gap: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Tentukan Fibonacci Pullback Support</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    Setelah pembalikan arah divergence, harga turun mengalami koreksi sehat (pullback) sebelum melanjutkan breakout berikutnya.
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--info)', fontWeight: 600, margin: 0 }}>
                    Misi: Klik titik koreksi terendah harga tepat pada level horizontal Fibonacci Support 61.8% (Golden Ratio).
                  </p>
                </div>
              )}

              {/* Action Buttons for Step 1 */}
              {step === 1 && status === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleAnswerTrend('uptrend')}
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    Uptrend (Kecenderungan Naik)
                  </button>
                  <button 
                    onClick={() => handleAnswerTrend('downtrend')}
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    Downtrend (Kecenderungan Turun)
                  </button>
                </div>
              )}

              {/* Feedback banners */}
              {status === 'correct' && (
                <div className="flex-col" style={{ gap: '12px', marginTop: 'auto' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', color: 'var(--bullish)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <CheckCircle size={14} style={{ flexShrink: 0 }} /> Jawaban Tepat! Analisis Anda Benar.
                  </div>
                  
                  <button 
                    onClick={handleNextStep}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--info)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Lanjutkan Misi <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {status === 'wrong' && (
                <div className="flex-col" style={{ gap: '10px', marginTop: 'auto' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: 'var(--bearish)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <ShieldAlert size={14} style={{ flexShrink: 0 }} /> Salah. Coba amati chart lebih cermat.
                  </div>
                  <button 
                    onClick={() => setStatus('idle')}
                    style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
