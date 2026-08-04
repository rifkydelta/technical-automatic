'use client';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

export default function ScreenerCard({ data, onClick }) {
  if (!data) return null;

  const isUp = data.change_pct >= 0;
  const isUptrend = data.trend === 'Bullish' || data.trend === 'Strong Bullish';
  const isHighRisk = data.risk_status === 'High Risk';

  // Format IDR
  const formatIDR = (val) => new Intl.NumberFormat('id-ID').format(val);
  const formatVol = (val) => {
    if (val > 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val > 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val > 1000) return (val / 1000).toFixed(1) + 'K';
    return val;
  };

  return (
    <div 
      onClick={() => onClick(data.ticker)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Section */}
      <div className="flex-row items-center" style={{ justifyContent: 'space-between' }}>
        <div className="flex-col">
          <span className="font-mono text-xl font-bold text-primary">{data.ticker}</span>
          <span className="text-xs text-secondary" style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.company_name}
          </span>
        </div>
        
        <div className="flex-col" style={{ alignItems: 'flex-end' }}>
          <span className="font-mono text-lg font-bold" style={{ color: isUp ? 'var(--bullish)' : 'var(--bearish)' }}>
            {formatIDR(data.last_price)}
          </span>
          <div className="flex-row items-center gap-xs" style={{ color: isUp ? 'var(--bullish)' : 'var(--bearish)' }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span className="text-xs font-mono font-bold">
              {isUp ? '+' : ''}{data.change_pct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
        {/* Trend */}
        <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
          <div className="text-xs text-muted mb-1 flex-row items-center gap-xs"><Activity size={12}/> Trend</div>
          <div className="text-sm font-bold" style={{ color: isUptrend ? 'var(--bullish)' : 'var(--warning)' }}>
            {data.trend}
          </div>
        </div>

        {/* Volume */}
        <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
          <div className="text-xs text-muted mb-1 flex-row items-center gap-xs"><BarChart2 size={12}/> Volume</div>
          <div className="text-sm font-bold text-primary font-mono">
            {formatVol(data.volume)}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-row items-center gap-sm" style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
        <div style={{ 
          padding: '4px 8px', 
          borderRadius: '6px', 
          backgroundColor: data.recommendation.includes('BUY') ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: data.recommendation.includes('BUY') ? 'var(--bullish)' : 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          {data.recommendation} • {data.score_display}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          {isHighRisk ? (
            <div className="flex-row items-center gap-xs text-xs" style={{ color: 'var(--bearish)' }}>
              <ShieldAlert size={14} /> High Risk
            </div>
          ) : (
            <div className="flex-row items-center gap-xs text-xs" style={{ color: 'var(--bullish)' }}>
              <ShieldCheck size={14} /> Good Setup
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
