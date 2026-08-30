'use client';
import { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

export default function InputForm({ onSubmit, isLoading, mode = 'live' }) {
  const [ticker, setTicker] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSubmit({ ticker: ticker.trim(), mode: 'live' });
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Pro Command Search Input Form (Default Full LIVE Mode) */}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            border: isFocused ? '1px solid var(--bullish)' : '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: isFocused ? '0 0 16px rgba(74, 222, 128, 0.18)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
            borderRadius: '14px',
            padding: '5px 6px 5px 14px',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
        >
          <Search size={16} color={isFocused ? 'var(--bullish)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />

          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ketik kode saham (contoh: BBCA, VKTR)..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em'
            }}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.04em',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Memindai...</span>
              </>
            ) : (
              <>
                <span>Analisis</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
