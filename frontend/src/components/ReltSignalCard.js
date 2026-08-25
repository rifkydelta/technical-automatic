'use client';
import { useState, useMemo } from 'react';
import { 
  Zap, Shield, Target, ArrowUpRight, TrendingUp, TrendingDown, 
  Layers, CheckCircle2, AlertTriangle, Crosshair, DollarSign, 
  Sparkles, Compass, BarChart3, Activity, Info
} from 'lucide-react';

export default function ReltSignalCard({ data }) {
  const relt = data?.relt_signal;
  const lastPrice = data?.last_price || 0;

  // Interactive Lot Sizer state
  const [accountSize, setAccountSize] = useState(10000000); // Default IDR 10 Juta
  const [riskPercent, setRiskPercent] = useState(1.0); // Default 1%
  const [signalMode, setSignalMode] = useState('Balanced');

  if (!relt) {
    return null;
  }

  const {
    action,
    score,
    score_max,
    rating,
    trend_strength,
    is_no_trade_zone,
    smc,
    supertrend,
    trade_setup,
    direction_prediction,
    indicators
  } = relt;

  // Dynamic Lot Calculations based on local user input
  const dynamicSizing = useMemo(() => {
    const entryPrice = trade_setup?.entry_price || lastPrice;
    const stopLoss = trade_setup?.stop_loss || (entryPrice * 0.95);
    const priceRisk = Math.max(entryPrice - stopLoss, 1);
    const riskCash = accountSize * (riskPercent / 100.0);
    const rawShares = Math.floor(riskCash / priceRisk);
    const lots = Math.floor(rawShares / 100);
    const shares = lots * 100;
    const capitalRequired = shares * entryPrice;
    const maxRisk = shares * priceRisk;
    const riskPct = entryPrice > 0 ? ((priceRisk / entryPrice) * 100).toFixed(2) : '0.00';
    const tp1Pct = entryPrice > 0 ? (((trade_setup?.tp1 - entryPrice) / entryPrice) * 100).toFixed(2) : '0.00';
    const tp2Pct = entryPrice > 0 ? (((trade_setup?.tp2 - entryPrice) / entryPrice) * 100).toFixed(2) : '0.00';

    return {
      lots,
      shares,
      capitalRequired,
      maxRisk,
      riskPct,
      tp1Pct,
      tp2Pct,
      entryPrice,
      stopLoss
    };
  }, [accountSize, riskPercent, trade_setup, lastPrice]);

  // Action badge color
  const getActionTheme = (act) => {
    switch (act) {
      case 'ULTRA BUY':
        return {
          bg: 'rgba(74, 222, 128, 0.15)',
          border: 'rgba(74, 222, 128, 0.5)',
          color: '#4ade80',
          glow: '0 0 20px rgba(74, 222, 128, 0.35)',
          icon: Zap
        };
      case 'STRONG BUY':
        return {
          bg: 'rgba(34, 197, 94, 0.12)',
          border: 'rgba(34, 197, 94, 0.4)',
          color: '#22c55e',
          glow: '0 0 15px rgba(34, 197, 94, 0.25)',
          icon: TrendingUp
        };
      case 'PULLBACK BUY':
        return {
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.4)',
          color: '#38bdf8',
          glow: '0 0 15px rgba(56, 189, 248, 0.25)',
          icon: Crosshair
        };
      case 'WATCH BUY':
        return {
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.4)',
          color: '#fbbf24',
          glow: 'none',
          icon: Compass
        };
      case 'RISK WARNING':
        return {
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.5)',
          color: '#f43f5e',
          glow: '0 0 15px rgba(244, 63, 94, 0.3)',
          icon: AlertTriangle
        };
      case 'WAIT / NO TRADE':
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.15)',
          color: '#94a3b8',
          glow: 'none',
          icon: Shield
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.15)',
          color: 'var(--text-secondary)',
          glow: 'none',
          icon: Info
        };
    }
  };

  const actionTheme = getActionTheme(action);
  const ActionIcon = actionTheme.icon;

  const getScoreColor = (sc) => {
    if (sc >= 85) return '#4ade80';
    if (sc >= 70) return '#22c55e';
    if (sc >= 55) return '#38bdf8';
    if (sc >= 40) return '#fbbf24';
    return '#f43f5e';
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="card flex-col" style={{
      padding: '28px',
      gap: '24px',
      background: 'radial-gradient(ellipse at top left, rgba(74, 222, 128, 0.04), rgba(20, 20, 22, 0.6) 70%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 12px 40px -8px rgba(0,0,0,0.7)'
    }}>
      {/* 1. Header HUD Banner */}
      <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-row items-center gap-md">
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={18} style={{ color: '#4ade80' }} />
            <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.05em' }}>
              RELT SIGNAL PRO
            </span>
          </div>

          <div style={{
            padding: '8px 18px',
            background: actionTheme.bg,
            border: `1px solid ${actionTheme.border}`,
            borderRadius: '12px',
            boxShadow: actionTheme.glow,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: actionTheme.color,
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <ActionIcon size={16} />
            {action}
          </div>

          <div style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            Grade: <span style={{ fontWeight: 'bold', color: scoreColor }}>{rating}</span>
          </div>
        </div>

        {/* Score Radial / Badge */}
        <div className="flex-row items-center gap-md">
          <div className="flex-col" style={{ alignItems: 'flex-end', gap: '2px' }}>
            <span className="text-xs text-muted font-mono uppercase tracking-wider">Composite Score</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: scoreColor }}>
                {score}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
          
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#0d0e12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: scoreColor
            }}>
              {score}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Overview: SMC Checklist + Direction Prediction */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Smart Money Concepts Matrix */}
        <div style={{
          padding: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div className="flex-row items-center justify-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
            <div className="flex-row items-center gap-xs">
              <Layers size={15} style={{ color: '#38bdf8' }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Smart Money Concepts</span>
            </div>
            <span className="text-xs font-mono" style={{ color: smc?.market_phase === 'Markup' ? '#4ade80' : 'var(--text-muted)' }}>
              Fase: {smc?.market_phase || 'Accumulation'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Bullish OB */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: smc?.bullish_ob_active ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: smc?.bullish_ob_active ? '0 0 8px #4ade80' : 'none'
              }} />
              <span style={{ color: smc?.bullish_ob_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Order Block (OB): {smc?.bullish_ob_active ? '🟢 Bullish' : '⚪ Neutral'}
              </span>
            </div>

            {/* FVG */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: smc?.bullish_fvg_active ? '#4ade80' : (smc?.bearish_fvg_active ? '#f43f5e' : 'rgba(255, 255, 255, 0.2)'),
                boxShadow: smc?.bullish_fvg_active ? '0 0 8px #4ade80' : 'none'
              }} />
              <span style={{ color: smc?.bullish_fvg_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                FVG Gap: {smc?.bullish_fvg_active ? '🟢 Bullish Gap' : (smc?.bearish_fvg_active ? '🔴 Bearish Gap' : '⚪ Clear')}
              </span>
            </div>

            {/* BOS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: smc?.bos_bull ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: smc?.bos_bull ? '0 0 8px #4ade80' : 'none'
              }} />
              <span style={{ color: smc?.bos_bull ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Structure (BOS): {smc?.bos_bull ? '🟢 Bullish Break' : '⚪ In Range'}
              </span>
            </div>

            {/* Liquidity Sweep */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: smc?.liquidity_sweep_low ? '#4ade80' : (smc?.liquidity_sweep_high ? '#f43f5e' : 'rgba(255, 255, 255, 0.2)'),
                boxShadow: smc?.liquidity_sweep_low ? '0 0 8px #4ade80' : 'none'
              }} />
              <span style={{ color: smc?.liquidity_sweep_low ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Liquidity: {smc?.liquidity_sweep_low ? '🟢 Low Sweep' : (smc?.liquidity_sweep_high ? '🔴 High Fakeout' : '⚪ Normal')}
              </span>
            </div>

            {/* Supertrend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: supertrend?.st_trend === 'Bullish' ? '#4ade80' : '#f43f5e',
                boxShadow: supertrend?.st_trend === 'Bullish' ? '0 0 8px #4ade80' : 'none'
              }} />
              <span style={{ color: supertrend?.st_trend === 'Bullish' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                Supertrend: {supertrend?.st_trend} ({supertrend?.st_value ? `Rp ${Math.round(supertrend.st_value)}` : '-'})
              </span>
            </div>

            {/* Smart Money Spike */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: smc?.smart_money_buy ? '#c084fc' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: smc?.smart_money_buy ? '0 0 8px #c084fc' : 'none'
              }} />
              <span style={{ color: smc?.smart_money_buy ? '#c084fc' : 'var(--text-muted)' }}>
                Smart Money: {smc?.smart_money_buy ? '🟣 Big Spike Buy' : '⚪ Normal Flow'}
              </span>
            </div>
          </div>
        </div>

        {/* Direction Forecast (Linear Regression Projection) */}
        <div style={{
          padding: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div className="flex-row items-center justify-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
            <div className="flex-row items-center gap-xs">
              <Compass size={15} style={{ color: '#a855f7' }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Direction & Target Forecast</span>
            </div>
            <span className="text-xs text-muted font-mono">{direction_prediction?.target_bars || 12} Hari Bursa</span>
          </div>

          <div className="flex-row items-center justify-between">
            <div className="flex-col gap-xs">
              <span className="text-xs text-muted">Proyeksi Arah:</span>
              <div className="flex-row items-center gap-xs">
                {direction_prediction?.direction === 'UP' ? (
                  <TrendingUp size={20} style={{ color: '#4ade80' }} />
                ) : direction_prediction?.direction === 'DOWN' ? (
                  <TrendingDown size={20} style={{ color: '#f43f5e' }} />
                ) : (
                  <Activity size={20} style={{ color: '#fbbf24' }} />
                )}
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: direction_prediction?.direction === 'UP' ? '#4ade80' : (direction_prediction?.direction === 'DOWN' ? '#f43f5e' : '#fbbf24')
                }}>
                  {direction_prediction?.direction}
                </span>
              </div>
            </div>

            <div className="flex-col gap-xs" style={{ alignItems: 'flex-end' }}>
              <span className="text-xs text-muted">Target Harga Est.:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                Rp {Math.round(direction_prediction?.predicted_price || lastPrice).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: direction_prediction?.upside_pct > 0 ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            <span className="text-muted">Estimasi Upside Potensial:</span>
            <span style={{
              fontWeight: 'bold',
              fontFamily: 'var(--font-mono)',
              color: direction_prediction?.upside_pct > 0 ? '#4ade80' : 'var(--text-muted)'
            }}>
              {direction_prediction?.upside_pct > 0 ? `+${direction_prediction.upside_pct}%` : `${direction_prediction?.upside_pct || 0}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Trade Execution Plan & Position Sizer */}
      <div style={{
        padding: '22px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Trade Levels Grid & Visual Execution Ladder */}
        <div>
          <div className="flex-row items-center justify-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div className="flex-row items-center gap-xs">
              <Crosshair size={16} style={{ color: '#38bdf8' }} />
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Rencana Eksekusi Trading (Adaptive Risk Management)
              </span>
            </div>

            <div style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(74, 222, 128, 0.08)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}>
              <span className="text-muted">Risk/Reward:</span>
              <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#4ade80' }}>
                1 : {trade_setup?.risk_reward_ratio ? trade_setup.risk_reward_ratio.toFixed(2) : '2.00'}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}>
            {/* 1. Stop Loss Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.12) 0%, rgba(20, 20, 22, 0.6) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 4px 20px -4px rgba(244, 63, 94, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #f43f5e, transparent)'
              }} />
              <div className="flex-row items-center justify-between">
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Shield size={13} /> Stop Loss
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  color: '#f43f5e'
                }}>
                  -{dynamicSizing.riskPct}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f43f5e', lineHeight: '1.2' }}>
                  Rp {Math.round(dynamicSizing.stopLoss).toLocaleString()}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Anti Stop-Hunt Buffer
                </div>
              </div>
            </div>

            {/* 2. Entry Point Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(20, 20, 22, 0.6) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 20px -4px rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #fff, transparent)'
              }} />
              <div className="flex-row items-center justify-between">
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Target size={13} /> Harga Entry
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  PIVOT
                </span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                  Rp {Math.round(dynamicSizing.entryPrice).toLocaleString()}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Pullback / Breakout Trigger
                </div>
              </div>
            </div>

            {/* 3. Take Profit 1 Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(74, 222, 128, 0.12) 0%, rgba(20, 20, 22, 0.6) 100%)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              boxShadow: '0 4px 20px -4px rgba(74, 222, 128, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #4ade80, transparent)'
              }} />
              <div className="flex-row items-center justify-between">
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={13} /> TP 1 (1.3R)
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(74, 222, 128, 0.2)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  color: '#4ade80'
                }}>
                  +{dynamicSizing.tp1Pct}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#4ade80', lineHeight: '1.2' }}>
                  Rp {Math.round(trade_setup?.tp1 || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Ambil Profit 50% Posisi
                </div>
              </div>
            </div>

            {/* 4. Take Profit 2 Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(20, 20, 22, 0.6) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 4px 20px -4px rgba(56, 189, 248, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #38bdf8, transparent)'
              }} />
              <div className="flex-row items-center justify-between">
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <TrendingUp size={13} /> TP 2 (2.0R)
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  color: '#38bdf8'
                }}>
                  +{dynamicSizing.tp2Pct}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#38bdf8', lineHeight: '1.2' }}>
                  Rp {Math.round(trade_setup?.tp2 || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Target Runner Optimal
                </div>
              </div>
            </div>

            {/* 5. Trailing Stop Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(192, 132, 252, 0.12) 0%, rgba(20, 20, 22, 0.6) 100%)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              boxShadow: '0 4px 20px -4px rgba(192, 132, 252, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #c084fc, transparent)'
              }} />
              <div className="flex-row items-center justify-between">
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Shield size={13} /> Trailing SL
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(192, 132, 252, 0.2)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#c084fc'
                }}>
                  LOCK
                </span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#c084fc', lineHeight: '1.2' }}>
                  Rp {Math.round(trade_setup?.trailing_stop || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Kunci Keuntungan Otomatis
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive IDX Lot Calculator Bar */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(12, 16, 24, 0.95) 100%)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(74, 222, 128, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top glowing accent border */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #4ade80, #38bdf8, transparent)'
          }} />

          {/* Header Bar */}
          <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '14px' }}>
            <div className="flex-row items-center gap-sm">
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(74, 222, 128, 0.25)'
              }}>
                <DollarSign size={20} style={{ color: '#4ade80' }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.02em' }}>
                  Kalkulator Ukuran Posisi & Lot Saham IDX
                </div>
                <div className="text-xs text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                  Standar Fraksi BEI • 1 Lot = 100 Lembar Saham • Strict Risk Guard
                </div>
              </div>
            </div>

            {/* Preset Buttons Bar */}
            <div className="flex-row items-center gap-xs" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px 6px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <span className="text-xs text-muted" style={{ fontSize: '11px', marginRight: '4px' }}>Preset:</span>
              {[
                { label: '5 Juta', val: 5000000 },
                { label: '10 Juta', val: 10000000 },
                { label: '50 Juta', val: 50000000 },
                { label: '100 Juta', val: 100000000 }
              ].map((p) => {
                const isActive = accountSize === p.val;
                return (
                  <button
                    key={p.val}
                    onClick={() => setAccountSize(p.val)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: isActive ? '800' : '600',
                      borderRadius: '7px',
                      background: isActive ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%)' : 'transparent',
                      border: isActive ? '1px solid #4ade80' : '1px solid transparent',
                      color: isActive ? '#4ade80' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 0 10px rgba(74, 222, 128, 0.25)' : 'none'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column Interactive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Input 1: Modal Akun */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Total Modal Akun (IDR)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#64748b',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Rp
                </span>
                <input
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Math.max(100000, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                />
              </div>
              <div className="text-xs text-muted" style={{ fontSize: '11px' }}>
                Dana aktif: <span style={{ color: '#fff', fontWeight: 'bold' }}>Rp {accountSize.toLocaleString()}</span>
              </div>
            </div>

            {/* Input 2: Toleransi Risiko */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div className="flex-row items-center justify-between">
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                  Batas Risiko per Trade
                </label>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                  {riskPercent}% Modal
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { r: 0.5, tag: 'Aman' },
                  { r: 1.0, tag: 'Standar' },
                  { r: 2.0, tag: 'Agresif' }
                ].map((item) => {
                  const isActive = riskPercent === item.r;
                  return (
                    <button
                      key={item.r}
                      onClick={() => setRiskPercent(item.r)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: isActive ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isActive ? '#4ade80' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{item.r}%</span>
                      <span style={{ fontSize: '9px', opacity: 0.8 }}>{item.tag}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-muted" style={{ fontSize: '11px' }}>
                Maks. Toleransi Kerugian: <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>Rp {Math.round(accountSize * (riskPercent / 100)).toLocaleString()}</span>
              </div>
            </div>

            {/* Output Hero Bento Card */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
              border: '1px solid rgba(74, 222, 128, 0.35)',
              boxShadow: '0 4px 20px -4px rgba(74, 222, 128, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4ade80' }}>
                  Rekomendasi Beli Maksimal
                </div>
                <div className="flex-row items-baseline justify-between" style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#4ade80', lineHeight: '1.1' }}>
                    {dynamicSizing.lots.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '700' }}>LOT</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {dynamicSizing.shares.toLocaleString()} Lembar
                  </div>
                </div>
              </div>

              <div style={{
                paddingTop: '8px',
                borderTop: '1px solid rgba(74, 222, 128, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px'
              }}>
                <div className="flex-row justify-between">
                  <span className="text-muted">Estimasi Modal Terpakai:</span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    Rp {Math.round(dynamicSizing.capitalRequired).toLocaleString()}
                  </span>
                </div>
                <div className="flex-row justify-between">
                  <span className="text-muted">Risiko Aktual (1R):</span>
                  <span style={{ fontWeight: 'bold', color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                    Rp {Math.round(dynamicSizing.maxRisk).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
