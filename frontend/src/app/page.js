'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InputForm from '@/components/InputForm';
import IHSGCard from '@/components/IHSGCard';
import CategoryPresetHub from '@/components/CategoryPresetHub';
import { Radio, Layers, BookOpen, ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'VKTR', 'AUTO', 'DSSA', 'BRIS', 'ADRO'];

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
      // Screener multi-ticker
      router.push(`/screener?tickers=${inputTickers.join(',')}&mode=${formData.mode || mode}`);
    } else {
      // Single ticker analysis
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
          overflow: 'hidden'
        }}
      >
        <div className="flex-col" style={{ alignItems: 'flex-start', position: 'relative', zIndex: 1, paddingRight: '20px' }}>
          <div className="flex-row items-center gap-sm" style={{ marginBottom: '10px' }}>
            <div className="live-dot"></div>
            <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'var(--bullish)', letterSpacing: '0.2em' }}>
              Live Market Intelligence
            </span>
          </div>

          <h1
            className="text-4xl font-bold"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.15',
              letterSpacing: '-0.025em',
              textShadow: '0 0 40px rgba(255,255,255,0.1)',
              marginBottom: '12px'
            }}
          >
            Algorithmic<br />Technical Analysis
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2px', marginBottom: '20px' }}>
            <p
              className="text-sm text-secondary"
              style={{
                lineHeight: '1.6',
                maxWidth: '100%',
                fontWeight: '300',
                margin: 0
              }}
            >
              One Click. Complete Market Insights, Smart Money Signals & Pattern Detection.
            </p>
            <div
              className="text-muted tracking-widest uppercase"
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                paddingLeft: '8px',
                fontSize: 'clamp(9px, 2.5vw, 12px)',
                display: 'flex',
                alignItems: 'center',
                height: '14px',
                lineHeight: '1'
              }}
            >
              powered by <span style={{ color: 'var(--bullish)', fontWeight: 'bold', textTransform: 'lowercase', marginLeft: '4px' }}>@rifkydelta</span>
            </div>
          </div>

          {/* Quick Popular Ticker Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sering Dianalisis:
            </span>
            {POPULAR_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/analysis/${t}?mode=${mode}`)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-col" style={{ alignItems: 'flex-end', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <IHSGCard />
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <InputForm
              onSubmit={handleAnalysisSubmit}
              isLoading={isLoading}
              mode={mode}
              onModeChange={setMode}
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
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
            padding: '20px 24px',
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa'
                }}
              >
                <Radio size={18} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  color: 'var(--bullish)',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}
              >
                REALTIME 1H
              </span>
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Live Signal Scanner
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Pantau sinyal beli & rekam jejak trade seluruh emiten IDX dengan timing eksekusi bursa presisi.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', fontWeight: '700', color: '#60a5fa' }}>
            Buka Signal Dashboard <ArrowRight size={13} />
          </div>
        </Link>

        {/* Feature 2: Screener & Preset Hub */}
        <Link
          href="/screener"
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bullish)'
                }}
              >
                <Layers size={18} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                PRESET & CUSTOM
              </span>
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Screener & Presets Hub
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Formula preset Bluechip, Dividen, Rebound MA20, dan Full Scan seluruh saham IHSG.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--bullish)' }}>
            Eksplorasi Screener <ArrowRight size={13} />
          </div>
        </Link>

        {/* Feature 3: Learning Center */}
        <Link
          href="/learning"
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--warning)'
                }}
              >
                <BookOpen size={18} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
              >
                8 CHAPTERS
              </span>
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Learning Center & Guide
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Kuasai indikator teknikal, SMC Order Block, Moving Averages, dan manajemen risiko adaptif.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--warning)' }}>
            Mulai Belajar <ArrowRight size={13} />
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
