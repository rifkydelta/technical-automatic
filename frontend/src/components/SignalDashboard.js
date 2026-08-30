'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Play,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import SignalTable from './SignalTable';
import SignalDetailModal from './SignalDetailModal';

export default function SignalDashboard({ onSelectTicker }) {
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'HIT_TP' | 'HIT_SL' | 'CLOSED'
  const [minScore, setMinScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Fetch Latest Signals from Database
  const fetchLatestSignals = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sigRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/signals/latest?limit=200`),
        fetch(`${API_URL}/api/signals/stats`)
      ]);

      if (sigRes.ok) {
        const data = await sigRes.json();
        setSignals(data);
        if (data.length > 0 && !lastScanTime) {
          setLastScanTime(data[0].signal_time);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch latest signals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, lastScanTime]);

  // Initial load
  useEffect(() => {
    fetchLatestSignals();
  }, [fetchLatestSignals]);

  // 2. Trigger Scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_URL}/api/signals/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_workers: 6 })
      });

      if (res.ok) {
        const result = await res.json();
        setSignals(result.signals || []);
        setLastScanTime(result.scan_time);
        // Refresh stats
        const statsRes = await fetch(`${API_URL}/api/signals/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // 3. Auto Refresh (every 60s if enabled)
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLatestSignals();
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLatestSignals]);

  // Filter signals
  const filteredSignals = signals.filter((s) => {
    if (filterType !== 'ALL' && s.signal_type !== filterType) {
      return false;
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OPEN' && s.status !== 'OPEN') return false;
      if (statusFilter === 'HIT_TP' && !(s.status === 'HIT_TP1' || s.status === 'HIT_TP2')) return false;
      if (statusFilter === 'HIT_SL' && s.status !== 'HIT_SL') return false;
      if (statusFilter === 'CLOSED' && !(s.status === 'CLOSED' || s.status === 'HIT_TP1' || s.status === 'HIT_TP2' || s.status === 'HIT_SL')) return false;
    }
    if (minScore > 0 && s.relt_score < minScore) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase();
      return (
        s.ticker.toUpperCase().includes(q) ||
        (s.company_name && s.company_name.toUpperCase().includes(q))
      );
    }
    return true;
  });

  const buyCount = signals.filter((s) => s.signal_type === 'BUY').length;
  const sellCount = signals.filter((s) => s.signal_type === 'SELL').length;
  const openCount = signals.filter((s) => s.status === 'OPEN').length;
  const tpCount = signals.filter((s) => s.status === 'HIT_TP1' || s.status === 'HIT_TP2').length;
  const slCount = signals.filter((s) => s.status === 'HIT_SL').length;
  const closedCount = signals.filter((s) => s.status === 'CLOSED').length;
  const avgWinRate = signals.length > 0
    ? (signals.reduce((acc, s) => acc + (s.backtest_winrate || 0), 0) / signals.length).toFixed(1)
    : '0.0';

  return (
    <div className="signal-dashboard-container" style={{ padding: '8px 0', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header Banner */}
      <div
        className="card header-grid"
        style={{
          marginBottom: '28px',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(20, 20, 22, 0.4) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="flex-col" style={{ alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div className="flex-row items-center gap-sm" style={{ marginBottom: '8px' }}>
            <div className="live-dot" style={{ background: '#60a5fa', boxShadow: '0 0 12px #60a5fa' }}></div>
            <span
              className="text-xs tracking-widest font-mono uppercase"
              style={{ color: 'var(--info)', letterSpacing: '0.2em', fontWeight: '700' }}
            >
              Real-Time Signal Radar
            </span>
          </div>

          <h1
            className="text-3xl font-bold"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              letterSpacing: '-0.025em',
              marginBottom: '8px'
            }}
          >
            Algorithmic Buy/Sell Signals
          </h1>

          <p
            className="text-sm text-secondary"
            style={{
              lineHeight: '1.6',
              maxWidth: '680px',
              fontWeight: '300',
              margin: 0
            }}
          >
            Pemantauan signal buy/sell real-time terkonfirmasi multi-timeframe: penentuan area entry presisi pada TF 1 Jam untuk eksekusi signal TF Daily, lengkap dengan win rate backtest, open bar menit, dan proyeksi PnL closing.
          </p>

          {lastScanTime && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)'
              }}
            >
              <Clock size={12} /> Scan Terakhir: <span style={{ color: 'var(--text-primary)' }}>{lastScanTime}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div
          className="flex-col"
          style={{ alignItems: 'flex-end', justifyContent: 'center', position: 'relative', zIndex: 1, gap: '12px' }}
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: isScanning
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isScanning ? 'none' : '0 4px 20px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={16} className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? 'Memindai Seluruh Emiten...' : 'Scan Real-Time Signal'}
            </button>

            <button
              onClick={fetchLatestSignals}
              disabled={isLoading}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            Auto-refresh setiap 60 detik
          </label>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Total Active Signals */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="var(--info)" /> Total Signal Terdeteksi
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            {signals.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            dari hasil pemindaian BEI / IDX
          </div>
        </div>

        {/* Buy Signals */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(74, 222, 128, 0.03)',
            border: '1px solid rgba(74, 222, 128, 0.15)'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bullish)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} /> Buy Signals
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--bullish)', marginTop: '8px' }}>
            {buyCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Terfilter (Ultra, Strong & Pullback)
          </div>
        </div>

        {/* Sell Signals */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(244, 63, 94, 0.03)',
            border: '1px solid rgba(244, 63, 94, 0.15)'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bearish)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={14} /> Risk / Sell Warnings
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--bearish)', marginTop: '8px' }}>
            {sellCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Kondisi breakdown & risk alert
          </div>
        </div>

        {/* Average Backtest Win Rate */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={14} color="var(--info)" /> Rata-Rata Win Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            {avgWinRate}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Best: <span style={{ color: 'var(--bullish)', fontWeight: 'bold' }}>{stats?.best_performer || '-'}</span> ({stats?.best_pnl ? `+${stats.best_pnl}%` : '-'})
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Signal Type & Trade Lifecycle Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Filter:
          </span>

          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background: statusFilter === 'ALL' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: statusFilter === 'ALL' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
              color: statusFilter === 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            Semua ({signals.length})
          </button>

          <button
            onClick={() => setStatusFilter('OPEN')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: statusFilter === 'OPEN' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.05)',
              border: statusFilter === 'OPEN' ? '1px solid var(--bullish)' : '1px solid rgba(74, 222, 128, 0.2)',
              color: 'var(--bullish)'
            }}
          >
            🟢 Aktif / Entry ({openCount})
          </button>

          <button
            onClick={() => setStatusFilter('HIT_TP')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background: statusFilter === 'HIT_TP' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.05)',
              border: statusFilter === 'HIT_TP' ? '1px solid #60a5fa' : '1px solid rgba(96, 165, 250, 0.2)',
              color: '#60a5fa'
            }}
          >
            🚀 Hit TP ({tpCount})
          </button>

          <button
            onClick={() => setStatusFilter('HIT_SL')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background: statusFilter === 'HIT_SL' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.05)',
              border: statusFilter === 'HIT_SL' ? '1px solid var(--bearish)' : '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--bearish)'
            }}
          >
            🛑 Hit SL ({slCount})
          </button>

          <button
            onClick={() => setStatusFilter('CLOSED')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              background: statusFilter === 'CLOSED' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.05)',
              border: statusFilter === 'CLOSED' ? '1px solid var(--neutral)' : '1px solid rgba(251, 191, 36, 0.2)',
              color: 'var(--neutral)'
            }}
          >
            ⏳ Closed / Exit ({closedCount})
          </button>
        </div>

        {/* Search Input & Score Filter */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value={0}>Semua Score</option>
            <option value={60}>Score ≥ 60 (Grade B+)</option>
            <option value={70}>Score ≥ 70 (Grade A)</option>
            <option value={80}>Score ≥ 80 (Grade A+)</option>
          </select>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              gap: '8px'
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari ticker (e.g. BBCA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '160px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Signal Table */}
      <SignalTable
        signals={filteredSignals}
        onRowClick={(item) => setSelectedSignal(item)}
        onTickerSelect={onSelectTicker}
      />

      {/* Detail Modal */}
      {selectedSignal && (
        <SignalDetailModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onSelectTicker={onSelectTicker}
        />
      )}
    </div>
  );
}
