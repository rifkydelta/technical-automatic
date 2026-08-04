import React from 'react';
import { Activity } from 'lucide-react';

export default function MomentumView({ momentumData }) {
  if (!momentumData) return null;

  // Helper for 0-100 gauge (RSI, StochRSI, MFI)
  const renderGauge = (label, value, zone, type) => {
    // type: "RSI" (30-70), "MFI" (20-80)
    const val = Math.min(Math.max(value, 0), 100);
    
    let color = 'var(--neutral)';
    if (zone === 'Overbought') color = 'var(--bearish)';
    else if (zone === 'Oversold') color = 'var(--bullish)'; // Oversold is good for buy
    
    // Gradients
    let gradient = '';
    if (type === 'RSI') {
      gradient = 'linear-gradient(90deg, #4ade80 30%, #fbbf24 30% 70%, #f43f5e 70%)';
    } else { // MFI, StochRSI
      gradient = 'linear-gradient(90deg, #4ade80 20%, #fbbf24 20% 80%, #f43f5e 80%)';
    }

    return (
      <div className="card flex-col gap-sm" style={{ padding: '16px', marginTop: '8px' }}>
        <div className="flex-row justify-between text-xs font-semibold tracking-widest uppercase text-muted">
          <span>{label}</span>
          <span style={{ color, fontWeight: 'bold' }}>{value.toFixed(1)} • {zone}</span>
        </div>
        <div style={{ position: 'relative', marginBottom: '8px', marginTop: '4px' }}>
          <div className="gauge-bar" style={{ background: gradient }}>
             <div className="gauge-marker" style={{ left: `${val}%` }}></div>
          </div>
          {/* Tick marks */}
          <div style={{ position: 'absolute', top: '100%', left: '0', right: '0', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
            <span>0</span>
            {type === 'RSI' ? (
              <>
                <span style={{ position: 'absolute', left: '30%', transform: 'translateX(-50%)' }}>30</span>
                <span style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)' }}>70</span>
              </>
            ) : (
              <>
                <span style={{ position: 'absolute', left: '20%', transform: 'translateX(-50%)' }}>20</span>
                <span style={{ position: 'absolute', left: '80%', transform: 'translateX(-50%)' }}>80</span>
              </>
            )}
            <span>100</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-col gap-md">
      <h2 className="text-xl font-bold">Momentum Analysis</h2>
      
      {renderGauge("RSI (14)", momentumData.rsi_value, momentumData.rsi_zone, "RSI")}
      {renderGauge("Stoch RSI", momentumData.stoch_rsi_value, momentumData.stoch_rsi_zone, "Stoch")}
      {renderGauge("Money Flow Index (14)", momentumData.mfi_value, momentumData.mfi_zone, "MFI")}

      {/* MACD */}
      <div className="card flex-col gap-sm" style={{ padding: '20px', marginTop: '8px' }}>
        <div className="flex-row justify-between items-center mb-2">
          <div className="flex-col">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">MACD (12, 26, 9)</span>
          </div>
          <div className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ 
            color: ['Golden Cross', 'Bullish'].includes(momentumData.macd_cross) ? 'var(--bullish)' : 'var(--bearish)',
            borderColor: ['Golden Cross', 'Bullish'].includes(momentumData.macd_cross) ? 'var(--bullish)' : 'var(--bearish)'
          }}>
            {momentumData.macd_cross}
          </div>
        </div>
        
        {/* Value Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>MACD Line</div>
            <div className="text-lg font-mono font-bold" style={{ color: momentumData.macd_value > 0 ? 'var(--info)' : 'var(--bearish)' }}>
              {momentumData.macd_value > 0 ? '+' : ''}{momentumData.macd_value.toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Signal Line</div>
            <div className="text-lg font-mono font-bold text-secondary">
              {momentumData.macd_signal_value > 0 ? '+' : ''}{momentumData.macd_signal_value.toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Histogram</div>
            <div className="text-lg font-mono font-bold" style={{ color: momentumData.macd_hist_value > 0 ? 'var(--bullish)' : 'var(--bearish)' }}>
              {momentumData.macd_hist_value > 0 ? '+' : ''}{momentumData.macd_hist_value.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Clearer Histogram Visualizer */}
        <div className="flex-col gap-xs">
          <span className="text-xs text-muted">Histogram Strength</span>
          <div style={{ display: 'flex', width: '100%', height: '40px', alignItems: 'center', position: 'relative', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 20px' }}>
            <div style={{ position: 'absolute', width: 'calc(100% - 40px)', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', top: '50%' }}></div>
            <div style={{
              position: 'absolute',
              left: '50%',
              bottom: momentumData.macd_hist_value > 0 ? '50%' : 'auto',
              top: momentumData.macd_hist_value < 0 ? '50%' : 'auto',
              width: '16px',
              height: `${Math.min(Math.abs(momentumData.macd_hist_value) * 5, 100)}%`, // adjusted scale
              minHeight: '2px',
              backgroundColor: momentumData.macd_hist_value > 0 ? 'var(--bullish)' : 'var(--bearish)',
              transform: 'translateX(-50%)',
              borderRadius: '2px',
              boxShadow: `0 0 8px ${momentumData.macd_hist_value > 0 ? 'var(--bullish)' : 'var(--bearish)'}`
            }}></div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
