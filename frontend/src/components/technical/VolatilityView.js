import React from 'react';
import { AlertTriangle, Activity, Zap } from 'lucide-react';

export default function VolatilityView({ volData, lastPrice }) {
  if (!volData) return null;

  const getAtrStyle = (regime) => {
    switch(regime) {
      case 'Extreme':
      case 'Elevated': return 'extreme'; // maps to CSS class
      case 'Normal': return 'normal';
      case 'Low': return 'low';
      default: return 'normal';
    }
  };

  const getAtrIcon = (regime) => {
    if (regime === 'Extreme') return <AlertTriangle size={20} />;
    if (regime === 'Elevated') return <Zap size={20} />;
    return <Activity size={20} />;
  };

  // Find max range for scaling
  const maxRange = Math.max(volData.range_1w, volData.range_1m, volData.range_ytd, 1);
  
  // Calculate distances
  const getDistancePct = (targetPrice) => {
    if (!lastPrice || !targetPrice) return null;
    const diff = targetPrice - lastPrice;
    const pct = (diff / lastPrice) * 100;
    return {
      value: pct,
      formatted: `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`,
      isPositive: pct > 0
    };
  };

  const upperDist = getDistancePct(volData.bb_upper);
  const lowerDist = getDistancePct(volData.bb_lower);
  const middleDist = getDistancePct(volData.bb_middle);

  return (
    <div className="flex-col gap-md">
      <h2 className="text-xl font-bold">Volatility Analysis</h2>

      {/* ATR Alert */}
      <div className={`alert-box ${getAtrStyle(volData.atr_regime)}`}>
        {getAtrIcon(volData.atr_regime)}
        <div className="flex-col">
          <span className="font-bold text-sm tracking-widest uppercase">ATR Regime: {volData.atr_regime}</span>
          <span className="text-xs opacity-80 mt-1">
            Rentang pergerakan rata-rata harian (ATR) adalah {volData.atr_value.toFixed(1)} poin atau setara dengan {volData.atr_pct.toFixed(2)}% dari harga saat ini.
          </span>
        </div>
      </div>

      {/* Historical Range */}
      <div className="card flex-col gap-sm" style={{ padding: '16px' }}>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Historical Range (High - Low)</h3>
        <p className="text-xs text-secondary mb-3" style={{ lineHeight: '1.5' }}>
          Perbandingan selisih harga tertinggi dan terendah pada berbagai rentang waktu. Semakin panjang bar, semakin lebar fluktuasinya.
        </p>
        
        <div className="flex-col gap-md">
          {/* 1W */}
          <div className="flex-row items-center gap-md">
            <span className="text-xs font-semibold text-secondary" style={{ width: '60px', flexShrink: 0 }}>1 Week</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(volData.range_1w / maxRange) * 100}%`, height: '100%', backgroundColor: 'var(--info)' }}></div>
            </div>
            <span className="text-sm font-mono font-bold text-right text-muted" style={{ width: '60px', flexShrink: 0 }}>
              {lastPrice ? ((volData.range_1w / lastPrice) * 100).toFixed(1) + '%' : Math.round(volData.range_1w).toLocaleString()}
            </span>
          </div>
          {/* 1M */}
          <div className="flex-row items-center gap-md">
            <span className="text-xs font-semibold text-secondary" style={{ width: '60px', flexShrink: 0 }}>1 Month</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(volData.range_1m / maxRange) * 100}%`, height: '100%', backgroundColor: 'var(--info)', opacity: 0.8 }}></div>
            </div>
            <span className="text-sm font-mono font-bold text-right text-muted" style={{ width: '60px', flexShrink: 0 }}>
              {lastPrice ? ((volData.range_1m / lastPrice) * 100).toFixed(1) + '%' : Math.round(volData.range_1m).toLocaleString()}
            </span>
          </div>
          {/* YTD */}
          <div className="flex-row items-center gap-md">
            <span className="text-xs font-semibold text-secondary" style={{ width: '60px', flexShrink: 0 }}>YTD</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(volData.range_ytd / maxRange) * 100}%`, height: '100%', backgroundColor: 'var(--info)', opacity: 0.5 }}></div>
            </div>
            <span className="text-sm font-mono font-bold text-right text-muted" style={{ width: '60px', flexShrink: 0 }}>
              {lastPrice ? ((volData.range_ytd / lastPrice) * 100).toFixed(1) + '%' : Math.round(volData.range_ytd).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bollinger Bands Grid */}
      <div className="card flex-col gap-sm" style={{ padding: '16px' }}>
        <div className="flex-col gap-xs mb-2">
          <div className="flex-row justify-between text-xs font-semibold tracking-widest uppercase text-muted">
            <span>Bollinger Bands (20, 2)</span>
            <span style={{ color: volData.bb_position === 'Upper Band' ? 'var(--bearish)' : (volData.bb_position === 'Lower Band' ? 'var(--bullish)' : 'var(--neutral)') }}>
              Posisi: {volData.bb_position}
            </span>
          </div>
          <p className="text-xs text-secondary" style={{ lineHeight: '1.5' }}>
            Mengukur batas deviasi wajar pergerakan harga relatif terhadap MA 20. Band width yang sempit menandakan area kompresi sebelum breakout.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Upper Band</div>
            <div className="flex-row justify-between items-center">
              <span className="text-sm font-mono font-bold">{Math.round(volData.bb_upper).toLocaleString()}</span>
              {upperDist && (
                <span className={`text-xs font-mono font-bold ${upperDist.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                  {upperDist.formatted}
                </span>
              )}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Lower Band</div>
            <div className="flex-row justify-between items-center">
              <span className="text-sm font-mono font-bold">{Math.round(volData.bb_lower).toLocaleString()}</span>
              {lowerDist && (
                <span className={`text-xs font-mono font-bold ${lowerDist.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                  {lowerDist.formatted}
                </span>
              )}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Middle Band (SMA20)</div>
            <div className="flex-row justify-between items-center">
              <span className="text-sm font-mono font-bold">{Math.round(volData.bb_middle).toLocaleString()}</span>
              {middleDist && (
                <span className={`text-xs font-mono font-bold ${middleDist.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                  {middleDist.formatted}
                </span>
              )}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Band Width %</div>
            <div className="flex-row justify-between items-center">
              <span className="text-sm font-mono font-bold text-info">{volData.bb_width.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
