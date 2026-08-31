'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Radio, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  Search, 
  Target, 
  Database, 
  Flame
} from 'lucide-react';

const POPULAR_TICKERS = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Financials', tag: 'Big 4' },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Financials', tag: 'Big 4' },
  { ticker: 'BMRI', name: 'Bank Mandiri Tbk', sector: 'Financials', tag: 'Big 4' },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', sector: 'Financials', tag: 'Big 4' },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Industrials', tag: 'Conglomerate' },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Telecommunication', tag: 'BUMN' },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', sector: 'Energy & Coal', tag: 'Dividend' },
  { ticker: 'PTBA', name: 'Bukit Asam Tbk', sector: 'Energy & Coal', tag: 'High Yield' },
  { ticker: 'MDKA', name: 'Merdeka Copper Gold Tbk', sector: 'Basic Materials', tag: 'Gold' },
  { ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'Basic Materials', tag: 'Nickel' },
  { ticker: 'VKTR', name: 'VKTR Teknologi Mobilitas Tbk', sector: 'EV & Tech', tag: 'EV' },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Technology', tag: 'Tech' },
];

const PRESET_CLUSTERS = [
  { label: 'Big 4 Banks', query: 'BBCA,BBRI,BMRI,BBNI' },
  { label: 'Mining & Metals', query: 'MDKA,ANTM,INCO,TINS,MBMA,BRMS' },
  { label: 'Coal & Energy', query: 'ADRO,PTBA,ITMG,MEDC,PGAS,AKRA' },
  { label: 'EV & Tech', query: 'GOTO,EMTK,ARTO,AUTO,VKTR,ASII' },
  { label: 'High Dividend', query: 'PTBA,ADRO,ITMG,HEXA,BJTM,BJBR' },
];

/* ── Shared inline style objects (reduce JSX noise) ── */
const S = {
  card: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(10px)',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
  },
  sectionGap: { marginTop: '28px', marginBottom: '24px' },
  mono: { fontFamily: 'var(--font-mono)' },
  muted: { color: 'var(--text-muted, #64748b)' },
  labelSmall: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: 'var(--text-muted, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
  },
};

