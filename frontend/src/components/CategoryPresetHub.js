'use client';
import { useState, useEffect } from 'react';
import ScreenerCard from './ScreenerCard';
import { 
  Building2, Flame, Zap, SlidersHorizontal, Search, RefreshCw, Sparkles, 
  Filter, Clock, Moon, Crosshair, Layers, Table as TableIcon, LayoutGrid, 
  Target, Calendar, TrendingUp, TrendingDown, ArrowRight 
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'relt_a_plus',
    label: 'RELT Setup A+ (≥75%)',
    badge: 'A+ Strong Buy',
    icon: Sparkles,
    color: '#4ade80',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'relt_a_plus',
    desc: 'Hasil pemindaian seluruh IHSG untuk setup komposit Grade A+/A (Score ≥ 75%).'
  },
  {
    id: 'relt_pullback',
    label: 'RELT Pullback Hunter (≥60%)',
    badge: 'EMA Retest Rebound',
    icon: Crosshair,
    color: '#38bdf8',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'relt_pullback',
    desc: 'Saham tren naik yang sedang retest sehat ke area EMA dengan candle reversal.'
  },
  {
    id: 'relt_smc_breakout',
    label: 'Smart Money & FVG Breakout',
    badge: 'Institutional SMC',
    icon: Layers,
    color: '#c084fc',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'relt_smc_breakout',
    desc: 'Konfirmasi jejak institusi melalui Order Block (OB), FVG Gap, dan Bullish BOS.'
  },
  {
    id: 'bank',
    label: 'Sektor Bank',
    badge: 'Big & Mid Bank',
    icon: Building2,
    color: '#60a5fa',
    tickers: ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BBTN', 'BDMN', 'NISP', 'PNBN', 'ARTO'],
    desc: 'Daftar emiten perbankan utama di Bursa Efek Indonesia.'
  },
  {
    id: 'bakrie',
    label: 'Bakrie Group',
    badge: 'Konglomerat Bakrie',
    icon: Flame,
    color: '#f97316',
    tickers: ['BUMI', 'BRMS', 'ENRG', 'DEWA', 'VKTR', 'UNSP', 'BNBR', 'VIVA', 'MDIA'],
    desc: 'Saham-saham grup Bakrie lintas sektor komoditas, infrastruktur, & media.'
  },
  {
    id: 'prajogo',
    label: 'Prajogo Pangestu',
    badge: 'Barito Group & Afiliasi',
    icon: Zap,
    color: '#a855f7',
    tickers: ['BRPT', 'TPIA', 'BREN', 'CUAN', 'PTRO', 'CGAS'],
    desc: 'Konglomerasi Barito Group, energi terbarukan, pertambangan & petrokimia.'
  },
  {
    id: 'bpjs',
    label: 'BPJS (09.05-09.20)',
    badge: '09.05 - 09.20',
    icon: Sparkles,
    color: '#eab308',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'bpjs_daytrade',
    desc: 'Hasil pemindaian seluruh IHSG untuk strategi BPJS (09.05 - 09.20).'
  },
  {
    id: 'opening_0858',
    label: 'OPENING (08.58)',
    badge: '08.58',
    icon: Clock,
    color: '#38bdf8',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'opening_0858',
    desc: 'Hasil pemindaian seluruh IHSG untuk strategi Opening (08.58).'
  },
  {
    id: 'bsjp_1530',
    label: 'BSJP (15.30-15.40)',
    badge: '15.30 - 15.40',
    icon: Moon,
    color: '#c084fc',
    tickers: [],
    isCustomScreener: true,
    screenerId: 'bsjp_1530',
    desc: 'Hasil pemindaian seluruh IHSG untuk strategi BSJP (Beli Sore Jual Pagi).'
  }
];


