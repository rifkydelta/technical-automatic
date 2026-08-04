import { Activity, Clock, Zap, ArrowRightLeft, TrendingUp, TrendingDown, Minus, ArrowDownRight } from 'lucide-react';

export default function AnalysisCards({ data }) {
  if (!data) return null;

  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase text-primary">{title}</h3>
    </div>
  );

  const TableContainer = ({ children }) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        {children}
      </table>
    </div>
  );

  const Td = ({ children, align = 'left', color = 'var(--text-primary)', bold = false, mono = false, muted = false, noBorder = false }) => (
    <td style={{ 
      padding: '12px', 
      fontSize: '13px', 
      textAlign: align, 
      color: muted ? 'var(--text-secondary)' : color,
      fontWeight: bold ? '600' : '500',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      borderBottom: noBorder ? 'none' : '1px solid rgba(255,255,255,0.05)'
    }}>
      {children}
    </td>
  );

  const getTrendIcon = (trend) => {
    if (!trend) return <Minus size={14} color="var(--neutral)" />;
    const t = trend.toLowerCase();
    if (t.includes('bullish')) return <TrendingUp size={14} color="var(--bullish)" />;
    if (t.includes('bearish')) return <TrendingDown size={14} color="var(--bearish)" />;
    if (t.includes('pullback')) return <ArrowDownRight size={14} color="var(--warning)" />;
    return <Minus size={14} color="var(--neutral)" />;
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'var(--neutral)';
    const t = trend.toLowerCase();
    if (t.includes('bullish')) return 'var(--bullish)';
    if (t.includes('bearish')) return 'var(--bearish)';
    if (t.includes('pullback')) return 'var(--warning)';
    return 'var(--neutral)';
  };

  const getMacdText = () => {
    if (!data.indicators.macd || !data.indicators.macd_signal) return 'N/A';
    return data.indicators.macd > data.indicators.macd_signal ? 'Golden Cross' : 'Death Cross';
  };

  const getTop3Prices = (areaStr) => {
    if (!areaStr || typeof areaStr !== 'string') return areaStr || '-';
    if (areaStr === 'N/A' || areaStr === '-') return areaStr;
    const parts = areaStr.split(', ');
    if (parts.length <= 3) return areaStr;
    
    const sortedParts = [...parts].sort((a, b) => {
      const numA = parseFloat(a.replace(/,/g, ''));
      const numB = parseFloat(b.replace(/,/g, ''));
      return numB - numA;
    });
    
    return sortedParts.slice(0, 3).join(', ');
  };

  return (
    <div className="grid-4-cols" style={{ marginBottom: '24px' }}>
      
      {/* 1. Trend Overview */}
      <div className="card flex-col" style={{ padding: '20px' }}>
        <SectionHeader title="TREND OVERVIEW" />
        <TableContainer>
          <tbody>
            <tr>
              <Td muted>Trend Besar</Td>
              <Td align="right" color={getTrendColor(data.trend_analysis.trend_besar)} bold>
                {data.trend_analysis.trend_besar === 'Bullish' ? 'UP' : 'DOWN'}
              </Td>
            </tr>
            <tr>
              <Td muted>Price Position</Td>
              <Td align="right">{data.last_price > (data.indicators.ema200 || 0) ? 'Above EMA200' : 'Below EMA200'}</Td>
            </tr>
            <tr>
              <Td muted>EMA20</Td>
              <Td align="right" color="var(--bullish)" mono>{Math.round(data.indicators.ema20 || 0).toLocaleString()}</Td>
            </tr>
            <tr>
              <Td muted>EMA50</Td>
              <Td align="right" color="var(--bullish)" mono>{Math.round(data.indicators.ema50 || 0).toLocaleString()}</Td>
            </tr>
            <tr>
              <Td muted>EMA200</Td>
              <Td align="right" color="var(--bullish)" mono>{Math.round(data.indicators.ema200 || 0).toLocaleString()}</Td>
            </tr>
            <tr>
              <Td muted>Structure</Td>
              <Td align="right" color="var(--bullish)">{data.market_structure.structure.split(' ')[0]}</Td>
            </tr>
            <tr>
              <Td muted noBorder>ADX (Daily)</Td>
              <Td align="right" color="var(--bullish)" noBorder>
                {`${data.indicators.adx ? data.indicators.adx.toFixed(1) : 'N/A'} (${data.indicators.adx > 25 ? 'Strong' : (data.indicators.adx > 20 ? 'Emerging' : 'Weak')})`}
              </Td>
            </tr>
          </tbody>
        </TableContainer>
      </div>

      {/* 2. Multi Timeframe */}
      <div className="card flex-col" style={{ padding: '20px' }}>
        <SectionHeader title="MULTI TIMEFRAME" />
        <TableContainer>
          <tbody>
            <tr>
              <Td muted>Daily (1D)</Td>
              <Td>
                <div className="flex-col gap-xs">
                  <span className="font-semibold flex-row gap-xs items-center" style={{ color: getTrendColor(data.multi_timeframe.daily) }}>
                    {getTrendIcon(data.multi_timeframe.daily)} {data.multi_timeframe.daily}
                  </span>
                  <span className="text-xs text-muted leading-tight">{data.multi_timeframe.daily_desc}</span>
                </div>
              </Td>
            </tr>
            <tr>
              <Td muted>1 Hour (1H)</Td>
              <Td>
                <div className="flex-col gap-xs">
                  <span className="font-semibold flex-row gap-xs items-center" style={{ color: getTrendColor(data.multi_timeframe.h1) }}>
                    {getTrendIcon(data.multi_timeframe.h1)} {data.multi_timeframe.h1}
                  </span>
                  <span className="text-xs text-muted leading-tight">{data.multi_timeframe.h1_desc}</span>
                </div>
              </Td>
            </tr>
            <tr>
              <Td muted>15 Min (15M)</Td>
              <Td>
                <div className="flex-col gap-xs">
                  <span className="font-semibold flex-row gap-xs items-center" style={{ color: getTrendColor(data.multi_timeframe.m15) }}>
                    {getTrendIcon(data.multi_timeframe.m15)} {data.multi_timeframe.m15}
                  </span>
                  <span className="text-xs text-muted leading-tight">{data.multi_timeframe.m15_desc}</span>
                </div>
              </Td>
            </tr>
            <tr>
              <Td muted noBorder>Alignment</Td>
              <Td color={data.multi_timeframe.alignment === 'Confirmed' ? 'var(--neutral)' : 'var(--warning)'} bold noBorder>
                {data.multi_timeframe.alignment}
              </Td>
            </tr>
          </tbody>
        </TableContainer>
      </div>

      {/* 3. Momentum & Indicators */}
      <div className="card flex-col" style={{ padding: '20px' }}>
        <SectionHeader title="MOMENTUM & INDICATORS" />
        <TableContainer>
          <tbody>
            <tr>
              <Td muted>RSI (Daily)</Td>
              <Td align="center" mono>{data.indicators.rsi ? data.indicators.rsi.toFixed(1) : 'N/A'}</Td>
              <Td align="right">Neutral</Td>
            </tr>
            <tr>
              <Td muted>Stoch RSI</Td>
              <Td align="center" mono>{data.indicators.stoch_rsi ? data.indicators.stoch_rsi.toFixed(1) : 'N/A'}</Td>
              <Td align="right" color="var(--bullish)">Cross ↑</Td>
            </tr>
            <tr>
              <Td muted>MACD (1D)</Td>
              <Td align="center">{getMacdText()}</Td>
              <Td align="right" color="var(--bullish)">Bullish</Td>
            </tr>
            <tr>
              <Td muted>Volume</Td>
              <Td align="center" mono>1.45x</Td>
              <Td align="right" color="var(--bullish)">Above Avg</Td>
            </tr>
            <tr>
              <Td muted>ATR (14)</Td>
              <Td align="center" mono>{data.indicators.atr ? data.indicators.atr.toFixed(1) : 'N/A'}</Td>
              <Td align="right">Normal</Td>
            </tr>
            <tr>
              <Td muted>VWAP</Td>
              <Td align="center" mono>{data.indicators.vwap ? Math.round(data.indicators.vwap).toLocaleString() : 'N/A'}</Td>
              <Td align="right" color="var(--bullish)">Above</Td>
            </tr>
            <tr>
              <Td muted noBorder>Bollinger</Td>
              <Td align="center" noBorder>Middle Zone</Td>
              <Td align="right" noBorder>Neutral</Td>
            </tr>
          </tbody>
        </TableContainer>
      </div>

      {/* 4. Order Flow */}
      {data.order_flow && (
        <div className="card flex-col" style={{ padding: '20px' }}>
          <SectionHeader title="ORDER FLOW & HAKA/HAKI" />
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', width: '35%' }}>Indikator</th>
                  <th style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, width: '65%' }}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>Status</td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div className="flex-col" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: data.order_flow.status_color, fontWeight: 600 }}>{data.order_flow.status_icon} {data.order_flow.status}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.order_flow.status_desc}</span>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>Buy Dominance (HAKA)</td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div className="flex-col" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{data.order_flow.buy_dominance_pct}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.order_flow.buy_dominance_desc}</span>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>Kondisi HAKA/HAKI</td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div className="flex-col" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{data.order_flow.haka_condition}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.order_flow.haka_condition_desc}</span>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>Bandar Activity</td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div className="flex-col" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: data.order_flow.bandar_activity_color, fontWeight: 600 }}>{data.order_flow.bandar_activity_icon} {data.order_flow.bandar_activity}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.order_flow.bandar_activity_desc}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>Area Transaksi</td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div className="flex-col" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{getTop3Prices(data.order_flow.bandar_area)}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.order_flow.bandar_area_desc}</span>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} color="var(--bullish)" />
              Automated 1-min Vol Profiling
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
