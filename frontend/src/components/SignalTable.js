'use client';
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Target,
  Shield,
  Compass,
  ChevronUp,
  ChevronDown,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function SignalTable({ signals = [], onRowClick, onTickerSelect, isLoading = false }) {
  const [sortField, setSortField] = useState('relt_score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredSignals = signals.filter((item) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      const matchTicker = item.ticker?.toUpperCase().includes(q);
      const matchName = item.company_name?.toUpperCase().includes(q);
      if (!matchTicker && !matchName) return false;
    }

    // 2. Category / Status Filter
    if (filterCategory === 'OPEN') return item.status === 'OPEN';
    if (filterCategory === 'GRADE_A') return item.relt_rating?.includes('A');
    if (filterCategory === 'STRONG_BUY') {
      const act = item.relt_action?.toUpperCase() || '';
      return act.includes('STRONG') || act.includes('ULTRA');
    }
    if (filterCategory === 'HIT_TP') return item.status === 'HIT_TP1' || item.status === 'HIT_TP2';
    if (filterCategory === 'HIT_SL') return item.status === 'HIT_SL';

    return true;
  });

  const sortedSignals = [...filteredSignals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  // Counts for filter pills
  const countOpen = signals.filter(s => s.status === 'OPEN').length;
  const countGradeA = signals.filter(s => s.relt_rating?.includes('A')).length;
  const countUltra = signals.filter(s => (s.relt_action || '').includes('STRONG') || (s.relt_action || '').includes('ULTRA')).length;
  const countTP = signals.filter(s => s.status === 'HIT_TP1' || s.status === 'HIT_TP2').length;
  const countSL = signals.filter(s => s.status === 'HIT_SL').length;

  const FILTER_PILLS = [
    { id: 'ALL', label: 'Semua Sinyal', count: signals.length },
    { id: 'OPEN', label: '🟢 Hanya OPEN', count: countOpen, color: 'var(--bullish)' },
    { id: 'GRADE_A', label: '⭐ Grade A / A+', count: countGradeA, color: '#60a5fa' },
    { id: 'STRONG_BUY', label: '⚡ Ultra / Strong Buy', count: countUltra, color: '#38bdf8' },
    { id: 'HIT_TP', label: '🎯 Target Hit (TP)', count: countTP, color: '#4ade80' },
    { id: 'HIT_SL', label: '🛑 Stop Loss Hit', count: countSL, color: '#f43f5e' },
  ];

  if (!signals || signals.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Zap size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Belum ada signal aktif yang terdeteksi
        </div>
        <div style={{ fontSize: '13px', marginTop: '6px' }}>
          Klik tombol <strong>"Scan Real-Time Signal"</strong> di atas untuk memindai seluruh emiten BEI / IDX.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Interactive Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {FILTER_PILLS.map((pill) => {
            const isActive = filterCategory === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setFilterCategory(pill.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isActive ? `1px solid ${pill.color || '#ffffff'}` : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{pill.label}</span>
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ticker Search Box */}
        <div style={{ minWidth: '220px', flex: '1 1 220px', maxWidth: '340px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode saham (misal: VKTR, BBCA)..."
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Signal Table Container */}
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
            <th
              onClick={() => handleSort('signal_date')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> Tanggal / Jam {renderSortIndicator('signal_date')}
              </div>
            </th>

            <th
              onClick={() => handleSort('ticker')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Emiten {renderSortIndicator('ticker')}
              </div>
            </th>

            <th
              onClick={() => handleSort('backtest_winrate')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Backtest WR% {renderSortIndicator('backtest_winrate')}
              </div>
            </th>

            <th
              onClick={() => handleSort('signal_type')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Signal {renderSortIndicator('signal_type')}
              </div>
            </th>

            <th
              onClick={() => handleSort('relt_score')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={13} /> Score {renderSortIndicator('relt_score')}
              </div>
            </th>

            <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Compass size={13} /> Area Entry (1H)
              </div>
            </th>

            <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={13} /> Eksekusi & SL
              </div>
            </th>

            <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
              TP1 / TP2
            </th>

            <th
              onClick={() => handleSort('minute_bar_open')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Min. Open {renderSortIndicator('minute_bar_open')}
              </div>
            </th>

            <th
              onClick={() => handleSort('status')}
              style={{ padding: '14px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={13} /> Status & PnL {renderSortIndicator('status')}
              </div>
            </th>

            <th style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                }}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '12px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40px', height: '10px' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="skeleton skeleton-badge" style={{ width: '52px', height: '24px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '90px', height: '12px' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '55px', height: '22px' }} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '70px', height: '22px' }} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-avatar" style={{ width: '26px', height: '26px' }} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '75px', height: '13px' }} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '12px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '50px', height: '10px' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '12px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '12px' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '45px', height: '20px' }} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '80px', height: '22px' }} />
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div className="skeleton skeleton-button" style={{ width: '60px', height: '26px', margin: '0 auto' }} />
                </td>
              </tr>
            ))
          ) : (
            sortedSignals.map((item, index) => {
              const isBuy = item.signal_type === 'BUY';
              const rawDate = item.signal_date || (item.signal_time ? item.signal_time.slice(0, 10) : '');
            let dateFormatted = '';
            if (rawDate && rawDate.includes('-')) {
              const datePart = rawDate.split(' ')[0];
              const [y, m, d] = datePart.split('-');
              const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const mIdx = parseInt(m, 10);
              dateFormatted = `${parseInt(d, 10)} ${monthNames[mIdx] || m}`;
            }
            const timeFormatted = item.signal_time
              ? (item.signal_time.trim().split(' ').pop()?.slice(0, 5) || '16:00')
              : '16:00';
            
            const isOpen = item.status === 'OPEN';
            const pnlVal = isOpen ? (item.projected_pnl_pct || 0) : (item.actual_pnl_pct || 0);
            const pnlPos = pnlVal >= 0;

            // Status Badge Formatting
            let statusBadge = {
              text: 'OPEN (LIVE)',
              bg: 'rgba(74, 222, 128, 0.15)',
              color: 'var(--bullish)',
              border: 'rgba(74, 222, 128, 0.3)'
            };

            if (item.status === 'HIT_TP2') {
              statusBadge = {
                text: '🚀 HIT TP2',
                bg: 'rgba(96, 165, 250, 0.18)',
                color: '#60a5fa',
                border: 'rgba(96, 165, 250, 0.4)'
              };
            } else if (item.status === 'HIT_TP1') {
              statusBadge = {
                text: '🎯 HIT TP1',
                bg: 'rgba(74, 222, 128, 0.18)',
                color: '#4ade80',
                border: 'rgba(74, 222, 128, 0.4)'
              };
            } else if (item.status === 'HIT_SL') {
              statusBadge = {
                text: '🛑 STOP LOSS',
                bg: 'rgba(244, 63, 94, 0.18)',
                color: '#f43f5e',
                border: 'rgba(244, 63, 94, 0.4)'
              };
            } else if (item.status === 'CLOSED') {
              const isProfitable = item.actual_pnl_pct > 0 || (item.actual_exit_price && item.actual_exit_price > item.entry_price);
              statusBadge = {
                text: isProfitable ? '✨ PROFIT EXIT' : '⏳ EXIT AT CLOSE',
                bg: isProfitable ? 'rgba(52, 211, 153, 0.18)' : 'rgba(251, 191, 36, 0.18)',
                color: isProfitable ? '#34d399' : '#fbbf24',
                border: isProfitable ? 'rgba(52, 211, 153, 0.4)' : 'rgba(251, 191, 36, 0.4)'
              };
            }

            return (
              <tr
                key={item.id || `${item.ticker}-${index}`}
                onClick={() => onRowClick && onRowClick(item)}
                className="signal-table-row"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Candle Date & Time */}
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {dateFormatted || 'Terbaru'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {timeFormatted} WIB
                  </div>
                </td>

                {/* Ticker & Name */}
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

                {/* Backtest Winrate */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: '700',
                        fontSize: '14px',
                        color: item.backtest_winrate >= 60 ? 'var(--bullish)' : 'var(--neutral)'
                      }}
                    >
                      {item.backtest_winrate}%
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.backtest_total_trades} trades • <span style={{ color: item.backtest_total_pnl >= 0 ? 'var(--bullish)' : 'var(--bearish)' }}>{item.backtest_total_pnl > 0 ? `+${item.backtest_total_pnl}%` : `${item.backtest_total_pnl}%`}</span>
                  </div>
                </td>

                {/* Signal Badge */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isBuy ? 'var(--bullish-bg)' : 'var(--bearish-bg)',
                        border: `1px solid ${isBuy ? 'rgba(74, 222, 128, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                        color: isBuy ? 'var(--bullish)' : 'var(--bearish)'
                      }}
                    >
                      {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.relt_action || item.signal_type}
                    </span>
                  </div>
                </td>

                {/* Score */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '6px',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${item.relt_score}%`,
                          height: '100%',
                          background: item.relt_score >= 70 ? 'var(--bullish)' : (item.relt_score >= 50 ? 'var(--info)' : 'var(--neutral)'),
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {item.relt_score}/100
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.relt_rating?.split(' ')[0] || 'A'}
                    </span>
                  </div>
                </td>

                {/* Area Entry (1H) */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--info)', fontSize: '12px' }}>
                    {item.h1_entry_zone_low?.toLocaleString('id-ID')} — {item.h1_entry_zone_high?.toLocaleString('id-ID')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: item.h1_entry_status === 'ENTRY NOW' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: item.h1_entry_status === 'ENTRY NOW' ? 'var(--bullish)' : 'var(--neutral)'
                      }}
                    >
                      ▸ {item.h1_entry_status || 'ENTRY NOW'}
                    </span>
                  </div>
                </td>

                {/* Eksekusi & SL */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Rp{item.entry_price?.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--bearish)', fontFamily: 'monospace', marginTop: '2px' }}>
                    SL: {item.stop_loss?.toLocaleString('id-ID')} ({item.entry_price > 0 ? `-${(((item.entry_price - item.stop_loss) / item.entry_price) * 100).toFixed(1)}%` : '-'})
                  </div>
                </td>

                {/* TP1 / TP2 */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  <div style={{ color: 'var(--bullish)', fontWeight: '600', fontSize: '12px' }}>
                    TP1: {item.tp1?.toLocaleString('id-ID')} ({item.entry_price > 0 ? `+${(((item.tp1 - item.entry_price) / item.entry_price) * 100).toFixed(1)}%` : '-'})
                  </div>
                  <div style={{ color: 'rgba(74, 222, 128, 0.8)', fontSize: '11px', marginTop: '2px' }}>
                    TP2: {item.tp2?.toLocaleString('id-ID')} ({item.entry_price > 0 ? `+${(((item.tp2 - item.entry_price) / item.entry_price) * 100).toFixed(1)}%` : '-'})
                  </div>
                </td>

                {/* Minute Bar Open */}
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Rp{item.minute_bar_open?.toLocaleString('id-ID')}
                </td>

                {/* Status & PnL */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '800',
                        letterSpacing: '0.04em',
                        background: statusBadge.bg,
                        border: `1px solid ${statusBadge.border}`,
                        color: statusBadge.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      {statusBadge.text}
                    </span>
                  </div>

                  {isOpen ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '800',
                          fontSize: '12px',
                          color: pnlPos ? 'var(--bullish)' : 'var(--bearish)'
                        }}
                      >
                        {pnlPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {pnlPos ? `+${item.projected_pnl_pct}%` : `${item.projected_pnl_pct}%`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'monospace' }}>
                        {pnlPos ? `+Rp${item.projected_pnl_nominal?.toLocaleString('id-ID')}` : `Rp${item.projected_pnl_nominal?.toLocaleString('id-ID')}`} / lot
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '800',
                          fontSize: '12px',
                          color: item.actual_pnl_pct >= 0 ? 'var(--bullish)' : 'var(--bearish)'
                        }}
                      >
                        {item.actual_pnl_pct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {item.actual_pnl_pct >= 0 ? `+${item.actual_pnl_pct}%` : `${item.actual_pnl_pct}%`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'monospace' }}>
                        Exit @ Rp{item.actual_exit_price?.toLocaleString('id-ID')}
                      </div>
                    </div>
                  )}
                </td>

                {/* Action button */}
                <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTickerSelect) {
                        onTickerSelect(item.ticker);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Detail <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            );
          }))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
