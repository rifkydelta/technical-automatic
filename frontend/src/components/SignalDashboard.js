'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw
} from 'lucide-react';
import SignalTable from './SignalTable';
import SignalDetailModal from './SignalDetailModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SignalDashboard({ onSelectTicker }) {
  const searchParams = useSearchParams();
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

  // Pagination & Datepicker State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  // 1. Fetch Paginated Signals from Database
  const fetchPaginatedSignals = useCallback(async (
    targetPage = currentPage,
    targetPageSize = pageSize,
    targetType = filterType,
    targetStatus = statusFilter,
    targetDate = selectedDate,
    targetScore = minScore,
    targetSearch = searchQuery
  ) => {
    setIsLoading(true);
    try {
      const url = new URL(`${API_URL}/api/signals/paginated`);
      url.searchParams.set('page', String(targetPage));
      url.searchParams.set('page_size', String(targetPageSize));
      if (targetType && targetType !== 'ALL') url.searchParams.set('signal_type', targetType);
      if (targetStatus && targetStatus !== 'ALL') url.searchParams.set('status', targetStatus);
      if (targetDate && targetDate.trim()) url.searchParams.set('signal_date', targetDate.trim());
      if (targetScore > 0) url.searchParams.set('min_score', String(targetScore));
      if (targetSearch && targetSearch.trim()) url.searchParams.set('search', targetSearch.trim());

      const [sigRes, statsRes] = await Promise.all([
        fetch(url.toString()),
        fetch(`${API_URL}/api/signals/stats`)
      ]);

      if (sigRes.ok) {
        const data = await sigRes.json();
        setSignals(data.items || []);
        setTotalItems(data.total_items || 0);
        setTotalPages(data.total_pages || 1);
        setCurrentPage(data.current_page || 1);
        if (data.available_dates && data.available_dates.length > 0) {
          setAvailableDates(data.available_dates);
        }
        if (data.items && data.items.length > 0 && !lastScanTime) {
          setLastScanTime(data.items[0].signal_time);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch paginated signals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, currentPage, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery, lastScanTime]);

  // Sync initial query params if present and fetch filtered data
  useEffect(() => {
    if (!searchParams) return;
    const typeParam = searchParams.get('type') || 'ALL';
    const statusParam = searchParams.get('status') || 'ALL';
    const scoreParam = searchParams.get('minScore');
    const searchParam = searchParams.get('search');
    const dateParam = searchParams.get('date');

    const cleanType = typeParam.toUpperCase();
    const cleanStatus = statusParam.toUpperCase();
    const cleanDate = dateParam || '';
    const cleanScore = Number(scoreParam) || 0;
    const cleanSearch = searchParam || '';

    setFilterType(cleanType);
    setStatusFilter(cleanStatus);
    setSelectedDate(cleanDate);
    setMinScore(cleanScore);
    setSearchQuery(cleanSearch);

    fetchPaginatedSignals(1, pageSize, cleanType, cleanStatus, cleanDate, cleanScore, cleanSearch);
  }, [searchParams]);

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
        // Refresh paginated data & stats
        fetchPaginatedSignals(1, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery);
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
        fetchPaginatedSignals(currentPage, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchPaginatedSignals, currentPage, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery]);

  // Handle Page Change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchPaginatedSignals(newPage, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Handle Page Size Change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchPaginatedSignals(1, newSize, filterType, statusFilter, selectedDate, minScore, searchQuery);
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (st) => {
    setStatusFilter(st);
    setCurrentPage(1);
    fetchPaginatedSignals(1, pageSize, filterType, st, selectedDate, minScore, searchQuery);
  };

  // Handle Date Filter Change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setCurrentPage(1);
    fetchPaginatedSignals(1, pageSize, filterType, statusFilter, newDate, minScore, searchQuery);
  };

  // Handle Min Score Change
  const handleScoreChange = (newScore) => {
    setMinScore(newScore);
    setCurrentPage(1);
    fetchPaginatedSignals(1, pageSize, filterType, statusFilter, selectedDate, newScore, searchQuery);
  };

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
    fetchPaginatedSignals(1, pageSize, filterType, statusFilter, selectedDate, minScore, val);
  };

  const buyCount = signals.filter((s) => s.signal_type === 'BUY').length;
  const sellCount = signals.filter((s) => s.signal_type === 'SELL').length;
  const openCount = signals.filter((s) => s.status === 'OPEN').length;
  const tpCount = signals.filter((s) => s.status === 'HIT_TP1' || s.status === 'HIT_TP2' || (s.status === 'CLOSED' && s.actual_pnl_pct > 0)).length;
  const slCount = signals.filter((s) => s.status === 'HIT_SL' || (s.status === 'CLOSED' && s.actual_pnl_pct < 0)).length;
  const closedCount = signals.filter((s) => s.status === 'CLOSED' || s.status === 'HIT_TP1' || s.status === 'HIT_TP2' || s.status === 'HIT_SL').length;
  const avgWinRate = signals.length > 0
    ? (signals.reduce((acc, s) => acc + (s.backtest_winrate || 0), 0) / signals.length).toFixed(1)
    : (stats?.avg_winrate ? stats.avg_winrate.toFixed(1) : '0.0');

  const totalDisplay = stats?.total_signals || 2860;
  const openDisplay = stats?.open_signals_count ?? openCount;
  const tpDisplay = stats?.hit_tp_count ?? tpCount;
  const slDisplay = stats?.hit_sl_count ?? slCount;
  const closedDisplay = stats?.closed_count ?? closedCount;

  // Render Page Number Buttons (Smart Window)
  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: currentPage === i ? '800' : '600',
            fontFamily: 'monospace',
            background: currentPage === i ? '#38bdf8' : 'rgba(255, 255, 255, 0.04)',
            border: currentPage === i ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
            color: currentPage === i ? '#080b12' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

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
              onClick={() => fetchPaginatedSignals(currentPage, pageSize, filterType, statusFilter, selectedDate, minScore, searchQuery)}
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
            <Radio size={14} color="var(--info)" /> Sinyal Terfilter / Ditampilkan
          </div>
          {isLoading && signals.length === 0 ? (
            <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px', marginTop: '8px' }} />
          ) : (
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {totalItems.toLocaleString('id-ID')}
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {selectedDate ? `Sesi tanggal ${selectedDate}` : `dari total ${totalDisplay.toLocaleString('id-ID')} sinyal di DB`}
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
          {isLoading && signals.length === 0 ? (
            <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px', marginTop: '8px' }} />
          ) : (
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--bullish)', marginTop: '8px' }}>
              {stats?.buy_count || buyCount}
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Sinyal BUY aktif di radar BEI
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
          {isLoading && signals.length === 0 ? (
            <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px', marginTop: '8px' }} />
          ) : (
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--bearish)', marginTop: '8px' }}>
              {stats?.sell_count || sellCount}
            </div>
          )}
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
          {isLoading && signals.length === 0 ? (
            <div className="skeleton skeleton-text" style={{ width: '80px', height: '32px', marginTop: '8px' }} />
          ) : (
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {avgWinRate}%
            </div>
          )}
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
            onClick={() => handleStatusFilterChange('ALL')}
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
            Semua ({totalDisplay})
          </button>

          <button
            onClick={() => handleStatusFilterChange('OPEN')}
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
            🟢 Aktif / Entry ({openDisplay})
          </button>

          <button
            onClick={() => handleStatusFilterChange('HIT_TP')}
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
            🚀 Hit TP ({tpDisplay})
          </button>

          <button
            onClick={() => handleStatusFilterChange('HIT_SL')}
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
            🛑 Hit SL ({slDisplay})
          </button>

          <button
            onClick={() => handleStatusFilterChange('CLOSED')}
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
            🏁 Closed Trade ({closedDisplay})
          </button>
        </div>

        {/* Datepicker, Search Input & Score Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Calendar Date Picker Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              border: selectedDate ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '5px 10px',
              gap: '6px',
              transition: 'border-color 0.15s ease'
            }}
          >
            <Calendar size={13} color={selectedDate ? '#38bdf8' : 'var(--text-muted)'} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              title="Pilih tanggal sinyal spesifik"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: selectedDate ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '12px',
                fontFamily: 'monospace',
                cursor: 'pointer',
                colorScheme: 'dark'
              }}
            />
            {selectedDate && (
              <button
                onClick={() => handleDateChange('')}
                title="Hapus filter tanggal (tampilkan semua)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Date Select Dropdown */}
          {availableDates.length > 0 && (
            <select
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              <option value="">Semua Sesi Tanggal</option>
              {availableDates.slice(0, 15).map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date} ({d.count} sinyal)
                </option>
              ))}
            </select>
          )}

          {/* Score Selector */}
          <select
            value={minScore}
            onChange={(e) => handleScoreChange(Number(e.target.value))}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value={0}>Semua Score</option>
            <option value={60}>Score ≥ 60 (B+)</option>
            <option value={70}>Score ≥ 70 (A)</option>
            <option value={80}>Score ≥ 80 (A+)</option>
          </select>

          {/* Search Input */}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '140px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Signal Table */}
      <SignalTable
        signals={signals}
        onRowClick={(item) => setSelectedSignal(item)}
        onTickerSelect={onSelectTicker}
        isLoading={isLoading}
      />

      {/* Pagination Controller Bar */}
      <div
        className="card"
        style={{
          marginTop: '16px',
          padding: '14px 20px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Left: Range and total records */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Menampilkan <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> - <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{Math.min(currentPage * pageSize, totalItems)}</strong> dari <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{totalItems.toLocaleString('id-ID')}</strong> sinyal
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
              <option value={100}>100 / halaman</option>
              <option value={200}>200 / halaman</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: currentPage <= 1 ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: currentPage <= 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Halaman Pertama"
          >
            <ChevronsLeft size={14} /> Awal
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: currentPage <= 1 ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: currentPage <= 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page number indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 4px' }}>
            {renderPageNumbers()}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: currentPage >= totalPages ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: currentPage >= totalPages ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Halaman Berikutnya"
          >
            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: currentPage >= totalPages ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: currentPage >= totalPages ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Halaman Terakhir"
          >
            Akhir <ChevronsRight size={14} />
          </button>
        </div>
      </div>

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
