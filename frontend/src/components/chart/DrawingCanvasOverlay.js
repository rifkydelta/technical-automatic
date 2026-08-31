'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DRAWING_TOOLS,
  FIBONACCI_LEVELS,
  pointToScreen,
  screenToPoint,
  pointToLineDistance,
  isPointInsideRect,
  generateDrawingId,
} from '../../utils/chartDrawingEngine';

export default function DrawingCanvasOverlay({
  chart,
  series,
  ohlcData = [],
  drawings = [],
  activeTool = DRAWING_TOOLS.CURSOR,
  setActiveTool,
  selectedDrawingId,
  setSelectedDrawingId,
  isMagnet = false,
  isVisible = true,
  onAddDrawing,
  onUpdateDrawing,
  onDeleteDrawing,
  onSelectPosition,
}) {
  const svgRef = useRef(null);

  // Drawing in progress state
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // Dragging existing drawing or anchor handle state
  const [dragState, setDragState] = useState(null); // { drawingId, handleIndex: 0 | 1 | 'body', startPoint, origPoints }

  // Hover state for cursor styling
  const [hoveredDrawingId, setHoveredDrawingId] = useState(null);
  const [hoveredHandleIndex, setHoveredHandleIndex] = useState(null);

  // Render tick for 60 FPS synchronization with chart zooming/panning
  const [renderTick, setRenderTick] = useState(0);

  // Subscribe to chart zoom, pan, and range change events
  useEffect(() => {
    if (!chart) return;

    const handleRangeChange = () => {
      setRenderTick((t) => (t + 1) % 1000000);
    };

    try {
      chart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeChange);
      chart.timeScale().subscribeVisibleTimeRangeChange(handleRangeChange);
    } catch (e) {}

    return () => {
      try {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleRangeChange);
        chart.timeScale().unsubscribeVisibleTimeRangeChange(handleRangeChange);
      } catch (e) {}
    };
  }, [chart]);

  // Transform all drawings to screen coordinates
  const projectedDrawings = useMemo(() => {
    if (!chart || !series || !isVisible) return [];

    return drawings
      .map((d) => {
        const p1 = d.p1 ? pointToScreen(d.p1, chart, series) : null;
        const p2 = d.p2 ? pointToScreen(d.p2, chart, series) : null;
        const p3 = d.p3 ? pointToScreen(d.p3, chart, series) : null;

        return {
          ...d,
          screen: { p1, p2, p3 },
        };
      })
      .filter((d) => d.screen.p1 !== null); // Keep if at least p1 is projected
  }, [drawings, chart, series, isVisible, renderTick]);

  // Projected current drawing in progress
  const projectedCurrent = useMemo(() => {
    if (!currentDrawing || !chart || !series) return null;
    const p1 = currentDrawing.p1 ? pointToScreen(currentDrawing.p1, chart, series) : null;
    const p2 = currentDrawing.p2 ? pointToScreen(currentDrawing.p2, chart, series) : null;
    return {
      ...currentDrawing,
      screen: { p1, p2 },
    };
  }, [currentDrawing, chart, series, renderTick]);

  // Selected drawing object
  const selectedDrawing = useMemo(() => {
    return projectedDrawings.find((d) => d.id === selectedDrawingId) || null;
  }, [projectedDrawings, selectedDrawingId]);

  // Update properties bar position when selection changes
  useEffect(() => {
    if (selectedDrawing && selectedDrawing.screen.p1 && onSelectPosition) {
      const sp1 = selectedDrawing.screen.p1;
      const sp2 = selectedDrawing.screen.p2 || sp1;
      const midX = (sp1.x + sp2.x) / 2;
      const minY = Math.min(sp1.y, sp2.y);
      onSelectPosition({ x: midX, y: minY });
    }
  }, [selectedDrawing, onSelectPosition]);

  // Helper to get SVG local coordinates from mouse event
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Pointer Down (Start drawing or Start dragging)
  const handlePointerDown = (e) => {
    if (!chart || !series) return;
    const { x, y } = getSvgCoordinates(e);
    const clickedPoint = screenToPoint(x, y, chart, series, ohlcData, isMagnet);

    if (!clickedPoint) return;

    // 1. Eraser Tool: Delete clicked drawing
    if (activeTool === DRAWING_TOOLS.ERASER) {
      const hit = findHitDrawing(x, y);
      if (hit) {
        onDeleteDrawing(hit.id);
      }
      return;
    }

    // 2. If Cursor Mode: Check for handle or drawing selection/dragging
    if (activeTool === DRAWING_TOOLS.CURSOR) {
      // Check if clicking on an existing handle of the selected drawing
      if (selectedDrawing) {
        const { p1, p2 } = selectedDrawing.screen;
        if (p1 && Math.hypot(p1.x - x, p1.y - y) <= 10) {
          setDragState({
            drawingId: selectedDrawing.id,
            handleIndex: 0,
            startPoint: clickedPoint,
            origP1: selectedDrawing.p1,
            origP2: selectedDrawing.p2,
          });
          return;
        }
        if (p2 && Math.hypot(p2.x - x, p2.y - y) <= 10) {
          setDragState({
            drawingId: selectedDrawing.id,
            handleIndex: 1,
            startPoint: clickedPoint,
            origP1: selectedDrawing.p1,
            origP2: selectedDrawing.p2,
          });
          return;
        }
      }

      // Check if clicking on any drawing body
      const hit = findHitDrawing(x, y);
      if (hit) {
        setSelectedDrawingId(hit.id);
        setDragState({
          drawingId: hit.id,
          handleIndex: 'body',
          startPoint: clickedPoint,
          origP1: hit.p1,
          origP2: hit.p2,
        });
      } else {
        setSelectedDrawingId(null);
      }
      return;
    }

    // 3. Drawing Creation Mode
    if (activeTool === DRAWING_TOOLS.HORIZONTAL_LINE) {
      // Horizontal Line only needs 1 point
      const newDrawing = {
        id: generateDrawingId(),
        type: DRAWING_TOOLS.HORIZONTAL_LINE,
        p1: clickedPoint,
        style: { color: '#38bdf8', lineWidth: 2, lineStyle: 'dashed' },
      };
      onAddDrawing(newDrawing);
      setSelectedDrawingId(newDrawing.id);
      setActiveTool(DRAWING_TOOLS.CURSOR);
      return;
    }

    if (activeTool === DRAWING_TOOLS.TEXT) {
      const textVal = prompt('Masukkan Catatan Analisis Teks:', 'Support Level Kuat');
      if (textVal) {
        const newDrawing = {
          id: generateDrawingId(),
          type: DRAWING_TOOLS.TEXT,
          p1: clickedPoint,
          text: textVal,
          style: { color: '#38bdf8', fontSize: 12 },
        };
        onAddDrawing(newDrawing);
        setSelectedDrawingId(newDrawing.id);
      }
      setActiveTool(DRAWING_TOOLS.CURSOR);
      return;
    }

    // Multi-point tools: Start elastic preview
    setCurrentDrawing({
      id: generateDrawingId(),
      type: activeTool,
      p1: clickedPoint,
      p2: clickedPoint,
      style: getDefaultStyle(activeTool),
    });
  };

  // Pointer Move (Update preview or drag)
  const handlePointerMove = (e) => {
    if (!chart || !series) return;
    const { x, y } = getSvgCoordinates(e);

    // 1. If actively creating a drawing
    if (currentDrawing) {
      const currentPoint = screenToPoint(x, y, chart, series, ohlcData, isMagnet);
      if (currentPoint) {
        setCurrentDrawing((prev) => ({
          ...prev,
          p2: currentPoint,
        }));
      }
      return;
    }

    // 2. If actively dragging an existing drawing or handle
    if (dragState) {
      const currentPoint = screenToPoint(x, y, chart, series, ohlcData, isMagnet);
      if (!currentPoint) return;

      const { drawingId, handleIndex, startPoint, origP1, origP2 } = dragState;

      if (handleIndex === 0) {
        onUpdateDrawing(drawingId, { p1: currentPoint });
      } else if (handleIndex === 1) {
        onUpdateDrawing(drawingId, { p2: currentPoint });
      } else if (handleIndex === 'body') {
        const priceDelta = currentPoint.price - startPoint.price;
        const newP1 = { ...origP1, price: Math.round((origP1.price + priceDelta) * 100) / 100 };
        const newP2 = origP2 ? { ...origP2, price: Math.round((origP2.price + priceDelta) * 100) / 100 } : null;

        onUpdateDrawing(drawingId, {
          p1: newP1,
          ...(newP2 ? { p2: newP2 } : {}),
        });
      }
      return;
    }

    // 3. Hover detection for cursor styling in pointer mode
    if (activeTool === DRAWING_TOOLS.CURSOR) {
      const hit = findHitDrawing(x, y);
      setHoveredDrawingId(hit ? hit.id : null);
    }
  };

  // Pointer Up (Finish drawing or end dragging)
  const handlePointerUp = () => {
    if (currentDrawing) {
      if (currentDrawing.p1 && currentDrawing.p2) {
        onAddDrawing(currentDrawing);
        setSelectedDrawingId(currentDrawing.id);
      }
      setCurrentDrawing(null);
      setActiveTool(DRAWING_TOOLS.CURSOR);
    }

    if (dragState) {
      setDragState(null);
    }
  };

  // Find drawing hit at screen coordinates (px, py)
  const findHitDrawing = (px, py) => {
    for (let i = projectedDrawings.length - 1; i >= 0; i--) {
      const d = projectedDrawings[i];
      const { p1, p2 } = d.screen;

      if (!p1) continue;

      if (d.type === DRAWING_TOOLS.HORIZONTAL_LINE) {
        if (Math.abs(p1.y - py) <= 8) return d;
      } else if (d.type === DRAWING_TOOLS.HORIZONTAL_RAY && p2) {
        if (px >= p1.x - 5 && Math.abs(p1.y - py) <= 8) return d;
      } else if (d.type === DRAWING_TOOLS.RECTANGLE && p2) {
        if (isPointInsideRect(px, py, p1.x, p1.y, p2.x, p2.y)) return d;
      } else if (d.type === DRAWING_TOOLS.FIBONACCI && p2) {
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        if (py >= minY - 10 && py <= maxY + 10 && px >= Math.min(p1.x, p2.x) - 20 && px <= Math.max(p1.x, p2.x) + 20) {
          return d;
        }
      } else if (p2) {
        const dist = pointToLineDistance(px, py, p1.x, p1.y, p2.x, p2.y);
        if (dist <= 8) return d;
      } else {
        if (Math.hypot(p1.x - px, p1.y - py) <= 15) return d;
      }
    }
    return null;
  };

  const getDefaultStyle = (tool) => {
    switch (tool) {
      case DRAWING_TOOLS.TRENDLINE:
        return { color: '#38bdf8', lineWidth: 2, lineStyle: 'solid' };
      case DRAWING_TOOLS.HORIZONTAL_RAY:
        return { color: '#fbbf24', lineWidth: 2, lineStyle: 'dashed' };
      case DRAWING_TOOLS.FIBONACCI:
        return { color: '#38bdf8', lineWidth: 1, opacity: 0.12 };
      case DRAWING_TOOLS.RECTANGLE:
        return { color: '#38bdf8', lineWidth: 2, opacity: 0.15 };
      case DRAWING_TOOLS.POSITION_LONG:
      case DRAWING_TOOLS.POSITION_SHORT:
        return { color: '#10b981', lineWidth: 1, opacity: 0.2 };
      case DRAWING_TOOLS.RULER:
        return { color: '#38bdf8', lineWidth: 1, opacity: 0.15 };
      default:
        return { color: '#38bdf8', lineWidth: 2, lineStyle: 'solid' };
    }
  };

  // Determine cursor icon based on active tool and hover
  const getCursor = () => {
    if (activeTool === DRAWING_TOOLS.ERASER) return 'crosshair';
    if (activeTool !== DRAWING_TOOLS.CURSOR) return 'crosshair';
    if (dragState) return 'grabbing';
    if (hoveredDrawingId) return 'pointer';
    return 'default';
  };

  // Determine if SVG layer should capture mouse events
  const isInteractive =
    activeTool !== DRAWING_TOOLS.CURSOR ||
    dragState !== null ||
    currentDrawing !== null ||
    hoveredDrawingId !== null ||
    selectedDrawingId !== null;

  return (
    <svg
      ref={svgRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 15,
        pointerEvents: isInteractive ? 'all' : 'none',
        cursor: getCursor(),
        overflow: 'hidden',
      }}
    >
      <defs>
        {/* Glow filter for selected items */}
        <filter id="drawingGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Render all saved drawings */}
      {isVisible &&
        projectedDrawings.map((d) => (
          <DrawingItem
            key={d.id}
            drawing={d}
            isSelected={d.id === selectedDrawingId}
            chartWidth={svgRef.current ? svgRef.current.clientWidth : 1000}
          />
        ))}

      {/* 2. Render drawing in progress (elastic preview) */}
      {projectedCurrent && (
        <DrawingItem
          drawing={projectedCurrent}
          isSelected={true}
          isPreview={true}
          chartWidth={svgRef.current ? svgRef.current.clientWidth : 1000}
        />
      )}

      {/* 3. Render Selection Handles for Active Object */}
      {selectedDrawing && (
        <SelectionHandles drawing={selectedDrawing} />
      )}
    </svg>
  );
}

