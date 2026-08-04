import { AlertCircle, Target, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export default function FooterRow({ data }) {
  if (!data) return null;

  const { risk_management: risk, recommendation, recommendation_reason } = data;

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'STRONG BUY': return 'var(--bullish)';
      case 'BUY': return 'var(--bullish)';
      case 'WATCHLIST': return 'var(--warning)';
      case 'NOT BUY': return 'var(--bearish)';
      default: return 'var(--neutral)';
    }
  };

  const color = getRecommendationColor(recommendation);

  return (
    <div className="grid-2-cols" style={{ marginBottom: '24px' }}>

      {/* Kiri: Kolom berisi 2 Card Terpisah */}
      <div className="flex-col gap-md">
        
        {/* Valuation Metrics at the top */}
        {data.valuation && (
          <div className="card flex-col">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-secondary flex-row gap-sm items-center" style={{ marginBottom: '12px' }}>
              VALUATION METRICS
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '8px' 
            }}>
              {/* Market Cap */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>Market Cap</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {data.valuation.market_cap ? (data.valuation.market_cap / 1e12).toFixed(1) + 'T' : '-'}
                </div>
              </div>
              {/* P/E */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>P/E Ratio</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {data.valuation.pe_ratio ? data.valuation.pe_ratio.toFixed(2) + 'x' : '-'}
                </div>
              </div>
              {/* P/B */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>P/B Ratio</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {data.valuation.pb_ratio ? data.valuation.pb_ratio.toFixed(2) + 'x' : '-'}
                </div>
              </div>
              {/* P/S */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>P/S Ratio</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {data.valuation.ps_ratio ? data.valuation.ps_ratio.toFixed(2) + 'x' : '-'}
                </div>
              </div>
              {/* Div Yield */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>Div Yield</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {data.valuation.dividend_yield != null ? (Math.abs(data.valuation.dividend_yield) > 1 ? data.valuation.dividend_yield.toFixed(2) : (data.valuation.dividend_yield * 100).toFixed(2)) + '%' : '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk & Reward Plan pushed to the bottom */}
        <div className="card flex-col" style={{ marginTop: 'auto' }}>
          <h3 className="text-xs font-semibold tracking-widest uppercase text-secondary flex-row gap-sm items-center" style={{ marginBottom: '12px' }}>
            RISK & REWARD PLAN
          </h3>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '12px 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)' }}>Entry Zone</th>
                  <th style={{ padding: '12px 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)' }}>Stop Loss</th>
                  <th style={{ padding: '12px 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)' }}>Target 1 (R1)</th>
                  <th style={{ padding: '12px 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)' }}>Target 2 (R2)</th>
                  <th style={{ padding: '12px 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Risk : Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--bullish)', fontWeight: 'bold', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>{risk.entry_zone}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--bearish)', fontWeight: '600', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>{Math.round(risk.stop_loss).toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--info)', fontWeight: '600', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>{Math.round(risk.target_1).toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--info)', fontWeight: '600', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>{Math.round(risk.target_2).toLocaleString()}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--bullish)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>1 : {risk.risk_reward_ratio}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {risk.is_rejected && (
            <div className="flex-row gap-sm items-center text-xs font-semibold" style={{ color: 'var(--bearish)', marginTop: '16px' }}>
              <AlertCircle size={14} /> WARNING: Setup Rejected (Ratio &lt; 1:2)
            </div>
          )}

          <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>* Note Kalkulasi:</span><br/>
            Risk = (Asumsi Entry 1% di atas Support) - Stop Loss<br/>
            Reward = Target 1 (R1) - (Asumsi Entry 1% di atas Support)
          </div>
        </div>
      </div>

      {/* Kanan: Recommendation */}
      <div className="card flex-col">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-secondary flex-row gap-sm items-center" style={{ marginBottom: '8px' }}>
          SIGNAL OUTPUT
        </h3>

        <div className="flex-col items-center justify-center" style={{
          padding: '24px 0',
          width: '100%',
          marginBottom: '8px'
        }}>
          <div className="signal-output-text" style={{
            color: color,
            fontSize: '56px',
            fontWeight: '900',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: '1',
            textAlign: 'center'
          }}>
            {recommendation}
          </div>
        </div>

        <div className="flex-row items-center justify-center gap-sm" style={{
          color: 'var(--text-primary)',
          lineHeight: '1.6',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: `1px solid ${color}40`,
          borderRadius: '9999px',
          padding: '12px 24px',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 12px ${color}10`,
          width: 'fit-content',
          margin: '0 auto',
          marginBottom: '20px'
        }}>
          <AlertCircle size={16} color={color} style={{ flexShrink: 0 }} />
          <span className="text-xs text-center" style={{ fontWeight: 300 }}>{recommendation_reason}</span>
        </div>

        <div style={{ 
          width: '100%', 
          backgroundColor: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '12px', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '12px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', width: '50%' }}>
                  Today's Volume
                </th>
                <th style={{ padding: '12px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, width: '50%' }}>
                  Avg Volume (20D)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-primary)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  {(() => {
                    if (!data.ohlcv_daily || data.ohlcv_daily.length === 0 || !data.indicators?.avg_volume) return 'N/A';
                    const todayVol = data.ohlcv_daily[data.ohlcv_daily.length - 1].volume;
                    const avgVol = data.indicators.avg_volume;
                    const formatted = Math.round(todayVol / 100).toLocaleString() + ' Lot';
                    
                    if (todayVol > avgVol * 1.2) {
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                          {formatted}
                          <TrendingUp size={16} color="var(--bullish)" />
                        </div>
                      );
                    }
                    if (todayVol < avgVol * 0.8) {
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                          {formatted}
                          <TrendingDown size={16} color="var(--bearish)" />
                        </div>
                      );
                    }
                    return formatted;
                  })()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {data.indicators && data.indicators.avg_volume 
                    ? Math.round(data.indicators.avg_volume / 100).toLocaleString() + ' Lot'
                    : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
