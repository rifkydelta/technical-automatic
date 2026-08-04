'use client';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import InputForm from '@/components/InputForm';
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
import IHSGCard from '@/components/IHSGCard';
import TechnicalTab from '@/components/TechnicalTab';
import DashboardScreener from '@/components/DashboardScreener';
import ChartPatternTab from '@/components/chartpattern/ChartPatternTab';
import LearningCenter from '@/components/LearningCenter';
import CategoryPresetHub from '@/components/CategoryPresetHub';
import { BookOpen, Terminal, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mode, setMode] = useState('live');
  const [lastTicker, setLastTicker] = useState(null);
  const [screenerResults, setScreenerResults] = useState(null);
  const [isScreenerLoading, setIsScreenerLoading] = useState(false);
  const [appMode, setAppMode] = useState('terminal'); // 'terminal' or 'learning'

  const resultsRef = useRef(null);

  const fetchAnalysis = async (formData) => {
    // Check if input is multi-ticker
    const inputTickers = (formData.ticker || lastTicker || '').split(',').map(t => t.trim().toUpperCase()).filter(t => t);

    if (inputTickers.length > 1) {
      // Screener Mode
      setIsScreenerLoading(true);
      setError(null);
      setData(null); // Clear single data
      setScreenerResults(null);
      try {
        const payload = {
          tickers: inputTickers,
          mode: formData.mode || mode
        };
        const res = await fetch('http://localhost:8000/api/screener', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch screener data');
        }
        const result = await res.json();
        setScreenerResults(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsScreenerLoading(false);
      }
      return;
    }

    // Single Ticker Mode
    setIsLoading(true);
    setError(null);
    setScreenerResults(null); // Clear screener data
    setNewsData(null);
    setIsNewsLoading(true);
    try {
      const currentTicker = inputTickers[0];
      setLastTicker(currentTicker);
      const payload = {
        ticker: currentTicker,
        mode: formData.mode || mode,
        order_flow: {
          broker_summary: formData.broker_summary,
          broker_summary_value: formData.broker_summary_value,
          foreign_flow: formData.foreign_flow,
          foreign_flow_value: formData.foreign_flow_value,
          running_trade: formData.running_trade,
          running_trade_pct: formData.running_trade_pct,
          big_lot: formData.big_lot
        }
      };

      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to fetch analysis');
      }

      const result = await res.json();
      setData(result);

      // Fetch news asynchronously without awaiting its completion to unblock UI
      const companyNameParam = result.company_name ? `&company_name=${encodeURIComponent(result.company_name)}` : '';
      fetch(`http://localhost:8000/api/news?ticker=${formData.ticker}${companyNameParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setNewsData(data.data);
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
      setActiveTab('overview'); // Reset to overview when new analysis is fetched
    }
  };

  useEffect(() => {
    if ((data || isLoading) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data, isLoading]);

  // Auto re-fetch when mode changes and we already have data
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (screenerResults) {
      // If we were in screener mode, re-fetch screener
      fetchAnalysis({ ticker: screenerResults.map(r => r.ticker).join(','), mode: newMode });
    } else if (lastTicker) {
      fetchAnalysis({ ticker: lastTicker, mode: newMode });
    }
  };

  return (
    <main className="dashboard-container">
      {/* Top App Navigation */}
      <div className="flex-row gap-sm" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
        <button
          onClick={() => setAppMode('terminal')}
          className="flex-row items-center gap-xs"
          style={{
            padding: '8px 16px',
            background: appMode === 'terminal' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none',
            color: appMode === 'terminal' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: appMode === 'terminal' ? '600' : '400',
            borderRadius: '8px',
          }}
        >
          <Terminal size={16} /> Live Terminal
        </button>
        <button
          onClick={() => setAppMode('learning')}
          className="flex-row items-center gap-xs"
          style={{
            padding: '8px 16px',
            background: appMode === 'learning' ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
            border: 'none',
            color: appMode === 'learning' ? 'var(--info)' : 'var(--text-muted)',
            fontWeight: appMode === 'learning' ? '600' : '400',
            borderRadius: '8px',
          }}
        >
          <BookOpen size={16} /> Learning Center
        </button>
      </div>

      {appMode === 'learning' ? (
        <LearningCenter />
      ) : (
        <div>

          <div className="card header-grid" style={{
            marginBottom: '48px',
            marginTop: '12px',
            padding: '40px',
            borderRadius: '24px'
          }}>
            <div className="flex-col" style={{ alignItems: 'flex-start', position: 'relative', zIndex: 1, paddingRight: '20px' }}>
              <div className="flex-row items-center gap-sm" style={{ marginBottom: '8px' }}>
                <div className="live-dot"></div>
                <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'var(--bullish)', letterSpacing: '0.2em' }}>Live Terminal</span>
              </div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                lineHeight: '1.15',
                letterSpacing: '-0.025em',
                textShadow: '0 0 40px rgba(255,255,255,0.1)',
                marginBottom: '12px'
              }}>
                Algorithmic<br />Technical Analysis
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2px' }}>
                <p className="text-sm text-secondary" style={{
                  lineHeight: '1.6',
                  maxWidth: '100%',
                  fontWeight: '300',
                  margin: 0
                }}>
                  One Click. Complete Market Insights & Pattern Detection.
                </p>
                <div className="text-muted tracking-widest uppercase" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '8px', fontSize: 'clamp(9px, 2.5vw, 12px)', display: 'flex', alignItems: 'center', height: '14px', lineHeight: '1' }}>
                  powered by <span style={{ color: 'var(--bullish)', fontWeight: 'bold', textTransform: 'lowercase', marginLeft: '4px' }}>@rifkydelta</span>
                </div>
              </div>
            </div>

            <div className="flex-col" style={{ alignItems: 'flex-end', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <IHSGCard />
              <div style={{ width: '100%', maxWidth: '440px' }}>
                <InputForm onSubmit={fetchAnalysis} isLoading={isLoading} mode={mode} onModeChange={handleModeChange} availableModes={data?.session_info?.available_modes} />
              </div>
            </div>
          </div>

          {error && (
            <div className="card text-bearish font-mono mb-6" style={{ border: '1px solid var(--bearish)' }}>
              Error: {error}
            </div>
          )}

          {(data || screenerResults) && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => {
                  setData(null);
                  setScreenerResults(null);
                  setError(null);
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
                <ArrowLeft size={14} /> Kembali ke Kategori Saham & Screener
              </button>
            </div>
          )}

          {isScreenerLoading || screenerResults ? (
            <DashboardScreener
              results={screenerResults}
              isLoading={isScreenerLoading}
              onTickerClick={(ticker) => {
                // Switch back to single mode for this ticker
                const formArgs = { ticker, mode };
                fetchAnalysis(formArgs);
              }}
            />
          ) : isLoading ? (
            <div ref={resultsRef} className="glass-panel">
              <LoadingState />
            </div>
          ) : data ? (
            <div id="export-container" ref={resultsRef} className="glass-panel flex-col" style={{
              gap: '24px',
              padding: '32px'
            }}>
              <Header data={data} mode={mode} />

              <div className="flex-row" style={{ gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '8px' }}>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'overview' ? 'var(--bullish-bg)' : 'transparent',
                    border: activeTab === 'overview' ? '1px solid var(--bullish)' : '1px solid transparent',
                    color: activeTab === 'overview' ? 'var(--bullish)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'technical' ? 'var(--bullish-bg)' : 'transparent',
                    border: activeTab === 'technical' ? '1px solid var(--bullish)' : '1px solid transparent',
                    color: activeTab === 'technical' ? 'var(--bullish)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Technical
                </button>
                <button
                  onClick={() => setActiveTab('financial')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'financial' ? 'var(--bullish-bg)' : 'transparent',
                    border: activeTab === 'financial' ? '1px solid var(--bullish)' : '1px solid transparent',
                    color: activeTab === 'financial' ? 'var(--bullish)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Financial
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'news' ? 'var(--bullish-bg)' : 'transparent',
                    border: activeTab === 'news' ? '1px solid var(--bullish)' : '1px solid transparent',
                    color: activeTab === 'news' ? 'var(--bullish)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  News
                </button>
                <button
                  onClick={() => setActiveTab('patterns')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'patterns' ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                    border: activeTab === 'patterns' ? '1px solid var(--info)' : '1px solid transparent',
                    color: activeTab === 'patterns' ? 'var(--info)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Chart Pattern
                </button>
              </div>

              {activeTab === 'overview' && (
                <>
                  <TopCards data={data} mode={mode} />
                  <CandlestickChart data={data} />
                  <SupportResistance data={data} />
                  <AnalysisCards data={data} />
                  <ScenarioCards data={data} />
                </>
              )}

              {activeTab === 'technical' && (
                <TechnicalTab data={data} />
              )}

              {activeTab === 'financial' && (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  {(data.financials?.length > 0 || data.fair_value_analysis) ? (
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
                      No financial data available for {data.ticker}.
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

              <FooterRow data={data} />
              <Disclaimer />
            </div>
          ) : (
            <CategoryPresetHub
              mode={mode}
              onTickerClick={(ticker) => fetchAnalysis({ ticker, mode })}
            />
          )}

        </div>
      )}
    </main>
  );
}
