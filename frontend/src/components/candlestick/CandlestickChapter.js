import React, { useState, useEffect } from 'react';
import { Search, Info, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { CANDLESTICK_PATTERNS } from '../../data/candlestickData';
import CandlestickCard from './CandlestickCard';
import CandlestickDetailPopup from './CandlestickDetailPopup';
import CandlestickComparison from './CandlestickComparison';

export default function CandlestickChapter({ chapterId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);

  // Load persistence
  useEffect(() => {
    const savedFavs = localStorage.getItem('candlestick_favorites');
    const savedRecents = localStorage.getItem('candlestick_recents');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedRecents) setRecentlyViewed(JSON.parse(savedRecents));
  }, []);

  const handleToggleFavorite = (id) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('candlestick_favorites', JSON.stringify(newFavs));
  };

  const handleOpenPattern = (pattern) => {
    setSelectedPattern(pattern);
    const newRecents = [pattern.id, ...recentlyViewed.filter(id => id !== pattern.id)].slice(0, 5);
    setRecentlyViewed(newRecents);
    localStorage.setItem('candlestick_recents', JSON.stringify(newRecents));
  };

  const renderPatternGrid = (typeFilter) => {
    let filtered = CANDLESTICK_PATTERNS;
    if (typeFilter) {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {filtered.map(pattern => (
          <CandlestickCard 
            key={pattern.id} 
            pattern={pattern} 
            isFavorite={favorites.includes(pattern.id)}
            onToggleFavorite={handleToggleFavorite}
            onClick={() => handleOpenPattern(pattern)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No patterns found matching "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  const renderSearchBox = () => (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      <input 
        type="text" 
        placeholder="Search patterns (e.g., Hammer, Engulfing)..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 10px 10px 36px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '12px',
          outline: 'none'
        }}
      />
    </div>
  );

  // Chapter 1: Introduction
  if (chapterId === 1) {
    return (
      <div className="flex-col fade-in" style={{ gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Introduction to Candlesticks</h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Candlestick Pattern merupakan pola yang terbentuk dari satu atau beberapa candlestick yang digunakan untuk membaca <strong>psikologi pasar</strong>.
        </p>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Candlestick membantu trader mengetahui siapa yang lebih dominan, apakah momentum menguat, apakah terjadi penolakan harga, dan probabilitas arah selanjutnya.
        </p>

        <div style={{ padding: '24px', background: 'rgba(96, 165, 250, 0.05)', border: '1px dashed rgba(96,165,250,0.2)', borderRadius: '8px', textAlign: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Candlestick</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bearish)', marginBottom: '16px' }}>≠ Signal Mutlak</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Candlestick</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--info)' }}>= Probability</div>
        </div>

        <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--info)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Candlestick sebaiknya digunakan bersama:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['Volume', 'Support', 'Resistance', 'EMA', 'Trend', 'Chart Pattern'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={12} color="var(--info)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chapter 2: Bullish Candlestick
  if (chapterId === 2) {
    return (
      <div className="flex-col fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Bullish Candlestick</h2>
        {renderSearchBox()}
        {renderPatternGrid('bullish')}
        <CandlestickDetailPopup pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />
      </div>
    );
  }

  // Chapter 3: Bearish Candlestick
  if (chapterId === 3) {
    return (
      <div className="flex-col fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Bearish Candlestick</h2>
        {renderSearchBox()}
        {renderPatternGrid('bearish')}
        <CandlestickDetailPopup pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />
      </div>
    );
  }

  // Chapter 4: Neutral Candlestick
  if (chapterId === 4) {
    return (
      <div className="flex-col fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Neutral Candlestick</h2>
        {renderSearchBox()}
        {renderPatternGrid('neutral')}
        <CandlestickDetailPopup pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />
      </div>
    );
  }

  // Chapter 5: Multi Candle Pattern
  if (chapterId === 5) {
    return (
      <div className="flex-col fade-in" style={{ gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Multi Candle Pattern</h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Semakin banyak candle yang terlibat dalam pembentukan pola, biasanya semakin tinggi tingkat konfirmasi, namun tetap harus didukung oleh konteks pasar dan volume.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div className="ide-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Single Candle</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Marubozu</div>
              <div>Hammer</div>
              <div>Doji</div>
            </div>
          </div>
          <div className="ide-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Double Candle</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Engulfing</div>
              <div>Harami</div>
            </div>
          </div>
          <div className="ide-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--bullish)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Triple Candle</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Morning Star</div>
              <div>Evening Star</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Comparison Mode</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>Compare patterns side-by-side to understand visual and psychological differences.</p>
          <CandlestickComparison />
        </div>
      </div>
    );
  }

  // Chapter 6: Volume Confirmation
  if (chapterId === 6) {
    return (
      <div className="flex-col fade-in" style={{ gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Volume Confirmation</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="ide-panel" style={{ padding: '24px', borderTop: '2px solid var(--bullish)', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Pattern + Volume Besar</div>
            <div style={{ fontSize: '16px', color: 'var(--warning)', letterSpacing: '2px', marginBottom: '8px' }}>★★★★★</div>
            <div style={{ fontSize: '11px', color: 'var(--bullish)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High Confidence</div>
          </div>
          <div className="ide-panel" style={{ padding: '24px', borderTop: '2px solid var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Pattern + Volume Kecil</div>
            <div style={{ fontSize: '16px', color: 'var(--warning)', letterSpacing: '2px', marginBottom: '8px' }}>★★☆☆☆</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weak Confirmation</div>
          </div>
        </div>

        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Volume adalah konfirmasi. Besarnya volume saat candlestick terbentuk menentukan tingkat validitas pola; semakin besar volume pendukungnya, semakin kuat konfirmasinya.
        </p>

        <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.06) 0%, transparent 100%)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Golden Rule Probability
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Candlestick</span>
            <span style={{ color: 'var(--text-muted)' }}>+</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Volume</span>
            <span style={{ color: 'var(--text-muted)' }}>+</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Support</span>
            <span style={{ color: 'var(--text-muted)' }}>+</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Trend</span>
            <span style={{ color: 'var(--text-muted)' }}>=</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--bullish)' }}>High Probability</span>
          </div>
        </div>
      </div>
    );
  }

  // Chapter 7: Summary
  if (chapterId === 7) {
    return (
      <div className="flex-col fade-in" style={{ gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Summary</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          {['Candlestick', 'Market Psychology', 'Confirmation', 'Entry', 'Risk Management'].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step}</div>
              {i < arr.length - 1 && <Play size={10} color="var(--text-muted)" />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Trend', 'Support', 'Resistance', 'Volume', 'EMA', 'Chart Pattern', 'Risk Reward'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color="var(--info)" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--warning)' }}>Golden Rules</h3>
            <div className="ide-panel" style={{ padding: '20px', borderLeft: '2px solid var(--warning)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>Jangan entry hanya karena muncul candlestick pattern.</p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selalu pastikan:</div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Trend mendukung</li>
                <li>Volume mendukung</li>
                <li>Dekat Support atau Resistance</li>
                <li>Risk Reward layak</li>
                <li>Ada konfirmasi candle berikutnya</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
