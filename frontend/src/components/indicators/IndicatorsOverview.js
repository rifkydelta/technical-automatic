import React from 'react';
import { Play } from 'lucide-react';

export default function IndicatorsOverview({ onStart }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', minHeight: '400px', padding: '32px 0' }} className="fade-in">
      
      {/* Left Content */}
      <div style={{ flex: 1, maxWidth: '440px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--info)', marginBottom: '12px' }}>Module 03</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Technical Indicators
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          "Measure Market, Not Predict It"
        </p>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '8px' }}>
          Technical Indicators adalah alat bantu analisis berbasis perhitungan matematis yang membantu trader membaca trend, momentum, volatilitas, dan potensi pembalikan arah harga saham.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
          Indikator bukan alat magis untuk memprediksi masa depan saham secara mutlak, melainkan alat bantu statistik untuk mengukur probabilitas arah pasar.
        </p>

        <button 
          onClick={onStart}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--info)',
            color: '#000',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Start Learning <Play size={12} fill="currentColor" />
        </button>
      </div>

      {/* Right Visual SVG */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '200px',
          background: 'rgba(96,165,250,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Grid bg */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <svg viewBox="0 0 160 100" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>
            {/* Price line */}
            <path d="M 10 70 L 40 85 L 75 60 L 105 78 L 145 28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            
            {/* Indicator Line A (Lagging EMA) */}
            <path d="M 10 75 Q 60 78 105 65 T 145 35" fill="none" stroke="#f59e0b" strokeWidth="2.2" opacity="0.8" />
            
            {/* Indicator Line B (Fast EMA Crossover) */}
            <path d="M 10 80 C 45 78 75 62 105 55 T 145 30" fill="none" stroke="#10b981" strokeWidth="2.2" />
            
            {/* Golden cross point */}
            <circle cx="88" cy="61" r="3" fill="#10b981" stroke="#fff" strokeWidth="0.8" />
            
            {/* Wave Oscillator (RSI lookalike below) */}
            <line x1="0" y1="88" x2="160" y2="88" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
            <path d="M 10 95 Q 40 88 80 96 T 140 92" fill="none" stroke="#3b82f6" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
