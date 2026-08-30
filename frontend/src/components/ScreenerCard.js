'use client';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, ShieldCheck, Activity, BarChart2, Target, Calendar } from 'lucide-react';

export default function ScreenerCard({ data, onClick }) {
  if (!data) return null;

  const isUp = data.change_pct >= 0;
  const isUptrend = data.trend === 'Bullish' || data.trend === 'Strong Bullish';
  const isHighRisk = data.risk_status === 'High Risk';

  // Format IDR
  const formatIDR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID').format(Math.round(val));
  };

  const formatVol = (val) => {
    if (!val) return '0';
    if (val > 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val > 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val > 1000) return (val / 1000).toFixed(1) + 'K';
    return val;
  };

  const tp1Val = data.tp1 || (data.last_price ? data.last_price * 1.03 : 0);
  const tp1Pct = data.tp1_pct !== undefined && data.tp1_pct !== null
    ? data.tp1_pct
    : (data.last_price > 0 ? (((tp1Val - data.last_price) / data.last_price) * 100).toFixed(1) : '3.0');
  const estDays = data.estimated_tp_range || (data.estimated_tp_days ? `${data.estimated_tp_days} Hari` : '2-4 Hari');

  return (
    <div 
      onClick={() => onClick(data.ticker)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '18px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Section: Ticker, Name & Current Price */}
      <div className="flex-row items-center" style={{ justifyContent: 'space-between' }}>
        <div className="flex-col">
          <span className="font-mono text-xl font-bold text-primary">{data.ticker}</span>
          <span className="text-xs text-secondary" style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.company_name}
          </span>
        </div>
        
        <div className="flex-col" style={{ alignItems: 'flex-end' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '1px' }}>Harga Sekarang</div>
          <span className="font-mono text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Rp{formatIDR(data.last_price)}
          </span>
          <div className="flex-row items-center gap-xs" style={{ color: isUp ? 'var(--bullish)' : 'var(--bearish)', marginTop: '2px' }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span className="text-xs font-mono font-bold">
              {isUp ? '+' : ''}{data.change_pct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Target Profit & Estimated Days Highlight Box */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.06), rgba(59, 130, 246, 0.06))',
          border: '1px solid rgba(74, 222, 128, 0.18)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={11} color="var(--bullish)" /> Target TP1
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--bullish)', fontFamily: 'monospace', marginTop: '2px' }}>
            Rp{formatIDR(tp1Val)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--bullish)', fontWeight: 'bold' }}>
            +{tp1Pct}% Upside
          </div>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={11} color="#60a5fa" /> Estimasi ke TP
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa', marginTop: '2px' }}>
            {estDays}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Swing / Volatilitas
          </div>
        </div>
      </div>

      {/* Middle Grid: Trend & Volume */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Trend */}
        <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
          <div className="text-xs text-muted mb-1 flex-row items-center gap-xs"><Activity size={11}/> Trend</div>
          <div className="text-xs font-bold" style={{ color: isUptrend ? 'var(--bullish)' : 'var(--warning)' }}>
            {data.trend}
          </div>
        </div>

        {/* Volume */}
        <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
          <div className="text-xs text-muted mb-1 flex-row items-center gap-xs"><BarChart2 size={11}/> Volume</div>
          <div className="text-xs font-bold text-primary font-mono">
            {formatVol(data.volume)}
          </div>
          {data.volume_change_pct !== undefined && data.volume_change_pct !== null ? (
            <div
              style={{
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                marginTop: '2px',
                color: data.volume_change_pct >= 0 ? 'var(--bullish)' : 'var(--bearish)'
              }}
            >
              {data.volume_change_pct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {data.volume_change_pct >= 0 ? `+${data.volume_change_pct}%` : `${data.volume_change_pct}%`} vs MA20
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Avg: {formatVol(data.avg_volume)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recommendation & Risk */}
      <div className="flex-row items-center gap-sm" style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
        {(() => {
          const rec = (data.recommendation || '').toUpperCase();
          const isNotBuy = rec.includes('NOT BUY') || rec.includes('SELL') || rec.includes('AVOID') || rec.includes('RISK');
          const isBuy = !isNotBuy && rec.includes('BUY');
          const isWait = rec.includes('WAIT') || rec.includes('WATCH');
          const bg = isNotBuy ? 'rgba(244, 63, 94, 0.15)' : (isBuy ? 'rgba(74, 222, 128, 0.15)' : (isWait ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)'));
          const color = isNotBuy ? 'var(--bearish)' : (isBuy ? 'var(--bullish)' : (isWait ? 'var(--warning)' : 'var(--text-secondary)'));
          const border = isNotBuy ? '1px solid rgba(244, 63, 94, 0.35)' : (isBuy ? '1px solid rgba(74, 222, 128, 0.35)' : (isWait ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)'));

          return (
            <div style={{ 
              padding: '4px 8px', 
              borderRadius: '6px', 
              backgroundColor: bg,
              color: color,
              border: border,
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              {data.recommendation} • {data.score_display}
            </div>
          );
        })()}

        <div style={{ marginLeft: 'auto' }}>
          {isHighRisk ? (
            <div className="flex-row items-center gap-xs text-xs" style={{ color: 'var(--bearish)' }}>
              <ShieldAlert size={13} /> High Risk
            </div>
          ) : (
            <div className="flex-row items-center gap-xs text-xs" style={{ color: 'var(--bullish)' }}>
              <ShieldCheck size={13} /> Good Setup
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
