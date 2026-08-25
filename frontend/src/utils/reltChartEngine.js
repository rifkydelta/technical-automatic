/**
 * RELT Chart Engine
 * Pure client-side calculations for technical indicators & SMC visual overlays
 * Designed for lightweight-charts integration.
 */

// 1. Exponential Moving Average (EMA)
export function calculateEMA(data, period) {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaData = [];
  let ema = data[0].close;
  emaData.push({ time: data[0].time, value: ema });

  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    emaData.push({ time: data[i].time, value: parseFloat(ema.toFixed(2)) });
  }
  return emaData;
}

// 2. Supertrend Calculation (Wilder's ATR based, matching TradingView Pine Script)
export function calculateSupertrend(data, factor = 3.0, atrLen = 10) {
  if (!data || data.length < atrLen) return { series: [], isBullish: true, lastValue: 0 };

  const n = data.length;
  const tr = new Array(n);
  tr[0] = data[0].high - data[0].low;

  for (let i = 1; i < n; i++) {
    const h = data[i].high;
    const l = data[i].low;
    const pc = data[i - 1].close;
    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  }

  // Wilder's ATR
  const atr = new Array(n);
  let trSum = 0;
  for (let i = 0; i < atrLen; i++) {
    trSum += tr[i];
  }
  atr[atrLen - 1] = trSum / atrLen;

  for (let i = atrLen; i < n; i++) {
    atr[i] = (atr[i - 1] * (atrLen - 1) + tr[i]) / atrLen;
  }

  const upperBand = new Array(n);
  const lowerBand = new Array(n);
  const supertrend = new Array(n);
  const direction = new Array(n); // -1 = Bullish (Green), 1 = Bearish (Red)

  const continuousSeries = [];
  const segments = [];
  let currentSegment = null;

  for (let i = atrLen - 1; i < n; i++) {
    const hl2 = (data[i].high + data[i].low) / 2.0;
    const curAtr = atr[i];
    const basicUpper = hl2 + factor * curAtr;
    const basicLower = hl2 - factor * curAtr;

    if (i === atrLen - 1) {
      upperBand[i] = basicUpper;
      lowerBand[i] = basicLower;
      direction[i] = data[i].close > basicUpper ? -1 : 1;
      supertrend[i] = direction[i] === -1 ? lowerBand[i] : upperBand[i];
    } else {
      const prevUpper = upperBand[i - 1];
      const prevLower = lowerBand[i - 1];
      const prevClose = data[i - 1].close;

      upperBand[i] = basicUpper < prevUpper || prevClose > prevUpper ? basicUpper : prevUpper;
      lowerBand[i] = basicLower > prevLower || prevClose < prevLower ? basicLower : prevLower;

      const prevDir = direction[i - 1];
      if (prevDir === 1 && data[i].close > prevUpper) {
        direction[i] = -1; // Flip to Bullish
      } else if (prevDir === -1 && data[i].close < prevLower) {
        direction[i] = 1;  // Flip to Bearish
      } else {
        direction[i] = prevDir;
      }

      supertrend[i] = direction[i] === -1 ? lowerBand[i] : upperBand[i];
    }

    const val = parseFloat(supertrend[i].toFixed(2));
    const isBull = direction[i] === -1;
    const point = { time: data[i].time, value: val };

    continuousSeries.push({ time: data[i].time, value: val, isBullish: isBull });

    if (!currentSegment || currentSegment.isBullish !== isBull) {
      if (currentSegment && currentSegment.data.length > 0) {
        segments.push(currentSegment);
      }
      currentSegment = {
        isBullish: isBull,
        data: [point]
      };
    } else {
      currentSegment.data.push(point);
    }
  }

  if (currentSegment && currentSegment.data.length > 0) {
    segments.push(currentSegment);
  }

  const lastDir = direction[n - 1] === -1;
  const lastVal = supertrend[n - 1] ? parseFloat(supertrend[n - 1].toFixed(2)) : 0;

  return {
    segments,
    continuousSeries,
    isBullish: lastDir,
    lastValue: lastVal
  };
}

// 3. Heikin-Ashi Candlesticks
export function calculateHeikinAshi(data) {
  if (!data || data.length === 0) return [];
  const haData = [];

  let prevHaOpen = (data[0].open + data[0].close) / 2.0;
  let prevHaClose = (data[0].open + data[0].high + data[0].low + data[0].close) / 4.0;

  haData.push({
    time: data[0].time,
    open: parseFloat(prevHaOpen.toFixed(2)),
    high: data[0].high,
    low: data[0].low,
    close: parseFloat(prevHaClose.toFixed(2))
  });

  for (let i = 1; i < data.length; i++) {
    const cur = data[i];
    const haClose = (cur.open + cur.high + cur.low + cur.close) / 4.0;
    const haOpen = (prevHaOpen + prevHaClose) / 2.0;
    const haHigh = Math.max(cur.high, haOpen, haClose);
    const haLow = Math.min(cur.low, haOpen, haClose);

    haData.push({
      time: cur.time,
      open: parseFloat(haOpen.toFixed(2)),
      high: parseFloat(haHigh.toFixed(2)),
      low: parseFloat(haLow.toFixed(2)),
      close: parseFloat(haClose.toFixed(2))
    });

    prevHaOpen = haOpen;
    prevHaClose = haClose;
  }

  return haData;
}

