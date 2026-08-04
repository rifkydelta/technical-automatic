import React from 'react';
import { Star } from 'lucide-react';
import CandlestickIllustration from './CandlestickIllustration';

export default function CandlestickCard({ pattern, onClick, isFavorite, onToggleFavorite }) {
  const getBadgeColor = (type) => {
    switch (type) {
      case 'bullish': return 'var(--bullish)';
      case 'bearish': return 'var(--bearish)';
      default: return 'var(--text-secondary)';
    }
  };

  const badgeColor = getBadgeColor(pattern.type);

  return (
    <div 
      className="ide-panel fade-in"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        borderTop: `2px solid ${badgeColor}`
      }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(pattern.id);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isFavorite ? 'var(--warning)' : 'var(--text-muted)',
          padding: '4px',
          zIndex: 2,
          transition: 'all 0.2s'
        }}
      >
        <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
        <CandlestickIllustration patternId={pattern.id} />
      </div>

      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {pattern.name}
        </div>
        <div style={{ fontSize: '11px', color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {pattern.category}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < pattern.reliability ? "var(--warning)" : "none"} color={i < pattern.reliability ? "var(--warning)" : "var(--text-muted)"} />
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to Learn</div>
      </div>
    </div>
  );
}
