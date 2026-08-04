import React, { useState } from 'react';
import { BookOpen, BarChart2, CandlestickChart, Activity, TrendingUp } from 'lucide-react';
import ChartPatternTab from './chartpattern/ChartPatternTab';
import VolumeIndicatorModule from './volume/VolumeIndicatorModule';
import CandlestickIndicatorModule from './candlestick/CandlestickIndicatorModule';
import TechnicalIndicatorModule from './indicators/TechnicalIndicatorModule';

export default function LearningCenter() {
  const [activeModule, setActiveModule] = useState('chart-pattern');

  return (
    <div className="lc-container ide-panel">
      {/* Sidebar Navigation */}
      <div className="lc-sidebar flex-col" style={{ gap: '12px', paddingTop: '20px' }}>
        <h2 style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: '12px', paddingLeft: '16px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={12} />
          Modules
        </h2>
        
        <div className="flex-col" style={{ gap: '4px' }}>
          <button 
            className={`lc-module-item ${activeModule === 'chart-pattern' ? 'active' : ''}`}
            onClick={() => setActiveModule('chart-pattern')}
          >
            <Activity size={14} />
            <span style={{ fontSize: '13px' }}>Chart Pattern</span>
          </button>
          
          <button 
            className={`lc-module-item ${activeModule === 'volume' ? 'active' : ''}`}
            onClick={() => setActiveModule('volume')}
          >
            <BarChart2 size={14} />
            <span style={{ fontSize: '13px' }}>Volume Indicator</span>
          </button>

          <button 
            className={`lc-module-item ${activeModule === 'candlestick' ? 'active' : ''}`}
            onClick={() => setActiveModule('candlestick')}
          >
            <CandlestickChart size={14} />
            <span style={{ fontSize: '13px' }}>Candlestick Pattern</span>
          </button>
          
          <button 
            className={`lc-module-item ${activeModule === 'technical-indicators' ? 'active' : ''}`}
            onClick={() => setActiveModule('technical-indicators')}
          >
            <TrendingUp size={14} />
            <span style={{ fontSize: '13px' }}>Technical Indicators</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lc-content">
        {activeModule === 'chart-pattern' && <ChartPatternTab standalone={true} />}
        {activeModule === 'volume' && <VolumeIndicatorModule />}
        {activeModule === 'candlestick' && <CandlestickIndicatorModule />}
        {activeModule === 'technical-indicators' && <TechnicalIndicatorModule />}
      </div>
    </div>
  );
}
