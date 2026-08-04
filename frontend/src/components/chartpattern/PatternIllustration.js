import React from 'react';

// Common SVG props
const svgProps = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 100 80",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// SVG Paths for each pattern
const illustrations = {
  'ascending-triangle': (
    <svg {...svgProps}>
      {/* Resistance */}
      <line x1="10" y1="20" x2="90" y2="20" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      {/* Support */}
      <line x1="10" y1="70" x2="80" y2="20" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      {/* Price action */}
      <polyline points="10,70 30,20 50,45 70,20 85,30 95,5" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'inverted-head-and-shoulders': (
    <svg {...svgProps}>
      <line x1="10" y1="30" x2="90" y2="30" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <path d="M5,10 L15,30 L25,55 L35,30 L50,75 L65,30 L75,50 L85,30 L95,10" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'cup-and-handle': (
    <svg {...svgProps}>
      <line x1="10" y1="25" x2="90" y2="25" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <path d="M10,25 C10,90 70,90 70,25 L75,40 L80,35 L90,10" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'double-bottom': (
    <svg {...svgProps}>
      <line x1="10" y1="40" x2="90" y2="40" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,10 30,70 50,40 70,70 90,10" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'bullish-flag': (
    <svg {...svgProps}>
      <line x1="20" y1="6" x2="60" y2="32" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="10" y1="24" x2="50" y2="50" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,75 25,9 20,31 40,19 35,40 50,25 85,5" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'bullish-pennant': (
    <svg {...svgProps}>
      <line x1="30" y1="20" x2="80" y2="45" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="30" y1="70" x2="80" y2="45" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,80 35,30 45,60 60,40 70,50 90,10" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'falling-wedge': (
    <svg {...svgProps}>
      <line x1="10" y1="10" x2="80" y2="50" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="20" y1="70" x2="80" y2="60" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,15 25,65 40,35 55,60 70,45 80,55 95,20" stroke="var(--bullish)" strokeWidth="3" />
    </svg>
  ),
  'descending-triangle': (
    <svg {...svgProps}>
      <line x1="10" y1="60" x2="90" y2="60" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="10" y1="10" x2="80" y2="60" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,10 30,60 50,35 70,60 85,50 95,75" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'head-and-shoulders': (
    <svg {...svgProps}>
      <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <path d="M5,70 L15,50 L25,25 L35,50 L50,5 L65,50 L75,30 L85,50 L95,70" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'inverted-cup-and-handle': (
    <svg {...svgProps}>
      <line x1="10" y1="55" x2="90" y2="55" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <path d="M10,55 C10,-10 70,-10 70,55 L75,40 L80,45 L90,70" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'double-top': (
    <svg {...svgProps}>
      <line x1="10" y1="40" x2="90" y2="40" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,70 30,10 50,40 70,10 90,70" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'bearish-flag': (
    <svg {...svgProps}>
      <line x1="10" y1="56" x2="50" y2="30" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="20" y1="74" x2="60" y2="48" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,5 25,71 20,49 40,61 35,40 50,55 85,75" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'bearish-pennant': (
    <svg {...svgProps}>
      <line x1="30" y1="60" x2="80" y2="35" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="30" y1="10" x2="80" y2="35" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,5 35,50 45,20 60,40 70,30 90,75" stroke="var(--bearish)" strokeWidth="3" />
    </svg>
  ),
  'symmetrical-triangle': (
    <svg {...svgProps}>
      <line x1="10" y1="10" x2="80" y2="40" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="10" y1="70" x2="80" y2="40" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,70 25,18 40,55 55,30 70,45 90,20" stroke="var(--neutral)" strokeWidth="3" />
    </svg>
  ),
  'rectangle': (
    <svg {...svgProps}>
      <line x1="10" y1="20" x2="90" y2="20" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <line x1="10" y1="60" x2="90" y2="60" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="5,40 15,20 35,60 55,20 75,60 85,20 95,10" stroke="var(--neutral)" strokeWidth="3" />
    </svg>
  ),
  'false-break': (
    <svg {...svgProps}>
      <line x1="10" y1="40" x2="90" y2="40" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
      <polyline points="10,70 30,40 50,45 60,10 70,45 90,60" stroke="var(--warning)" strokeWidth="3" />
    </svg>
  )
};

export default function PatternIllustration({ patternId, className = "" }) {
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
    <div className={`pattern-illustration ${className}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {illustration}
    </div>
  );
}
