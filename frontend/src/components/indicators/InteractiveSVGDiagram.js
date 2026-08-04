import React from 'react';

export default function InteractiveSVGDiagram({ type, animate = true }) {
  const getDiagramContent = () => {
    switch (type) {
      case 'crossover':
      case 'ma-crossover':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full" style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <linearGradient id="fastGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Slow Moving Average (MA50) - Orange */}
            <path 
              d="M 20 160 Q 150 130 250 80 T 380 50" 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="3" 
              strokeLinecap="round"
              opacity="0.85"
            />
            <text x="35" y="135" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">Slow MA (MA50)</text>

            {/* Fast Moving Average (MA20) - Blue/Green */}
            <path 
              d="M 20 190 C 100 180 180 140 225 100 C 260 70 320 40 380 30" 
              fill="none" 
              stroke="url(#fastGrad)" 
              strokeWidth="4" 
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <text x="290" y="30" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">Fast MA (MA20)</text>

            {/* Golden Cross Point */}
            <circle cx="225" cy="100" r="7" fill="#10b981" stroke="#fff" strokeWidth="2" filter="url(#glow)">
              {animate && (
                <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
              )}
            </circle>

            {/* Callouts */}
            <line x1="225" y1="100" x2="225" y2="150" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,3" />
            <rect x="160" y="150" width="130" height="32" rx="6" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
            <text x="225" y="164" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">GOLDEN CROSS</text>
            <text x="225" y="176" fill="var(--text-secondary)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Sinyal Reversal Bullish</text>
          </svg>
        );

      case 'macd-divergence':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full" style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <linearGradient id="bullGreen" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Price Chart (Top Half) */}
            <text x="15" y="20" fill="var(--text-muted)" fontSize="9" fontFamily="monospace" uppercase="true">PRICE ACTION</text>
            {/* Price line making Lower Lows */}
            <path 
              d="M 20 80 L 100 95 L 180 70 L 260 110 L 330 90 L 380 120" 
              fill="none" 
              stroke="var(--text-primary)" 
              strokeWidth="2.5" 
            />
            {/* Support Trendline showing Lower Lows */}
            <line x1="100" y1="95" x2="260" y2="110" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
            <circle cx="100" cy="95" r="4" fill="#ef4444" />
            <circle cx="260" cy="110" r="4" fill="#ef4444" />
            <text x="170" y="125" fill="#ef4444" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Lower Lows (Harga Turun)</text>

            {/* Divider */}
            <line x1="0" y1="135" x2="400" y2="135" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* MACD Oscillator (Bottom Half) */}
            <text x="15" y="150" fill="var(--text-muted)" fontSize="9" fontFamily="monospace">MACD HISTOGRAM & DIVERGENCE</text>
            {/* MACD Histogram bars (Higher Lows) */}
            <line x1="60" y1="165" x2="60" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
            <path d="M 80 165 L 80 175 M 100 165 L 100 190 M 120 165 L 120 180 M 140 165 L 140 170" stroke="#ef4444" strokeWidth="3" />
            <path d="M 160 165 L 160 160 M 180 165 L 180 155 M 200 165 L 200 158 M 220 165 L 220 162" stroke="#10b981" strokeWidth="3" />
            <path d="M 240 165 L 240 175 M 260 165 L 260 178 M 280 165 L 280 170 M 300 165 L 300 160" stroke="#ef4444" strokeWidth="3" />
            <path d="M 320 165 L 320 150 M 340 165 L 340 142 M 360 165 L 360 138" stroke="#10b981" strokeWidth="3" />

            {/* Trendline on MACD showing Higher Lows */}
            <line x1="100" y1="190" x2="260" y2="178" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
            <circle cx="100" cy="190" r="4" fill="#10b981" />
            <circle cx="260" cy="178" r="4" fill="#10b981" />
            <text x="175" y="210" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Higher Lows (MACD Naik)</text>
            <text x="325" y="195" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">BULLISH DIVERGENCE</text>
          </svg>
        );

      case 'bb-squeeze':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full" style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <linearGradient id="bbArea" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(96,165,250,0.01)" />
                <stop offset="50%" stopColor="rgba(96,165,250,0.05)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.08)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Bands Shading */}
            <path 
              d="M 10 70 Q 110 75 210 100 T 350 35 L 390 25 L 390 195 L 350 185 Q 210 120 110 145 T 10 150 Z" 
              fill="url(#bbArea)" 
            />

            {/* Upper Band */}
            <path 
              d="M 10 70 Q 110 75 210 100 T 350 35 L 390 25" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2" 
              opacity="0.8"
            />
            <text x="320" y="20" fill="#60a5fa" fontSize="8" fontFamily="monospace">Upper Band</text>

            {/* Lower Band */}
            <path 
              d="M 10 150 Q 110 145 210 120 T 350 185 L 390 195" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2" 
              opacity="0.8"
            />
            <text x="320" y="210" fill="#60a5fa" fontSize="8" fontFamily="monospace">Lower Band</text>

            {/* Middle Band (MA20) */}
            <path 
              d="M 10 110 Q 110 110 210 110 T 350 110 L 390 110" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="1.5" 
              strokeDasharray="4,4"
              opacity="0.5"
            />

            {/* Price Candles Breaking Out */}
            {/* Bouncing Price line */}
            <path 
              d="M 20 110 L 60 135 L 100 95 L 140 120 L 180 105 L 210 100 L 250 85 L 300 40 L 350 25" 
              fill="none" 
              stroke="#fff" 
              strokeWidth="2" 
            />

            {/* Highlight Squeeze (volatility low) */}
            <ellipse cx="205" cy="110" rx="25" ry="18" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
            <text x="205" y="145" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Squeeze (Volatilitas Rendah)</text>

            {/* Breakout Highlight */}
            <circle cx="300" cy="40" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
            <rect x="250" y="-8" width="100" height="20" rx="4" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1" />
            <text x="300" y="5" fill="#10b981" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">BREAKOUT BULLISH</text>
          </svg>
        );

      case 'rsi-thresholds':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full" style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Area Fills for Extremes */}
            {/* Overbought Shading */}
            <rect x="0" y="0" width="400" height="50" fill="rgba(239,68,68,0.05)" />
            {/* Oversold Shading */}
            <rect x="0" y="170" width="400" height="50" fill="rgba(16,185,129,0.05)" />

            {/* Threshold Lines */}
            {/* Overbought line (70) */}
            <line x1="0" y1="50" x2="400" y2="50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
            <text x="355" y="45" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">Overbought (70)</text>

            {/* Oversold line (30) */}
            <line x1="0" y1="170" x2="400" y2="170" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
            <text x="360" y="182" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">Oversold (30)</text>

            {/* Middle line (50) */}
            <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,5" />

            {/* RSI Wave */}
            <path 
              d="M 10 110 Q 50 140 80 185 T 150 120 T 220 35 T 300 130 T 380 120" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="3" 
              strokeLinecap="round"
            />

            {/* Overbought Highlight */}
            <circle cx="220" cy="35" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
            <rect x="180" y="8" width="80" height="18" rx="4" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1" />
            <text x="220" y="20" fill="#ef4444" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Jenuh Beli</text>

            {/* Oversold Highlight */}
            <circle cx="80" cy="185" r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
            <rect x="40" y="195" width="80" height="18" rx="4" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1" />
            <text x="80" y="207" fill="#10b981" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Jenuh Jual</text>
          </svg>
        );

      case 'fibonacci':
      case 'fibonacci-retrace':
        return (
          <svg viewBox="0 0 400 220" className="w-full h-full" style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Fibonacci Levels */}
            {/* 0% (High) */}
            <line x1="40" y1="40" x2="360" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="330" y="35" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">0.0% (Swing High) - Rp 1000</text>

            {/* 38.2% */}
            <line x1="40" y1="85" x2="360" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,2" />
            <text x="330" y="80" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">38.2% - Rp 840</text>

            {/* 50% */}
            <line x1="40" y1="110" x2="360" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
            <text x="330" y="105" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">50.0% - Rp 800</text>

            {/* 61.8% Golden Ratio */}
            <line x1="40" y1="135" x2="360" y2="135" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="330" y="130" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">61.8% (Golden Ratio) - Rp 750</text>

            {/* 100% (Low) */}
            <line x1="40" y1="180" x2="360" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="330" y="175" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">100.0% (Swing Low) - Rp 600</text>

            {/* Price Line Pulling back to 61.8% */}
            <path 
              d="M 50 180 L 120 40 L 195 135 L 280 60" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            
            {/* Draw Fibonacci Trend line (Diagonal connecting high & low) */}
            <line x1="50" y1="180" x2="120" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Rebound Highlight */}
            <circle cx="195" cy="135" r="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
            <rect x="140" y="145" width="110" height="28" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
            <text x="195" y="157" fill="#10b981" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">PULLBACK SUPPORT</text>
            <text x="195" y="167" fill="var(--text-secondary)" fontSize="7" fontFamily="sans-serif" textAnchor="middle">Pantulan Golden Ratio</text>
          </svg>
        );

      default:
        return (
          <div style={{ height: '220px', background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Diagram {type}</span>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: '12px', overflow: 'hidden' }}>
      {getDiagramContent()}
    </div>
  );
}
