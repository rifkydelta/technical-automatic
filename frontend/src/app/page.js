'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InputForm from '@/components/InputForm';
import IHSGCard from '@/components/IHSGCard';
import CategoryPresetHub from '@/components/CategoryPresetHub';
import { Radio, Layers, BookOpen, ArrowRight, Zap, TrendingUp, Sparkles, ShieldCheck, Activity } from 'lucide-react';

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'VKTR', 'AUTO', 'DSSA', 'BRIS', 'ADRO', 'PTBA', 'TLKM'];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState('live');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'IDX Terminal | Pro Algorithmic Market Intelligence';
  }, []);

  const handleAnalysisSubmit = (formData) => {
    const inputTickers = (formData.ticker || '').split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    if (inputTickers.length === 0) return;

    if (inputTickers.length > 1) {
      // Multi-ticker Screener
      router.push(`/screener?tickers=${inputTickers.join(',')}&mode=${formData.mode || mode}`);
    } else {
      // Single Ticker Analysis
      router.push(`/analysis/${inputTickers[0]}?mode=${formData.mode || mode}`);
    }
  };

  return (
    <main className="dashboard-container" style={{ paddingBottom: '60px' }}>
      {/* Hero Banner with Search & Market Overview */}
      <div
        className="card header-grid"
        style={{
          marginBottom: '28px',
          marginTop: '16px',
          padding: '36px',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.09)'
        }}
      >
        {/* Left Column: Brand, Headline, Value Prop & Quick Pills */}
        <div className="flex-col" style={{ alignItems: 'flex-start', position: 'relative', zIndex: 1, paddingRight: '20px' }}>
          <div className="flex-row items-center gap-sm" style={{ marginBottom: '12px' }}>
            <div className="live-dot" />
            <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'var(--bullish)', letterSpacing: '0.18em', fontWeight: '700' }}>
              Live Market Intelligence • IDX Terminal
            </span>
          </div>

          <h1
            className="text-4xl font-bold"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.15',
              letterSpacing: '-0.025em',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.12)',
              marginBottom: '12px'
            }}
          >
            Algorithmic<br />Technical Analysis
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '4px',
              marginBottom: '22px',
              flexWrap: 'nowrap',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
            <span
              className="text-sm text-secondary"
              style={{
                fontWeight: '300',
                whiteSpace: 'nowrap'
              }}
            >
              One Click. Complete Market Insights, Smart Money Signals & Pattern Detection.
            </span>
            <span
              className="text-muted tracking-widest uppercase"
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                paddingLeft: '10px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              powered by <span style={{ color: 'var(--bullish)', fontWeight: 'bold', textTransform: 'lowercase', marginLeft: '4px' }}>@rifkydelta</span>
            </span>
          </div>

          {/* Quick Popular Ticker Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
              Sering Dianalisis:
            </span>
            {POPULAR_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/analysis/${t}?mode=${mode}`)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 222, 128, 0.12)';
                  e.currentTarget.style.borderColor = 'var(--bullish)';
                  e.currentTarget.style.color = 'var(--bullish)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Integrated IHSG Widget & Pro Command Search Bar */}
        <div className="flex-col" style={{ alignItems: 'stretch', justifyContent: 'center', position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px', marginLeft: 'auto' }}>
          <IHSGCard />
          <InputForm
            onSubmit={handleAnalysisSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 3 Pro Action Feature Cards (Bento Style) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        {/* Feature 1: Signal Scanner */}
        <Link
          href="/signals"
          className="card"
          style={{
            padding: '22px 26px',
            borderRadius: '20px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}
              >
                <Radio size={19} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  letterSpacing: '0.04em'
                }}
              >
                REALTIME 1H
              </span>
            </div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Live Signal Scanner
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Pantau sinyal beli realtime terkonfirmasi 1H bursa dengan rekam jejak trade & win rate backtest transparan.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', fontSize: '12px', fontWeight: '800', color: '#60a5fa' }}>
            Buka Signal Dashboard <ArrowRight size={13} strokeWidth={2.5} />
          </div>
        </Link>

        {/* Feature 2: Screener & Preset Hub */}
        <Link
          href="/screener"
          className="card"
          style={{
            padding: '22px 26px',
            borderRadius: '20px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(74, 222, 128, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bullish)'
                }}
              >
                <Layers size={19} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  color: 'var(--bullish)',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  letterSpacing: '0.04em'
                }}
              >
                8 PRESETS & CUSTOM
              </span>
            </div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Screener & Presets Hub
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Saring saham Bluechip LQ45, High Dividend, Rebound MA20, dan Breakout 52-Minggu dalam hitungan detik.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', fontSize: '12px', fontWeight: '800', color: 'var(--bullish)' }}>
            Eksplorasi Screener <ArrowRight size={13} strokeWidth={2.5} />
          </div>
        </Link>

        {/* Feature 3: Learning Center */}
        <Link
          href="/learning"
          className="card"
          style={{
            padding: '22px 26px',
            borderRadius: '20px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--warning)'
                }}
              >
                <BookOpen size={19} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  letterSpacing: '0.04em'
                }}
              >
                8 BAB PANDUAN
              </span>
            </div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Learning Center & Guide
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Kuasai Smart Money Concepts (SMC), Order Block, FVG, Supertrend, dan aturan manajemen risiko adaptif.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', fontSize: '12px', fontWeight: '800', color: 'var(--warning)' }}>
            Mulai Belajar <ArrowRight size={13} strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* Category Preset Hub */}
      <CategoryPresetHub
        mode={mode}
        onTickerClick={(ticker) => {
          router.push(`/analysis/${ticker}?mode=${mode}`);
        }}
      />
    </main>
  );
}
