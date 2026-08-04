import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Target, Info } from 'lucide-react';
import { CATEGORIES } from '../../data/chartpatterns';
import PatternIllustration from './PatternIllustration';

export default function PatternDetailPopup({ pattern, onClose }) {
  const popupRef = useRef(null);
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

  const categoryMeta = CATEGORIES[pattern.category];

  const popupContent = (
    <div className="cp-popup-overlay" onClick={onClose}>
      <div 
        className="cp-popup-container card" 
        onClick={(e) => e.stopPropagation()} 
        ref={popupRef}
        style={{
          borderTop: `4px solid ${categoryMeta.color}`
        }}
      >
        {/* Header - Sticky */}
        <div className="cp-popup-header">
          <div className="flex-col">
            <h2 className="text-3xl font-bold">{pattern.name}</h2>
            <div className="flex-row items-center gap-sm mt-1">
              <span style={{ color: categoryMeta.color, fontWeight: 'bold' }}>{categoryMeta.name} Pattern</span>
              <span className="text-muted">•</span>
              <span className="text-secondary">{pattern.type.toUpperCase()}</span>
            </div>
          </div>
          <button className="cp-popup-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="cp-popup-content">
          
          {/* Top Section: Illustration & Description */}
          <div className="grid-2-cols" style={{ marginBottom: '32px' }}>
            <div className="card" style={{ backgroundColor: 'rgba(0,0,0,0.3)', minHeight: '250px' }}>
              <PatternIllustration patternId={pattern.illustration} />
            </div>
            <div className="flex-col gap-md">
              <div className="cp-section">
                <h3 className="cp-section-title"><Info size={16} /> Deskripsi</h3>
                <p className="text-secondary" style={{ fontSize: '15px' }}>{pattern.description}</p>
              </div>
              
              <div className="cp-section" style={{ flex: 1 }}>
                <h3 className="cp-section-title">Psikologi Pasar</h3>
                <ul className="cp-list psychology-list">
                  {pattern.psychology.map((item, idx) => (
                    <li key={idx} className="text-secondary">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Rules & Confirmation */}
          <div className="grid-2-cols" style={{ marginBottom: '32px' }}>
            <div className="cp-section">
              <h3 className="cp-section-title">Aturan Formasi (Formation Rules)</h3>
              <ul className="cp-list rules-list">
                {pattern.formation.rules.map((rule, idx) => (
                  <li key={idx} className="text-secondary"><span style={{ color: categoryMeta.color }}>•</span> {rule}</li>
                ))}
              </ul>
              <div className="mt-4 text-sm">
                <span className="text-muted">Minimum Swings:</span> <span className="font-bold">{pattern.formation.minSwings}</span>
              </div>
            </div>
            
            <div className="cp-section">
              <h3 className="cp-section-title">Konfirmasi Validitas</h3>
              <ul className="cp-list rules-list">
                {pattern.confirmation.map((conf, idx) => (
                  <li key={idx} className="text-secondary"><Check size={14} color="var(--bullish)" /> {conf}</li>
                ))}
              </ul>
              <div className="card mt-4 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <h4 className="text-sm font-bold mb-2">Konfirmasi Volume:</h4>
                <div className="text-sm flex-col gap-xs">
                  <div><span className="text-muted">Konsolidasi:</span> <span className="text-secondary">{pattern.volume.consolidation}</span></div>
                  <div><span className="text-muted">Breakout:</span> <span className="text-primary">{pattern.volume.breakout}</span></div>
                  <div><span className="text-muted">Risiko (False Break):</span> <span className="text-warning">{pattern.volume.falseBreak}</span></div>
                </div>
              </div>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Trading Strategy (Entry, SL, TP) */}
          <h3 className="cp-section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Strategi Trading</h3>
          
          <div className="grid-3-cols" style={{ marginBottom: '32px' }}>
            {/* Entry */}
            <div className="card cp-strategy-card">
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--info)' }}><Target size={18} /> Entry</h4>
              <div className="mt-3 flex-col gap-sm text-sm">
                <div>
                  <div className="font-semibold text-primary mb-1">Aggressive:</div>
                  <div className="text-secondary">{pattern.entry.aggressive}</div>
                </div>
                <div>
                  <div className="font-semibold text-primary mb-1">Conservative:</div>
                  <div className="text-secondary">{pattern.entry.conservative}</div>
                </div>
              </div>
            </div>

            {/* Stop Loss */}
            <div className="card cp-strategy-card">
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--bearish)' }}><TrendingDown size={18} /> Stop Loss</h4>
              <div className="mt-3 text-sm text-secondary">
                {pattern.stopLoss}
              </div>
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-xs text-muted">Risk Level:</span>
                <span className="ml-2 cp-badge" style={{ 
                  backgroundColor: pattern.risk === 'High' ? 'var(--bearish-bg)' : pattern.risk === 'Low' ? 'var(--bullish-bg)' : 'var(--neutral-bg)',
                  color: pattern.risk === 'High' ? 'var(--bearish)' : pattern.risk === 'Low' ? 'var(--bullish)' : 'var(--neutral)',
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                }}>
                  {pattern.risk}
                </span>
              </div>
            </div>

            {/* Take Profit */}
            <div className="card cp-strategy-card">
              <h4 className="font-bold flex-row items-center gap-xs" style={{ color: 'var(--bullish)' }}><TrendingUp size={18} /> Take Profit</h4>
              <div className="mt-3 text-sm text-secondary">
                {pattern.takeProfit}
              </div>
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-xs text-muted mb-1">Target Formula:</div>
                <div className="font-mono text-xs p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--primary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {pattern.targetFormula}
                </div>
              </div>
            </div>
          </div>

          <hr className="cp-divider" />

          {/* Bottom Section: Mistakes, Checklist, Tips */}
          <div className="grid-3-cols" style={{ marginBottom: '16px' }}>
            <div className="cp-section">
              <h3 className="cp-section-title text-bearish"><AlertTriangle size={16} /> Kesalahan Umum</h3>
              <ul className="cp-list rules-list text-sm">
                {pattern.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="text-secondary"><X size={14} color="var(--bearish)" /> {mistake}</li>
                ))}
              </ul>
            </div>
            
            <div className="cp-section">
              <h3 className="cp-section-title text-bullish"><Check size={16} /> Checklist Setup</h3>
              <ul className="cp-list rules-list text-sm">
                {pattern.checklist.map((item, idx) => (
                  <li key={idx} className="text-secondary"><Check size={14} color="var(--bullish)" /> {item}</li>
                ))}
              </ul>
            </div>

            <div className="cp-section">
              <h3 className="cp-section-title text-neutral"><AlertCircle size={16} /> Tips Tambahan</h3>
              <ul className="cp-list rules-list text-sm">
                {pattern.tips.map((tip, idx) => (
                  <li key={idx} className="text-secondary"><span style={{color:'var(--neutral)'}}>💡</span> {tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