export default function CategoryPresetHub({ onTickerClick, mode = 'live' }) {
  const [activeTab, setActiveTab] = useState('bank');
  const [categoryData, setCategoryData] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Screener Formula Filter States
  const [minScore, setMinScore] = useState(50);
  const [trendFilter, setTrendFilter] = useState('ALL'); // 'ALL', 'Bullish', 'Bearish'
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL', 'Good Setup', 'High Risk'
  const [customFormulaText, setCustomFormulaText] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Fetch Category Stock Data
  const fetchCategoryData = async (catId, forceRefresh = false) => {
    const category = CATEGORIES.find(c => c.id === catId);
    if (!category) return;

    if (!forceRefresh && categoryData[catId]) {
      const hasUnknown = categoryData[catId].some(item => item.trend === 'Unknown');
      if (!hasUnknown) return;
    }

    setLoadingMap(prev => ({ ...prev, [catId]: true }));
    setErrorMap(prev => ({ ...prev, [catId]: null }));

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let res;
      if (category.isCustomScreener) {
        // Call custom-preset endpoint (e.g. BPJS full IHSG scan)
        res = await fetch(`${API_URL}/api/screener/custom-preset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screener_id: category.screenerId, mode })
        });
      } else {
        const targetTickers = catId === 'screener' 
          ? ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BUMI', 'BRMS', 'ENRG', 'BRPT', 'TPIA', 'BREN', 'CUAN', 'PTRO', 'DEWA', 'VKTR', 'BRIS']
          : category.tickers;

        res = await fetch(`${API_URL}/api/screener`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tickers: targetTickers, mode })
        });
      }

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Gagal mengambil data kategori.');
      }

      const result = await res.json();
      setCategoryData(prev => ({ ...prev, [catId]: result.data }));
    } catch (err) {
      setErrorMap(prev => ({ ...prev, [catId]: err.message }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [catId]: false }));
    }
  };

  // Initial Fetch on mount or mode change
  useEffect(() => {
    fetchCategoryData(activeTab);
  }, [activeTab, mode]);

  const currentCategory = CATEGORIES.find(c => c.id === activeTab);
  const rawResults = categoryData[activeTab] || [];
  const isLoading = loadingMap[activeTab];
  const errorMessage = errorMap[activeTab];

  // Apply filters to raw results
  const filteredResults = rawResults.filter(item => {
    // 1. Search Query Filter
    const matchesSearch = item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company_name && item.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Extra filters for Screener tab
    if (activeTab === 'screener') {
      if (item.score < minScore) return false;
      if (trendFilter === 'Bullish' && !(item.trend === 'Bullish' || item.trend === 'Strong Bullish')) return false;
      if (trendFilter === 'Bearish' && !(item.trend === 'Bearish' || item.trend === 'Strong Bearish')) return false;
      if (riskFilter === 'Good Setup' && item.risk_status === 'High Risk') return false;
      if (riskFilter === 'High Risk' && item.risk_status !== 'High Risk') return false;

      // Custom formula text matching (if user inputs search text like "BUY", "Bullish", "Double Bottom")
      if (customFormulaText.trim()) {
        const formulaLower = customFormulaText.toLowerCase();
        const strMatch = item.recommendation.toLowerCase().includes(formulaLower) ||
                         item.trend.toLowerCase().includes(formulaLower) ||
                         item.risk_status.toLowerCase().includes(formulaLower);
        if (!strMatch) return false;
      }
    }

    return true;
  });

  return (
    <div style={{ marginTop: '24px', marginBottom: '40px' }}>
      {/* Category Tab Selector Bar */}
      <div className="card" style={{ padding: '20px 24px', borderRadius: '20px', marginBottom: '24px' }}>
        <div className="flex-row items-center justify-between flex-wrap gap-md" style={{ marginBottom: '16px' }}>
          <div>
            <div className="flex-row items-center gap-xs mb-1">
              <Sparkles size={16} style={{ color: 'var(--bullish)' }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--bullish)' }}>
                Market Overview & Presets
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Eksplorasi Saham Terpopuler IDX
            </h2>
          </div>

          {/* Local Search Input & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: viewMode === 'table' ? '700' : '400',
                  background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: viewMode === 'table' ? '#60a5fa' : 'var(--text-muted)'
                }}
              >
                <TableIcon size={13} /> Tabel Screener
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: viewMode === 'grid' ? '700' : '400',
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: viewMode === 'grid' ? '#60a5fa' : 'var(--text-muted)'
                }}
              >
                <LayoutGrid size={13} /> Card Grid
              </button>
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Filter emiten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex-row gap-sm flex-wrap">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? `1px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 15px ${cat.color}25` : 'none'
                }}
              >
                <Icon size={16} style={{ color: cat.color }} />
                <span>{cat.label}</span>
                <span 
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? cat.color : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#000' : 'var(--text-muted)',
                    fontWeight: 'bold'
                  }}
                >
                  {cat.id === 'screener' ? 'Custom' : (categoryData[cat.id] ? categoryData[cat.id].length : cat.tickers.length)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description & Custom Formula Controls */}
      <div style={{ marginBottom: '20px', padding: '0 8px' }}>
        <div className="flex-row items-center justify-between flex-wrap gap-sm">
          <div className="text-sm text-secondary">
            {currentCategory?.desc}
          </div>
          <button 
            onClick={() => fetchCategoryData(activeTab, true)}
            className="flex-row items-center gap-xs text-xs font-mono text-muted"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} /> Refresh Data
          </button>
        </div>

        {/* BPJS Strategy Rule Breakdown Card */}
        {activeTab === 'bpjs' && (
          <div className="card" style={{ marginTop: '16px', marginBottom: '16px', padding: '20px', backgroundColor: 'rgba(234, 179, 8, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '16px' }}>
            <div className="flex-row items-center justify-between flex-wrap gap-xs" style={{ marginBottom: '12px' }}>
              <div className="flex-row items-center gap-xs">
                <Sparkles size={16} style={{ color: '#eab308' }} />
                <span className="text-sm font-bold text-primary">Ketentuan Rumus: BPJS (09.05 - 09.20)</span>
              </div>
              <span className="text-xs font-mono" style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', fontWeight: 'bold' }}>
                Pemindaian Universe IHSG
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Open &le; 1.01 &times; Low Price
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Volume &ge; 1.5 &times; Volume MA5
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Price &ge; 1.0 &times; Price MA5
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Price Change &ge; +2.0%
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Value &gt; Rp 5.000.000.000 (5B)
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span> Price &ge; Rp 100
              </div>
            </div>
          </div>
        )}

        {/* OPENING (08.58) Strategy Rule Breakdown Card */}
        {activeTab === 'opening_0858' && (
          <div className="card" style={{ marginTop: '16px', marginBottom: '16px', padding: '20px', backgroundColor: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px' }}>
            <div className="flex-row items-center justify-between flex-wrap gap-xs" style={{ marginBottom: '12px' }}>
              <div className="flex-row items-center gap-xs">
                <Clock size={16} style={{ color: '#38bdf8' }} />
                <span className="text-sm font-bold text-primary">Ketentuan Rumus: OPENING (08.58)</span>
              </div>
              <span className="text-xs font-mono" style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 'bold' }}>
                Pemindaian Universe IHSG
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> Volume &gt; 500.000
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> Open Price &le; 1.0 &times; Low Price
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> Price &le; Rp 1.000
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> 1 Day Return &ge; +1.0%
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> Price &gt; Rp 100
              </div>
            </div>
          </div>
        )}

        {/* BSJP (15.30-15.40) Strategy Rule Breakdown Card */}
        {activeTab === 'bsjp_1530' && (
          <div className="card" style={{ marginTop: '16px', marginBottom: '16px', padding: '20px', backgroundColor: 'rgba(192, 132, 252, 0.04)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '16px' }}>
            <div className="flex-row items-center justify-between flex-wrap gap-xs" style={{ marginBottom: '12px' }}>
              <div className="flex-row items-center gap-xs">
                <Moon size={16} style={{ color: '#c084fc' }} />
                <span className="text-sm font-bold text-primary">Ketentuan Rumus: BSJP (15.30 - 15.40)</span>
              </div>
              <span className="text-xs font-mono" style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontWeight: 'bold' }}>
                Pemindaian Universe IHSG
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#c084fc', fontWeight: 'bold' }}>✓</span> Price Change &ge; +2.0%
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#c084fc', fontWeight: 'bold' }}>✓</span> Price &ge; 1.0 &times; Price MA20
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#c084fc', fontWeight: 'bold' }}>✓</span> Volume &ge; 1.2 &times; Volume MA20
              </div>
              <div className="flex-row items-center gap-xs text-xs text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#c084fc', fontWeight: 'bold' }}>✓</span> Value &gt; Rp 10.000.000.000 (10B)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Stock Table or Cards Grid */}
      {isLoading ? (
        viewMode === 'table' ? (
          <SkeletonTableView />
        ) : (
          <SkeletonCardGrid />
        )
      ) : errorMessage ? (
        <div className="card text-bearish font-mono" style={{ border: '1px solid var(--bearish)', padding: '20px' }}>
          Gagal memuat data: {errorMessage}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
          Tidak ada emiten yang memenuhi kriteria pencarian / filter pada kategori ini.
        </div>
      ) : viewMode === 'table' ? (
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
              {filteredResults.map((item, idx) => {
                const isUp = item.change_pct >= 0;
                const isUptrend = item.trend === 'Bullish' || item.trend === 'Strong Bullish';
                const tp1Val = item.tp1 || (item.last_price ? item.last_price * 1.03 : 0);
                const tp1Pct = item.tp1_pct !== undefined && item.tp1_pct !== null
                  ? item.tp1_pct
                  : (item.last_price > 0 ? (((tp1Val - item.last_price) / item.last_price) * 100).toFixed(1) : '3.0');
                const estDays = item.estimated_tp_range || (item.estimated_tp_days ? `${item.estimated_tp_days} Hari` : '2-4 Hari');

                const formatIDR = (val) => new Intl.NumberFormat('id-ID').format(Math.round(val || 0));
                const formatVol = (val) => {
                  if (!val) return '0';
                  if (val > 1000000000) return (val / 1000000000).toFixed(1) + 'B';
                  if (val > 1000000) return (val / 1000000).toFixed(1) + 'M';
                  if (val > 1000) return (val / 1000).toFixed(1) + 'K';
                  return val;
                };

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
                      <div style={{ fontSize: '11px', color: 'var(--bullish)', opacity: 0.85 }}>
                        +{tp1Pct}% Upside
                      </div>
                    </td>

                    {/* Estimasi Sampai TP */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'rgba(96, 165, 250, 0.1)',
                          border: '1px solid rgba(96, 165, 250, 0.25)',
                          color: '#60a5fa',
                          fontWeight: '700',
                          fontSize: '11px'
                        }}
                      >
                        <Calendar size={12} /> {estDays}
                      </div>
                    </td>

                    {/* Trend */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: isUptrend ? 'var(--bullish)' : 'var(--warning)'
                        }}
                      >
                        {item.trend}
                      </span>
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '12px' }}>
                          {item.score_display || `${item.score}%`}
                        </span>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredResults.map((item, idx) => (
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

function SkeletonTableView() {
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
            <th style={{ padding: '14px 16px', textAlign: 'center' }}>Action</th>
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
              {/* 1. Ticker & Name */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton skeleton-badge" style={{ width: '56px', height: '24px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="skeleton skeleton-text" style={{ width: '90px', height: '12px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '10px' }} />
                  </div>
                </div>
              </td>

              {/* 2. Price */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '70px', height: '14px' }} />
              </td>

              {/* 3. Change % */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '64px', height: '22px' }} />
              </td>

              {/* 4. Target TP1 */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '65px', height: '13px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '45px', height: '10px' }} />
                </div>
              </td>

              {/* 5. Estimasi ke TP */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '75px', height: '20px' }} />
              </td>

              {/* 6. Trend */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '60px', height: '20px' }} />
              </td>

              {/* 7. Score */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="skeleton skeleton-avatar" style={{ width: '28px', height: '28px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '24px', height: '12px' }} />
                </div>
              </td>

              {/* 8. Rekomendasi */}
              <td style={{ padding: '14px 16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '85px', height: '22px' }} />
              </td>

              {/* 9. Action Button */}
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div className="skeleton skeleton-button" style={{ width: '65px', height: '28px', margin: '0 auto' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonCardGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton skeleton-badge" style={{ width: '75px', height: '24px' }} />
              <div className="skeleton skeleton-text" style={{ width: '130px', height: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '20px' }} />
              <div className="skeleton skeleton-badge" style={{ width: '55px', height: '18px' }} />
            </div>
          </div>

          {/* Metric Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '2px' }}>
            <div className="skeleton" style={{ height: '52px', borderRadius: '10px' }} />
            <div className="skeleton" style={{ height: '52px', borderRadius: '10px' }} />
          </div>

          {/* Forecast / Risk Ray */}
          <div className="skeleton" style={{ height: '36px', borderRadius: '8px' }} />

          {/* Bottom Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="skeleton skeleton-badge" style={{ width: '100px', height: '24px' }} />
            <div className="skeleton skeleton-button" style={{ width: '70px', height: '26px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