// 4. Volume Moving Average (SMA 20)
export function calculateVolumeSMA(data, period = 20) {
  if (!data || data.length === 0) return [];
  const smaData = [];
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const vol = data[i].volume || 0;
    sum += vol;
    if (i >= period) {
      sum -= (data[i - period].volume || 0);
      smaData.push({ time: data[i].time, value: Math.round(sum / period) });
    } else {
      smaData.push({ time: data[i].time, value: Math.round(sum / (i + 1)) });
    }
  }

  return smaData;
}

// 5. RSI Calculation (Wilder's Smoothing)
export function calculateRSI(data, period = 14) {
  if (!data || data.length <= period) return new Array(data ? data.length : 0).fill(50);
  const n = data.length;
  const rsi = new Array(n).fill(50);
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gainSum += diff;
    else lossSum += Math.abs(diff);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

  for (let i = period + 1; i < n; i++) {
    const diff = data[i].close - data[i - 1].close;
    const curGain = diff >= 0 ? diff : 0;
    const curLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + curGain) / period;
    avgLoss = (avgLoss * (period - 1) + curLoss) / period;

    rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  }

  return rsi;
}

// 6. MACD Calculation (12, 26, 9)
export function calculateMACD(data, fast = 12, slow = 26, signalPeriod = 9) {
  if (!data || data.length < slow + signalPeriod) return { macdLine: [], signalLine: [], hist: [] };
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);
  const n = data.length;

  const macdLine = [];
  for (let i = 0; i < n; i++) {
    const fVal = emaFast[i] ? emaFast[i].value : data[i].close;
    const sVal = emaSlow[i] ? emaSlow[i].value : data[i].close;
    macdLine.push({ time: data[i].time, value: fVal - sVal });
  }

  const signalLine = calculateEMA(macdLine.map(m => ({ time: m.time, close: m.value })), signalPeriod);
  const hist = [];

  for (let i = 0; i < n; i++) {
    const m = macdLine[i] ? macdLine[i].value : 0;
    const s = signalLine[i] ? signalLine[i].value : 0;
    hist.push(m - s);
  }

  return { macdLine, signalLine, hist };
}

// 7. Wilder's ATR Calculation
export function calculateATR(data, period = 14) {
  if (!data || data.length === 0) return [];
  const n = data.length;
  const atr = new Array(n).fill(1);
  const tr = new Array(n);
  tr[0] = data[0].high - data[0].low;

  for (let i = 1; i < n; i++) {
    const h = data[i].high;
    const l = data[i].low;
    const pc = data[i - 1].close;
    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  }

  let trSum = 0;
  for (let i = 0; i < Math.min(period, n); i++) trSum += tr[i];
  atr[Math.min(period - 1, n - 1)] = trSum / Math.min(period, n);

  for (let i = period; i < n; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }

  return atr;
}

