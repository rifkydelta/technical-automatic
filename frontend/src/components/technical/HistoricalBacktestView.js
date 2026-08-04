import React, { useState } from 'react';
import { History, TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react';

export default function HistoricalBacktestView({ historicalData }) {
  const [activeTab, setActiveTab] = useState('Scalping');

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="card flex-col items-center justify-center gap-sm" style={{ padding: '48px 24px', opacity: 0.7 }}>
        <AlertTriangle size={32} className="text-secondary" />
        <div className="text-secondary font-medium">Data historical backtest tidak tersedia.</div>
      </div>
    );
  }

  // Fallback if it's not array
  const dataList = Array.isArray(historicalData) ? historicalData : [historicalData];
  const summary = dataList.find(s => s.timeframe === activeTab) || dataList[0];

  return (
    <div className="flex-col gap-md">
      
      {/* Timeframe Tabs */}
      <div className="flex-row gap-sm items-center mb-2" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <History size={16} className="text-secondary" />
        <span className="text-xs font-semibold tracking-widest uppercase text-muted mr-2">Mode Backtest:</span>
        {dataList.map(s => (
          <button 
            key={s.timeframe}
            className={`sub-tab-pill ${activeTab === s.timeframe ? 'active' : ''}`}
            onClick={() => setActiveTab(s.timeframe)}
            style={{ padding: '6px 16px', fontSize: '11px' }}
          >
            {s.timeframe}
          </button>
        ))}
      </div>

      <div className="flex-row justify-between items-center mt-2">
        <h2 className="text-xl font-bold">Historical Performance</h2>
        <div className="text-xs text-secondary bg-black bg-opacity-40 px-3 py-1 rounded-full border border-gray-800">
          Last {summary.total_trades} Trading Days
        </div>
      </div>
      <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
        Menampilkan ringkasan eksekusi otomatis strategi {activeTab} menggunakan perhitungan ATR dinamis harian selama kurang lebih sebulan ke belakang.
      </p>

      {/* Headline Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <div className="card flex-col gap-xs" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
            <Target size={12} /> Win Rate
          </span>
          <span className="text-2xl font-mono font-bold" style={{ color: summary.win_rate_pct >= 50 ? 'var(--bullish)' : 'var(--bearish)' }}>
            {summary.win_rate_pct.toFixed(1)}%
          </span>
          <span className="text-xs text-secondary">{summary.win_count} Win / {summary.loss_count} Loss</span>
        </div>

        <div className="card flex-col gap-xs" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
            <TrendingUp size={12} /> Total PnL
          </span>
          <span className="text-2xl font-mono font-bold" style={{ color: summary.total_pnl_pct >= 0 ? 'var(--bullish)' : 'var(--bearish)' }}>
            {summary.total_pnl_pct >= 0 ? '+' : ''}{summary.total_pnl_pct.toFixed(2)}%
          </span>
          <span className="text-xs text-secondary">Accumulated</span>
        </div>

        <div className="card flex-col gap-xs" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
            <Clock size={12} /> Exit at Close
          </span>
          <span className="text-2xl font-mono font-bold text-info">
            {summary.expired_count}
          </span>
          <span className="text-xs text-secondary">Tutup Pasar</span>
        </div>
      </div>

      {/* Trade Log Table */}
      <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mt-4 mb-2">Trade Log (Latest First)</h3>
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Entry</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Exit</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>PnL</th>
            </tr>
          </thead>
          <tbody>
            {summary.trade_logs.map((log, i) => {
              const isHit = log.status.includes('hit_tp');
              const isMiss = log.status === 'hit_sl';
              return (
                <tr key={i} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: isHit ? 'rgba(16, 185, 129, 0.05)' : (isMiss ? 'rgba(244, 63, 94, 0.05)' : 'transparent')
                }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{log.date}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{log.signal_type}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{Math.round(log.entry_price).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{Math.round(log.exit_price).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: isHit ? 'rgba(16, 185, 129, 0.2)' : (isMiss ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.1)'),
                      color: isHit ? 'var(--bullish)' : (isMiss ? 'var(--bearish)' : 'var(--text-secondary)')
                    }}>
                      {log.status === 'hit_tp1' ? '🎯 HIT TP1' : 
                       log.status === 'hit_tp2' ? '🚀 HIT TP2' : 
                       log.status === 'hit_sl' ? '🛑 STOP LOSS' : 
                       '⏳ EXIT AT CLOSE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: log.pnl_pct > 0 ? 'var(--bullish)' : (log.pnl_pct < 0 ? 'var(--bearish)' : 'var(--text-primary)') }}>
                    {log.pnl_pct > 0 ? '+' : ''}{log.pnl_pct.toFixed(2)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
