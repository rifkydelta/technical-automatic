import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TrendView({ trendData }) {
  if (!trendData) return null;

  const getAdxColor = (val) => {
    if (val > 50) return '#60a5fa'; // Blue (Very strong)
    if (val >= 25) return '#4ade80'; // Green (Strong)
    if (val >= 20) return '#fbbf24'; // Yellow (Emerging)
    return '#f43f5e'; // Red (Weak)
  };

  const adxWidth = Math.min(Math.max((trendData.adx_value / 60) * 100, 0), 100); // Scale up to 60 as max for visual
  const diTotal = trendData.di_plus + trendData.di_minus;
  const diPlusWidth = diTotal > 0 ? (trendData.di_plus / diTotal) * 100 : 50;

  return (
    <div className="flex-col gap-md">
      <div className="flex-row justify-between items-center">
        <h2 className="text-xl font-bold">Trend Analysis</h2>
        <div className="text-2xl font-bold" style={{
          color: ['A', 'B'].includes(trendData.grade) ? 'var(--bullish)' : (['D', 'E'].includes(trendData.grade) ? 'var(--bearish)' : 'var(--neutral)'),
          backgroundColor: 'rgba(255,255,255,0.05)',
          padding: '4px 16px',
          borderRadius: '8px'
        }}>
          {trendData.grade}
        </div>
      </div>

      <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
        {trendData.main_reason} {trendData.short_term_reason}
      </p>

      {/* ADX */}
      <div className="card flex-col gap-sm" style={{ padding: '16px' }}>
        <div className="flex-row justify-between text-xs font-semibold tracking-widest uppercase text-muted">
          <span>Trend Strength (ADX)</span>
          <span style={{ color: getAdxColor(trendData.adx_value) }}>
            {trendData.adx_value.toFixed(1)} • {trendData.adx_status}
          </span>
        </div>
        <div style={{ position: 'relative', marginBottom: '8px', marginTop: '4px' }}>
          <div className="gauge-bar" style={{ background: 'linear-gradient(90deg, #f43f5e 20%, #fbbf24 35%, #4ade80 60%, #60a5fa 100%)' }}>
             <div className="gauge-marker" style={{ left: `${adxWidth}%` }}></div>
          </div>
          {/* Tick marks */}
          <div style={{ position: 'absolute', top: '100%', left: '0', right: '0', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
            <span>0</span>
            <span style={{ position: 'absolute', left: '33.33%', transform: 'translateX(-50%)' }}>20</span>
            <span style={{ position: 'absolute', left: '41.66%', transform: 'translateX(-50%)' }}>25</span>
            <span style={{ position: 'absolute', left: '83.33%', transform: 'translateX(-50%)' }}>50</span>
            <span>60+</span>
          </div>
        </div>
      </div>

      {/* DI+ vs DI- */}
      <div className="card flex-col gap-sm" style={{ padding: '16px', marginTop: '8px' }}>
        <div className="flex-row justify-between text-xs font-semibold tracking-widest uppercase text-muted">
          <span>Directional Bias (DI)</span>
          <span>DMI (14)</span>
        </div>
        <div className="flex-row justify-between text-sm font-mono mb-1">
          <span style={{ color: 'var(--bullish)' }}>+DI: {trendData.di_plus.toFixed(1)}</span>
          <span style={{ color: 'var(--bearish)' }}>-DI: {trendData.di_minus.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', width: '100%', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${diPlusWidth}%`, backgroundColor: 'var(--bullish)' }}></div>
          <div style={{ width: `${100 - diPlusWidth}%`, backgroundColor: 'var(--bearish)' }}></div>
        </div>
      </div>

      {/* SMA Table */}
      <div className="card flex-col gap-sm" style={{ padding: '16px', marginTop: '8px' }}>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">Position vs SMA</h3>
        <div className="flex-col gap-xs">
          {trendData.sma_table.map((sma, i) => (
            <div key={i} className="flex-row justify-between items-center" style={{ padding: '10px 0', borderBottom: i < trendData.sma_table.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: '60px' }} className="text-sm font-semibold">{sma.name}</div>
              <div style={{ width: '80px' }} className="text-sm font-mono text-secondary">{Math.round(sma.value).toLocaleString()}</div>
              
              {/* Double Progress Bar */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 16px', position: 'relative', height: '16px' }}>
                 {/* Center line */}
                 <div style={{ position: 'absolute', left: '50%', width: '2px', height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 1 }}></div>
                 
                 {/* Track */}
                 <div style={{ position: 'absolute', left: '0', right: '0', top: '50%', transform: 'translateY(-50%)', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}></div>

                 {/* Bar */}
                 <div style={{ 
                   position: 'absolute',
                   left: sma.diff_pct < 0 ? `calc(50% - ${Math.min(Math.abs(sma.diff_pct), 50)}%)` : '50%',
                   width: `${Math.min(Math.abs(sma.diff_pct), 50)}%`,
                   height: '8px',
                   backgroundColor: sma.diff_pct > 0 ? 'var(--bullish)' : 'var(--bearish)',
                   borderRadius: '4px',
                   top: '50%',
                   transform: 'translateY(-50%)'
                 }}></div>
              </div>

              <div style={{ width: '60px', textAlign: 'right' }} className={`text-sm font-mono font-bold ${sma.diff_pct > 0 ? 'text-bullish' : 'text-bearish'}`}>
                {sma.diff_pct > 0 ? '+' : ''}{sma.diff_pct.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