export default function Home() {
  const router = useRouter();
  const [tickerInput, setTickerInput] = useState('');
  const [mode, setMode] = useState('live');
  const [stats, setStats] = useState(null);
  const [topPicks, setTopPicks] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPicks, setIsLoadingPicks] = useState(true);

  useEffect(() => {
    document.title = 'IDX Terminal | Pro Algorithmic Market Intelligence & Signal Radar';
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // 1. Fetch live signal stats
    fetch(`${API_URL}/api/signals/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingStats(false));

    // 2. Fetch top market setups preview
    fetch(`${API_URL}/api/signals/latest?limit=6`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.signals || []);
        if (list && list.length > 0) {
          setTopPicks(list);
        } else {
          setTopPicks(FALLBACK_PICKS);
        }
      })
      .catch(() => {
        setTopPicks(FALLBACK_PICKS);
      })
      .finally(() => {
        setIsLoadingPicks(false);
      });
  }, []);

  const handleLaunchSearch = (e) => {
    e?.preventDefault();
    const clean = tickerInput.trim().toUpperCase();
    if (!clean) return;

    if (clean.includes(',')) {
      router.push(`/screener?tickers=${clean}&mode=${mode}`);
    } else {
      router.push(`/analysis/${clean}?mode=${mode}`);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bg-primary, #050505)', color: 'var(--text-primary, #ffffff)' }}>
      {/* Ambient background glow */}
      <div className="glow-bg" />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 48px' }}>
        
        {/* ══════════════════════════════════════════════════
            § 1. HERO — 2-Column Split (Left Copy / Right Radar)
            Compact: fits viewport, no scroll to CTA
           ══════════════════════════════════════════════════ */}
        <section className="hero-grid"
          style={{
            paddingTop: '20px',
            paddingBottom: '8px',
          }}
        >
          {/* Left Column: Headline + Omni-Search */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Live badge */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                marginBottom: '16px',
                alignSelf: 'flex-start',
              }}
            >
              <span 
                className="live-dot" 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  backgroundColor: '#38bdf8', 
                  boxShadow: '0 0 6px rgba(56, 189, 248, 0.7)' 
                }} 
              />
              <span style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.75)', ...S.mono }}>
                IDX TERMINAL
              </span>
            </div>

            {/* Headline — solid white, accent on keyword only, no gradient slop */}
            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: '800',
                lineHeight: '1.08',
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: '12px',
              }}
            >
              Presisi Kuantitatif &amp; Sinyal Algoritmik{' '}
              <span style={{ color: '#38bdf8' }}>Saham BEI</span>
            </h1>

            {/* Subtitle — concise, max 20 words */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, rgba(255,255,255,0.7))',
                lineHeight: '1.6',
                maxWidth: '500px',
                marginBottom: '20px',
              }}
            >
              SMC, Signal 1H/Daily, Valuasi Forensik, dan analisis berbasis data kuantitatif untuk trader profesional di IDX.
            </p>

            {/* Omni-Search Box */}
            <div 
              style={{
                position: 'relative',
                padding: '1.5px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.04) 60%, rgba(255, 255, 255, 0.04) 100%)',
                marginBottom: '14px',
              }}
            >
              <form 
                onSubmit={handleLaunchSearch}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary, #050505)',
                  borderRadius: 'calc(var(--radius-md) - 1.5px)',
                  padding: '6px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {/* Text Input */}
                <div
                  style={{
                    flex: '1 1 200px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    height: '44px',
                  }}
                >
                  <Search size={16} color="#64748b" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Ketik ticker emiten (e.g. BBCA)..."
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: '#ffffff',
                      ...S.mono,
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none',
                      border: 'none',
                      letterSpacing: '0.03em',
                    }}
                  />
                </div>

                {/* Mode Switcher & Submit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                      height: '44px',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMode('live')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: mode === 'live' ? 'rgba(50, 53, 61, 0.9)' : 'transparent',
                        color: mode === 'live' ? '#34d399' : '#64748b',
                        fontSize: '11px',
                        fontWeight: '700',
                        ...S.mono,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 5px rgba(52, 211, 153, 0.6)' }} />
                      Live
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('simulasi')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: mode === 'simulasi' ? 'rgba(50, 53, 61, 0.9)' : 'transparent',
                        color: mode === 'simulasi' ? '#c084fc' : '#64748b',
                        fontSize: '11px',
                        fontWeight: '700',
                        ...S.mono,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Simulasi
                    </button>
                  </div>

                  <button
                    type="submit"
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '700',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.45)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
                    }}
                  >
                    Analisis <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Preset Pills — no emoji per §3.D */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {PRESET_CLUSTERS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/screener?tickers=${preset.query}&mode=${mode}`)}
                  className="liquid-glass-hover"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Radar Scanner Visualizer */}
          <div style={{ position: 'relative', width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(30, 41, 59, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '20px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Concentric Radar Pulse Rings */}
              <div 
                style={{
                  position: 'relative',
                  zIndex: 20,
                  width: '100%',
                  maxWidth: '260px',
                  aspectRatio: '1/1',
                  borderRadius: '50%',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  backgroundColor: 'rgba(56, 189, 248, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)',
                }}
              >
                {/* Animated Pulsing Rings */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div className="radar-pulse-ring-1" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.15)' }} />
                  <div className="radar-pulse-ring-2" style={{ position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.2)' }} />
                  <div className="radar-pulse-ring-3" style={{ position: 'absolute', width: '50%', height: '50%', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.3)' }} />
                </div>

                {/* Rotating Sweep Scanner Blade */}
                <div 
                  className="radar-sweep-blade"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0.35) 0deg, rgba(56, 189, 248, 0.08) 45deg, transparent 90deg)',
                    opacity: 0.65,
                    pointerEvents: 'none',
                  }}
                />

                {/* Center Scanner Icon */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <Radio size={36} color="#38bdf8" />
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.15em', ...S.mono }}>
                    SCANNING
                  </span>
                </div>
              </div>

              {/* Floating Panel 1: BBCA (Top-Left) */}
              <div 
                onClick={() => router.push(`/analysis/BBCA?mode=${mode}`)}
                className="liquid-glass-hover"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  zIndex: 30,
                  backgroundColor: 'rgba(11, 14, 21, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                    <img src="https://assets.stockbit.com/logos/companies/BBCA.png" alt="BBCA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: '#fff', ...S.mono, margin: 0 }}>BBCA</p>
                    <p style={{ fontSize: '10px', color: '#34d399', fontWeight: '700', ...S.mono, margin: 0 }}>+1.25%</p>
                  </div>
                </div>
                {/* Mini equalizer bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
                  {[5, 9, 7, 12, 8, 11].map((h, i) => (
                    <div key={i} style={{ width: '3px', height: `${h}px`, backgroundColor: i % 2 === 0 ? '#10b981' : '#34d399', borderRadius: '1px' }} />
                  ))}
                </div>
              </div>

              {/* Floating Panel 2: BBRI (Bottom-Right) */}
              <div 
                onClick={() => router.push(`/analysis/BBRI?mode=${mode}`)}
                className="liquid-glass-hover"
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  zIndex: 30,
                  backgroundColor: 'rgba(11, 14, 21, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                    <img src="https://assets.stockbit.com/logos/companies/BBRI.png" alt="BBRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: '#fff', ...S.mono, margin: 0 }}>BBRI</p>
                    <p style={{ fontSize: '10px', color: '#34d399', fontWeight: '700', ...S.mono, margin: 0 }}>+0.85%</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '9px', fontWeight: '800', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    STRONG BUY
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.45)', ...S.mono }}>Score 92</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 2. LIVE SIGNAL STATS RIBBON (4 KPI Cards)
            Tight spacing, standardized radius
           ══════════════════════════════════════════════════ */}
        <section style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: <Activity size={15} />, iconBg: 'rgba(56, 189, 248, 0.12)', iconColor: '#38bdf8', label: 'RADAR SCAN', value: stats?.total_emiten || 171, unit: 'Emiten', period: 'Live BEI', href: '/signals' },
              { icon: <TrendingUp size={15} />, iconBg: 'rgba(16, 185, 129, 0.12)', iconColor: '#10b981', label: 'BUY SIGNALS', value: stats?.buy_count || 171, unit: 'Emiten', unitColor: '#34d399', period: 'Aktif', href: '/signals?type=BUY' },
              { icon: <Target size={15} />, iconBg: 'rgba(56, 189, 248, 0.12)', iconColor: '#38bdf8', label: 'WIN RATE AVG', value: stats?.avg_winrate ? stats.avg_winrate.toFixed(1) : '62.5', unit: '%', period: 'Quant RELT', href: '/signals?minScore=75' },
              { icon: <Sparkles size={15} />, iconBg: 'rgba(251, 191, 36, 0.12)', iconColor: '#fbbf24', label: 'TP TERCAPAI', value: stats?.hit_tp_count || 748, unit: 'Target', period: 'Historis', href: '/signals?status=HIT_TP' },
            ].map((kpi, idx) => (
              <div 
                key={idx}
                onClick={() => router.push(kpi.href)}
                className="liquid-glass-hover"
                style={{
                  ...S.card,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ padding: '5px', borderRadius: '7px', backgroundColor: kpi.iconBg, color: kpi.iconColor }}>
                    {kpi.icon}
                  </div>
                  <span style={{ fontSize: '10px', ...S.muted, ...S.mono, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {kpi.period} <ArrowRight size={10} style={{ opacity: 0.7 }} />
                  </span>
                </div>
                <p style={S.labelSmall}>{kpi.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#fff', ...S.mono, margin: '3px 0 0' }}>
                  {kpi.value}<span style={{ fontSize: '11px', color: kpi.unitColor || 'var(--text-muted, #64748b)', fontWeight: '400', marginLeft: '3px' }}>{kpi.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 3. RADAR HIGHLIGHTS — Sinyal Berpotensi Tinggi
            Grid cards layout
           ══════════════════════════════════════════════════ */}
        <section style={S.sectionGap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                <Flame size={17} />
              </div>
              Sinyal Berpotensi Tinggi Terkini
            </h2>

            <Link
              href="/screener"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#38bdf8',
                fontSize: '12.5px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Buka Screener Lengkap <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
            {isLoadingPicks ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-md)' }} />
              ))
            ) : (
              topPicks.slice(0, 4).map((pick, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(`/analysis/${pick.ticker}?mode=${mode}`)}
                  className="liquid-glass-hover"
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(39, 42, 50, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#fff', ...S.mono, margin: 0 }}>
                        {pick.ticker}
                      </h3>
                      <p style={{ fontSize: '10.5px', ...S.muted, margin: '1px 0 0' }}>
                        {pick.company_name}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: '800',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      {pick.signal_type} · {pick.relt_score || 85}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div>
                      <span style={{ fontSize: '9.5px', ...S.muted, textTransform: 'uppercase' }}>Target TP1</span>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', ...S.mono }}>
                        Rp{pick.tp1 ? Math.round(pick.tp1).toLocaleString('id-ID') : '-'}
                      </div>
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Analisis <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 4. EKSPLORASI POPULER — 12 Emiten Bluechip BEI
            Compact list layout (different family from §3 grid)
           ══════════════════════════════════════════════════ */}
        <section style={S.sectionGap}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Emiten Bluechip &amp; Paling Aktif di BEI
            </h2>
          </div>

          {/* Compact 3-column grid — smaller cells, no card-inside-card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {POPULAR_TICKERS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/analysis/${item.ticker}?mode=${mode}`)}
                className="liquid-glass-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`https://assets.stockbit.com/logos/companies/${item.ticker}.png`}
                    alt={item.ticker}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span style={{ display: 'none', color: '#000', fontWeight: '800', fontSize: '12px' }}>
                    {item.ticker.charAt(0)}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff', ...S.mono }}>
                      {item.ticker}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 4px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.55)' }}>
                      {item.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '10.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '1px 0 0' }}>
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            § 5. LOCAL-FIRST ENGINE ADVANTAGE
            Tightened, translated, mock-attributed numbers
           ══════════════════════════════════════════════════ */}
        <section style={{ marginTop: '28px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                  Keunggulan Mesin Kuantitatif Lokal
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6', marginBottom: '16px' }}>
                  Kalkulasi mikrodetik offline dengan arsitektur FastAPI + SQLite WAL Mode. Analisis berjalan di perangkat Anda tanpa delay server.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', ...S.muted }}>
                    <Zap size={14} color="#38bdf8" /> FastAPI Engine
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', ...S.muted }}>
                    <Database size={14} color="#38bdf8" /> SQLite WAL Mode
                  </div>
                </div>
              </div>

              {/* 2x2 metric grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { val: '~0', unit: 'ms', desc: 'Latensi Cache Lokal' },
                  { val: '100', unit: '%', desc: 'Privasi Klien' },
                  { val: '60', unit: 'FPS', desc: 'Render Chart Vektor' },
                  { val: 'WAL', unit: '', desc: 'Mode Basis Data Konkuren' },
                ].map((m, i) => (
                  <div key={i} style={{
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: m.val === 'WAL' ? '16px' : '22px', fontWeight: '800', color: '#fff', ...S.mono }}>
                      {m.val}{m.unit && <span style={{ fontSize: '12px', fontWeight: '400', ...S.muted }}>{m.unit}</span>}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════
          § 6. FOOTER
         ══════════════════════════════════════════════════ */}
      <footer style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '10.5px', ...S.mono, fontWeight: '600', color: 'rgba(255, 255, 255, 0.35)' }}>
            © 2026 IDX TERMINAL · BY @RIFKYDELTA
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/learning" style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textDecoration: 'none' }}>
              Dokumentasi
            </Link>
            <Link href="/screener" style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textDecoration: 'none' }}>
              Screener
            </Link>
            <Link href="/signals" style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textDecoration: 'none' }}>
              Sinyal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Fallback picks when API is unavailable */
const FALLBACK_PICKS = [
  { ticker: 'BBCA', company_name: 'Bank Central Asia', signal_type: 'BUY', relt_score: 85, tp1: 10450 },
  { ticker: 'BBRI', company_name: 'Bank Rakyat Indonesia', signal_type: 'BUY', relt_score: 80, tp1: 5200 },
  { ticker: 'BMRI', company_name: 'Bank Mandiri', signal_type: 'BUY', relt_score: 82, tp1: 7150 },
  { ticker: 'VKTR', company_name: 'VKTR Teknologi', signal_type: 'BUY', relt_score: 88, tp1: 175 },
];
