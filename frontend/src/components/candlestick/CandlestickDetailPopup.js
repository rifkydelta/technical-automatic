import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Target, Info, Star, Brain, Eye } from 'lucide-react';
import CandlestickIllustration from './CandlestickIllustration';

export default function CandlestickDetailPopup({ pattern, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!pattern || !mounted) return null;

  const getBadgeColor = (type) => {
    switch (type) {
      case 'bullish': return 'var(--bullish)';
      case 'bearish': return 'var(--bearish)';
      default: return 'var(--neutral)';
    }
  };

  const badgeColor = getBadgeColor(pattern.type);

  const popupContent = (
    <div className="cp-popup-overlay" onClick={onClose}>
      <div 
        className="cp-popup-container card" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          borderTop: `4px solid ${badgeColor}`
        }}
      >
        {/* Header - Sticky */}
        <div className="cp-popup-header">
          <div className="flex-col">
            <h2 className="text-3xl font-bold">{pattern.name}</h2>
            <div className="flex-row items-center gap-sm mt-1">
              <span style={{ color: badgeColor, fontWeight: 'bold' }}>{pattern.category}</span>
              <span className="text-muted">•</span>
              <span className="text-secondary" style={{ textTransform: 'uppercase' }}>{pattern.type} Pattern</span>
            </div>
          </div>
          <button className="cp-popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="cp-popup-content">
          
          {/* Top Section: Illustration & Description */}
          <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
            <div className="card" style={{ backgroundColor: 'rgba(0,0,0,0.3)', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ width: '100%', height: '180px' }}>
                <CandlestickIllustration patternId={pattern.id} />
              </div>
            </div>
            <div className="flex-col gap-md">
              <div className="cp-section">
                <h3 className="cp-section-title"><Info size={16} color="var(--info)" /> Deskripsi</h3>
                <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>{pattern.description}</p>
              </div>
              
              <div className="cp-section" style={{ flex: 1 }}>
                <h3 className="cp-section-title"><Brain size={16} color="var(--info)" /> Psikologi Pasar</h3>
                <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>{pattern.psychology}</p>
              </div>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Rules & Confirmation */}
          <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
            <div className="cp-section">
              <h3 className="cp-section-title"><Eye size={16} color="var(--info)" /> Aturan Formasi</h3>
              <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{pattern.formation}</p>
              
              <div className="card p-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reliability Level</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < pattern.reliability ? "var(--warning)" : "none"} color={i < pattern.reliability ? "var(--warning)" : "var(--text-muted)"} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="cp-section">
              <h3 className="cp-section-title"><Check size={16} color="var(--bullish)" /> Konfirmasi Validitas</h3>
              <ul className="cp-list rules-list">
                <li className="text-secondary"><span style={{ color: 'var(--info)' }}>•</span> {pattern.confirmation}</li>
                <li className="text-secondary"><span style={{ color: 'var(--info)' }}>•</span> {pattern.volume}</li>
              </ul>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Trading Strategy (Entry, SL, TP) */}
          <h3 className="cp-section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Strategi Trading</h3>
          
          <div className="grid-3-cols" style={{ marginBottom: '24px' }}>
            {/* Entry */}
            <div className="card cp-strategy-card" style={{ borderRadius: '12px' }}>
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--info)', fontSize: '14px', marginBottom: '12px' }}><Target size={16} /> Entry Point</h4>
              <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>{pattern.entry}</p>
            </div>

            {/* Stop Loss */}
            <div className="card cp-strategy-card" style={{ borderRadius: '12px' }}>
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--bearish)', fontSize: '14px', marginBottom: '12px' }}><TrendingDown size={16} /> Stop Loss</h4>
              <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>{pattern.stoploss}</p>
            </div>

            {/* Take Profit */}
            <div className="card cp-strategy-card" style={{ borderRadius: '12px' }}>
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--bullish)', fontSize: '14px', marginBottom: '12px' }}><TrendingUp size={16} /> Target Profit</h4>
              <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>{pattern.target}</p>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Bottom Section: Mistakes & Tips */}
          <div className="grid-2-cols" style={{ marginBottom: '16px' }}>
            <div className="cp-section" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.04)', borderRadius: '12px', border: '1px solid rgba(244,63,94,0.1)' }}>
              <h3 className="cp-section-title text-bearish" style={{ fontSize: '14px', marginBottom: '8px' }}><AlertTriangle size={16} /> Kesalahan Umum</h3>
              <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>{pattern.commonMistakes}</p>
            </div>
            
            <div className="cp-section" style={{ padding: '16px', background: 'rgba(251, 191, 36, 0.04)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.1)' }}>
              <h3 className="cp-section-title text-neutral" style={{ fontSize: '14px', marginBottom: '8px' }}><AlertCircle size={16} /> Tips Tambahan</h3>
              <p className="text-secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>{pattern.tips}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
