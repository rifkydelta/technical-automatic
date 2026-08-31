'use client';
import React from 'react';

export default function LoadingState() {
  return (
    <main className="container flex-col gap-lg" style={{ paddingBottom: '80px', marginTop: '16px' }}>
      {/* 1. Header Skeleton (Exact 1-to-1 match with Header.js) */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
        <div className="flex-row justify-between flex-wrap gap-md mobile-col" style={{ alignItems: 'stretch' }}>
          {/* Left: Subtitle, Logo & Ticker Info */}
          <div className="flex-col gap-xs">
            <div className="flex-row items-center gap-sm mb-1" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '11px' }} />
              <div className="skeleton skeleton-text" style={{ width: '150px', height: '11px' }} />
            </div>
            
            <div className="flex-row gap-md items-center">
              {/* 80x80px Company Avatar Logo */}
              <div 
                className="skeleton skeleton-avatar" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }} 
              />

              <div className="flex-col" style={{ gap: '4px' }}>
                <div className="skeleton skeleton-text" style={{ width: '110px', height: '36px', borderRadius: '8px' }} />
                <div className="skeleton skeleton-text" style={{ width: '220px', height: '13px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '90px', height: '20px', borderRadius: '999px', marginTop: '2px' }} />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Price */}
          <div className="flex-col gap-xs justify-between mobile-w-full" style={{ alignItems: 'flex-end' }}>
            <div className="flex-row gap-xs items-center">
              <div className="skeleton skeleton-button" style={{ width: '105px', height: '32px', borderRadius: '8px' }} />
              <div className="skeleton skeleton-button" style={{ width: '95px', height: '32px', borderRadius: '8px' }} />
            </div>

            <div className="flex-col items-end gap-1">
              <div className="skeleton skeleton-text" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '48px', height: '18px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '70px', height: '18px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subtab Switcher Bar Skeleton */}
      <div 
        className="flex-row gap-xs pb-xs border-b border-subtle overflow-x-auto" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px'
        }}
      >
        {[
          { label: 'Overview', width: '85px' },
          { label: 'Technical', width: '95px' },
          { label: 'Financials', width: '100px' },
          { label: 'Forensic & Valuation', width: '155px' },
          { label: 'AI Analyst Engine', width: '145px' },
          { label: 'SMC & Pivots', width: '115px' },
          { label: 'News & Catalysts', width: '135px' }
        ].map((tab, i) => (
          <div 
            key={i} 
            className="skeleton skeleton-badge" 
            style={{ 
              width: tab.width, 
              height: '36px', 
              borderRadius: '10px' 
            }} 
          />
        ))}
      </div>

      {/* 3. TopCards 5-Bento Grid Skeleton (Exact 1-to-1 match with TopCards.js) */}
      <div className="bento-grid">
        {/* 1. SETUP SCORE */}
        <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px', minHeight: '135px' }}>
          <div className="flex-row items-center justify-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '3px' }} />
              <div className="skeleton skeleton-text" style={{ width: '85px', height: '12px' }} />
            </div>
          </div>
          <div className="flex-col gap-xs mt-auto">
            <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '135px', height: '12px', marginTop: '4px' }} />
          </div>
        </div>

        {/* 2. SMC PHASE */}
        <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px', minHeight: '135px' }}>
          <div className="flex-row items-center justify-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '3px' }} />
              <div className="skeleton skeleton-text" style={{ width: '75px', height: '12px' }} />
            </div>
          </div>
          <div className="flex-col gap-xs mt-auto">
            <div className="skeleton skeleton-text" style={{ width: '85px', height: '26px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '110px', height: '12px', marginTop: '4px' }} />
          </div>
        </div>

        {/* 3. TREN UTAMA (1D) */}
        <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px', minHeight: '135px' }}>
          <div className="flex-row items-center justify-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '3px' }} />
              <div className="skeleton skeleton-text" style={{ width: '95px', height: '12px' }} />
            </div>
          </div>
          <div className="flex-col gap-xs mt-auto">
            <div className="skeleton skeleton-text" style={{ width: '70px', height: '22px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '11px', marginTop: '4px' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%', height: '11px' }} />
          </div>
        </div>

        {/* 4. BREAK LEVEL */}
        <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px', minHeight: '135px' }}>
          <div className="flex-row items-center justify-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '3px' }} />
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px' }} />
            </div>
          </div>
          <div className="flex-col gap-xs mt-auto">
            <div className="skeleton skeleton-text" style={{ width: '85px', height: '26px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '130px', height: '12px', marginTop: '4px' }} />
          </div>
        </div>

        {/* 5. INVALIDATION */}
        <div className="card flex-col justify-between" style={{ gridColumn: 'span 1', padding: '20px', minHeight: '135px' }}>
          <div className="flex-row items-center justify-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '3px' }} />
              <div className="skeleton skeleton-text" style={{ width: '90px', height: '12px' }} />
            </div>
          </div>
          <div className="flex-col gap-xs mt-auto">
            <div className="skeleton skeleton-text" style={{ width: '85px', height: '26px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '115px', height: '12px', marginTop: '4px' }} />
          </div>
        </div>
      </div>

      {/* 4. ReltSignalCard Banner Skeleton */}
      <div 
        className="card" 
        style={{ 
          padding: '24px 28px', 
          borderRadius: '24px', 
          backgroundColor: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton skeleton-badge" style={{ width: '140px', height: '22px' }} />
            <div className="skeleton skeleton-text" style={{ width: '280px', height: '28px', borderRadius: '6px' }} />
            <div className="skeleton skeleton-text" style={{ width: '380px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skeleton" style={{ width: '120px', height: '60px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ width: '120px', height: '60px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>

      {/* 5. Candlestick Chart Pro Skeleton */}
      <div 
        className="card flex-col" 
        style={{ 
          padding: '20px', 
          borderRadius: '20px', 
          gap: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}
      >
        {/* Top Control Bar Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skeleton skeleton-badge" style={{ width: '60px', height: '26px' }} />
            <div className="skeleton" style={{ width: '120px', height: '26px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '140px', height: '26px', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton skeleton-badge" style={{ width: '90px', height: '26px' }} />
            <div className="skeleton skeleton-badge" style={{ width: '95px', height: '26px' }} />
            <div className="skeleton skeleton-badge" style={{ width: '85px', height: '26px' }} />
          </div>
        </div>

        {/* Middle Canvas Grid Skeleton with Floating HUD Badge */}
        <div 
          style={{ 
            position: 'relative', 
            height: '520px', 
            width: '100%', 
            borderRadius: '12px', 
            overflow: 'hidden',
            backgroundColor: 'rgba(10, 14, 22, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}
        >
          {/* Floating HUD Legend Skeleton */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '48px', 
              zIndex: 5, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="skeleton skeleton-text" style={{ width: '240px', height: '14px' }} />
            <div className="skeleton skeleton-text" style={{ width: '190px', height: '12px' }} />
          </div>

          {/* Grid lines shimmer */}
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0, opacity: 0.15 }} />
        </div>

        {/* Bottom Range Bar Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['1M', '3M', '6M', '1Y', 'ALL'].map((r) => (
              <div key={r} className="skeleton skeleton-badge" style={{ width: '38px', height: '22px' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skeleton skeleton-text" style={{ width: '110px', height: '12px' }} />
            <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }} />
            <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px' }} />
          </div>
        </div>
      </div>
    </main>
  );
}
