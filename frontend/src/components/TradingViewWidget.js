'use client';
import React, { useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

export default function TradingViewWidget({ ticker, height = '480px' }) {
  const containerRef = useRef();

  useEffect(() => {
    const cleanTicker = ticker ? ticker.toUpperCase() : 'BBRI';
    
    // Default to Indonesia IDX symbol formatting, fallback to crypto if keyword matches
    let symbol = `IDX:${cleanTicker}`;
    if (cleanTicker.includes('-') || cleanTicker.includes('USDT') || cleanTicker === 'BTC' || cleanTicker === 'ETH') {
      symbol = `BINANCE:${cleanTicker.replace('-', '')}T`;
    }

    const onLoadScript = () => {
      if (typeof window !== 'undefined' && 'TradingView' in window && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: 'D',
          timezone: 'Asia/Jakarta',
          theme: 'dark',
          style: '1',
          locale: 'id',
          enable_publishing: false,
          hide_side_toolbar: false, // ensures native TV drawing tools are visible
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          studies: [
            "Volume@tv-basicstudies",
            "MAExp@tv-basicstudies"
          ],
        });
      }
    };

    if (typeof window !== 'undefined') {
      if (!window.TradingView) {
        if (!tvScriptLoadingPromise) {
          tvScriptLoadingPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.id = 'tradingview-widget-loading-script';
            script.src = 'https://s3.tradingview.com/tv.js';
            script.type = 'text/javascript';
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }
        tvScriptLoadingPromise.then(onLoadScript);
      } else {
        onLoadScript();
      }
    }
  }, [ticker]);

  return (
    <div className='tradingview-widget-container' style={{ height: height, width: "100%", borderRadius: '8px', overflow: 'hidden' }}>
      <div id={`tradingview_${Math.random().toString(36).substr(2, 9)}`} ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
