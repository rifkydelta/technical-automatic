import React, { useState } from 'react';
import TrendView from './technical/TrendView';
import MomentumView from './technical/MomentumView';
import VolatilityView from './technical/VolatilityView';
import LevelView from './technical/LevelView';
import StrategyView from './technical/StrategyView';
import HistoricalBacktestView from './technical/HistoricalBacktestView';
import { Activity } from 'lucide-react';

export default function TechnicalTab({ data }) {
  const [activeSubTab, setActiveSubTab] = useState('trend');

  if (!data || !data.technical_detail) {
    return (
      <div className="card text-center" style={{ padding: '32px' }}>
        <p className="text-secondary">Detailed technical data is not available for this asset.</p>
      </div>
    );
  }

  const { technical_detail } = data;

  const renderContent = () => {
    switch(activeSubTab) {
      case 'trend': return <TrendView trendData={technical_detail.trend} />;
      case 'momentum': return <MomentumView momentumData={technical_detail.momentum} />;
      case 'volatility': return <VolatilityView volData={technical_detail.volatility} lastPrice={data.last_price} />;
      case 'levels': return <LevelView levelsData={technical_detail.levels} />;
      case 'strategy': return <StrategyView strategiesData={technical_detail.strategies} />;
      case 'backtest': return <HistoricalBacktestView historicalData={technical_detail.historical_backtest} />;
      default: return null;
    }
  };

  const getSubTabClass = (id) => {
    return `sub-tab-pill ${activeSubTab === id ? 'active' : ''}`;
  };

  return (
    <div className="card flex-col" style={{ padding: '32px', gap: '24px' }}>
      
      {/* Header */}
      <div className="flex-col gap-xs">
        <div className="text-xs font-semibold tracking-widest uppercase text-muted">
          ANALISIS TEKNIKAL • {data.ticker} • HARIAN
        </div>
        <div className="text-xs text-secondary opacity-80">
          Last Update: {data.date}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card flex-col gap-xs" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted">Tren Utama (EMA 200)</span>
          <span className="text-xl font-bold" style={{ color: technical_detail.trend.main_trend === 'Bullish' ? 'var(--bullish)' : 'var(--bearish)' }}>
            {technical_detail.trend.main_trend}
          </span>
        </div>
        <div className="card flex-col gap-xs" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted">Tren Pendek (EMA 20)</span>
          <span className="text-xl font-bold" style={{ color: technical_detail.trend.short_term_trend === 'Bullish' ? 'var(--bullish)' : 'var(--bearish)' }}>
            {technical_detail.trend.short_term_trend}
          </span>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="quick-metrics">
        <div className="metric-chip">
          <span className="text-muted">EMA 20:</span>
          <span className="font-mono text-primary">{Math.round(data.indicators.ema20 || 0).toLocaleString()}</span>
        </div>
        <div className="metric-chip">
          <span className="text-muted">EMA 50:</span>
          <span className="font-mono text-primary">{Math.round(data.indicators.ema50 || 0).toLocaleString()}</span>
        </div>
        <div className="metric-chip">
          <span className="text-muted">EMA 200:</span>
          <span className="font-mono text-primary">{Math.round(data.indicators.ema200 || 0).toLocaleString()}</span>
        </div>
        <div className="metric-chip">
          <span className="text-muted">ADX:</span>
          <span className="font-mono text-primary">{(data.indicators.adx || 0).toFixed(1)}</span>
        </div>
        <div className="metric-chip">
          <span className="text-muted">RSI:</span>
          <span className="font-mono text-primary">{(data.indicators.rsi || 0).toFixed(1)}</span>
        </div>
        <div className="metric-chip">
          <span className="text-muted">ATR:</span>
          <span className="font-mono text-primary">{(data.indicators.atr || 0).toFixed(1)}</span>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Sub Navigation */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }} className="quick-metrics">
        <button className={getSubTabClass('trend')} onClick={() => setActiveSubTab('trend')}>Tren</button>
        <button className={getSubTabClass('momentum')} onClick={() => setActiveSubTab('momentum')}>Momentum</button>
        <button className={getSubTabClass('volatility')} onClick={() => setActiveSubTab('volatility')}>Volatilitas</button>
        <button className={getSubTabClass('levels')} onClick={() => setActiveSubTab('levels')}>Level Harga</button>
        <button className={getSubTabClass('strategy')} onClick={() => setActiveSubTab('strategy')}>Strategi</button>
        <button className={getSubTabClass('backtest')} onClick={() => setActiveSubTab('backtest')}>Backtest</button>
      </div>

      {/* Main Content Area */}
      <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {renderContent()}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={12} color="var(--info)" />
          Powered by Advanced Technical Engine
        </div>
      </div>
    </div>
  );
}
