import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { CATEGORIES, BADGES } from '../../data/chartpatterns';
import PatternIllustration from './PatternIllustration';

export default function PatternCard({ pattern, isFavorite, onToggleFavorite, onClick }) {
  const categoryMeta = CATEGORIES[pattern.category];
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(pattern.id);
  };

  const renderStars = () => {
    if (pattern.reliability === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Unrated</span>;
    
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={11} 
            fill={star <= pattern.reliability ? categoryMeta.color : "none"} 
            color={star <= pattern.reliability ? categoryMeta.color : "rgba(255,255,255,0.15)"}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="ide-panel flex-col" 
      onClick={() => onClick(pattern.id)}
      style={{
        cursor: 'pointer',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        position: 'relative',
        height: '100%',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(10, 10, 10, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = categoryMeta.color;
        e.currentTarget.style.boxShadow = `0 8px 24px ${categoryMeta.color}15`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: Category Badge & Favorite Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span 
          style={{ 
            fontSize: '9px', 
            backgroundColor: categoryMeta.bg, 
            color: categoryMeta.color, 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            border: `1px solid ${categoryMeta.color}30`
          }}
        >
          {categoryMeta.name}
        </span>

        <button 
          onClick={handleFavoriteClick}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            color: isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'color 0.2s',
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
          onMouseLeave={(e) => { if(!isFavorite) e.currentTarget.style.color = 'rgba(255,255,255,0.2)' }}
        >
          <Star size={16} fill={isFavorite ? "#fbbf24" : "none"} />
        </button>
      </div>

      {/* Illustration Box */}
      <div style={{ 
        height: '110px', 
        width: '100%', 
        backgroundColor: 'rgba(0,0,0,0.15)', 
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.02)'
      }}>
        <PatternIllustration patternId={pattern.illustration} />
      </div>

      {/* Details Box */}
      <div className="flex-col" style={{ gap: '10px', width: '100%' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {pattern.name}
        </h3>
        
        {/* Stats Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Keandalan (Reliability)</span>
            <span>{renderStars()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Success Rate</span>
            <span 
              style={{ 
                color: pattern.successRate === 'High' ? 'var(--bullish)' : pattern.successRate === 'Low' ? 'var(--bearish)' : 'var(--neutral)', 
                fontWeight: 700 
              }}
            >
              {pattern.successRate}
            </span>
          </div>
        </div>

        {/* Badges pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {pattern.badges && pattern.badges.map(badgeName => {
            const badgeMeta = BADGES[badgeName];
            if (!badgeMeta) return null;
            return (
              <span 
                key={badgeName} 
                style={{ 
                  fontSize: '9px', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'nowrap'
                }}
              >
                {badgeName}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Footer CTA */}
      <div style={{ 
        width: '100%',
        paddingTop: '12px', 
        borderTop: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: categoryMeta.color,
        fontSize: '11px',
        fontWeight: '600',
        transition: 'all 0.2s'
      }}>
        <span>Pelajari Analisis Detail</span>
        <ArrowRight size={12} className="cta-arrow" style={{ transition: 'transform 0.2s' }} />
      </div>
    </div>
  );
}
