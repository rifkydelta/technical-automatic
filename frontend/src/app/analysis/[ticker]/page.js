'use client';
import { useState, useEffect, use, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import TopCards from '@/components/TopCards';
import SupportResistance from '@/components/SupportResistance';
import AnalysisCards from '@/components/AnalysisCards';
import ScenarioCards from '@/components/ScenarioCards';
import FooterRow from '@/components/FooterRow';
import NewsCard from '@/components/NewsCard';
import FinancialCard from '@/components/FinancialCard';
import Disclaimer from '@/components/Disclaimer';
import CandlestickChart from '@/components/CandlestickChart';
import LoadingState from '@/components/LoadingState';
import TechnicalTab from '@/components/TechnicalTab';
import ChartPatternTab from '@/components/chartpattern/ChartPatternTab';
import HistoricalBacktestView from '@/components/technical/HistoricalBacktestView';
import ReltSignalCard from '@/components/ReltSignalCard';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Layers,
  BarChart3,
  TrendingUp,
  PieChart,
  Newspaper,
  Shapes,
  History,
  Zap,
  Activity
} from 'lucide-react';

const QUICK_WATCHLIST = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'VKTR', 'AUTO', 'DSSA', 'BRIS', 'ADRO', 'PTBA', 'BREN', 'ASII'];

function AnalysisContent({ params }) {
  const unwrappedParams = use(params);
  const ticker = (unwrappedParams.ticker || '').toUpperCase();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get('tab') || 'overview';
  const urlMode = searchParams.get('mode') || 'live';

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(urlTab);
  const [mode, setMode] = useState(urlMode);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const resultsRef = useRef(null);

  // Fetch Analysis
  const fetchTickerAnalysis = async (targetTicker, currentMode) => {
    if (!targetTicker) return;
    setIsLoading(true);
    setError(null);
    setNewsData(null);
    setIsNewsLoading(true);

    try {
      const payload = {
        ticker: targetTicker,
        mode: currentMode
      };

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `Gagal mengambil data analisis untuk ${targetTicker}`);
      }

      const result = await res.json();
      setData(result);

      // Fetch news asynchronously
      const companyNameParam = result.company_name ? `&company_name=${encodeURIComponent(result.company_name)}` : '';
      fetch(`${API_URL}/api/news?ticker=${targetTicker}${companyNameParam}`)
        .then((res) => res.json())
        .then((nData) => {
          if (nData.status === 'success') {
            setNewsData(nData.data);
          } else {
            setNewsData([]);
          }
        })
        .catch(() => setNewsData([]))
        .finally(() => setIsNewsLoading(false));
    } catch (err) {
      setError(err.message);
      setIsNewsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      document.title = `${ticker} - Analisis Teknikal | IDX Terminal`;
      fetchTickerAnalysis(ticker, mode);
    }
  }, [ticker, mode]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    router.replace(`/analysis/${ticker}?tab=${tabName}&mode=${mode}`, { scroll: false });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    router.replace(`/analysis/${ticker}?tab=${activeTab}&mode=${newMode}`, { scroll: false });
  };

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'technical', label: 'Technical', icon: TrendingUp },
    { id: 'financial', label: 'Financial', icon: PieChart },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'patterns', label: 'Chart Pattern', icon: Shapes },
    { id: 'backtest', label: 'Backtest', icon: History }
  ];

  return (
    <main className="dashboard-container" style={{ paddingBottom: '60px' }}>
      {/* Top Breadcrumb & Quick Watchlist Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 0 10px 0',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={13} /> Beranda
          </Link>

          <Link
            href="/screener"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} /> Screener
          </Link>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: 'monospace'
            }}
          >
            <Activity size={13} /> {ticker}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchTickerAnalysis(ticker, mode)}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Watchlist Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          Quick Watchlist:
        </span>
        {QUICK_WATCHLIST.map((t) => {
          const isCurrent = t === ticker;
          return (
            <Link
              key={t}
              href={`/analysis/${t}?mode=${mode}&tab=${activeTab}`}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: isCurrent ? '800' : '600',
                fontFamily: 'monospace',
                textDecoration: 'none',
                backgroundColor: isCurrent ? 'var(--bullish-bg)' : 'rgba(255, 255, 255, 0.03)',
                color: isCurrent ? 'var(--bullish)' : 'var(--text-secondary)',
                border: `1px solid ${isCurrent ? 'var(--bullish)' : 'rgba(255, 255, 255, 0.08)'}`,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {t}
            </Link>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid var(--bearish)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--bearish)'
          }}
        >
          <AlertTriangle size={24} />
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>Gagal Memuat Analisis {ticker}</div>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: '60px 20px', borderRadius: '24px' }}>
          <LoadingState />
        </div>
      ) : data ? (
        <div id="export-container" ref={resultsRef} className="glass-panel flex-col" style={{ gap: '24px', padding: '32px', borderRadius: '24px' }}>
          {/* Header with Price, Change, and Actions */}
          <Header data={data} mode={mode} onModeChange={handleModeChange} />

          {/* Modern Segmented Sub-Tabs Nav */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto'
            }}
          >
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} color={isActive ? 'var(--bullish)' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtab Contents */}
          {activeTab === 'overview' && (
            <>
              <TopCards data={data} mode={mode} />
              <ReltSignalCard data={data} />
              <CandlestickChart data={data} />
              <SupportResistance data={data} />
              <AnalysisCards data={data} />
              <ScenarioCards data={data} />
            </>
          )}

          {activeTab === 'technical' && <TechnicalTab data={data} />}

          {activeTab === 'financial' && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {data.financials?.length > 0 || data.fair_value_analysis ? (
                <div style={{ flex: '1 1 500px', minWidth: '0' }}>
                  <FinancialCard
                    financials={data.financials}
                    fairValueAnalysis={data.fair_value_analysis}
                    growthAnalysis={data.growth_analysis}
                    analystTargets={data.analyst_targets}
                    financialHealth={data.financial_health}
                    financialsAnalytics={data.financials_analytics}
                    lastPrice={data.last_price}
                    valuation={data.valuation}
                    ticker={data.ticker}
                  />
                </div>
              ) : (
                <div className="card" style={{ flex: 1, padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada data keuangan tersedia untuk {data.ticker}.
                </div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              <div style={{ flex: '1 1 500px', minWidth: '0' }}>
                <NewsCard newsData={newsData} isLoading={isNewsLoading} ticker={data.ticker} />
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <ChartPatternTab
              standalone={false}
              detectedPatterns={data.detected_patterns || []}
              ohlcvData={data.ohlcv_daily || []}
              ticker={data.ticker}
            />
          )}

          {activeTab === 'backtest' && (
            <div className="card flex-col" style={{ padding: '32px', gap: '24px', borderRadius: '20px' }}>
              <HistoricalBacktestView
                historicalData={data.technical_detail?.historical_backtest || data.historical_backtest || []}
              />
            </div>
          )}

          <FooterRow data={data} />
          <Disclaimer />
        </div>
      ) : null}
    </main>
  );
}

export default function AnalysisPage({ params }) {
  return (
    <Suspense fallback={<div className="glass-panel" style={{ padding: '60px 20px', borderRadius: '24px' }}><LoadingState /></div>}>
      <AnalysisContent params={params} />
    </Suspense>
  );
}
