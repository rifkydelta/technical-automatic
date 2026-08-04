'use client';
import { useState } from 'react';
import { Search, Radio, BarChart3, Lock } from 'lucide-react';

const MODE_CONFIG = {
  live: { label: 'LIVE', icon: Radio, color: 'var(--bullish)', desc: 'Real-time' },
  session_1: { label: 'SESI 1', icon: BarChart3, color: 'var(--warning)', desc: 'Close Sesi 1' },
  close_market: { label: 'CLOSE', icon: Lock, color: 'var(--info)', desc: 'Close Market' },
};

export default function InputForm({ onSubmit, isLoading, mode = 'live', onModeChange, availableModes }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker) {
      onSubmit({ ticker, mode });
    }
  };

  const resolvedAvailable = availableModes || ['live'];

  return (
    <div style={{ width: '100%' }}>
      {/* Mode Selector */}
      <div className="flex-row" style={{ 
        gap: '4px', 
        marginBottom: '10px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {Object.entries(MODE_CONFIG).map(([key, cfg]) => {
          const isActive = mode === key;
          const isAvailable = resolvedAvailable.includes(key);
          const Icon = cfg.icon;

          return (
            <button
              key={key}
              type="button"
              onClick={() => isAvailable && onModeChange?.(key)}
              disabled={!isAvailable || isLoading}
              title={!isAvailable ? `${cfg.label} belum tersedia saat ini` : cfg.desc}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: isActive ? `1px solid ${cfg.color}` : '1px solid transparent',
                backgroundColor: isActive ? `${cfg.color}15` : 'transparent',
                color: isActive ? cfg.color : (isAvailable ? 'var(--text-secondary)' : 'var(--text-muted)'),
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: isAvailable && !isLoading ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.35,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Icon size={13} strokeWidth={2.5} />
              {cfg.label}
              {isActive && (
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  backgroundColor: cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}`,
                  animation: key === 'live' ? 'pulse 2s infinite' : 'none',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex-row gap-sm items-center">
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter Ticker (e.g. BBCA)"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--bullish)';
              e.target.style.boxShadow = '0 0 12px rgba(57, 255, 20, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-secondary)' 
            }} 
          />
        </div>
        
        <button type="submit" disabled={isLoading} className="analyze-btn">
          {isLoading ? 'ANALYZING...' : 'ANALYZE'}
        </button>
      </form>
    </div>
  );
}
