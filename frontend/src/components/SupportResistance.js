import { Shield, ShieldAlert } from 'lucide-react';

export default function SupportResistance({ data }) {
  if (!data || !data.support_resistance) return null;

  const { supports, resistances } = data.support_resistance;

  const ScoreIndicator = ({ score, maxScore = 5, color }) => (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: maxScore }).map((_, i) => (
        <div key={i} style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: i < score ? color : 'rgba(255,255,255,0.08)',
          boxShadow: i < score ? `0 0 6px ${color}` : 'none',
          transition: 'all 0.2s ease',
        }} />
      ))}
    </div>
  );

  const ZoneCard = ({ id, zone, strength, reason, rating, details, date_detected, isResistance }) => {
    const color = isResistance ? 'var(--bearish)' : 'var(--bullish)';
    const bgColor = isResistance ? 'rgba(244, 63, 94, 0.08)' : 'rgba(57, 255, 20, 0.08)';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '12px'
      }}>
        <div className="flex-row justify-between mb-2">
          <div style={{
            backgroundColor: bgColor,
            color: color,
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '12px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            {id}
          </div>
          <ScoreIndicator score={rating} color={color} />
        </div>
        <div className="flex-row justify-between items-end mb-2">
          <div className="text-lg font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{zone}</div>
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: color }}>
            {strength}
          </div>
        </div>

        {/* Confluence details */}
        {details && details !== reason && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '8px',
          }}>
            {details.split(' | ').map((tag, i) => (
              <span key={i} style={{
                fontSize: '9px',
                fontWeight: '300',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
                whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-muted" style={{ lineHeight: '1.4', fontWeight: '300' }}>
          {reason}
        </div>

        {date_detected && (
          <div className="text-xs text-muted" style={{ marginTop: '8px', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>
            Detected: {date_detected.split(' ')[0]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-col">
      <div className="grid-2-cols">
        {/* Support Card */}
        <div className="card flex-col gap-sm">
          <h3 className="text-sm font-semibold tracking-widest uppercase flex-row gap-sm text-bullish mb-4">
            <Shield size={16} strokeWidth={1.5} />
            Support Zones
          </h3>
          <div className="table-responsive">
            {supports.length > 0 ? (
              supports.map((s) => (
                <ZoneCard key={s.id} {...s} isResistance={false} />
              ))
            ) : (
              <div className="text-muted text-sm py-4">No support zones detected</div>
            )}
          </div>
        </div>

        {/* Resistance Card */}
        <div className="card flex-col gap-sm">
          <h3 className="text-sm font-semibold tracking-widest uppercase flex-row gap-sm text-bearish mb-4">
            <ShieldAlert size={16} strokeWidth={1.5} />
            Resistance Zones
          </h3>
          <div className="table-responsive">
            {resistances.length > 0 ? (
              resistances.map((r) => (
                <ZoneCard key={r.id} {...r} isResistance={true} />
              ))
            ) : (
              <div className="text-muted text-sm py-4">No resistance zones detected</div>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Legend */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 16px',
        marginTop: '8px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
          gap: '8px',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 1 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,0,0,0,0].map((v, i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: v ? 'var(--text-secondary)' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-muted" style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', whiteSpace: 'nowrap' }}>Weak (1)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 1 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,1,0,0,0].map((v, i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: v ? 'var(--text-secondary)' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-muted" style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', whiteSpace: 'nowrap' }}>Medium (2-3)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 1 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,1,1,1,0].map((v, i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: v ? 'var(--bullish)' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-muted" style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', whiteSpace: 'nowrap' }}>Strong (4-5)</span>
          </div>
        </div>
        <div className="text-muted" style={{ opacity: 0.5, fontSize: 'clamp(9px, 2.5vw, 12px)' }}>
          Score = Confluence dari Candlestick Pattern, Bollinger Band, EMA, RSI, MACD
        </div>
      </div>
    </div>
  );
}
