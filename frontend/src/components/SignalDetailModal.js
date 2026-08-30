'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Target,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  Compass,
  ArrowUpRight,
  Activity
} from 'lucide-react';

export default function SignalDetailModal({ signal, onClose, onSelectTicker }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!signal || !mounted) return null;

  const isBuy = signal.signal_type === 'BUY';
  const pnlIsPositive = signal.projected_pnl_pct >= 0;

  const modalContent = (
    <div
      className="signal-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        margin: 0,
        boxSizing: 'border-box'
      }}
    >
      <div
        className="signal-modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          background: 'rgba(15, 17, 23, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.95), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '16px',
              background: isBuy ? 'var(--bullish-bg)' : 'var(--bearish-bg)',
              border: `1px solid ${isBuy ? 'var(--bullish)' : 'var(--bearish)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {isBuy ? <TrendingUp size={24} color="var(--bullish)" /> : <TrendingDown size={24} color="var(--bearish)" />}
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isBuy ? 'var(--bullish)' : 'var(--bearish)', fontWeight: 'bold' }}>
                SIGNAL {signal.signal_type}
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {signal.relt_action || signal.signal_type}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {signal.ticker}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                IDX: {signal.ticker}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)'
                }}
              >
                {signal.relt_rating || 'Grade A'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {signal.company_name} • Signal Generated: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{signal.signal_time}</span>
            </div>
          </div>
        </div>

        {/* Quick KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          {/* Backtest Winrate */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <BarChart3 size={13} /> Backtest Win Rate
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: signal.backtest_winrate >= 60 ? 'var(--bullish)' : 'var(--neutral)' }}>
              {signal.backtest_winrate}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {signal.backtest_total_trades} trades • Tot PnL: <span style={{ color: signal.backtest_total_pnl >= 0 ? 'var(--bullish)' : 'var(--bearish)' }}>{signal.backtest_total_pnl > 0 ? `+${signal.backtest_total_pnl}%` : `${signal.backtest_total_pnl}%`}</span>
            </div>
          </div>

          {/* RELT Score */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Zap size={13} /> RELT Composite Score
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: signal.relt_score >= 70 ? 'var(--bullish)' : 'var(--info)' }}>
              {signal.relt_score}<span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Direction: <span style={{ color: signal.direction === 'UP' ? 'var(--bullish)' : 'var(--neutral)', fontWeight: 'bold' }}>{signal.direction}</span>
            </div>
          </div>

          {/* Minute Bar Open */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Clock size={13} /> Minute Bar Open
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              Rp{signal.minute_bar_open?.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Execution: Rp{signal.entry_price?.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Projected PnL */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: pnlIsPositive ? 'rgba(74, 222, 128, 0.05)' : 'rgba(244, 63, 94, 0.05)',
              border: `1px solid ${pnlIsPositive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
            }}
          >
            <div style={{ fontSize: '11px', color: pnlIsPositive ? 'var(--bullish)' : 'var(--bearish)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ArrowUpRight size={13} /> Proyeksi PnL (Close)
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: pnlIsPositive ? 'var(--bullish)' : 'var(--bearish)' }}>
              {pnlIsPositive ? `+${signal.projected_pnl_pct}%` : `${signal.projected_pnl_pct}%`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Nominal: <span style={{ color: pnlIsPositive ? 'var(--bullish)' : 'var(--bearish)', fontWeight: 'bold' }}>{pnlIsPositive ? `+Rp${signal.projected_pnl_nominal?.toLocaleString('id-ID')}` : `Rp${signal.projected_pnl_nominal?.toLocaleString('id-ID')}`}</span> / lot
            </div>
          </div>
        </div>

        {/* 1H Entry Zone Detail Section */}
        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(96, 165, 250, 0.04)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="var(--info)" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                1-Hour Multi-Timeframe Entry Confirmation
              </span>
            </div>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                background: signal.h1_entry_status === 'ENTRY NOW' ? 'var(--bullish-bg)' : 'rgba(251, 191, 36, 0.1)',
                border: `1px solid ${signal.h1_entry_status === 'ENTRY NOW' ? 'var(--bullish)' : 'var(--neutral)'}`,
                color: signal.h1_entry_status === 'ENTRY NOW' ? 'var(--bullish)' : 'var(--neutral)'
              }}
            >
              {signal.h1_entry_status}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '12px'
            }}
          >
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1H Entry Zone</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--info)', fontFamily: 'monospace', marginTop: '2px' }}>
                Rp{signal.h1_entry_zone_low?.toLocaleString('id-ID')} — Rp{signal.h1_entry_zone_high?.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status Area Entry</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
                {signal.h1_entry_status === 'ENTRY NOW' ? '✓ Harga berada tepat di dalam area ideal' : '⏳ Menunggu retracement / konfirmasi lebih lanjut'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(0, 0, 0, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--info)', fontWeight: 'bold' }}>Indikator 1H:</span> {signal.h1_confirmation || 'Konfirmasi 1H selaras dengan tren Daily.'}
          </div>
        </div>

        {/* Execution Levels (Entry, SL, TP1, TP2) */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={14} /> Posisi Eksekusi & Target R:R
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px'
            }}
          >
            {/* Entry Price */}
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Harga Eksekusi</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                Rp{signal.entry_price?.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Reference / Signal Price</div>
            </div>

            {/* Stop Loss */}
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
              <div style={{ fontSize: '11px', color: 'var(--bearish)' }}>Stop Loss (SL)</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--bearish)', fontFamily: 'monospace', marginTop: '2px' }}>
                Rp{signal.stop_loss?.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--bearish)', marginTop: '2px' }}>
                {signal.entry_price > 0 ? `-${(((signal.entry_price - signal.stop_loss) / signal.entry_price) * 100).toFixed(1)}%` : '-'}
              </div>
            </div>

            {/* TP 1 */}
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.04)', border: '1px solid rgba(74, 222, 128, 0.15)' }}>
              <div style={{ fontSize: '11px', color: 'var(--bullish)' }}>Target Profit 1 (TP1)</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--bullish)', fontFamily: 'monospace', marginTop: '2px' }}>
                Rp{signal.tp1?.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--bullish)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{signal.entry_price > 0 ? `+${(((signal.tp1 - signal.entry_price) / signal.entry_price) * 100).toFixed(1)}%` : '-'}</span>
                <span style={{ color: '#60a5fa', fontWeight: '600' }}>Est. 1-3 Hari</span>
              </div>
            </div>

            {/* TP 2 */}
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
              <div style={{ fontSize: '11px', color: 'var(--bullish)' }}>Target Profit 2 (TP2)</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--bullish)', fontFamily: 'monospace', marginTop: '2px' }}>
                Rp{signal.tp2?.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--bullish)', marginTop: '2px' }}>
                {signal.entry_price > 0 ? `+${(((signal.tp2 - signal.entry_price) / signal.entry_price) * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to switch to full analysis */}
        {onSelectTicker && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectTicker(signal.ticker);
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
              }}
            >
              <Activity size={16} /> Buka Analisis Lengkap {signal.ticker}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
