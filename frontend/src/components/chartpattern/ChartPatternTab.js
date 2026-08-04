import React, { useState } from 'react';
import { Search, BookOpen, Clock, Activity } from 'lucide-react';
import { useChartPatterns } from '../../hooks/useChartPatterns';
import { CATEGORIES, getPatternById } from '../../data/chartpatterns/index';
import PatternCard from './PatternCard';
import PatternDetailPopup from './PatternDetailPopup';
import ActivePatternChart from './ActivePatternChart';

export default function ChartPatternTab({ standalone = false, detectedPatterns = [], ohlcvData = [], ticker = "" }) {
  const {
    filteredPatterns,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    favorites,
    toggleFavorite,
    recentlyViewed,
    markAsViewed,
  } = useChartPatterns();

  const [selectedPattern, setSelectedPattern] = useState(null);

  const handleOpenPattern = (pattern) => {
    markAsViewed(pattern.id);
    setSelectedPattern(pattern);
  };

  const handleClosePopup = () => {
    setSelectedPattern(null);
  };

  return (
    <div className={`flex-col ${standalone ? 'dashboard-container' : ''}`} style={{ gap: '24px', padding: standalone ? '0' : '24px 0 0 0' }}>
      
      {/* Detected Patterns Highlight */}
      {detectedPatterns.length > 0 ? (
        <div className="flex-col gap-md">
          {/* Live Chart Canvas */}
          {ohlcvData.length > 0 && (
            <ActivePatternChart data={ohlcvData} pattern={detectedPatterns[0]} ticker={ticker} />
          )}

          <div className="card" style={{ borderLeft: '4px solid var(--bullish)' }}>
            <div className="flex-row items-center gap-sm" style={{ marginBottom: '24px' }}>
              <Activity size={18} color="var(--bullish)" />
              <h3 className="font-bold text-lg">Pola yang Sedang Terbentuk</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              
              {/* Left Column: Volume Confirmation Banner */}
              <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column' }}>
                {(() => {
                  if (!ohlcvData || ohlcvData.length === 0) return null;
                  const lastCandle = ohlcvData[ohlcvData.length - 1];
                  const lastVol = lastCandle ? (lastCandle.volume || 0) : 0;
                  
                  // Calculate volume MA20
                  const period = Math.min(ohlcvData.length, 20);
                  const lastPeriod = ohlcvData.slice(-period);
                  const sum = lastPeriod.reduce((acc, curr) => acc + (curr.volume || 0), 0);
                  const avgVol = period > 0 ? sum / period : 0;
                  
                  const isVolumeHigh = lastVol > avgVol;
                  const ratio = avgVol > 0 ? (lastVol / avgVol).toFixed(1) : 0;
                  const isBullishCandle = lastCandle ? lastCandle.close >= lastCandle.open : true;

                  const formatMil = (num) => {
                    if (num >= 1.0e6) return (num / 1.0e6).toFixed(1) + ' M';
                    if (num >= 1.0e3) return (num / 1.0e3).toFixed(1) + ' K';
                    return num.toLocaleString();
                  };

                  return (
                    <div 
                      className="ide-panel" 
                      style={{ 
                        padding: '24px', 
                        height: '100%',
                        background: 'rgba(10, 10, 10, 0.25)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span 
                            style={{ 
                              fontSize: '9px', 
                              fontWeight: '700', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              background: isVolumeHigh ? 'rgba(74, 222, 128, 0.08)' : 'rgba(245, 158, 11, 0.08)', 
                              color: isVolumeHigh ? 'var(--bullish)' : 'var(--warning)',
                              border: isVolumeHigh ? '1px solid rgba(74, 222, 128, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)'
                            }}
                          >
                            Volume Konfirmasi
                          </span>
                        </div>

                        <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '4px 0 0 0', color: '#fff', letterSpacing: '-0.02em' }}>
                          {isVolumeHigh 
                            ? (isBullishCandle ? 'Konfirmasi Akumulasi Kuat' : 'Konfirmasi Distribusi Kuat') 
                            : 'Partisipasi Pasar Lemah'}
                        </h4>
                        
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                          {isVolumeHigh ? (
                            <span>
                              Sesuai materi <strong>Volume Indicator</strong>, volume transaksi penutupan melonjak sebesar <strong>{ratio}x</strong> di atas rata-rata MA20 dengan tipe <strong>{isBullishCandle ? 'Buy / Akumulasi' : 'Sell / Distribusi'}</strong>. Ini mengonfirmasi <strong>{isBullishCandle ? 'minat beli (buying pressure) yang sangat kuat' : 'tekanan jual (selling pressure) yang sangat kuat'}</strong> yang mendukung pergerakan pola saat ini.
                            </span>
                          ) : (
                            <span>
                              Sesuai materi <strong>Volume Indicator</strong>, transaksi berjalan dengan volume rendah di bawah rata-rata MA20 (tipe: <strong>{isBullishCandle ? 'Buy' : 'Sell'}</strong>). Kurangnya partisipasi aktif ini rentan memicu <strong>False Breakout</strong>.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Flat typography metrics grid with Buy/Sell detail */}
                      <div style={{ display: 'flex', gap: '12px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 70px' }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Terakhir</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{formatMil(lastVol)}</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                        <div style={{ flex: '1 1 80px' }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Tipe Volume</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: isBullishCandle ? 'var(--bullish)' : 'var(--bearish)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {isBullishCandle ? 'Buy / Akum' : 'Sell / Dist'}
                          </div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                        <div style={{ flex: '1 1 70px' }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Rata-Rata</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{formatMil(avgVol)}</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                        <div style={{ flex: '1 1 50px' }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Rasio</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: isVolumeHigh ? 'var(--bullish)' : 'var(--warning)' }}>{ratio}x</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Pattern Cards Grid */}
              <div style={{ flex: '1.2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="cp-grid" style={{ height: '100%', margin: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {detectedPatterns.map(p => {
                    const fullPattern = getPatternById(p.pattern_id);
                    if (!fullPattern) return null;
                    return (
                      <PatternCard 
                        key={p.pattern_id} 
                        pattern={fullPattern} 
                        isFavorite={favorites.has(p.pattern_id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => handleOpenPattern(fullPattern)}
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
          </div>
      ) : !standalone ? (
        <div className="card flex-row items-center gap-sm" style={{ borderLeft: '4px solid var(--neutral)' }}>
          <Activity size={18} color="var(--neutral)" />
          <div className="text-secondary text-sm">
            <strong>Belum Ada Pola:</strong> Sistem tidak mendeteksi adanya formasi Chart Pattern klasik (seperti Double Bottom, dll) yang matang pada pergerakan harga saham ini saat ini.
          </div>
        </div>
      ) : null}

      {/* Header & Recent */}
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <BookOpen size={24} color="var(--info)" />
          <h2 className="text-2xl font-bold font-mono tracking-wider">Chart Pattern Library</h2>
        </div>
        
        {recentlyViewed.length > 0 && (
          <div className="flex-row items-center gap-sm flex-wrap">
            <span className="text-sm text-muted flex-row items-center gap-xs">
              <Clock size={14} /> Recently Viewed:
            </span>
            {recentlyViewed.map(p => (
              <button 
                key={`recent-${p.id}`}
                className="cp-recent-chip"
                onClick={() => handleOpenPattern(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card flex-col gap-md" style={{ padding: '20px' }}>
        <div className="cp-search-container">
          <Search size={18} className="cp-search-icon text-muted" />
          <input 
            type="text" 
            className="cp-search-input"
            placeholder="Search pattern... (triangle, flag, head, cup, double, wedge)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-row gap-sm flex-wrap mt-2">
          {Object.values(CATEGORIES).map(cat => (
            <button
              key={cat.id}
              className={`cp-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                '--cat-color': cat.color,
                '--cat-bg': cat.bg
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="card flex-col items-center justify-center" style={{ padding: '64px 0', color: 'var(--text-muted)' }}>
          <Search size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No patterns found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="cp-grid">
          {filteredPatterns.map(p => (
            <PatternCard 
              key={p.id} 
              pattern={p} 
              isFavorite={favorites.has(p.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => handleOpenPattern(p)}
            />
          ))}
        </div>
      )}

      {/* Popup */}
      {selectedPattern && (
        <PatternDetailPopup 
          pattern={selectedPattern} 
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
