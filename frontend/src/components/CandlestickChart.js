'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import TradingViewWidget from './TradingViewWidget';

const calculateEMA = (data, period) => {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaData = [];
  let ema = data[0].close;
  emaData.push({ time: data[0].time, value: ema });
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    emaData.push({ time: data[i].time, value: ema });
  }
  return emaData;
};

export default function CandlestickChart({ data }) {
  const chartContainerRef = useRef();
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('tradingview'); // Default to native TradingView Advanced Widget

  useEffect(() => {
    if (!data || chartType !== 'lightweight' || !chartContainerRef.current) return;

    let activeData = data.ohlcv_daily;
    if (timeframe === '1H' && data.ohlcv_1h) activeData = data.ohlcv_1h;
    if (timeframe === '15M' && data.ohlcv_15m) activeData = data.ohlcv_15m;

    if (!activeData || activeData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa', // Zinc 400
        fontFamily: 'var(--font-mono), monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(255,255,255,0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.1)',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    const chartData = activeData.map(bar => {
      let parsedTime = bar.time;
      if (timeframe !== '1D') {
        const d = new Date(bar.time);
        if (!isNaN(d.getTime())) {
          parsedTime = Math.floor(d.getTime() / 1000);
        }
      }
      return {
        time: parsedTime,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close
      };
    });

    // Validasi time yang duplicate atau tidak berurutan karena API
    // lightweight-charts sangat sensitif, harus di-deduplicate
    const uniqueData = [];
    const seenTimes = new Set();
    for (const d of chartData) {
      if (!seenTimes.has(d.time)) {
        seenTimes.add(d.time);
        uniqueData.push(d);
      }
    }
    
    // Sort ascending by time just in case
    uniqueData.sort((a, b) => {
      const ta = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
      const tb = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
      return ta - tb;
    });

    candlestickSeries.setData(uniqueData);

    if (timeframe === '1D' || timeframe === '1H') {
      if (data.indicators.ema20) {
        candlestickSeries.createPriceLine({ price: data.indicators.ema20, color: '#3b82f6', lineWidth: 1, lineStyle: 2, title: 'EMA20 (Daily)' });
      }
      if (data.indicators.ema50) {
        candlestickSeries.createPriceLine({ price: data.indicators.ema50, color: '#f59e0b', lineWidth: 1, lineStyle: 2, title: 'EMA50 (Daily)' });
      }
      if (data.indicators.ema200) {
        candlestickSeries.createPriceLine({ price: data.indicators.ema200, color: '#f43f5e', lineWidth: 1, lineStyle: 0, title: 'EMA200 (Daily)' });
      }
    } else if (timeframe === '15M') {
      const ema5Data = calculateEMA(uniqueData, 5);
      const ema10Data = calculateEMA(uniqueData, 10);
      const ema200Data = calculateEMA(uniqueData, 200);
      
      const ema5Series = chart.addLineSeries({ color: '#facc15', lineWidth: 2, title: 'EMA 5' });
      ema5Series.setData(ema5Data);
      
      const ema10Series = chart.addLineSeries({ color: '#38bdf8', lineWidth: 2, title: 'EMA 10' });
      ema10Series.setData(ema10Data);

      const ema200Series = chart.addLineSeries({ color: '#f43f5e', lineWidth: 2, title: 'EMA 200' });
      ema200Series.setData(ema200Data);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, timeframe, chartType]);

  if (!data || !data.ohlcv_daily) return null;

  return (
    <div className="card flex-col">
      <div className="flex-row justify-between items-center flex-wrap gap-md" style={{ marginBottom: '24px' }}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-secondary">
          Price Action ({chartType === 'tradingview' ? 'Real-Time GMT+7' : timeframe === '1D' ? 'Daily' : timeframe})
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Chart Type Toggle */}
          <div className="flex-row gap-xs items-center" style={{ 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            padding: '4px', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setChartType('tradingview')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: chartType === 'tradingview' ? 'var(--info)' : 'transparent',
                color: chartType === 'tradingview' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: chartType === 'tradingview' ? '800' : '500',
                fontSize: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              TradingView Live
            </button>
            <button
              onClick={() => setChartType('lightweight')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: chartType === 'lightweight' ? 'var(--info)' : 'transparent',
                color: chartType === 'lightweight' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: chartType === 'lightweight' ? '800' : '500',
                fontSize: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Session Static
            </button>
          </div>

          {/* Timeframe Selector (Only shown in lightweight/static chart) */}
          {chartType === 'lightweight' && (
            <div className="flex-row gap-xs items-center" style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              padding: '4px', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {['1D', '1H', '15M'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: timeframe === tf ? 'var(--bullish)' : 'transparent',
                    color: timeframe === tf ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontWeight: timeframe === tf ? '800' : '500',
                    fontSize: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {chartType === 'tradingview' ? (
        <TradingViewWidget ticker={data.ticker} height="480px" />
      ) : (
        <div ref={chartContainerRef} style={{ width: '100%', height: '480px' }} />
      )}
      
      {chartType === 'lightweight' && timeframe === '15M' && (
        <div className="flex-row justify-center gap-md mt-4" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div className="flex-row items-center gap-xs">
            <div style={{ width: '12px', height: '3px', backgroundColor: '#facc15' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>EMA 5 (Fast)</span>
          </div>
          <div className="flex-row items-center gap-xs">
            <div style={{ width: '12px', height: '3px', backgroundColor: '#38bdf8' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>EMA 10 (Slow)</span>
          </div>
          <div className="flex-row items-center gap-xs">
            <div style={{ width: '12px', height: '3px', backgroundColor: '#f43f5e' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>EMA 200 (Trend)</span>
          </div>
        </div>
      )}
    </div>
  );
}
