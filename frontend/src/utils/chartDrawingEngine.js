/**
 * TradingView-Style Drawing Engine Utilities
 * Handles coordinate projection between Price/Time and Screen X/Y,
 * Fibonacci levels, Snapping (Magnet to OHLC), Hit Testing, and Storage.
 */

export const DRAWING_TOOLS = {
  CURSOR: 'cursor',
  ERASER: 'eraser',
  TRENDLINE: 'trendline',
  HORIZONTAL_LINE: 'horizontal_line',
  HORIZONTAL_RAY: 'horizontal_ray',
  FIBONACCI: 'fibonacci',
  RECTANGLE: 'rectangle',
  POSITION_LONG: 'position_long',
  POSITION_SHORT: 'position_short',
  RULER: 'ruler',
  TEXT: 'text',
};

export const FIBONACCI_LEVELS = [
  { ratio: 0.0, label: '0.0% (0.0)', color: '#94a3b8', bg: 'transparent' },
  { ratio: 0.236, label: '23.6% (0.236)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  { ratio: 0.382, label: '38.2% (0.382)', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
  { ratio: 0.500, label: '50.0% (0.500)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)' },
  { ratio: 0.618, label: '61.8% (0.618 Golden Pocket)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.18)' },
  { ratio: 0.786, label: '78.6% (0.786)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  { ratio: 1.000, label: '100.0% (1.000)', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' },
  { ratio: 1.618, label: '161.8% (1.618 Target Extension)', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)' },
];

export const PRESET_COLORS = [
  '#38bdf8', // Sky Blue
  '#10b981', // Emerald Green
  '#f43f5e', // Rose Red
  '#fbbf24', // Amber Yellow
  '#c084fc', // Purple
  '#3b82f6', // Royal Blue
  '#ffffff', // White
  '#94a3b8', // Slate Grey
];

/**
 * Converts a data point { time, price } to screen coordinates { x, y }
 */
export function pointToScreen(point, chart, series) {
  if (!point || !chart || !series) return null;

  try {
    let x = null;
    if (point.time !== undefined && point.time !== null) {
      x = chart.timeScale().timeToCoordinate(point.time);
    }
    if (x === null && point.logical !== undefined && point.logical !== null) {
      x = chart.timeScale().logicalToCoordinate(point.logical);
    }

    const y = series.priceToCoordinate(point.price);

    if (x === null || y === null || isNaN(x) || isNaN(y)) {
      return null;
    }

    return { x, y };
  } catch (e) {
    return null;
  }
}

/**
 * Converts screen coordinates { x, y } to chart data point { time, price, logical }
 */
export function screenToPoint(screenX, screenY, chart, series, ohlcData = [], isMagnet = false) {
  if (!chart || !series) return null;

  try {
    let price = series.coordinateToPrice(screenY);
    let time = chart.timeScale().coordinateToTime(screenX);
    let logical = chart.timeScale().coordinateToLogical(screenX);

    if (price === null || isNaN(price)) return null;

    // Magnet Snapping to closest Candle OHLC
    if (isMagnet && ohlcData && ohlcData.length > 0) {
      const snapped = snapToOHLC(screenX, screenY, chart, series, ohlcData);
      if (snapped) {
        price = snapped.price;
        if (snapped.time !== undefined) time = snapped.time;
        if (snapped.logical !== undefined) logical = snapped.logical;
      }
    }

    return {
      price: Math.round(price * 100) / 100,
      time: time !== null ? time : undefined,
      logical: logical !== null ? Math.round(logical) : undefined,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Snaps to the nearest Candle Open, High, Low, or Close within a pixel threshold
 */
export function snapToOHLC(screenX, screenY, chart, series, ohlcData, thresholdPx = 30) {
  if (!chart || !series || !ohlcData || ohlcData.length === 0) return null;

  let closestBar = null;
  let minDistanceX = Infinity;

  // 1. Find the candle with the closest X coordinate
  for (let i = 0; i < ohlcData.length; i++) {
    const bar = ohlcData[i];
    const barX = chart.timeScale().timeToCoordinate(bar.time);
    if (barX !== null && !isNaN(barX)) {
      const dist = Math.abs(barX - screenX);
      if (dist < minDistanceX) {
        minDistanceX = dist;
        closestBar = bar;
      }
    }
  }

  if (!closestBar || minDistanceX > thresholdPx * 2) {
    return null;
  }

  // 2. Among O, H, L, C of this candle, find the closest price in Y
  const levels = [
    { type: 'High', price: closestBar.high },
    { type: 'Low', price: closestBar.low },
    { type: 'Open', price: closestBar.open },
    { type: 'Close', price: closestBar.close },
  ];

  let closestLevel = null;
  let minDistanceY = Infinity;

  for (const lvl of levels) {
    const lvlY = series.priceToCoordinate(lvl.price);
    if (lvlY !== null && !isNaN(lvlY)) {
      const distY = Math.abs(lvlY - screenY);
      if (distY < minDistanceY) {
        minDistanceY = distY;
        closestLevel = lvl;
      }
    }
  }

  if (closestLevel && minDistanceY <= thresholdPx) {
    return {
      price: closestLevel.price,
      time: closestBar.time,
      type: closestLevel.type,
    };
  }

  return null;
}

/**
 * Calculates distance from a point (px, py) to a line segment (x1, y1)-(x2, y2)
 */
export function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if point (px, py) is inside rectangle (x1, y1, x2, y2)
 */
export function isPointInsideRect(px, py, x1, y1, x2, y2) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

/**
 * Generates a unique ID for each drawing
 */
export function generateDrawingId() {
  return 'draw_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

/**
 * LocalStorage persistence adapter
 */
export function loadDrawings(ticker) {
  if (typeof window === 'undefined' || !ticker) return [];
  try {
    const raw = localStorage.getItem(`idx_chart_drawings_${ticker.toUpperCase()}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load chart drawings from localStorage:', e);
    return [];
  }
}

export function saveDrawings(ticker, drawings) {
  if (typeof window === 'undefined' || !ticker) return;
  try {
    localStorage.setItem(`idx_chart_drawings_${ticker.toUpperCase()}`, JSON.stringify(drawings || []));
  } catch (e) {
    console.error('Failed to save chart drawings to localStorage:', e);
  }
}
