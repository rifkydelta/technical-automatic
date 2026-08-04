'use client';
import { TrendingUp, TrendingDown, Minus, ArrowDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopCards({ data, mode = 'live' }) {
  const [livePrice, setLivePrice] = useState(data?.last_price);
  const [liveLabel, setLiveLabel] = useState(data?.session_info?.mode_label || 'Live');

  useEffect(() => {
    if (!data?.ticker) return;
    setLivePrice(data.last_price);

    const fetchLivePrice = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/price/${data.ticker}?mode=${mode}`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.price) {
            setLivePrice(result.price);
            if (result.label) setLiveLabel(result.label);
          }
        }
      } catch (e) {
        // silently ignore fetch errors for polling
      }
    };

    const interval = setInterval(fetchLivePrice, 1000);
    return () => clearInterval(interval);
  }, [data, mode]);

  if (!data) return null;

  const MetricCard = ({ title, value, subvalue, valueColor = "var(--text-primary)", borderColor }) => (
    <div className="card flex-col justify-between" style={{ minHeight: '120px', border: borderColor ? `1px solid ${borderColor}` : undefined }}>
      <div className="text-xs font-semibold text-secondary tracking-widest uppercase mb-2">{title}</div>
      <div className="text-2xl" style={{ fontFamily: 'var(--font-mono)', color: valueColor, marginTop: 'auto', marginBottom: '4px' }}>
        {value}
      </div>
      {subvalue && <div className="text-xs text-muted font-medium">{subvalue}</div>}
    </div>
  );

  const getBiasIcon = (bias) => {
    if (!bias) return <Minus size={18} strokeWidth={1.5} />;
    const b = bias.toLowerCase();
    if (b.includes('bullish')) return <TrendingUp size={18} strokeWidth={1.5} />;
    if (b.includes('bearish')) return <TrendingDown size={18} strokeWidth={1.5} />;
    if (b.includes('pullback')) return <ArrowDownRight size={18} strokeWidth={1.5} />;
    return <Minus size={18} strokeWidth={1.5} />;
  };

  const getBiasColor = (bias) => {
    if (!bias) return 'var(--neutral)';
    const b = bias.toLowerCase();
    if (b.includes('bullish')) return 'var(--bullish)';
    if (b.includes('bearish')) return 'var(--bearish)';
    if (b.includes('pullback')) return 'var(--warning)';
    return 'var(--neutral)';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--bullish)';
    if (score >= 60) return 'var(--neutral)';
    return 'var(--bearish)';
  };

  const scoreInfo = data.setup_score;
  const bias = data.trend_analysis.trend_besar;
  const breakLevel = data.support_resistance?.resistances?.[0]?.zone?.split('-')[0] || 'N/A';
  const invalidation = data.risk_management?.stop_loss ? Math.round(data.risk_management.stop_loss).toLocaleString() : 'N/A';
  const ema200_val = data.indicators?.ema200 ? Math.round(data.indicators.ema200) : 0;
  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split(' - ');
      if (parts.length !== 2) return dateString;

      const datePart = parts[0];
      const timePart = parts[1].replace(' WIB', '');

      const dateObj = new Date(datePart);
      if (isNaN(dateObj)) return dateString;

      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yy = String(dateObj.getFullYear()).slice(2);

      return `${dd}/${mm}/'${yy} - ${timePart}`;
    } catch {
      return dateString;
    }
  };

  const score = data.setup_score;
  const trend = data.trend_analysis;
  const res1 = data.support_resistance?.resistances?.[0]?.zone?.split('-')[0] || 'N/A';
  const sup1 = data.risk_management?.stop_loss ? Math.round(data.risk_management.stop_loss).toLocaleString() : 'N/A';
  
  const trendColor = trend.trend_besar.toLowerCase().includes('bullish') ? 'text-bullish' : 'text-bearish';
  
  const todayBar = data.ohlcv_daily?.[data.ohlcv_daily.length - 1];
  const openPrice = todayBar?.open;
  const displayPrice = livePrice || data.last_price;
  const pctChange = openPrice ? ((displayPrice - openPrice) / openPrice) * 100 : 0;
  const pctSign = pctChange > 0 ? '+' : '';
  const pctColor = pctChange > 0 ? 'var(--bullish)' : (pctChange < 0 ? 'var(--bearish)' : 'var(--text-secondary)');

  return (
    <div className="bento-grid">
      {/* 1. SETUP SCORE */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1' }}>
        <div className="flex-row justify-between mb-2">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-info">SETUP SCORE</h3>
        </div>
        <div className="flex-col gap-xs mt-2">
          <div className="text-4xl font-bold text-info" style={{ textShadow: '0 0 20px rgba(96,165,250,0.4)' }}>
            {score.score_display}
          </div>
          <div className="text-sm text-secondary font-medium mt-1">{score.rating}</div>
        </div>
      </div>

      {/* 2. CURRENT PRICE */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-row items-center gap-sm mb-3">
          <div className="text-xs font-mono text-secondary tracking-widest uppercase">CURRENT PRICE ({liveLabel})</div>
          {mode === 'live' && <div className="live-dot ml-auto"></div>}
        </div>
        <div className="flex-col mt-auto" style={{ gap: '6px' }}>
          <div className="flex-row" style={{ alignItems: 'baseline', gap: '6px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <div className="text-2xl font-mono font-bold text-primary" style={{ lineHeight: '1' }}>
              {displayPrice.toLocaleString()}
            </div>
            {openPrice && (
              <div className="text-xs font-mono font-semibold" style={{ color: pctColor, opacity: 0.9 }}>
                {pctChange === 0 ? '' : (pctChange > 0 ? '▲ ' : '▼ ')}{pctChange.toFixed(2)}%
              </div>
            )}
          </div>
          <div className="text-xs text-secondary opacity-80">{formatShortDate(data.date)}</div>
        </div>
      </div>

      {/* 3. BIAS (DAILY) */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1' }}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-2">BIAS (DAILY)</h3>
        <div className="flex-col gap-xs mt-auto">
          <div className={`text-xl font-bold ${trendColor}`}>
            {trend.trend_besar}
          </div>
          <div className={`text-xs ${trendColor} opacity-80`}>
            {trend.reason}
          </div>
        </div>
      </div>

      {/* 4. BREAK LEVEL */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1' }}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-2">BREAK LEVEL</h3>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-2xl font-mono font-bold text-primary">
            {res1}
          </div>
          <div className="text-xs text-secondary">Confirmation Level</div>
        </div>
      </div>

      {/* 5. INVALIDATION */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1' }}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-2">INVALIDATION</h3>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-2xl font-mono font-bold text-bearish" style={{ textShadow: '0 0 20px rgba(244,63,94,0.3)' }}>
            {sup1}
          </div>
          <div className="text-xs text-bearish opacity-80">Below Support</div>
        </div>
      </div>
    </div>
  );
}
