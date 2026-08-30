'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoryPresetHub from '@/components/CategoryPresetHub';
import DashboardScreener from '@/components/DashboardScreener';
import IHSGCard from '@/components/IHSGCard';
import LoadingState from '@/components/LoadingState';
import { Layers, ArrowLeft, Search, Sparkles, SlidersHorizontal } from 'lucide-react';

const QUICK_SCREEN_PRESETS = [
  { label: '🏛️ Big 4 Banks', tickers: 'BBCA,BBRI,BMRI,BBNI' },
  { label: '⛏️ Mining & Metals', tickers: 'MDKA,ANTM,INCO,TINS,MBMA,BRMS' },
  { label: '🔥 Coal & Energy', tickers: 'ADRO,PTBA,ITMG,MEDC,PGAS,AKRA' },
  { label: '⚡ EV & Tech Momentum', tickers: 'GOTO,EMTK,ARTO,AUTO,VKTR,ASII' }
];

function ScreenerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tickersQuery = searchParams.get('tickers');
  const modeQuery = searchParams.get('mode') || 'live';

  const [screenerResults, setScreenerResults] = useState(null);
  const [isScreenerLoading, setIsScreenerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customTickersInput, setCustomTickersInput] = useState(tickersQuery || '');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    document.title = 'Screener & Presets | IDX Terminal';
  }, []);

  useEffect(() => {
    if (tickersQuery) {
      setCustomTickersInput(tickersQuery);
      const tickersList = tickersQuery.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
      if (tickersList.length > 0) {
        setIsScreenerLoading(true);
        setError(null);
        fetch(`${API_URL}/api/screener`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tickers: tickersList,
            mode: modeQuery
          })
        })
          .then((res) => {
            if (!res.ok) throw new Error('Gagal mengambil data screener');
            return res.json();
          })
          .then((result) => {
            setScreenerResults(result.data);
          })
          .catch((err) => {
            setError(err.message);
          })
          .finally(() => {
            setIsScreenerLoading(false);
          });
      }
    } else {
      setScreenerResults(null);
    }
  }, [tickersQuery, modeQuery, API_URL]);

  const handleCustomScreenSubmit = (e) => {
    e.preventDefault();
    const clean = customTickersInput.trim().toUpperCase();
    if (clean) {
      router.push(`/screener?tickers=${clean}&mode=${modeQuery}`);
    }
  };

  return (
    <main className="dashboard-container" style={{ paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div
        className="card header-grid"
        style={{
          marginBottom: '24px',
          marginTop: '12px',
          padding: '32px',
          borderRadius: '24px'
        }}
      >
        <div className="flex-col" style={{ alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div className="flex-row items-center gap-sm" style={{ marginBottom: '8px' }}>
            <Layers size={16} color="var(--bullish)" />
            <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'var(--bullish)', letterSpacing: '0.2em' }}>
              STOCK PRESETS & CUSTOM SCREENER
            </span>
          </div>
          <h1
            className="text-3xl font-bold"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}
          >
            Screener & Kategori Saham IDX
          </h1>
          <p className="text-sm text-secondary" style={{ lineHeight: '1.5', maxWidth: '600px', fontWeight: '300', margin: 0, marginBottom: '16px' }}>
            Pilih formula preset (Bluechip, Dividend, Breakout, Rebound) atau jalankan custom multi-ticker screener dengan filter teknikal lengkap.
          </p>

          {/* Quick Presets Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Screener Cepat:
            </span>
            {QUICK_SCREEN_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => router.push(`/screener?tickers=${preset.tickers}&mode=${modeQuery}`)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: tickersQuery === preset.tickers ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${tickersQuery === preset.tickers ? 'var(--bullish)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: tickersQuery === preset.tickers ? 'var(--bullish)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-col" style={{ alignItems: 'flex-end', justifyContent: 'center', position: 'relative', zIndex: 1, gap: '16px' }}>
          <IHSGCard />

          {/* Custom Screener Form */}
          <form onSubmit={handleCustomScreenSubmit} style={{ width: '100%', maxWidth: '380px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '4px 6px 4px 12px',
                gap: '8px'
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Scan custom (e.g. BBCA, AUTO, VKTR)..."
                value={customTickersInput}
                onChange={(e) => setCustomTickersInput(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  width: '100%'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Scan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="card text-bearish font-mono mb-6" style={{ border: '1px solid var(--bearish)' }}>
          Error: {error}
        </div>
      )}

      {/* Screener View or Preset Hub */}
      {screenerResults || isScreenerLoading ? (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => {
                setScreenerResults(null);
                setCustomTickersInput('');
                router.push('/screener');
              }}
              className="flex-row items-center gap-xs text-xs font-mono"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Kembali ke Preset Hub
            </button>
          </div>

          <DashboardScreener
            results={screenerResults}
            isLoading={isScreenerLoading}
            onTickerClick={(ticker) => {
              router.push(`/analysis/${ticker}`);
            }}
          />
        </div>
      ) : (
        <CategoryPresetHub
          mode={modeQuery}
          onTickerClick={(ticker) => {
            router.push(`/analysis/${ticker}`);
          }}
        />
      )}
    </main>
  );
}

export default function ScreenerPage() {
  return (
    <Suspense fallback={<div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}><LoadingState /></div>}>
      <ScreenerContent />
    </Suspense>
  );
}
