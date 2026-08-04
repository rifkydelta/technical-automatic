import React from 'react';
import { Play } from 'lucide-react';
import CandlestickIllustration from './CandlestickIllustration';

export default function CandlestickOverview({ onStart }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', minHeight: '400px', padding: '32px 0' }} className="fade-in">
      
      {/* Left Content */}
      <div style={{ flex: 1, maxWidth: '420px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--info)', marginBottom: '12px' }}>Module 02</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Candlestick Pattern
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          "Read Market Psychology Through Candles"
        </p>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '8px' }}>
          Candlestick menunjukkan pertarungan antara buyer dan seller.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
          Dengan memahami pola candlestick, trader dapat mengetahui potensi reversal, continuation, dan momentum pasar.
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

      {/* Right Visual */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '200px',
          background: 'rgba(96,165,250,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '24px 20px 16px',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle grid background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div style={{ width: '40px', height: '100px', position: 'relative', zIndex: 2, transform: 'translateY(15px)' }}>
            <CandlestickIllustration patternId="bullish-engulfing" />
          </div>
          <div style={{ width: '40px', height: '100px', position: 'relative', zIndex: 2, transform: 'translateY(-15px)' }}>
            <CandlestickIllustration patternId="hammer" />
          </div>
          <div style={{ width: '40px', height: '100px', position: 'relative', zIndex: 2, transform: 'translateY(5px)' }}>
            <CandlestickIllustration patternId="bearish-harami" />
          </div>
        </div>
      </div>
    </div>
  );
}
