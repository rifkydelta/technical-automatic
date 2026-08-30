'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Target, Zap, Activity } from 'lucide-react';

export default function TopCards({ data, mode = 'live' }) {
  if (!data) return null;

  const score = data.setup_score || { score_display: '0/5', rating: 'N/A' };
  const trend = data.trend_analysis || { trend_besar: 'Neutral', reason: '' };
  const res1 = data.support_resistance?.resistances?.[0]?.zone?.split('-')[0] || (data.relt_signal?.tp1 ? `Rp${Math.round(data.relt_signal.tp1).toLocaleString('id-ID')}` : 'N/A');
  const sup1 = data.risk_management?.stop_loss ? `Rp${Math.round(data.risk_management.stop_loss).toLocaleString('id-ID')}` : (data.relt_signal?.stop_loss ? `Rp${Math.round(data.relt_signal.stop_loss).toLocaleString('id-ID')}` : 'N/A');
  
  // Smart Money Phase
  const smcPhase = data.smc_analysis?.current_phase || data.relt_signal?.smc_phase || 'Markup';
  const smcStructure = data.smc_analysis?.bos_choch || data.relt_signal?.smc_structure || 'Bullish Structure';

  const isUptrend = trend.trend_besar.toLowerCase().includes('bullish');
  const trendColor = isUptrend ? 'var(--bullish)' : (trend.trend_besar.toLowerCase().includes('bearish') ? 'var(--bearish)' : 'var(--neutral)');

  return (
    <div className="bento-grid">
      {/* 1. SETUP SCORE */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px' }}>
        <div className="flex-row items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-info flex-row items-center gap-xs">
            <Zap size={13} color="var(--info)" /> SETUP SCORE
          </h3>
        </div>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-3xl font-bold text-info" style={{ textShadow: '0 0 20px rgba(96,165,250,0.3)', fontFamily: 'var(--font-mono)' }}>
            {score.score_display}
          </div>
          <div className="text-xs text-secondary font-semibold mt-1">{score.rating}</div>
        </div>
      </div>

      {/* 2. SMART MONEY CONCEPTS PHASE */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px' }}>
        <div className="flex-row items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted flex-row items-center gap-xs">
            <Activity size={13} color="var(--bullish)" /> SMC PHASE
          </h3>
        </div>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-2xl font-bold" style={{ color: 'var(--bullish)', textShadow: '0 0 16px rgba(74,222,128,0.25)' }}>
            {smcPhase}
          </div>
          <div className="text-xs text-secondary opacity-80">{smcStructure}</div>
        </div>
      </div>

      {/* 3. TREN UTAMA & REGIME */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px' }}>
        <div className="flex-row items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted flex-row items-center gap-xs">
            {isUptrend ? <TrendingUp size={13} color="var(--bullish)" /> : <TrendingDown size={13} color="var(--bearish)" />}
            TREN UTAMA (1D)
          </h3>
        </div>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-xl font-bold" style={{ color: trendColor }}>
            {trend.trend_besar}
          </div>
          <div className="text-xs text-secondary opacity-80">
            {trend.reason || 'Berdasarkan Supertrend & EMA 200'}
          </div>
        </div>
      </div>

      {/* 4. BREAK LEVEL (TRIGGER) */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px' }}>
        <div className="flex-row items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted flex-row items-center gap-xs">
            <Target size={13} color="var(--text-secondary)" /> BREAK LEVEL
          </h3>
        </div>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-2xl font-mono font-bold text-primary">
            {res1}
          </div>
          <div className="text-xs text-secondary">Trigger Konfirmasi Awal</div>
        </div>
      </div>

      {/* 5. INVALIDATION (ADAPTIVE SL) */}
      <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px' }}>
        <div className="flex-row items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-muted flex-row items-center gap-xs">
            <ShieldAlert size={13} color="var(--bearish)" /> INVALIDATION
          </h3>
        </div>
        <div className="flex-col gap-xs mt-auto">
          <div className="text-2xl font-mono font-bold text-bearish" style={{ textShadow: '0 0 20px rgba(244,63,94,0.3)' }}>
            {sup1}
          </div>
          <div className="text-xs text-bearish opacity-80">Adaptive Stop Loss</div>
        </div>
      </div>
    </div>
  );
}
