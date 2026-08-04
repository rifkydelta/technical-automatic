import React from 'react';
import { Play } from 'lucide-react';

export default function VolumeOverview({ onStart }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', minHeight: '400px', padding: '32px 0' }} className="fade-in">
      
      {/* Left Content */}
      <div style={{ flex: 1, maxWidth: '420px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--info)', marginBottom: '12px' }}>Module 01</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Volume Indicator
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          "The Confirmation Behind Every Move"
        </p>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '8px' }}>
          Volume menunjukkan seberapa besar aktivitas transaksi yang terjadi pada suatu saham. 
          Ini adalah jejak kaki institusi yang tidak bisa dimanipulasi.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
          Pergerakan harga tanpa volume yang kuat memiliki kemungkinan besar menjadi <strong>False Breakout</strong> atau <strong>Reversal</strong>.
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
          Start Course <Play size={12} fill="currentColor" />
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
          alignItems: 'flex-end',
          gap: '6px',
          padding: '24px 20px 16px',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '12px',
          position: 'relative'
        }}>
          {/* MA20 line */}
          <div style={{ position: 'absolute', top: '45%', left: '16px', right: '16px', height: '1px', borderTop: '1.5px dashed var(--warning)', zIndex: 2 }}></div>
          <div style={{ position: 'absolute', top: 'calc(45% - 8px)', right: '20px', fontSize: '9px', color: 'var(--warning)', fontWeight: 600, background: 'rgba(96,165,250,0.03)', padding: '0 4px', zIndex: 3 }}>MA20</div>
          
          {[25, 35, 20, 45, 70, 30, 55, 85, 50, 28, 40, 32].map((height, i) => (
            <div 
              key={i} 
              style={{
                flex: 1,
                height: `${height}%`,
                background: height > 65 ? 'var(--info)' : 'rgba(255,255,255,0.08)',
                borderRadius: '2px 2px 0 0',
                animation: `fadeIn 0.4s ease-out ${i * 0.04}s backwards`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
