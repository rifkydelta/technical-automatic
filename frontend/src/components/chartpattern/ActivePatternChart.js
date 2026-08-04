import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import TradingViewWidget from '../TradingViewWidget';

// Helper to calculate Volume MA20
const calculateVolumeMA = (data, period = 20) => {
  if (!data || data.length < period) return [];
  const maData = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].volume || 0;
    }
    maData.push({ time: data[i].time, value: sum / period });
  }
  return maData;
};

export default function ActivePatternChart({ data, pattern, ticker }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const lineSeriesRefs = useRef([]);
  const predictionSeriesRef = useRef();
  const [chartWidth, setChartWidth] = useState(0);
  const [chartType, setChartType] = useState('tradingview'); // Default to TradingView Advanced Widget

  // Resize observer
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || chartType !== 'lightweight' || !chartContainerRef.current) return;

    // Destroy existing chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      lineSeriesRefs.current = [];
    }

    // Determine colors based on pattern status
    const isBullish = pattern?.name?.toLowerCase().includes('bottom') || pattern?.name?.toLowerCase().includes('bullish');
    const themeColor = isBullish ? '#4ade80' : '#f43f5e';
    
    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 440, // Increased height for volume visibility
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        rightOffset: pattern && pattern.status === 'Forming' ? 15 : 5,
      },
    });

    chartRef.current = chart;

    // Configure Price Scales Margins (Price at top 75%, Volume at bottom 25%)
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.08,
        bottom: 0.30,
      },
    });

    // Add Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#4ade80',
      wickDownColor: '#f43f5e',
    });
    seriesRef.current = candlestickSeries;

    // Map Price Data
    const chartData = data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candlestickSeries.setData(chartData);

    // Add Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume-scale',
    });

    // Map Volume Data (Semi-transparent bars)
    const volumeData = data.map(d => ({
      time: d.time,
      value: d.volume || 0,
      color: d.close >= d.open ? 'rgba(74, 222, 128, 0.25)' : 'rgba(244, 63, 94, 0.25)',
    }));
    volumeSeries.setData(volumeData);

    // Add Volume MA20 Series
    const volumeMASeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1.5,
      priceScaleId: 'volume-scale',
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    
    const volumeMAData = calculateVolumeMA(data, 20);
    volumeMASeries.setData(volumeMAData);

    // Configure Volume Price Scale (Must be configured after series using it has been added)
    chart.priceScale('volume-scale').applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
      visible: false, // hide scale numbers to look clean
    });

    // Draw Pattern Lines
    if (pattern) {
      pattern.lines.forEach((line) => {
        let lineColor = 'rgba(255, 255, 255, 0.5)';
        let lineWidth = 3; // Thicker lines for visibility
        let lineStyle = 0; // Solid
        
        if (line.type === 'neckline') {
          lineColor = '#60a5fa'; // Blue
          lineStyle = 2; // Dashed
        } else if (line.type === 'support') {
          lineColor = '#4ade80';
        } else if (line.type === 'resistance') {
          lineColor = '#f43f5e';
        }

        const lineSeries = chart.addLineSeries({
          color: lineColor,
          lineWidth: lineWidth,
          lineStyle: lineStyle,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        });

        // Ensure points are sorted by time
        const points = [...line.points].sort((a, b) => new Date(a.time) - new Date(b.time));
        lineSeries.setData(points.map(p => ({ time: p.time, value: p.val })));
        lineSeriesRefs.current.push(lineSeries);

        // Highlight line vertices using markers
        const lineMarkers = points.map((p, idx) => ({
          time: p.time,
          position: 'inBar',
          color: lineColor,
          shape: 'circle',
          size: 1,
        }));
        lineSeries.setMarkers(lineMarkers);
      });

      // Draw Prediction Line if present
      if (pattern.prediction && pattern.prediction.length > 0) {
        const predSeries = chart.addLineSeries({
          color: themeColor,
          lineWidth: 3,
          lineStyle: 3, // Dotted
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        
        // Handle "FUTURE" time tags by calculating next trading days
        let lastRealTime = chartData[chartData.length - 1].time;
        const predPoints = pattern.prediction.map((p, idx) => {
          if (p.time === 'FUTURE') {
            const lastDate = new Date(lastRealTime);
            lastDate.setDate(lastDate.getDate() + 5 + (idx * 2));
            return {
              time: lastDate.toISOString().split('T')[0],
              value: p.val
            };
          }
          lastRealTime = p.time;
          return { time: p.time, value: p.val };
        });

        predSeries.setData(predPoints);
        predictionSeriesRef.current = predSeries;

        // Draw direction arrow at the end of prediction line
        if (predPoints.length > 1) {
          const firstPt = predPoints[0];
          const lastPt = predPoints[predPoints.length - 1];
          const isUp = lastPt.value > firstPt.value;
          predSeries.setMarkers([
            {
              time: lastPt.time,
              position: 'inBar',
              color: themeColor,
              shape: isUp ? 'arrowUp' : 'arrowDown',
              text: isUp ? 'Proyeksi Naik' : 'Proyeksi Turun',
              size: 2,
            }
          ]);
        }
      }
    }

    chart.timeScale().fitContent();

  }, [data, pattern, chartType]);

  if (!pattern) return null;

  const isForming = pattern.status === 'Forming';
  
  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <div className="flex-row justify-between items-center flex-wrap gap-md" style={{ marginBottom: '24px' }}>
        <div className="flex-col gap-xs">
          <div className="flex-row items-center gap-sm">
            <span className="live-dot" style={{ backgroundColor: isForming ? 'var(--warning)' : 'var(--bullish)' }}></span>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: isForming ? 'var(--warning)' : 'var(--bullish)' }}>
              {isForming ? 'Pattern Forming' : 'Pattern Confirmed'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{pattern.name}</h2>
        </div>
        
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
              Pattern Static
            </button>
          </div>

          <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.05)', margin: 0 }}>
            <div className="text-xs text-muted mb-1 flex-row items-center gap-xs"><Target size={14}/> Proyeksi Target</div>
            <div className="text-xl font-bold" style={{ color: pattern.name.toLowerCase().includes('top') ? 'var(--bearish)' : 'var(--bullish)' }}>
              {pattern.prediction && pattern.prediction.length > 1 
                ? `Rp ${pattern.prediction[pattern.prediction.length - 1].val.toLocaleString()}` 
                : 'Menunggu konfirmasi'}
            </div>
          </div>
        </div>
      </div>

      {isForming && (
        <div className="bg-neutral-light text-sm" style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertTriangle size={16} style={{ color: 'var(--neutral)', marginTop: '2px', flexShrink: 0 }} />
          <div className="text-secondary">
            Pola <strong>{pattern.name}</strong> saat ini sedang dalam fase pembentukan. Harga belum menembus <em>neckline</em> atau level konfirmasi. Sangat disarankan untuk <strong className="text-primary">menunggu hingga status berubah menjadi Confirmed</strong> sebelum mengambil keputusan entry (Buy/Sell) agar terhindar dari <em>false breakout</em>.
          </div>
        </div>
      )}

      {/* The Chart Canvas or TV Widget */}
      {chartType === 'tradingview' ? (
        <TradingViewWidget ticker={ticker} height="440px" />
      ) : (
        <>
          <div 
            ref={chartContainerRef} 
            style={{ 
              width: '100%', 
              height: '440px', 
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }} 
          />

          {/* Legend for indicators */}
          <div className="flex-row justify-center gap-md mt-4" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <div className="flex-row items-center gap-xs">
              <div style={{ width: '12px', height: '3px', backgroundColor: '#f59e0b' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Volume MA 20</span>
            </div>
            <div className="flex-row items-center gap-xs">
              <div style={{ width: '12px', height: '6px', backgroundColor: 'rgba(74, 222, 128, 0.4)' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Volume (Naik)</span>
            </div>
            <div className="flex-row items-center gap-xs">
              <div style={{ width: '12px', height: '6px', backgroundColor: 'rgba(244, 63, 94, 0.4)' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Volume (Turun)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
