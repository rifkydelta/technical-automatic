'use client';
import { useState } from 'react';
import ScreenerCard from './ScreenerCard';
import { LayoutGrid, Table as TableIcon, TrendingUp, TrendingDown, Target, Calendar, ArrowRight, Activity, Zap } from 'lucide-react';

export default function DashboardScreener({ results, onTickerClick, isLoading }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

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

  if (isLoading) {
    return (
      <div style={{ marginTop: '32px' }}>
        {/* Header with View Toggle */}
        <div className="flex-row items-center gap-sm" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 className="text-xl font-bold font-mono tracking-wider">MARKET SCREENER</h2>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <span className="text-xs text-secondary font-mono">SCANNING MARKET...</span>

          {/* View Mode Toggle Buttons */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '4px'
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: viewMode === 'table' ? '700' : '400',
                background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                color: viewMode === 'table' ? '#60a5fa' : 'var(--text-muted)'
              }}
            >
              <TableIcon size={14} /> Tabel Screener
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: viewMode === 'grid' ? '700' : '400',
                background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                color: viewMode === 'grid' ? '#60a5fa' : 'var(--text-muted)'
              }}
            >
              <LayoutGrid size={14} /> Card Grid
            </button>
          </div>
        </div>

        {viewMode === 'table' ? <ScreenerTableSkeleton /> : <ScreenerGridSkeleton />}
      </div>
    );
  }

  if (!results || results.length === 0) return null;

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header with View Toggle */}
      <div className="flex-row items-center gap-sm" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        <h2 className="text-xl font-bold font-mono tracking-wider">MARKET SCREENER</h2>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        <span className="text-xs text-secondary font-mono">{results.length} TICKERS</span>

        {/* View Mode Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: viewMode === 'table' ? '700' : '400',
              background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: viewMode === 'table' ? '#60a5fa' : 'var(--text-muted)'
            }}
          >
            <TableIcon size={14} /> Tabel Screener
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: viewMode === 'grid' ? '700' : '400',
              background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: viewMode === 'grid' ? '#60a5fa' : 'var(--text-muted)'
            }}
          >
            <LayoutGrid size={14} /> Card Grid
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Screener Table View */
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table
            className="signal-table"
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              fontSize: '13px',
              background: 'rgba(10, 12, 16, 0.6)'
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'left'
                }}
              >
                <th style={{ padding: '14px 16px' }}>Emiten</th>
                <th style={{ padding: '14px 16px' }}>Harga Sekarang</th>
                <th style={{ padding: '14px 16px' }}>Change %</th>
                <th style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={13} color="var(--bullish)" /> Target TP1
                  </div>
                </th>
                <th style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#60a5fa" /> Estimasi ke TP
                  </div>
                </th>
                <th style={{ padding: '14px 16px' }}>Trend</th>
                <th style={{ padding: '14px 16px' }}>Score</th>
                <th style={{ padding: '14px 16px' }}>Rekomendasi</th>
                <th style={{ padding: '14px 16px' }}>Volume</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => {
                const isUp = item.change_pct >= 0;
                const isUptrend = item.trend === 'Bullish' || item.trend === 'Strong Bullish';
                const tp1Val = item.tp1 || (item.last_price ? item.last_price * 1.03 : 0);
                const tp1Pct = item.tp1_pct !== undefined && item.tp1_pct !== null
                  ? item.tp1_pct
                  : (item.last_price > 0 ? (((tp1Val - item.last_price) / item.last_price) * 100).toFixed(1) : '3.0');
                const estDays = item.estimated_tp_range || (item.estimated_tp_days ? `${item.estimated_tp_days} Hari` : '2-4 Hari');

                return (
                  <tr
                    key={`${item.ticker}-${idx}`}
                    onClick={() => onTickerClick(item.ticker)}
                    className="signal-table-row"
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Emiten */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>
                          {item.ticker}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.company_name}
                        </span>
                      </div>
                    </td>

                    {/* Harga Sekarang */}
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      Rp{formatIDR(item.last_price)}
                    </td>

                    {/* Change % */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: isUp ? 'var(--bullish)' : 'var(--bearish)',
                          fontFamily: 'monospace'
                        }}
                      >
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isUp ? '+' : ''}{item.change_pct?.toFixed(2)}%
                      </div>
                    </td>

                    {/* Target TP1 */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--bullish)', fontSize: '13px' }}>
                        Rp{formatIDR(tp1Val)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--bullish)', fontWeight: '600' }}>
                        +{tp1Pct}%
                      </div>
                    </td>

                    {/* Estimasi ke TP */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(96, 165, 250, 0.1)',
                          border: '1px solid rgba(96, 165, 250, 0.2)',
                          color: '#60a5fa',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        <Calendar size={11} /> {estDays}
                      </div>
                    </td>

                    {/* Trend */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isUptrend ? 'rgba(74, 222, 128, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          border: `1px solid ${isUptrend ? 'rgba(74, 222, 128, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                          color: isUptrend ? 'var(--bullish)' : 'var(--bearish)',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        {isUptrend ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {item.trend}
                      </div>
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            background: item.relt_score >= 70 ? 'rgba(74, 222, 128, 0.2)' : item.relt_score >= 50 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: item.relt_score >= 70 ? 'var(--bullish)' : item.relt_score >= 50 ? 'var(--neutral)' : 'var(--bearish)',
                            border: `1px solid ${item.relt_score >= 70 ? 'var(--bullish)' : item.relt_score >= 50 ? 'var(--neutral)' : 'var(--bearish)'}`
                          }}
                        >
                          {item.relt_score || item.score || 0}
                        </div>
                      </div>
                    </td>

                    {/* Rekomendasi */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const rec = (item.recommendation || '').toUpperCase();
                        const isNotBuy = rec.includes('NOT BUY') || rec.includes('SELL') || rec.includes('AVOID') || rec.includes('RISK');
                        const isBuy = !isNotBuy && rec.includes('BUY');
                        const isWait = rec.includes('WAIT') || rec.includes('WATCH');
                        const bg = isNotBuy ? 'rgba(244, 63, 94, 0.15)' : (isBuy ? 'rgba(74, 222, 128, 0.15)' : (isWait ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)'));
                        const color = isNotBuy ? 'var(--bearish)' : (isBuy ? 'var(--bullish)' : (isWait ? 'var(--warning)' : 'var(--text-secondary)'));
                        const border = isNotBuy ? '1px solid rgba(244, 63, 94, 0.35)' : (isBuy ? '1px solid rgba(74, 222, 128, 0.35)' : (isWait ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)'));

                        return (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: bg,
                              color: color,
                              border: border
                            }}
                          >
                            {item.recommendation}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Volume */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatVol(item.volume)}
                      </div>
                      {item.volume_change_pct !== undefined && item.volume_change_pct !== null ? (
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                            color: item.volume_change_pct >= 0 ? 'var(--bullish)' : 'var(--bearish)'
                          }}
                        >
                          {item.volume_change_pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {item.volume_change_pct >= 0 ? `+${item.volume_change_pct}%` : `${item.volume_change_pct}%`} vs MA20
                        </div>
                      ) : (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Avg: {formatVol(item.avg_volume)}
                        </div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTickerClick(item.ticker);
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Analisis <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {results.map((item, idx) => (
            <ScreenerCard 
              key={`${item.ticker}-${idx}`} 
              data={item} 
              onClick={onTickerClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenerTableSkeleton() {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <table
        className="signal-table"
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0',
          fontSize: '13px',
          background: 'rgba(10, 12, 16, 0.6)'
        }}
      >
        <thead>
          <tr
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'left'
            }}
          >
            <th style={{ padding: '14px 16px' }}>Emiten</th>
            <th style={{ padding: '14px 16px' }}>Harga Sekarang</th>
            <th style={{ padding: '14px 16px' }}>Change %</th>
            <th style={{ padding: '14px 16px' }}>Target TP1</th>
            <th style={{ padding: '14px 16px' }}>Estimasi ke TP</th>
            <th style={{ padding: '14px 16px' }}>Trend</th>
            <th style={{ padding: '14px 16px' }}>Score</th>
            <th style={{ padding: '14px 16px' }}>Rekomendasi</th>
            <th style={{ padding: '14px 16px' }}>Volume</th>
            <th style={{ padding: '14px 16px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
              }}
            >
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '56px', height: '24px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }} />
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '64px', height: '22px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '65px', height: '14px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '75px', height: '20px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '60px', height: '20px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '26px', height: '26px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '85px', height: '22px' }} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '55px', height: '13px' }} />
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div className="skeleton skeleton-button" style={{ width: '65px', height: '26px', margin: '0 auto' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScreenerGridSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px'
    }}>
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton skeleton-badge" style={{ width: '75px', height: '26px' }} />
              <div className="skeleton skeleton-text" style={{ width: '140px', height: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div className="skeleton skeleton-text" style={{ width: '85px', height: '22px' }} />
              <div className="skeleton skeleton-badge" style={{ width: '60px', height: '18px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="skeleton" style={{ height: '54px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '54px', borderRadius: '12px' }} />
          </div>
          <div className="skeleton" style={{ height: '40px', borderRadius: '10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="skeleton skeleton-badge" style={{ width: '100px', height: '24px' }} />
            <div className="skeleton skeleton-button" style={{ width: '80px', height: '28px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
