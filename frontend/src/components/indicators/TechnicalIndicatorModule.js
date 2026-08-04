import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Award, CheckCircle } from 'lucide-react';
import IndicatorsOverview from './IndicatorsOverview';
import IndicatorsChapter from './IndicatorsChapter';
import MiniSimulator from './MiniSimulator';

const CHAPTERS = [
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Lagging vs Leading' },
  { id: 3, title: 'Moving Average (MA)' },
  { id: 4, title: 'MACD' },
  { id: 5, title: 'Bollinger Bands' },
  { id: 6, title: 'RSI' },
  { id: 7, title: 'Fibonacci Retracement' },
  { id: 8, title: 'How to Combine' },
  { id: 9, title: 'Common Mistakes' },
  { id: 10, title: 'Summary & Practice' },
  { id: 11, title: 'Mini Simulator' }
];

export default function TechnicalIndicatorModule() {
  const [currentChapter, setCurrentChapter] = useState(0); // 0 = Overview
  const [completedChapters, setCompletedChapters] = useState([]);
  const [isSimulatorBadgeUnlocked, setIsSimulatorBadgeUnlocked] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('indicators_learning_progress');
    const badge = localStorage.getItem('indicators_simulator_badge');
    
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setCompletedChapters(parsed.completed || []);
      if (parsed.currentChapter !== undefined) {
        setCurrentChapter(parsed.currentChapter);
      }
    }
    
    if (badge === 'true') {
      setIsSimulatorBadgeUnlocked(true);
    }
  }, []);

  // Update progress in localStorage on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const progress = {
      currentChapter,
      completed: completedChapters
    };
    localStorage.setItem('indicators_learning_progress', JSON.stringify(progress));
  }, [currentChapter, completedChapters]);

  const handleNext = () => {
    if (currentChapter < CHAPTERS.length) {
      // Mark current chapter as completed before proceeding
      if (currentChapter > 0 && !completedChapters.includes(currentChapter)) {
        setCompletedChapters(prev => [...prev, currentChapter]);
      }
      setCurrentChapter(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const handleChapterClick = (id) => {
    setCurrentChapter(id);
  };

  if (currentChapter === 0) {
    return <IndicatorsOverview onStart={() => setCurrentChapter(1)} />;
  }

  return (
    <div className="flex-col w-full fade-in" style={{ position: 'relative' }}>
      
      {/* progress bar */}
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

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar navigation */}
        <div style={{ width: '200px', flexShrink: 0, position: 'sticky', top: '32px', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Chapters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {CHAPTERS.map((chap) => {
              const isCompleted = completedChapters.includes(chap.id) || chap.id < currentChapter;
              const isActive = chap.id === currentChapter;
              
              return (
                <button
                  key={chap.id}
                  onClick={() => handleChapterClick(chap.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '11px',
                    textAlign: 'left',
                    color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '2px',
                    background: isActive ? 'var(--info)' : isCompleted ? 'var(--bullish)' : 'rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}></div>
                  <span style={{ lineHeight: '1.3' }}>{chap.title}</span>
                </button>
              );
            })}
          </div>

          {/* Badge Display in Sidebar */}
          {isSimulatorBadgeUnlocked && (
            <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(16,185,129,0.05)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={14} color="var(--bullish)" />
              <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--bullish)', textTransform: 'uppercase' }}>
                Master Indicator
              </div>
            </div>
          )}
        </div>

        {/* Chapter content renderer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '320px' }}>
          <div style={{ minHeight: '50vh' }}>
            {currentChapter === 11 ? (
              <MiniSimulator />
            ) : (
              <IndicatorsChapter chapterId={currentChapter} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '32px', paddingTop: '16px' }}>
            <button
              onClick={handlePrev}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
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

            {currentChapter < CHAPTERS.length ? (
              <button
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  background: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.15)',
                  borderRadius: '6px',
                  color: 'var(--info)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              /* If on chapter 11 (Simulator), do not show a next button */
              <div style={{ width: '10px' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
