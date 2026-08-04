import React, { useState } from 'react';
import { Target, ShieldAlert, Crosshair, Clock, Activity, ArrowRight, Play } from 'lucide-react';

export default function StrategyView({ strategiesData }) {
  const [activeTab, setActiveTab] = useState('Intraday');

  if (!strategiesData || strategiesData.length === 0) {
    return (
      <div className="card flex-col items-center justify-center gap-sm" style={{ padding: '48px 24px', opacity: 0.8, backgroundColor: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
        <ShieldAlert size={48} className="text-bearish mb-2" />
        <h3 className="text-lg font-bold text-bearish">High Risk - No Trade Recommended</h3>
        <p className="text-secondary text-center max-w-md">
          Sistem mendeteksi profil risiko yang sangat buruk atau tidak adanya momentum "Buy/Strong Buy". 
          <br/><br/>
          Sangat berisiko untuk membuka posisi baru saat ini. Silakan cari emiten lain atau *wait and see*.
        </p>
      </div>
    );
  }

  // Fallback if data is single object instead of array (backward compatibility while API updates)
  const strategies = Array.isArray(strategiesData) ? strategiesData : [strategiesData];
  const strategyData = strategies.find(s => s.timeframe === activeTab) || strategies[0];

  const getSignalColor = (type) => {
    if (type.includes('buy')) return 'var(--bullish)';
    if (type.includes('sell')) return 'var(--bearish)';
    return 'var(--neutral)';
  };

  const getGradeColor = (grade) => {
    if (['A', 'B'].includes(grade)) return 'var(--bullish)';
    if (['D', 'E'].includes(grade)) return 'var(--bearish)';
    return 'var(--neutral)';
  };

  return (
    <div className="flex-col gap-md">
      
      {/* Timeframe Tabs */}
      <div className="flex-row gap-sm items-center mb-2" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <Clock size={16} className="text-secondary" />
        <span className="text-xs font-semibold tracking-widest uppercase text-muted mr-2">Timeframe:</span>
        {strategies.map(s => (
          <button 
            key={s.timeframe || 'Default'}
            className={`sub-tab-pill ${activeTab === (s.timeframe || 'Default') ? 'active' : ''}`}
            onClick={() => setActiveTab(s.timeframe || 'Default')}
            style={{ padding: '6px 16px', fontSize: '11px' }}
          >
            {s.timeframe || 'Default'}
          </button>
        ))}
      </div>

      <div className="flex-row justify-between items-center mt-2">
        <h2 className="text-xl font-bold">Trading Strategy</h2>
        <div className="flex-row gap-sm items-center">
          <div className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: getSignalColor(strategyData.signal_type), borderColor: getSignalColor(strategyData.signal_type) }}>
            {strategyData.signal_type.replace(/_/g, ' ')}
          </div>
          <div className="text-2xl font-bold" style={{ color: getGradeColor(strategyData.grade), backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 16px', borderRadius: '8px' }}>
            {strategyData.grade}
          </div>
        </div>
      </div>

      <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
        {strategyData.description} {strategyData.context}
      </p>

      {/* Trigger Box */}
      <div className="card flex-row items-center gap-md" style={{ padding: '16px', border: `1px solid ${getSignalColor(strategyData.signal_type)}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <Target size={32} color={getSignalColor(strategyData.signal_type)} />
        <div className="flex-col">
          <span className="text-xs tracking-widest uppercase font-semibold text-muted">Action Trigger</span>
          <span className="text-lg font-bold" style={{ color: getSignalColor(strategyData.signal_type) }}>
            {Math.round(strategyData.trigger_price).toLocaleString()}
          </span>
          <span className="text-xs text-secondary mt-1">{strategyData.trigger_condition}</span>
        </div>
      </div>

      {/* Evidence / Backtest Box */}
      {strategyData.backtest && (
        <div className="card flex-col gap-sm" style={{ padding: '16px', border: strategyData.backtest.status.includes('hit') ? `1px solid ${getSignalColor('buy')}` : '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <div className="flex-row justify-between items-center">
            <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
              <Play size={12} /> Trading Mode Evidence
            </span>
            <div className="text-xs font-bold px-2 py-1 rounded-sm" style={{
              backgroundColor: strategyData.backtest.status.includes('hit_tp') ? 'rgba(16, 185, 129, 0.2)' : 
                               strategyData.backtest.status === 'hit_sl' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.1)',
              color: strategyData.backtest.status.includes('hit_tp') ? 'var(--bullish)' : 
                     strategyData.backtest.status === 'hit_sl' ? 'var(--bearish)' : 'var(--text-secondary)'
            }}>
              {strategyData.backtest.status_label}
            </div>
          </div>
          
          <div className="flex-row items-center gap-md" style={{ flexWrap: 'wrap' }}>
            {strategyData.backtest.status !== 'waiting_entry' ? (
              <>
                <div className="flex-col">
                  <span className="text-xs text-secondary">Entry Price</span>
                  <span className="font-mono font-bold">{Math.round(strategyData.backtest.entry_hit_price).toLocaleString()}</span>
                </div>
                <ArrowRight size={14} className="text-muted" />
                <div className="flex-col">
                  <span className="text-xs text-secondary">Exit Price</span>
                  <span className="font-mono font-bold">{Math.round(strategyData.backtest.exit_price).toLocaleString()}</span>
                </div>
                <div className="flex-col" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <span className="text-xs text-secondary">PnL Realized</span>
                  <span className="font-mono font-bold text-lg" style={{ color: strategyData.backtest.pnl_pct > 0 ? 'var(--bullish)' : (strategyData.backtest.pnl_pct < 0 ? 'var(--bearish)' : 'var(--text-primary)') }}>
                    {strategyData.backtest.pnl_pct > 0 ? '+' : ''}{strategyData.backtest.pnl_pct.toFixed(2)}%
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-secondary">Belum ada pergerakan harga yang menyentuh area entry pada sesi ini.</div>
            )}
          </div>
          {strategyData.backtest.time_elapsed && (
            <div className="text-xs text-muted" style={{ textAlign: 'right' }}>Durasi Eksekusi: {strategyData.backtest.time_elapsed}</div>
          )}
        </div>
      )}

      {/* Specification Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {/* Entry */}
        <div className="card flex-col gap-xs" style={{ padding: '16px' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
            <Crosshair size={12} /> Entry Area
          </span>
          <span className="text-lg font-mono font-bold text-info">
            {Math.round(strategyData.entry_low).toLocaleString()} - {Math.round(strategyData.entry_high).toLocaleString()}
          </span>
        </div>
        
        {/* Risk / Reward */}
        <div className="card flex-col gap-xs" style={{ padding: '16px' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted">Risk/Reward</span>
          <span className="text-lg font-mono font-bold text-primary">
            1 : {strategyData.risk_reward.toFixed(1)}
          </span>
        </div>

        {/* Targets */}
        <div className="card flex-col gap-xs" style={{ padding: '16px' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted">Targets (TP)</span>
          <div className="flex-row justify-between w-full">
            <div className="flex-col">
              <span className="text-xs text-secondary">TP 1</span>
              <span className="text-md font-mono font-bold text-bullish">{Math.round(strategyData.target_1).toLocaleString()}</span>
            </div>
            <div className="flex-col text-right">
              <span className="text-xs text-secondary">TP 2</span>
              <span className="text-md font-mono font-bold text-bullish">{Math.round(strategyData.target_2).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Stop Loss */}
        <div className="card flex-col gap-xs" style={{ padding: '16px' }}>
          <span className="text-xs tracking-widest uppercase font-semibold text-muted flex-row items-center gap-xs">
            <ShieldAlert size={12} /> Stop Loss
          </span>
          <div className="flex-row justify-between w-full items-end">
            <span className="text-lg font-mono font-bold text-bearish">{Math.round(strategyData.stop_loss).toLocaleString()}</span>
            <span className="text-sm font-mono text-bearish opacity-80">-{strategyData.risk_pct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}
