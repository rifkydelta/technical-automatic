import React from 'react';
import { AlertCircle, Target, TrendingUp, TrendingDown, ShieldCheck, CheckCircle2, DollarSign, Activity } from 'lucide-react';

export default function FooterRow({ data }) {
  if (!data) return null;

  const { risk_management: risk, recommendation, recommendation_reason, valuation } = data;

  const getRecommendationColor = (rec) => {
    const r = (rec || '').toUpperCase();
    if (r.includes('NOT BUY') || r.includes('SELL') || r.includes('AVOID')) return 'var(--bearish)';
    if (r.includes('BUY')) return 'var(--bullish)';
    if (r.includes('WAIT') || r.includes('WATCH')) return 'var(--warning)';
    return 'var(--neutral)';
  };

  const color = getRecommendationColor(recommendation);

  // Volume calculations
  const todayBar = data.ohlcv_daily?.[data.ohlcv_daily.length - 1];
  const todayVol = todayBar?.volume || 0;
  const avgVol = data.indicators?.avg_volume || data.vol_ma20 || 1;
  const volRatio = (todayVol / avgVol);

  return (
    <div className="grid-2-cols" style={{ marginBottom: '24px', gap: '20px' }}>
      {/* Left Card: Valuation & Financial Multiples */}
      <div className="card flex-col" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-secondary flex-row gap-sm items-center" style={{ marginBottom: '16px' }}>
          <DollarSign size={14} color="var(--info)" /> RINGKASAN VALUASI PASAR
        </h3>

        {valuation ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' }}>
            {/* Market Cap */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Market Cap</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {valuation.market_cap ? `Rp${(valuation.market_cap / 1e12).toFixed(1)}T` : '-'}
              </div>
            </div>

            {/* P/E */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>P/E Ratio</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {valuation.pe_ratio ? `${valuation.pe_ratio.toFixed(1)}x` : '-'}
              </div>
            </div>

            {/* P/B */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>P/B Ratio</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {valuation.pb_ratio ? `${valuation.pb_ratio.toFixed(1)}x` : '-'}
              </div>
            </div>

            {/* P/S */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>P/S Ratio</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {valuation.ps_ratio ? `${valuation.ps_ratio.toFixed(1)}x` : '-'}
              </div>
            </div>

            {/* Div Yield */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Div Yield</div>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--bullish)' }}>
                {valuation.dividend_yield != null ? `${(Math.abs(valuation.dividend_yield) > 1 ? valuation.dividend_yield : valuation.dividend_yield * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Data valuasi tidak tersedia.</div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="var(--bullish)" />
          Standar Fraksi BEI • 1 Lot = 100 Lembar Saham
        </div>
      </div>

      {/* Right Card: Liquidity & Execution Safety Checklist */}
      <div className="card flex-col justify-between" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-secondary flex-row gap-sm items-center" style={{ marginBottom: '14px' }}>
          <Activity size={14} color="var(--bullish)" /> LIKUIDITAS & KONFIRMASI VOLUME
        </h3>

        {/* Volume Metric Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Volume Hari Ini</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-primary)' }}>
              {Math.round(todayVol / 100).toLocaleString('id-ID')} Lot
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Volume (MA20)</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-secondary)' }}>
              {Math.round(avgVol / 100).toLocaleString('id-ID')} Lot
            </div>
          </div>
        </div>

        {/* Reason / Checklist Note */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${color}35`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={15} color={color} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.4' }}>
            {recommendation_reason || 'Disarankan mengikuti rencana eksekusi pada kartu RELT Signal Pro.'}
          </span>
        </div>
      </div>
    </div>
  );
}
