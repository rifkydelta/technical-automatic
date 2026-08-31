'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { createChart, ColorType, LineStyle, CrosshairMode } from 'lightweight-charts';
import TradingViewWidget from './TradingViewWidget';
import DrawingToolbar from './chart/DrawingToolbar';
import DrawingCanvasOverlay from './chart/DrawingCanvasOverlay';
import DrawingPropertiesBar from './chart/DrawingPropertiesBar';
import { DRAWING_TOOLS, loadDrawings, saveDrawings, generateDrawingId } from '../utils/chartDrawingEngine';
import { 
  calculateEMA, 
  calculateSupertrend, 
  calculateHeikinAshi, 
  calculateVolumeSMA, 
  generateSignalMarkersAndTradePlan 
} from '../utils/reltChartEngine';
import { 
  Maximize2, Minimize2, Camera, RefreshCw, Layers, 
  TrendingUp, Crosshair, BarChart2, Shield, Zap, Sparkles, ChevronDown, Bell, X 
} from 'lucide-react';

export default function CandlestickChart({ data }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef({});

  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState('1D'); // '1D', '1H', '15M'
  const [chartMode, setChartMode] = useState('candles'); // 'candles', 'heikin_ashi', 'line'
  const [chartSource, setChartSource] = useState('lightweight'); // 'lightweight' or 'tradingview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);

  // Interactive Drawing Engine States
  const [drawings, setDrawings] = useState([]);
  const [activeDrawingTool, setActiveDrawingTool] = useState(DRAWING_TOOLS.CURSOR);
  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [isMagnet, setIsMagnet] = useState(false);
  const [isDrawingVisible, setIsDrawingVisible] = useState(true);
  const [drawingPropsPos, setDrawingPropsPos] = useState({ x: 20, y: 20 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Keyboard shortcut: Escape to exit Fullscreen & Body Scroll Lock
  useEffect(() => {
    if (!isFullscreen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const ticker = data?.ticker || 'IDX';

  // Load and auto-save drawings per ticker
  useEffect(() => {
    if (ticker) {
      const loaded = loadDrawings(ticker);
      setDrawings(loaded);
      setSelectedDrawingId(null);
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [ticker]);

  // Drawing Handlers
  const handleAddDrawing = useCallback((newDrawing) => {
    setDrawings((prev) => {
      const next = [...prev, newDrawing];
      saveDrawings(ticker, next);
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return next;
    });
  }, [ticker]);

  const handleUpdateDrawing = useCallback((id, updates) => {
    setDrawings((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
      saveDrawings(ticker, next);
      return next;
    });
  }, [ticker]);

  const handleDeleteDrawing = useCallback((id) => {
    setDrawings((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDrawings(ticker, next);
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return next;
    });
    setSelectedDrawingId(null);
  }, [ticker]);

  const handleDuplicateDrawing = useCallback((id) => {
    setDrawings((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;
      const cloned = {
        ...target,
        id: generateDrawingId(),
        p1: { ...target.p1, price: target.p1.price * 1.01 },
        p2: target.p2 ? { ...target.p2, price: target.p2.price * 1.01 } : undefined,
      };
      const next = [...prev, cloned];
      saveDrawings(ticker, next);
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      setSelectedDrawingId(cloned.id);
      return next;
    });
  }, [ticker]);

  const handleClearAllDrawings = useCallback(() => {
    setDrawings((prev) => {
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      saveDrawings(ticker, []);
      return [];
    });
    setSelectedDrawingId(null);
  }, [ticker]);

  const handleUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      const remaining = u.slice(0, -1);
      setDrawings((curr) => {
        setRedoStack((r) => [...r, curr]);
        saveDrawings(ticker, prev);
        return prev;
      });
      return remaining;
    });
  }, [ticker]);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      const remaining = r.slice(0, -1);
      setDrawings((curr) => {
        setUndoStack((u) => [...u, curr]);
        saveDrawings(ticker, next);
        return next;
      });
      return remaining;
    });
  }, [ticker]);

  // Keyboard Shortcuts for Drawings & Tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key: deselect drawing or cancel active tool
      if (e.key === 'Escape') {
        if (selectedDrawingId) {
          setSelectedDrawingId(null);
        } else if (activeDrawingTool !== DRAWING_TOOLS.CURSOR) {
          setActiveDrawingTool(DRAWING_TOOLS.CURSOR);
        }
      }

      // Delete / Backspace key: remove selected drawing
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDrawingId) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        handleDeleteDrawing(selectedDrawingId);
      }

      // Ctrl+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl+Y or Ctrl+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrawingId, activeDrawingTool, handleDeleteDrawing, handleUndo, handleRedo]);

  // Indicator Toggle States (matching reltsignal.pine)
  const [toggles, setToggles] = useState({
    supertrend: true,
    emaRibbon: true,
    smcLevels: true,
    tradeLevels: true,
    signals: true,
    volume: true,
  });

  // Crosshair hover state for Floating Legend
  const [hoverData, setHoverData] = useState(null);

  const companyName = data?.company_name || '';
  const lastPrice = data?.last_price || 0;
  const reltSignal = data?.relt_signal;
  const indicators = data?.indicators || {};
  const historicalBacktest = data?.technical_detail?.historical_backtest || data?.historical_backtest || [];

  // Select active raw OHLCV dataset based on timeframe
  const activeRawData = useMemo(() => {
    if (!data) return [];
    if (timeframe === '1H' && data.ohlcv_1h && data.ohlcv_1h.length > 0) return data.ohlcv_1h;
    if (timeframe === '15M' && data.ohlcv_15m && data.ohlcv_15m.length > 0) return data.ohlcv_15m;
    return data.ohlcv_daily || [];
  }, [data, timeframe]);

  // Clean, sort, and deduplicate OHLCV data
  const formattedData = useMemo(() => {
    if (!activeRawData || activeRawData.length === 0) return [];

    const mapped = activeRawData.map((bar) => {
      let parsedTime = bar.time;
      if (timeframe !== '1D') {
        const d = new Date(bar.time);
        if (!isNaN(d.getTime())) {
          parsedTime = Math.floor(d.getTime() / 1000);
        }
      }
      return {
        time: parsedTime,
        open: Number(bar.open),
        high: Number(bar.high),
        low: Number(bar.low),
        close: Number(bar.close),
        volume: Number(bar.volume || 0),
      };
    });

    // Deduplicate and sort
    const unique = [];
    const seen = new Set();
    for (const d of mapped) {
      if (!seen.has(d.time)) {
        seen.add(d.time);
        unique.push(d);
      }
    }

    unique.sort((a, b) => {
      const ta = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
      const tb = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
      return ta - tb;
    });

    return unique;
  }, [activeRawData, timeframe]);

  // Derived Indicator Series
  const haData = useMemo(() => calculateHeikinAshi(formattedData), [formattedData]);
  const ema9 = useMemo(() => calculateEMA(formattedData, 9), [formattedData]);
  const ema21 = useMemo(() => calculateEMA(formattedData, 21), [formattedData]);
  const ema50 = useMemo(() => calculateEMA(formattedData, 50), [formattedData]);
  const ema200 = useMemo(() => calculateEMA(formattedData, 200), [formattedData]);
  const supertrendRes = useMemo(() => calculateSupertrend(formattedData, 3.0, 10), [formattedData]);
  const volumeSMA = useMemo(() => calculateVolumeSMA(formattedData, 20), [formattedData]);
  const { markers: signalMarkers, activeTrade } = useMemo(
    () => generateSignalMarkersAndTradePlan(formattedData, reltSignal, historicalBacktest),
    [formattedData, reltSignal, historicalBacktest]
  );

  // Default Legend info when not hovering
  const latestBar = formattedData.length > 0 ? formattedData[formattedData.length - 1] : null;
  const prevBar = formattedData.length > 1 ? formattedData[formattedData.length - 2] : null;
  const defaultPriceChange = latestBar && prevBar ? latestBar.close - prevBar.close : 0;
  const defaultPriceChangePct = latestBar && prevBar && prevBar.close > 0 
    ? ((defaultPriceChange / prevBar.close) * 100).toFixed(2) 
    : '0.00';

  // Toggle helper
  const toggleIndicator = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset Zoom
  const handleResetZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().fitContent();
    }
  };

  // Range zoom helper
  const setRangeZoom = (barsBack) => {
    if (!chartInstanceRef.current || formattedData.length === 0) return;
    const total = formattedData.length;
    const fromIdx = Math.max(0, total - barsBack);
    chartInstanceRef.current.timeScale().setVisibleLogicalRange({
      from: fromIdx,
      to: total + 5,
    });
  };

  // Screenshot Capture
  const handleCaptureSnapshot = async () => {
    if (!chartContainerRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(chartContainerRef.current, {
        backgroundColor: '#0f1117',
        scale: 2,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${ticker}_TradingView_${timeframe}_chart.png`;
      link.click();
    } catch (e) {
      console.error('Error capturing chart snapshot:', e);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Initialize and update Lightweight Charts
  useEffect(() => {
    if (chartSource !== 'lightweight' || !chartContainerRef.current || formattedData.length === 0) {
      return;
    }

    // Clean up previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#0e1118' },
        textColor: '#94a3b8',
        fontFamily: 'var(--font-mono), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: {
          top: 0.08,
          bottom: toggles.volume ? 0.22 : 0.08,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: timeframe !== '1D',
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      width: container.clientWidth,
      height: isFullscreen ? (window.innerHeight - 140) : 520,
    });

    chartInstanceRef.current = chart;

    // 1. Primary Price Series (Candles / Heikin-Ashi / Line)
    let mainSeries;
    if (chartMode === 'line') {
      mainSeries = chart.addAreaSeries({
        topColor: 'rgba(56, 189, 248, 0.4)',
        bottomColor: 'rgba(56, 189, 248, 0.0)',
        lineColor: '#38bdf8',
        lineWidth: 2,
      });
      mainSeries.setData(formattedData.map((d) => ({ time: d.time, value: d.close })));
    } else {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      mainSeries.setData(chartMode === 'heikin_ashi' ? haData : formattedData);
    }
    seriesRef.current.main = mainSeries;

    // 2. Volume Sub-Pane (Histogram)
    if (toggles.volume) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Overlay pane
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = formattedData.map((d, i) => ({
        time: d.time,
        value: d.volume,
        color: i > 0 && d.close >= formattedData[i - 1].close 
          ? 'rgba(16, 185, 129, 0.35)' 
          : 'rgba(244, 63, 94, 0.35)',
      }));
      volumeSeries.setData(volumeData);

      // Volume SMA 20 Overlay Line
      const volSmaSeries = chart.addLineSeries({
        priceScaleId: '',
        scaleMargins: { top: 0.8, bottom: 0 },
        color: 'rgba(251, 191, 36, 0.8)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
      });
      volSmaSeries.setData(volumeSMA);
    }

    // 3. Supertrend Line (Dynamic Multi-Color: Lime for Bullish, Rose Red for Bearish)
    if (toggles.supertrend && supertrendRes.segments && supertrendRes.segments.length > 0) {
      supertrendRes.segments.forEach((seg) => {
        if (seg.data.length > 0) {
          const segSeries = chart.addLineSeries({
            color: seg.isBullish ? '#10b981' : '#f43f5e',
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: true,
            title: seg.isBullish ? 'ST (Bull)' : 'ST (Bear)',
          });
          segSeries.setData(seg.data);
        }
      });
    }

    // 4. EMA Ribbons (9 Fast, 21 Slow, 50, 200)
    if (toggles.emaRibbon) {
      const ema9Series = chart.addLineSeries({
        color: '#eab308',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'EMA 9',
      });
      ema9Series.setData(ema9);

      const ema21Series = chart.addLineSeries({
        color: '#38bdf8',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'EMA 21',
      });
      ema21Series.setData(ema21);

      const ema50Series = chart.addLineSeries({
        color: '#f97316',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'EMA 50',
      });
      ema50Series.setData(ema50);

      const ema200Series = chart.addLineSeries({
        color: '#c084fc',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        title: 'EMA 200',
      });
      ema200Series.setData(ema200);
    }

    // 5. SMC Active Levels (Order Blocks & Fair Value Gaps from reltSignal)
    if (toggles.smcLevels && reltSignal?.smc) {
      const { active_bull_obs, active_bear_obs, active_bull_fvgs, active_bear_fvgs } = reltSignal.smc;

      if (active_bull_obs && active_bull_obs.length > 0) {
        const ob = active_bull_obs[active_bull_obs.length - 1];
        mainSeries.createPriceLine({
          price: ob.top,
          color: '#22c55e',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'Bullish OB Zone',
        });
      }

      if (active_bear_obs && active_bear_obs.length > 0) {
        const ob = active_bear_obs[active_bear_obs.length - 1];
        mainSeries.createPriceLine({
          price: ob.bottom,
          color: '#f43f5e',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'Bearish OB Zone',
        });
      }

      if (active_bull_fvgs && active_bull_fvgs.length > 0) {
        const fvg = active_bull_fvgs[active_bull_fvgs.length - 1];
        mainSeries.createPriceLine({
          price: fvg.top,
          color: '#38bdf8',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'Bullish FVG Gap',
        });
      }
    }

    // 6. Trade Execution Plan & Direction Forecast (Entry, Stop Loss, TP1, TP2, Trailing SL)
    if (toggles.tradeLevels && reltSignal?.trade_setup) {
      const setup = reltSignal.trade_setup;

      if (setup.entry_price) {
        mainSeries.createPriceLine({
          price: setup.entry_price,
          color: '#ffffff',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'BUY ENTRY',
        });
      }

      if (setup.stop_loss) {
        mainSeries.createPriceLine({
          price: setup.stop_loss,
          color: '#f43f5e',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `STOP LOSS (-${setup.risk_percent}%)`,
        });
      }

      if (setup.tp1) {
        mainSeries.createPriceLine({
          price: setup.tp1,
          color: '#4ade80',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TARGET TP1 (1.3R)',
        });
      }

      if (setup.tp2) {
        mainSeries.createPriceLine({
          price: setup.tp2,
          color: '#38bdf8',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TARGET TP2 (2.0R)',
        });
      }

      if (setup.trailing_stop) {
        mainSeries.createPriceLine({
          price: setup.trailing_stop,
          color: '#c084fc',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'TRAILING SL',
        });
      }

      // Future Target Projection Ray (Direction Prediction)
      if (reltSignal.direction_prediction && reltSignal.direction_prediction.predicted_price) {
        const pred = reltSignal.direction_prediction;
        mainSeries.createPriceLine({
          price: pred.predicted_price,
          color: pred.direction === 'UP' ? '#22c55e' : (pred.direction === 'DOWN' ? '#f43f5e' : '#94a3b8'),
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `FORECAST (${pred.direction} +${pred.upside_pct || 0}%)`,
        });
      }
    }

    // 7. Full Historical & Future Buy/Sell (TP/SL) Signal Markers
    if (toggles.signals && signalMarkers.length > 0) {
      mainSeries.setMarkers(signalMarkers);
    } else {
      mainSeries.setMarkers([]);
    }

    // 8. Crosshair Move Handler for Floating HUD Legend
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData.get(mainSeries)) {
        setHoverData(null);
        return;
      }

      const bar = param.seriesData.get(mainSeries);
      const timeStr = typeof param.time === 'string' 
        ? param.time 
        : new Date(param.time * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

      setHoverData({
        time: timeStr,
        open: bar.open !== undefined ? bar.open : bar.value,
        high: bar.high,
        low: bar.low,
        close: bar.close !== undefined ? bar.close : bar.value,
      });
    });

    // Initial view fit
    chart.timeScale().fitContent();

    // Resize Handler with ResizeObserver for seamless tab-switching & fullscreen
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        const clientW = chartContainerRef.current.clientWidth;
        const clientH = chartContainerRef.current.clientHeight;
        if (clientW > 0 && clientH > 0) {
          chartInstanceRef.current.applyOptions({
            width: clientW,
            height: clientH,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartContainerRef.current && chartInstanceRef.current) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          chartInstanceRef.current.applyOptions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [
    formattedData, haData, ema9, ema21, ema50, ema200, supertrendRes, volumeSMA, signalMarkers,
    chartMode, chartSource, timeframe, toggles, reltSignal, isFullscreen
  ]);

  if (!data || !data.ohlcv_daily) return null;

  // Active display prices in the legend
  const displayBar = hoverData || latestBar || { open: 0, high: 0, low: 0, close: lastPrice };
  const currentDiff = hoverData && hoverData.open 
    ? hoverData.close - hoverData.open 
    : defaultPriceChange;
  const currentDiffPct = hoverData && hoverData.open > 0 
    ? ((currentDiff / hoverData.open) * 100).toFixed(2) 
    : defaultPriceChangePct;
  const isUpBar = currentDiff >= 0;

  const renderChartBody = () => (
    <>
      {/* 1. TradingView Pro Top Control Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        {/* Left Side: Ticker, Price, Timeframes, Chart Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.05em', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {ticker}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontWeight: '700'
            }}>
              IDX • {timeframe}
            </span>
          </div>

          {/* Timeframe Selector (TradingView Pill Group) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {['1D', '1H', '15M'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '4px 11px',
                  borderRadius: '6px',
                  backgroundColor: timeframe === tf ? '#2563eb' : 'transparent',
                  color: timeframe === tf ? '#ffffff' : '#94a3b8',
                  fontWeight: timeframe === tf ? '800' : '600',
                  fontSize: '11.5px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Mode Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {[
              { id: 'candles', label: 'Candles' },
              { id: 'heikin_ashi', label: 'Heikin-Ashi' },
              { id: 'line', label: 'Line' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setChartMode(m.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: chartMode === m.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: chartMode === m.id ? '#ffffff' : '#94a3b8',
                  fontWeight: chartMode === m.id ? '700' : '500',
                  fontSize: '11px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Indicator Layer Toggles & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Indicator Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleIndicator('supertrend')}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: toggles.supertrend ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: toggles.supertrend ? '#10b981' : '#64748b',
                border: toggles.supertrend ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle Supertrend (Factor 3.0, ATR 10)"
            >
              <Zap size={11} /> Supertrend
            </button>

            <button
              onClick={() => toggleIndicator('emaRibbon')}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: toggles.emaRibbon ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: toggles.emaRibbon ? '#38bdf8' : '#64748b',
                border: toggles.emaRibbon ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle EMA Ribbon (9, 21, 50, 200)"
            >
              <TrendingUp size={11} /> EMA Ribbon
            </button>

            <button
              onClick={() => toggleIndicator('smcLevels')}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: toggles.smcLevels ? 'rgba(192, 132, 252, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: toggles.smcLevels ? '#c084fc' : '#64748b',
                border: toggles.smcLevels ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle Order Blocks & FVG Zones"
            >
              <Layers size={11} /> SMC Zones
            </button>

            <button
              onClick={() => toggleIndicator('tradeLevels')}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: toggles.tradeLevels ? 'rgba(251, 191, 36, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: toggles.tradeLevels ? '#fbbf24' : '#64748b',
                border: toggles.tradeLevels ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle SL & Target TP1/TP2"
            >
              <Shield size={11} /> Targets
            </button>

            <button
              onClick={() => toggleIndicator('volume')}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                backgroundColor: toggles.volume ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                color: toggles.volume ? '#e2e8f0' : '#64748b',
                border: toggles.volume ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle Volume Pane & MA20"
            >
              <BarChart2 size={11} /> Vol
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Quick Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleResetZoom}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Reset Zoom / Fit Content"
            >
              <RefreshCw size={13} />
            </button>

            <button
              onClick={handleCaptureSnapshot}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Download Chart Snapshot"
            >
              <Camera size={13} />
            </button>

            <button
              onClick={toggleFullscreen}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                backgroundColor: isFullscreen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isFullscreen ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isFullscreen ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Perbesar Chart (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>

          {/* Source Toggle: Native vs TV Live */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setChartSource('lightweight')}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: chartSource === 'lightweight' ? '#38bdf8' : 'transparent',
                color: chartSource === 'lightweight' ? '#000000' : '#94a3b8',
                fontWeight: '700',
                fontSize: '10.5px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              RELT Pro
            </button>
            <button
              onClick={() => setChartSource('tradingview')}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: chartSource === 'tradingview' ? '#38bdf8' : 'transparent',
                color: chartSource === 'tradingview' ? '#000000' : '#94a3b8',
                fontWeight: '700',
                fontSize: '10.5px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              TV Embed
            </button>
          </div>

          {/* Dedicated Close Button in Fullscreen */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#f87171',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Tutup Fullscreen (Esc)"
            >
              <X size={13} />
              Tutup (Esc)
            </button>
          )}
        </div>
      </div>

      {/* 2. Chart Canvas Area with Floating HUD Legend & Drawing Layer */}
      <div style={{
        position: 'relative',
        width: '100%',
        flex: isFullscreen ? '1 1 auto' : 'none',
        height: isFullscreen ? '100%' : '520px',
        minHeight: isFullscreen ? '0' : '520px',
        overflow: 'hidden',
        marginTop: '6px'
      }}>
        {chartSource === 'tradingview' ? (
          <TradingViewWidget ticker={ticker} height="100%" />
        ) : (
          <>
            {/* Floating TradingView-style Legend (HUD) */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '48px',
              zIndex: 10,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: 'rgba(11, 15, 25, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              lineHeight: '1.4',
              color: '#e2e8f0'
            }}>
              {/* Row 1: Ticker OHLC & Change */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '800', color: '#ffffff' }}>{ticker}</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span>O <b style={{ color: isUpBar ? '#10b981' : '#f43f5e' }}>{displayBar.open ? displayBar.open.toLocaleString() : '-'}</b></span>
                <span>H <b style={{ color: isUpBar ? '#10b981' : '#f43f5e' }}>{displayBar.high ? displayBar.high.toLocaleString() : '-'}</b></span>
                <span>L <b style={{ color: isUpBar ? '#10b981' : '#f43f5e' }}>{displayBar.low ? displayBar.low.toLocaleString() : '-'}</b></span>
                <span>C <b style={{ color: isUpBar ? '#10b981' : '#f43f5e' }}>{displayBar.close ? displayBar.close.toLocaleString() : '-'}</b></span>
                <span style={{
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: isUpBar ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  color: isUpBar ? '#10b981' : '#f43f5e',
                  fontWeight: '700',
                  fontSize: '11px'
                }}>
                  {isUpBar ? '+' : ''}{currentDiff} ({isUpBar ? '+' : ''}{currentDiffPct}%)
                </span>
                {hoverData?.time && (
                  <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>[{hoverData.time}]</span>
                )}
              </div>

              {/* Row 2: Live Indicator Numeric Values */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '10.5px', color: '#94a3b8' }}>
                {toggles.supertrend && (
                  <span style={{ color: supertrendRes.isBullish ? '#10b981' : '#f43f5e' }}>
                    ST(3,10): <b>{supertrendRes.lastValue.toLocaleString()} ({supertrendRes.isBullish ? 'BULL' : 'BEAR'})</b>
                  </span>
                )}
                {toggles.emaRibbon && (
                  <>
                    <span style={{ color: '#eab308' }}>EMA9: <b>{ema9.length > 0 ? ema9[ema9.length - 1].value.toLocaleString() : '-'}</b></span>
                    <span style={{ color: '#38bdf8' }}>EMA21: <b>{ema21.length > 0 ? ema21[ema21.length - 1].value.toLocaleString() : '-'}</b></span>
                    <span style={{ color: '#f97316' }}>EMA50: <b>{ema50.length > 0 ? ema50[ema50.length - 1].value.toLocaleString() : '-'}</b></span>
                    <span style={{ color: '#c084fc' }}>EMA200: <b>{ema200.length > 0 ? ema200[ema200.length - 1].value.toLocaleString() : '-'}</b></span>
                  </>
                )}
              </div>
            </div>

            {/* TradingView Center Background Watermark */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.03,
              userSelect: 'none'
            }}>
              <span style={{ fontSize: '80px', fontWeight: '900', letterSpacing: '0.1em', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {ticker}
              </span>
              <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.3em', color: '#fff' }}>
                RELT SIGNAL PRO
              </span>
            </div>

            {/* 1. TradingView-Style Left Sidebar Toolbar */}
            <DrawingToolbar
              activeTool={activeDrawingTool}
              setActiveTool={setActiveDrawingTool}
              isMagnet={isMagnet}
              setIsMagnet={setIsMagnet}
              isVisible={isDrawingVisible}
              setIsVisible={setIsDrawingVisible}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClearAll={handleClearAllDrawings}
              drawingsCount={drawings.length}
            />

            {/* 2. Interactive SVG Drawing Layer */}
            <DrawingCanvasOverlay
              chart={chartInstanceRef.current}
              series={seriesRef.current?.main}
              ohlcData={formattedData}
              drawings={drawings}
              activeTool={activeDrawingTool}
              setActiveTool={setActiveDrawingTool}
              selectedDrawingId={selectedDrawingId}
              setSelectedDrawingId={setSelectedDrawingId}
              isMagnet={isMagnet}
              isVisible={isDrawingVisible}
              onAddDrawing={handleAddDrawing}
              onUpdateDrawing={handleUpdateDrawing}
              onDeleteDrawing={handleDeleteDrawing}
              onSelectPosition={setDrawingPropsPos}
            />

            {/* 3. Floating Mini Properties Bar for Selected Drawing */}
            {selectedDrawingId && (
              <DrawingPropertiesBar
                selectedDrawing={drawings.find((d) => d.id === selectedDrawingId)}
                onUpdateDrawing={handleUpdateDrawing}
                onDeleteDrawing={handleDeleteDrawing}
                onDuplicateDrawing={handleDuplicateDrawing}
                onDeselect={() => setSelectedDrawingId(null)}
                position={drawingPropsPos}
              />
            )}

            {/* Chart DOM Container */}
            <div 
              ref={chartContainerRef} 
              style={{ 
                width: '100%', 
                height: '100%',
                borderRadius: isFullscreen ? '0px' : '12px',
                overflow: 'hidden'
              }} 
            />
          </>
        )}
      </div>

      {/* 3. Bottom Range Switcher & Indicators Legend Ribbon */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0
        }}
      >
        {/* Quick Range Zoom Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Range:</span>
          {[
            { label: '1M', bars: 22 },
            { label: '3M', bars: 66 },
            { label: '6M', bars: 130 },
            { label: '1Y', bars: 250 },
            { label: 'ALL', bars: 1000 }
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeZoom(r.bars)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Visual Color Legend Guide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Bullish Supertrend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
            <span>Bearish Supertrend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '3px', backgroundColor: '#eab308' }} />
            <span>EMA 9</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '3px', backgroundColor: '#38bdf8' }} />
            <span>EMA 21</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '3px', backgroundColor: '#c084fc' }} />
            <span>EMA 200</span>
          </div>
        </div>
      </div>
    </>
  );

  if (isFullscreen && mounted) {
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          backgroundColor: '#070a12',
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          padding: '12px 18px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          animation: 'fadeInFullscreen 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes fadeInFullscreen {
            from { opacity: 0; transform: scale(0.99); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        {renderChartBody()}
      </div>,
      document.body
    );
  }

  return (
    <div 
      className="card flex-col"
      style={{
        padding: '20px',
        gap: '14px',
        background: '#0e1118',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '18px',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        position: 'relative',
        width: '100%',
      }}
    >
      {renderChartBody()}
    </div>
  );
}
