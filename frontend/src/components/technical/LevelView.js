import React from 'react';
import { Shield, ShieldAlert, Activity } from 'lucide-react';

export default function LevelView({ levelsData }) {
  if (!levelsData || levelsData.length === 0) return null;

  const resistances = levelsData.filter(l => l.level_type === 'resistance');
  const current = levelsData.find(l => l.level_type === 'current');
  const supports = levelsData.filter(l => l.level_type === 'support');

  const getStrengthBadge = (strength) => {
    let color = 'var(--text-muted)';
    let icon = null;

    if (strength === 'Strong') {
      color = 'var(--info)';
      icon = <ShieldAlert size={12} />;
    } else if (strength === 'Medium') {
      color = 'var(--neutral)';
      icon = <Shield size={12} />;
    } else if (strength === 'Weak') {
      color = 'var(--text-secondary)';
      icon = <Shield size={12} style={{ opacity: 0.6 }} />;
    }

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: color, padding: '4px 0' }}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-widest">{strength}</span>
      </div>
    );
  };

  const LevelCard = ({ level, type }) => {
    const isRes = type === 'resistance';
    const accentColor = isRes ? 'var(--bearish)' : 'var(--bullish)';
    const bgColor = isRes ? 'var(--bearish-bg)' : 'var(--bullish-bg)';

    return (
      <div className="card flex-col justify-between" style={{ 
        padding: '24px', 
        gap: '20px', 
        borderTop: `2px solid ${accentColor}`, 
        backgroundColor: 'rgba(255, 255, 255, 0.015)' 
      }}>
        <div className="flex-col gap-xs">
          <div className="flex-row justify-between items-center mb-1">
             <span className="text-sm font-bold uppercase tracking-widest" style={{ color: accentColor }}>
               {level.label}
             </span>
             {level.distance_pct !== undefined && (
               <span className="text-xs font-mono font-semibold" style={{ 
                 color: accentColor,
                 backgroundColor: bgColor,
                 padding: '4px 8px',
                 borderRadius: '6px'
               }}>
                 {level.distance_pct > 0 ? '+' : ''}{level.distance_pct.toFixed(2)}%
               </span>
             )}
          </div>
          <div className="text-3xl font-mono font-bold text-primary">
            {Math.round(level.price).toLocaleString()}
          </div>
        </div>
        
        <div className="flex-col gap-xs pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {getStrengthBadge(level.strength)}
          <p className="text-xs text-secondary" style={{ lineHeight: '1.5' }}>
            {level.reason}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-col gap-lg">
      <div className="flex-col gap-sm">
        <h2 className="text-2xl font-bold flex-row items-center gap-sm">
          <Activity size={24} className="text-info" />
          Price Levels
        </h2>
        <p className="text-sm text-secondary" style={{ maxWidth: '65ch', lineHeight: '1.6' }}>
          Tingkat harga penting berdasarkan aksi harga masa lalu dan konsolidasi, diurutkan dari tertinggi hingga terendah.
        </p>
      </div>

      <div className="flex-col gap-md">
        {/* Resistance Grid */}
        {resistances.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {resistances.map((level, i) => (
              <LevelCard key={`res-${i}`} level={level} type="resistance" />
            ))}
          </div>
        )}

        {/* Current Price Hero */}
        {current && (
          <div className="card" style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px', 
            gap: '24px',
            borderLeft: '4px solid var(--info)',
            backgroundColor: 'rgba(96, 165, 250, 0.05)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px -8px rgba(0,0,0,0.5)'
          }}>
            <div className="flex-col gap-xs">
              <span className="text-xs font-bold text-info uppercase tracking-widest">{current.label}</span>
              <div className="text-4xl font-mono font-bold text-primary" style={{ letterSpacing: '-0.02em' }}>
                {Math.round(current.price).toLocaleString()}
              </div>
            </div>
            <div className="flex-col" style={{ flex: '1 1 200px', minWidth: '200px' }}>
               <span className="text-sm font-semibold text-info mb-1">Harga Saat Ini (LTP)</span>
               <span className="text-xs text-secondary" style={{ lineHeight: '1.5' }}>
                 Baseline pergerakan pasar saat ini. Digunakan sebagai titik acuan untuk resistance dan support.
               </span>
            </div>
          </div>
        )}

        {/* Support Grid */}
        {supports.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {supports.map((level, i) => (
              <LevelCard key={`sup-${i}`} level={level} type="support" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
