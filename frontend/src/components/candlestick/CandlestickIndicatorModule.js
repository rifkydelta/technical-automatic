import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CandlestickOverview from './CandlestickOverview';
import CandlestickChapter from './CandlestickChapter';

const CHAPTERS = [
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Bullish Candlestick' },
  { id: 3, title: 'Bearish Candlestick' },
  { id: 4, title: 'Neutral Candlestick' },
  { id: 5, title: 'Multi Candle Pattern' },
  { id: 6, title: 'Volume Confirmation' },
  { id: 7, title: 'Summary' }
];

export default function CandlestickIndicatorModule() {
  const [currentChapter, setCurrentChapter] = useState(0); // 0 = Overview

  // Scroll to top on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter]);

  const handleNext = () => {
    if (currentChapter < CHAPTERS.length) {
      setCurrentChapter(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  if (currentChapter === 0) {
    return <CandlestickOverview onStart={() => setCurrentChapter(1)} />;
  }

  return (
    <div className="flex-col w-full fade-in" style={{ position: 'relative' }}>
      {/* Sleek Progress Bar Header */}
      <div className="absolute top-0 left-0 right-0 vol-progress-bar">
        <div 
          className="vol-progress-fill" 
          style={{ width: `${(currentChapter / CHAPTERS.length) * 100}%`, background: 'var(--info)' }}
        ></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 8px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Chapter {currentChapter} <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span> {CHAPTERS.length}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Module Sidebar */}
        <div style={{ width: '200px', flexShrink: 0, position: 'sticky', top: '32px', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Chapters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {CHAPTERS.map((chap) => {
              const isCompleted = chap.id < currentChapter;
              const isActive = chap.id === currentChapter;
              
              return (
                <button
                  key={chap.id}
                  onClick={() => setCurrentChapter(chap.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '12px',
                    textAlign: 'left',
                    color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '2px',
                    background: isActive ? 'var(--info)' : isCompleted ? 'var(--text-secondary)' : 'rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}></div>
                  <span style={{ lineHeight: '1.4' }}>{chap.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minHeight: '50vh' }}>
            <CandlestickChapter chapterId={currentChapter} />
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '32px', paddingTop: '16px' }}>
            <button
              onClick={handlePrev}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                transition: 'color 0.2s'
              }}
            >
              <ArrowLeft size={14} /> {currentChapter === 1 ? 'Overview' : 'Previous'}
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                background: currentChapter === CHAPTERS.length ? 'rgba(74, 222, 128, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                border: currentChapter === CHAPTERS.length ? '1px solid rgba(74, 222, 128, 0.15)' : '1px solid rgba(96, 165, 250, 0.15)',
                borderRadius: '6px',
                color: currentChapter === CHAPTERS.length ? 'var(--bullish)' : 'var(--info)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {currentChapter === CHAPTERS.length ? 'Finish' : 'Next'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