/**
 * Individual Drawing Item Renderer
 */
function DrawingItem({ drawing, isSelected, isPreview, chartWidth = 1000 }) {
  const { type, screen, style = {}, text } = drawing;
  const { p1, p2 } = screen;

  if (!p1) return null;

  const color = style.color || '#38bdf8';
  const width = style.lineWidth || 2;
  const strokeDash =
    style.lineStyle === 'dashed'
      ? '6 4'
      : style.lineStyle === 'dotted'
      ? '2 3'
      : undefined;

  switch (type) {
    case DRAWING_TOOLS.TRENDLINE:
      if (!p2) return null;
      return (
        <g>
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={strokeDash}
            strokeLinecap="round"
            filter={isSelected ? 'url(#drawingGlow)' : undefined}
          />
        </g>
      );

    case DRAWING_TOOLS.HORIZONTAL_LINE:
      return (
        <g>
          <line
            x1={0}
            y1={p1.y}
            x2={chartWidth}
            y2={p1.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={strokeDash || '4 4'}
            filter={isSelected ? 'url(#drawingGlow)' : undefined}
          />
          {/* Price Label Badge */}
          <rect
            x={Math.max(10, chartWidth - 85)}
            y={p1.y - 10}
            width={75}
            height={20}
            rx={4}
            fill="rgba(15, 23, 42, 0.9)"
            stroke={color}
            strokeWidth={1}
          />
          <text
            x={Math.max(10, chartWidth - 48)}
            y={p1.y + 4}
            fill={color}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {drawing.p1.price.toLocaleString()}
          </text>
        </g>
      );

    case DRAWING_TOOLS.HORIZONTAL_RAY:
      if (!p2) return null;
      return (
        <g>
          <line
            x1={p1.x}
            y1={p1.y}
            x2={chartWidth}
            y2={p1.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={strokeDash || '5 3'}
            strokeLinecap="round"
            filter={isSelected ? 'url(#drawingGlow)' : undefined}
          />
        </g>
      );

    case DRAWING_TOOLS.RECTANGLE:
      if (!p2) return null;
      const rx = Math.min(p1.x, p2.x);
      const ry = Math.min(p1.y, p2.y);
      const rw = Math.abs(p2.x - p1.x);
      const rh = Math.abs(p2.y - p1.y);
      const fillOpacity = style.opacity !== undefined ? style.opacity : 0.15;

      return (
        <g>
          <rect
            x={rx}
            y={ry}
            width={rw}
            height={rh}
            fill={color}
            fillOpacity={fillOpacity}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={strokeDash}
            rx={4}
            filter={isSelected ? 'url(#drawingGlow)' : undefined}
          />
        </g>
      );

    case DRAWING_TOOLS.FIBONACCI:
      if (!p2) return null;
      const startX = Math.min(p1.x, p2.x);
      const endX = Math.max(p1.x, p2.x, startX + 150);
      const price1 = drawing.p1.price;
      const price2 = drawing.p2.price;
      const priceDiff = price2 - price1;
      const yDiff = p2.y - p1.y;

      return (
        <g>
          {/* Main Diagonal Trend Ray */}
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* Fibonacci Horizontal Bands & Lines */}
          {FIBONACCI_LEVELS.map((lvl, idx) => {
            const levelY = p1.y + yDiff * lvl.ratio;
            const levelPrice = Math.round((price1 + priceDiff * lvl.ratio) * 100) / 100;

            const nextLvl = FIBONACCI_LEVELS[idx + 1];
            const nextY = nextLvl ? p1.y + yDiff * nextLvl.ratio : null;

            return (
              <g key={lvl.ratio}>
                {/* Background Band */}
                {nextY !== null && (
                  <rect
                    x={startX}
                    y={Math.min(levelY, nextY)}
                    width={endX - startX}
                    height={Math.abs(nextY - levelY)}
                    fill={lvl.color}
                    fillOpacity={lvl.ratio === 0.618 ? 0.22 : 0.08}
                  />
                )}

                {/* Level Horizontal Line */}
                <line
                  x1={startX}
                  y1={levelY}
                  x2={endX}
                  y2={levelY}
                  stroke={lvl.color}
                  strokeWidth={lvl.ratio === 0.618 ? 2 : 1}
                  strokeDasharray={lvl.ratio === 0 || lvl.ratio === 1 ? undefined : '4 3'}
                />

                {/* Label Tag */}
                <text
                  x={startX + 6}
                  y={levelY - 4}
                  fill={lvl.color}
                  fontSize={10}
                  fontWeight={lvl.ratio === 0.618 ? 'bold' : 'normal'}
                  fontFamily="var(--font-mono), monospace"
                >
                  {lvl.label} - {levelPrice.toLocaleString()}
                </text>
              </g>
            );
          })}
        </g>
      );

    case DRAWING_TOOLS.POSITION_LONG:
    case DRAWING_TOOLS.POSITION_SHORT:
      if (!p2) return null;
      const isLong = type === DRAWING_TOOLS.POSITION_LONG;
      const entryPrice = drawing.p1.price;
      const targetPrice = drawing.p2.price;
      const isProfitUp = isLong ? targetPrice >= entryPrice : targetPrice <= entryPrice;

      const pW = Math.max(120, Math.abs(p2.x - p1.x));
      const pLeft = Math.min(p1.x, p2.x);

      // Default 1:2 Risk Reward assumption for SL
      const profitDiff = Math.abs(targetPrice - entryPrice);
      const slDiff = profitDiff / 2;
      const slPrice = isLong ? entryPrice - slDiff : entryPrice + slDiff;

      const entryY = p1.y;
      const tpY = p2.y;
      const slY = isLong ? p1.y + Math.abs(p2.y - p1.y) / 2 : p1.y - Math.abs(p2.y - p1.y) / 2;

      const profitPct = ((profitDiff / entryPrice) * 100).toFixed(2);
      const lossPct = ((slDiff / entryPrice) * 100).toFixed(2);

      return (
        <g>
          {/* Target TP Zone (Green) */}
          <rect
            x={pLeft}
            y={Math.min(entryY, tpY)}
            width={pW}
            height={Math.abs(tpY - entryY)}
            fill="#10b981"
            fillOpacity={0.22}
            stroke="#10b981"
            strokeWidth={1}
          />
          {/* Stop Loss Zone (Red) */}
          <rect
            x={pLeft}
            y={Math.min(entryY, slY)}
            width={pW}
            height={Math.abs(slY - entryY)}
            fill="#f43f5e"
            fillOpacity={0.22}
            stroke="#f43f5e"
            strokeWidth={1}
          />

          {/* Entry Dividing Line */}
          <line
            x1={pLeft}
            y1={entryY}
            x2={pLeft + pW}
            y2={entryY}
            stroke="#ffffff"
            strokeWidth={2}
          />

          {/* R:R Ratio Badge */}
          <rect
            x={pLeft + 6}
            y={entryY - 10}
            width={110}
            height={20}
            rx={4}
            fill="rgba(15, 23, 42, 0.9)"
            stroke="#38bdf8"
            strokeWidth={1}
          />
          <text
            x={pLeft + 61}
            y={entryY + 4}
            fill="#38bdf8"
            fontSize={10.5}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            R:R Ratio 1:2.00
          </text>
        </g>
      );

    case DRAWING_TOOLS.RULER:
      if (!p2) return null;
      const rMinX = Math.min(p1.x, p2.x);
      const rMinY = Math.min(p1.y, p2.y);
      const rWidth = Math.abs(p2.x - p1.x);
      const rHeight = Math.abs(p2.y - p1.y);

      const priceChange = drawing.p2.price - drawing.p1.price;
      const priceChangePct = ((priceChange / drawing.p1.price) * 100).toFixed(2);
      const isUp = priceChange >= 0;

      return (
        <g>
          <rect
            x={rMinX}
            y={rMinY}
            width={rWidth}
            height={rHeight}
            fill={isUp ? '#10b981' : '#f43f5e'}
            fillOpacity={0.15}
            stroke={isUp ? '#10b981' : '#f43f5e'}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={isUp ? '#10b981' : '#f43f5e'}
            strokeWidth={1.5}
          />
          {/* Measurement Tag */}
          <rect
            x={rMinX + rWidth / 2 - 55}
            y={rMinY + rHeight / 2 - 12}
            width={110}
            height={24}
            rx={4}
            fill="rgba(15, 23, 42, 0.92)"
            stroke={isUp ? '#10b981' : '#f43f5e'}
            strokeWidth={1}
          />
          <text
            x={rMinX + rWidth / 2}
            y={rMinY + rHeight / 2 + 4}
            fill={isUp ? '#10b981' : '#f43f5e'}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
          >
            {isUp ? '+' : ''}{priceChange.toLocaleString()} ({isUp ? '+' : ''}{priceChangePct}%)
          </text>
        </g>
      );

    case DRAWING_TOOLS.TEXT:
      return (
        <g>
          <rect
            x={p1.x}
            y={p1.y - 20}
            width={Math.max(80, (text || '').length * 8 + 16)}
            height={26}
            rx={6}
            fill="rgba(15, 23, 42, 0.9)"
            stroke={color}
            strokeWidth={1.5}
            filter={isSelected ? 'url(#drawingGlow)' : undefined}
          />
          <text
            x={p1.x + 8}
            y={p1.y - 4}
            fill="#ffffff"
            fontSize={11.5}
            fontWeight="600"
            fontFamily="var(--font-mono), monospace"
          >
            {text || 'Catatan'}
          </text>
        </g>
      );

    default:
      return null;
  }
}

/**
 * Control Handle Anchors for Selected Objects
 */
function SelectionHandles({ drawing }) {
  const { screen } = drawing;
  const { p1, p2 } = screen;

  const renderAnchor = (p, key) => {
    if (!p) return null;
    return (
      <g key={key}>
        <circle
          cx={p.x}
          cy={p.y}
          r={5}
          fill="#ffffff"
          stroke="#38bdf8"
          strokeWidth={2}
          style={{ cursor: 'crosshair' }}
        />
      </g>
    );
  };

  return (
    <g>
      {renderAnchor(p1, 'p1')}
      {renderAnchor(p2, 'p2')}
    </g>
  );
}
