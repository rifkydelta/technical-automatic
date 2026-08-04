import React from 'react';

// Common SVG props
const svgProps = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 100 80",
  fill: "none",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Colors
const BULL = "var(--bullish)";
const BEAR = "var(--bearish)";
const NEUTRAL = "var(--text-secondary)";

const Candle = ({ x, y, width, height, wickTop, wickBottom, color, isDoji }) => {
  return (
    <g stroke={color}>
      {/* Upper wick */}
      <line x1={x + width / 2} y1={wickTop} x2={x + width / 2} y2={y} />
      {/* Lower wick */}
      <line x1={x + width / 2} y1={y + height} x2={x + width / 2} y2={wickBottom} />
      {/* Body */}
      {isDoji ? (
        <line x1={x} y1={y} x2={x + width} y2={y} strokeWidth="3" />
      ) : (
        <rect x={x} y={y} width={width} height={height} fill={color} strokeWidth="0" />
      )}
    </g>
  );
};

const illustrations = {
  'marubozu': (
    <svg {...svgProps}>
      <Candle x={35} y={10} width={30} height={60} wickTop={10} wickBottom={70} color={BULL} />
    </svg>
  ),
  'hammer': (
    <svg {...svgProps}>
      <Candle x={35} y={20} width={30} height={15} wickTop={15} wickBottom={70} color={BULL} />
    </svg>
  ),
  'bullish-engulfing': (
    <svg {...svgProps}>
      <Candle x={20} y={40} width={25} height={20} wickTop={30} wickBottom={65} color={BEAR} />
      <Candle x={55} y={15} width={25} height={55} wickTop={10} wickBottom={75} color={BULL} />
    </svg>
  ),
  'morning-star': (
    <svg {...svgProps}>
      <Candle x={15} y={15} width={20} height={40} wickTop={10} wickBottom={60} color={BEAR} />
      <Candle x={40} y={60} width={20} height={10} wickTop={55} wickBottom={75} color={BEAR} />
      <Candle x={65} y={25} width={20} height={35} wickTop={20} wickBottom={65} color={BULL} />
    </svg>
  ),
  'bullish-harami': (
    <svg {...svgProps}>
      <Candle x={20} y={15} width={25} height={55} wickTop={10} wickBottom={75} color={BEAR} />
      <Candle x={55} y={35} width={25} height={20} wickTop={25} wickBottom={60} color={BULL} />
    </svg>
  ),
  'inverted-hammer': (
    <svg {...svgProps}>
      <Candle x={35} y={55} width={30} height={15} wickTop={10} wickBottom={75} color={BEAR} />
    </svg>
  ),
  'bearish-engulfing': (
    <svg {...svgProps}>
      <Candle x={20} y={40} width={25} height={20} wickTop={30} wickBottom={65} color={BULL} />
      <Candle x={55} y={15} width={25} height={55} wickTop={10} wickBottom={75} color={BEAR} />
    </svg>
  ),
  'evening-star': (
    <svg {...svgProps}>
      <Candle x={15} y={25} width={20} height={35} wickTop={20} wickBottom={65} color={BULL} />
      <Candle x={40} y={10} width={20} height={10} wickTop={5} wickBottom={25} color={BULL} />
      <Candle x={65} y={15} width={20} height={40} wickTop={10} wickBottom={60} color={BEAR} />
    </svg>
  ),
  'bearish-harami': (
    <svg {...svgProps}>
      <Candle x={20} y={15} width={25} height={55} wickTop={10} wickBottom={75} color={BULL} />
      <Candle x={55} y={35} width={25} height={20} wickTop={25} wickBottom={60} color={BEAR} />
    </svg>
  ),
  'doji': (
    <svg {...svgProps}>
      <Candle x={35} y={40} width={30} height={0} wickTop={10} wickBottom={70} color={NEUTRAL} isDoji={true} />
    </svg>
  )
};

export default function CandlestickIllustration({ patternId, className = "" }) {
  const illustration = illustrations[patternId];
  
  if (!illustration) {
    return (
      <svg {...svgProps} className={className}>
        <rect width="100" height="80" fill="rgba(255,255,255,0.05)" />
        <text x="50" y="45" textAnchor="middle" fill="currentColor" fontSize="12">No Image</text>
      </svg>
    );
  }

  return (
    <div className={`candlestick-illustration ${className}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {illustration}
    </div>
  );
}
