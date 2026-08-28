'use client';
import { useState, useEffect } from 'react';
import ScreenerCard from './ScreenerCard';
import { Building2, Flame, Zap, SlidersHorizontal, Search, RefreshCw, Sparkles, Filter, Clock, Moon, Crosshair, Layers } from 'lucide-react';

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
      let res;
      if (category.isCustomScreener) {
        // Call custom-preset endpoint (e.g. BPJS full IHSG scan)
        res = await fetch('http://localhost:8000/api/screener/custom-preset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screener_id: category.screenerId, mode })
        });
      } else {
        const targetTickers = catId === 'screener' 
          ? ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BUMI', 'BRMS', 'ENRG', 'BRPT', 'TPIA', 'BREN', 'CUAN', 'PTRO', 'DEWA', 'VKTR', 'BRIS']
          : category.tickers;

        res = await fetch('http://localhost:8000/api/screener', {
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

          {/* Local Search Input */}
          <div style={{ position: 'relative', width: '240px' }}>
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

      {/* Main Stock Cards Grid */}
      {isLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="card text-bearish font-mono" style={{ border: '1px solid var(--bearish)', padding: '20px' }}>
          Gagal memuat data: {errorMessage}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
          Tidak ada emiten yang memenuhi kriteria pencarian / filter pada kategori ini.
        </div>
      ) : (
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

function SkeletonCard() {
  return (
    <div 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top Section */}
      <div className="flex-row items-center justify-between">
        <div className="flex-col gap-xs">
          <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '6px' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '12px', borderRadius: '4px' }}></div>
        </div>
        <div className="flex-col items-end gap-xs">
          <div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '6px' }}></div>
          <div className="skeleton" style={{ width: '50px', height: '14px', borderRadius: '4px' }}></div>
        </div>
      </div>

      {/* Middle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
        <div className="skeleton" style={{ height: '48px', borderRadius: '10px' }}></div>
        <div className="skeleton" style={{ height: '48px', borderRadius: '10px' }}></div>
      </div>

      {/* Bottom Section */}
      <div className="flex-row items-center justify-between" style={{ paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
        <div className="skeleton" style={{ width: '130px', height: '22px', borderRadius: '6px' }}></div>
        <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '6px' }}></div>
      </div>
    </div>
  );
}