// 8. Comprehensive Historical & Future Buy/Sell (TP/SL) Signal Engine (Synchronized with Backend Backtest)
export function generateSignalMarkersAndTradePlan(data, reltSignal, historicalBacktest) {
  if (!data || data.length < 5) return { markers: [], activeTrade: null };

  const markers = [];
  const n = data.length;

  // Map each data point's time to standard ISO date (YYYY-MM-DD) for lookup
  const timeToDateMap = new Map();
  data.forEach((bar) => {
    let dateStr = '';
    if (typeof bar.time === 'string') {
      dateStr = bar.time.split('T')[0];
    } else if (typeof bar.time === 'number') {
      const d = new Date(bar.time * 1000);
      dateStr = d.toISOString().split('T')[0];
    }
    timeToDateMap.set(dateStr, bar.time);
  });

  // 1. If backend historical backtest logs are available, use them directly for 100% exact parity
  const backtestLogs = historicalBacktest && historicalBacktest.length > 0 && historicalBacktest[0].trade_logs 
    ? historicalBacktest[0].trade_logs 
    : null;

  if (backtestLogs && backtestLogs.length > 0) {
    backtestLogs.forEach((trade) => {
      // Find Entry Candle
      let entryTime = trade.entry_time ? timeToDateMap.get(trade.entry_time) : null;
      if (!entryTime) {
        // Fallback date parsing from "24 Feb 2026 -> 09 Mar 2026"
        const parts = trade.date.split(' -> ');
        if (parts.length >= 1) {
          const d = new Date(parts[0]);
          if (!isNaN(d.getTime())) {
            const iso = d.toISOString().split('T')[0];
            entryTime = timeToDateMap.get(iso);
          }
        }
      }

      if (entryTime) {
        markers.push({
          time: entryTime,
          position: 'belowBar',
          color: trade.signal_type.includes('PULLBACK') ? '#38bdf8' : '#10b981',
          shape: 'arrowUp',
          text: `BUY (Rp ${Math.round(trade.entry_price).toLocaleString()})`
        });
      }

      // Find Exit Candle
      let exitTime = trade.exit_time ? timeToDateMap.get(trade.exit_time) : null;
      if (!exitTime && trade.status !== 'open_floating') {
        const parts = trade.date.split(' -> ');
        if (parts.length >= 2 && parts[1] !== 'Now') {
          const d = new Date(parts[1]);
          if (!isNaN(d.getTime())) {
            const iso = d.toISOString().split('T')[0];
            exitTime = timeToDateMap.get(iso);
          }
        }
      }

      if (exitTime && trade.status !== 'open_floating') {
        if (trade.status === 'hit_sl') {
          markers.push({
            time: exitTime,
            position: 'aboveBar',
            color: '#f43f5e',
            shape: 'arrowDown',
            text: `🛑 SL Hit (Rp ${Math.round(trade.exit_price).toLocaleString()})`
          });
        } else if (trade.status === 'hit_trail_sl') {
          markers.push({
            time: exitTime,
            position: 'aboveBar',
            color: '#c084fc',
            shape: 'arrowDown',
            text: `🔒 Trail SL (Rp ${Math.round(trade.exit_price).toLocaleString()})`
          });
        } else if (trade.status === 'hit_tp2') {
          markers.push({
            time: exitTime,
            position: 'aboveBar',
            color: '#38bdf8',
            shape: 'arrowDown',
            text: `🚀 TP2 Hit (Rp ${Math.round(trade.exit_price).toLocaleString()})`
          });
        } else if (trade.status === 'hit_tp1') {
          markers.push({
            time: exitTime,
            position: 'aboveBar',
            color: '#4ade80',
            shape: 'circle',
            text: `🎯 TP1 Hit (Rp ${Math.round(trade.exit_price).toLocaleString()})`
          });
        } else if (trade.status === 'st_exit' || trade.status === 'signal_exit') {
          markers.push({
            time: exitTime,
            position: 'aboveBar',
            color: '#f97316',
            shape: 'arrowDown',
            text: `🔴 ST Exit (Rp ${Math.round(trade.exit_price).toLocaleString()})`
          });
        }
      }
    });
  }

  // 2. Add Active Real-Time Signal on Latest Bar
  if (reltSignal && data.length > 0) {
    const lastBar = data[data.length - 1];
    const action = reltSignal.action;

    if (action === 'ULTRA BUY') {
      markers.push({
        time: lastBar.time,
        position: 'belowBar',
        color: '#4ade80',
        shape: 'arrowUp',
        text: `⚡ ULTRA BUY (Entry: Rp ${Math.round(reltSignal.trade_setup?.entry_price || lastBar.close).toLocaleString()})`
      });
    } else if (action === 'STRONG BUY') {
      markers.push({
        time: lastBar.time,
        position: 'belowBar',
        color: '#22c55e',
        shape: 'arrowUp',
        text: `🟢 STRONG BUY (Entry: Rp ${Math.round(reltSignal.trade_setup?.entry_price || lastBar.close).toLocaleString()})`
      });
    } else if (action === 'PULLBACK BUY') {
      markers.push({
        time: lastBar.time,
        position: 'belowBar',
        color: '#38bdf8',
        shape: 'arrowUp',
        text: `🎯 PULLBACK BUY (Entry: Rp ${Math.round(reltSignal.trade_setup?.entry_price || lastBar.close).toLocaleString()})`
      });
    }
  }

  // Deduplicate markers on same timestamp
  const uniqueMarkers = [];
  const markerKeys = new Set();

  markers.forEach((m) => {
    const key = `${m.time}_${m.position}_${m.text}`;
    if (!markerKeys.has(key)) {
      markerKeys.add(key);
      uniqueMarkers.push(m);
    }
  });

  // Sort markers strictly by time ascending (lightweight-charts requirement)
  uniqueMarkers.sort((a, b) => {
    const ta = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
    const tb = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
    return ta - tb;
  });

  return {
    markers: uniqueMarkers,
    activeTrade: reltSignal?.trade_setup || null
  };
}

