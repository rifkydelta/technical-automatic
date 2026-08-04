'use client';
import ScreenerCard from './ScreenerCard';

export default function DashboardScreener({ results, onTickerClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex-col items-center justify-center" style={{ padding: '60px 0', gap: '16px' }}>
        <div className="live-dot" style={{ width: '12px', height: '12px' }}></div>
        <span className="text-secondary font-mono tracking-widest uppercase">Scanning Market...</span>
      </div>
    );
  }

  if (!results || results.length === 0) return null;

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="flex-row items-center gap-sm" style={{ marginBottom: '24px' }}>
        <h2 className="text-xl font-bold font-mono tracking-wider">MARKET SCREENER</h2>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        <span className="text-xs text-secondary font-mono">{results.length} TICKERS</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {results.map((item, idx) => (
          <ScreenerCard 
            key={`${item.ticker}-${idx}`} 
            data={item} 
            onClick={onTickerClick} 
          />
        ))}
      </div>
    </div>
  );
}
