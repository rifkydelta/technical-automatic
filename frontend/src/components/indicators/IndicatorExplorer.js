import React, { useState } from 'react';
import { X, Search, Info, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { INDICATORS } from '../../data/indicatorsData';
import InteractiveSVGDiagram from './InteractiveSVGDiagram';

export default function IndicatorExplorer() {
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredIndicators = INDICATORS.filter(ind => 
    ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ind.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'lagging':
        return { background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.15)', text: 'Lagging (Confirmation)' };
      case 'leading':
        return { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', text: 'Leading (Prediction)' };
      case 'tool':
      default:
        return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)', text: 'Drawing Tool' };
    }
  };

  const getStarRating = (r) => {
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <div className="flex-col w-full" style={{ gap: '20px' }}>
      {/* Search and Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Indicator Explorer</h3>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={12} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search indicators..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 30px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Grid Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {filteredIndicators.map(ind => {
          const badge = getBadgeStyles(ind.type);
          return (
            <div 
              key={ind.id}
              className="ide-panel"
              style={{ 
                padding: '20px', 
                cursor: 'pointer', 
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid rgba(255,255,255,0.04)'
              }}
              onClick={() => {
                setSelectedIndicator(ind);
                setActiveTab('overview');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = badge.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, ...badge }}>
                {badge.text}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{ind.name}</h4>
                <div style={{ fontSize: '10px', color: 'var(--warning)', letterSpacing: '1px' }}>{getStarRating(ind.reliability)}</div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ind.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: badge.color, fontWeight: 600, marginTop: 'auto' }}>
                Pelajari Selengkapnya →
              </div>
            </div>
          );
        })}

        {filteredIndicators.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            Tidak ada indikator yang cocok dengan "{searchQuery}"
          </div>
        )}
      </div>

      {/* Glassmorphic Modal Popup Overlay */}
      {selectedIndicator && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="ide-panel fade-in" style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'var(--bg-primary)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedIndicator.name}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, ...getBadgeStyles(selectedIndicator.type) }}>
                    {getBadgeStyles(selectedIndicator.type).text}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedIndicator.category}</div>
              </div>
              
              <button 
                onClick={() => setSelectedIndicator(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div style={{ display: 'flex', flex: 1, overflowY: 'auto', padding: '24px', gap: '24px', flexWrap: 'wrap' }}>
              {/* Left Column: Visual Diagram */}
              <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Diagram</div>
                <InteractiveSVGDiagram type={selectedIndicator.id} />
                
                <div className="ide-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Info size={12} /> Keandalan Sinyal (Reliability)
                  </div>
                  <div style={{ fontSize: '15px', color: 'var(--warning)', letterSpacing: '2px', fontWeight: 'bold' }}>
                    {getStarRating(selectedIndicator.reliability)}
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                    Ditentukan berdasarkan potensi tingkat false signals dalam kondisi market trending maupun sideways.
                  </p>
                </div>
              </div>

              {/* Right Column: Educational Detail Tabs */}
              <div style={{ flex: '1.2 1 380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Tabs Headers */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px' }}>
                  {[
                    { id: 'overview', label: 'Konsep & Rumus' },
                    { id: 'usage', label: 'Fungsi Utama' },
                    { id: 'proscons', label: 'Pro & Kontra' },
                    { id: 'bestpractices', label: 'Praktik Terbaik' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '8px 0 12px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === tab.id ? '2px solid var(--info)' : '2px solid transparent',
                        color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === tab.id ? 600 : 400,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tabs Panels */}
                <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {activeTab === 'overview' && (
                    <div className="flex-col fade-in" style={{ gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Deskripsi</div>
                        <p style={{ margin: 0 }}>{selectedIndicator.description}</p>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Formula & Pembentukan</div>
                        <p style={{ margin: 0 }}>{selectedIndicator.formation}</p>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Psikologi Pasar</div>
                        <p style={{ margin: 0 }}>{selectedIndicator.psychology}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'usage' && (
                    <div className="flex-col fade-in" style={{ gap: '16px' }}>
                      <div className="ide-panel" style={{ padding: '16px', borderLeft: '2px solid var(--info)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <ShieldCheck size={14} /> Konfirmasi Sinyal
                        </div>
                        <p style={{ margin: 0 }}>{selectedIndicator.confirmation}</p>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Konfirmasi Volume</div>
                        <p style={{ margin: 0 }}>{selectedIndicator.volume}</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--bullish)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>STRATEGI ENTRY</span>
                          <span style={{ fontSize: '11px' }}>{selectedIndicator.entry}</span>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--bearish)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>STOP LOSS</span>
                          <span style={{ fontSize: '11px' }}>{selectedIndicator.stoploss}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'proscons' && (
                    <div className="flex-col fade-in" style={{ gap: '16px' }}>
                      <div className="ide-panel" style={{ padding: '16px', background: 'rgba(239,68,68,0.02)', borderLeft: '2px solid var(--bearish)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bearish)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <AlertTriangle size={14} /> Kesalahan Umum (Common Mistakes)
                        </div>
                        <p style={{ margin: 0 }}>{selectedIndicator.commonMistakes}</p>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Batasan Indikator</div>
                        <p style={{ margin: 0 }}>
                          Indikator ini tidak boleh digunakan sebagai sinyal mandiri, dan berpotensi memberikan banyak false signals jika kondisi pasar tidak sesuai dengan jenis indikatornya (misal menggunakan MA di pasar sideways).
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bestpractices' && (
                    <div className="flex-col fade-in" style={{ gap: '16px' }}>
                      <div className="ide-panel" style={{ padding: '16px', background: 'rgba(16,185,129,0.02)', borderLeft: '2px solid var(--bullish)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bullish)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Award size={14} /> Tips & Praktik Terbaik
                        </div>
                        <p style={{ margin: 0 }}>{selectedIndicator.tips}</p>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Target Exit Posisi</div>
                        <p style={{ margin: 0 }}>{selectedIndicator.target}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
