'use client';
import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Download,
  FileCode2,
  Share2,
  RefreshCw,
  Clock,
  History,
  Activity,
  DollarSign,
  PieChart,
  Sliders,
  ChevronRight,
  Info,
  Wallet,
  Compass,
  ArrowRight,
  BarChart3,
  Flame,
  Scale,
  Crosshair,
  BadgeCheck,
  Play
} from 'lucide-react';
import { exportAnalysisAsMarkdown, getSampleAiAnalysis } from '@/utils/aiPromptGenerator';

export default function AiReportView({
  aiData,
  onOpenPromptModal,
  onOpenPasteModal,
  onOpenHistory,
  onSuccessImport,
  ticker = ''
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedType, setCopiedType] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // EMPTY / ONBOARDING STATE
  if (!aiData) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '10px 0'
        }}
      >
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: '#0b111e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '36px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 70%, transparent 100%)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
                      Institutional AI Research Engine
                    </h2>
                    <span
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: 'monospace'
                      }}
                    >
                      {ticker || 'IDX'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Sintesis multi-perspektif (SMC, Bandarmologi, Valuasi Forensik 4-Tahun, Matriks Skenario & Blueprint Eksekusi)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const demo = getSampleAiAnalysis(ticker || 'BBCA');
                  if (onSuccessImport) onSuccessImport(demo);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#60a5fa',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Play size={14} fill="#60a5fa" />
                Coba Demo Analisis ({ticker || 'BBCA'})
              </button>
            </div>

            {/* 3-Step Interactive Onboarding Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '6px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>
                    1
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>Salin Prompt Intelijen</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Ekstrak seluruh laporan keuangan 4 tahun, 9-poin Piotroski, SMC, level pivot, dan 15 berita terkini.
                </p>
                <button
                  type="button"
                  onClick={onOpenPromptModal}
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    color: '#ffffff',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Sparkles size={14} />
                  Buka Generator Prompt
                </button>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>
                    2
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>Paste ke AI Provider</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Buka ChatGPT, Claude 3.7, DeepSeek R1, atau Gemini. Paste prompt dan tunggu output format JSON valid.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 163, 127, 0.15)', color: '#10a37f', fontWeight: '700' }}>ChatGPT</span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24', fontWeight: '700' }}>Claude</span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: '700' }}>DeepSeek</span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', fontWeight: '700' }}>Gemini</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>
                    3
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>Render Laporan Eksekutif</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Paste hasil respon JSON ke Terminal untuk dirender menjadi dashboard riset saham standar institusi.
                </p>
                <button
                  type="button"
                  onClick={onOpenPasteModal}
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <FileCode2 size={14} />
                  Paste Hasil JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PARSED DATA
  const meta = aiData.meta || {};
  const exec = aiData.executive_summary || {};
  const pers = aiData.perspectives || {};
  const scen = aiData.scenario_matrix || {};
  const execBp = aiData.execution_blueprint || {};
  const forensic = aiData.forensic_checklist || [];
  const port = aiData.portfolio_context || {};

  const bias = String(exec.master_bias || 'NEUTRAL').toUpperCase();
  const conviction = Number(exec.conviction_score || 0);

  const getBiasColor = (b) => {
    if (b.includes('BULLISH')) return '#22c55e';
    if (b.includes('BEARISH')) return '#ef4444';
    return '#94a3b8';
  };

  const getBiasBg = (b) => {
    if (b.includes('BULLISH')) return 'rgba(34, 197, 94, 0.15)';
    if (b.includes('BEARISH')) return 'rgba(239, 68, 68, 0.15)';
    return 'rgba(148, 163, 184, 0.15)';
  };

  const handleCopySummary = async () => {
    const text = `⚡ AI Deep Analysis (${meta.ticker || ticker}): ${exec.master_bias || ''} (Conviction: ${conviction}/100) | Action: ${exec.primary_action || ''}\nTesis: "${exec.one_sentence_thesis || ''}"`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedType('summary');
        setTimeout(() => setCopiedType(null), 2000);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyMarkdown = async () => {
    const md = exportAnalysisAsMarkdown(aiData);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
        setCopiedType('markdown');
        setTimeout(() => setCopiedType(null), 2000);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(aiData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Analysis_${meta.ticker || ticker}_${meta.analysis_date || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabOptions = [
    { id: 'all', label: 'Semua Ringkasan', icon: Layers },
    { id: 'smc', label: '1. SMC & Price Action', icon: Crosshair },
    { id: 'bandar', label: '2. Bandarmologi', icon: Activity },
    { id: 'quant', label: '3. Kuantitatif & Momentum', icon: Zap },
    { id: 'forensic', label: '4. Valuasi Forensik', icon: ShieldCheck },
    { id: 'execution', label: '5. Skenario & Eksekusi', icon: Target }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP STICKY / QUICK ACTION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '16px',
          backgroundColor: '#0b111e',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '3px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '900',
              fontFamily: 'monospace'
            }}
          >
            {meta.ticker || ticker}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
            {meta.company_name || ticker}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Model: <strong style={{ color: '#ffffff' }}>{meta.ai_provider_model || 'AI Model'}</strong>
          </span>
          {meta.time_horizon && (
            <span style={{ fontSize: '11px', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
              <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
              {meta.time_horizon}
            </span>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: copiedType === 'summary' ? '#4ade80' : 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {copiedType === 'summary' ? <Check size={12} /> : <Copy size={12} />}
            {copiedType === 'summary' ? 'Tersalin' : 'Salin Tesis'}
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: copiedType === 'markdown' ? '#4ade80' : 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {copiedType === 'markdown' ? <Check size={12} /> : <Share2 size={12} />}
            {copiedType === 'markdown' ? 'Tersalin' : 'Markdown'}
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Download size={12} />
            JSON
          </button>

          <button
            type="button"
            onClick={onOpenPasteModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} />
            Update / Paste Baru
          </button>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <History size={12} />
              Riwayat
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO MASTER VERDICT BANNER */}
      <div
        style={{
          borderRadius: '24px',
          backgroundColor: '#0b111e',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: getBiasBg(bias),
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Master Row: Bias + Radial Conviction Gauge + Action Ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            {/* Left: Master Bias */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: getBiasBg(bias),
                  border: `1px solid ${getBiasColor(bias)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getBiasColor(bias),
                  boxShadow: `0 0 20px ${getBiasColor(bias)}44`,
                  flexShrink: 0
                }}
              >
                {bias.includes('BULLISH') ? (
                  <TrendingUp size={30} />
                ) : bias.includes('BEARISH') ? (
                  <TrendingDown size={30} />
                ) : (
                  <Minus size={30} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  MASTER MARKET BIAS
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: getBiasColor(bias), letterSpacing: '-0.02em', marginTop: '2px' }}>
                  {exec.master_bias || 'NEUTRAL'}
                </div>
              </div>
            </div>

            {/* Center: Radial Conviction Score Meter (SVG circular gauge) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  CONVICTION SCORE
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: conviction >= 80 ? '#4ade80' : conviction >= 60 ? '#60a5fa' : 'var(--text-muted)' }}>
                  {conviction >= 80 ? 'Tinggi (High Conviction)' : conviction >= 60 ? 'Moderat (Moderate)' : 'Rendah (Caution)'}
                </div>
              </div>

              {/* Animated SVG Circle */}
              <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke={getBiasColor(bias)}
                    strokeWidth="6"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * Math.min(Math.max(conviction, 0), 100)) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div style={{ position: 'absolute', fontSize: '16px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>
                  {conviction}
                </div>
              </div>
            </div>

            {/* Right: Primary Action Ribbon */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                REKOMENDASI AKSI UTAMA
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: getBiasBg(bias),
                  border: `1px solid ${getBiasColor(bias)}`,
                  color: getBiasColor(bias),
                  fontSize: '14px',
                  fontWeight: '900',
                  letterSpacing: '0.02em',
                  boxShadow: `0 0 16px ${getBiasColor(bias)}33`
                }}
              >
                <Sparkles size={15} />
                {exec.primary_action || 'WATCHLIST'}
              </div>
            </div>
          </div>

          {/* One-Sentence Thesis Quote Card */}
          {exec.one_sentence_thesis && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: `4px solid ${getBiasColor(bias)}`,
                borderRadius: '0 12px 12px 0',
                padding: '14px 18px',
                fontSize: '13px',
                fontWeight: '600',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.95)',
                fontStyle: 'italic'
              }}
            >
              &ldquo;{exec.one_sentence_thesis}&rdquo;
            </div>
          )}

          {/* Catalysts vs Risks Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Key Catalysts */}
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <CheckCircle2 size={14} /> Katalis Penggerak Kunci (Drivers)
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(exec.key_catalysts || ['Katalis kinerja emiten']).map((cat, idx) => (
                  <li key={idx}>{cat}</li>
                ))}
              </ul>
            </div>

            {/* Key Risks */}
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <AlertTriangle size={14} /> Faktor Risiko Utama (Threats)
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(exec.key_risks || ['Volatilitas pasar modal']).map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 👤 PERSONALIZED PORTFOLIO STRATEGY CARD */}
      {port && (port.user_avg_price > 0 || (port.position_status && port.position_status !== 'FRESH_ENTRY')) && (
        <div
          style={{
            borderRadius: '20px',
            backgroundColor: '#0b111e',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '20px 24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Strategi Taktis Posisi Modal Anda
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      (Status: <strong style={{ color: '#ffffff' }}>{port.position_status || 'POSISI AKTIF'}</strong>)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#93c5fd',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                >
                  <Target size={13} />
                  {port.personalized_action || 'HOLD & LOCK'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Modal Beli (Average)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
                    Rp {Number(port.user_avg_price || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Floating PnL %</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: Number(port.floating_pnl_pct || 0) >= 0 ? '#4ade80' : '#f87171', fontFamily: 'monospace', marginTop: '2px' }}>
                    {Number(port.floating_pnl_pct || 0) >= 0 ? '+' : ''}{Number(port.floating_pnl_pct || 0).toFixed(2)}%
                  </div>
                </div>

                {port.custom_invalidation_level > 0 && (
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Custom Trailing Stop / Invalidation</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#fbbf24', fontFamily: 'monospace', marginTop: '2px' }}>
                      Rp {Number(port.custom_invalidation_level).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {port.position_advice && (
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.5' }}>
                  <strong>Panduan Taktis:</strong> {port.position_advice}
                </p>
              )}

              {port.averaging_strategy && (
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong>Strategi Averaging / Add-On:</strong> {port.averaging_strategy}
                </p>
              )}
            </div>
          )}

          {/* 4. INTERACTIVE 5-PERSPECTIVE SEGMENTED TABS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}
          >
            {tabOptions.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: isSelected ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={14} color={isSelected ? '#60a5fa' : 'var(--text-muted)'} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 5. PERSPECTIVE CARDS RENDERER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Perspective 1: SMC & Price Action */}
            {(activeTab === 'all' || activeTab === 'smc') && pers.price_action_smc && (
              <div
                style={{
                  backgroundColor: '#0b111e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Crosshair size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                        1. Price Action & Smart Money Concepts (SMC)
                      </span>
                      <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginTop: '2px' }}>
                        {pers.price_action_smc.status || 'Active Structure'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', fontSize: '12px', fontWeight: '900', fontFamily: 'monospace' }}>
                    Skor: {pers.price_action_smc.score || 0}/100
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(pers.price_action_smc.findings || []).map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                {pers.price_action_smc.smc_details && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Market Phase</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{pers.price_action_smc.smc_details.market_phase || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Demand Zone</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80' }}>Rp {pers.price_action_smc.smc_details.nearest_demand_zone || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Supply Zone</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171' }}>Rp {pers.price_action_smc.smc_details.nearest_supply_zone || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Liquidity Target</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24' }}>Rp {pers.price_action_smc.smc_details.liquidity_target || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Perspective 2: Bandarmologi & Order Flow */}
            {(activeTab === 'all' || activeTab === 'bandar') && pers.bandarmology_order_flow && (
              <div
                style={{
                  backgroundColor: '#0b111e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                        2. Bandarmologi & Order Flow Analysis
                      </span>
                      <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginTop: '2px' }}>
                        {pers.bandarmology_order_flow.status || 'Active Flow'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '12px', fontWeight: '900', fontFamily: 'monospace' }}>
                    Skor: {pers.bandarmology_order_flow.score || 0}/100
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(pers.bandarmology_order_flow.findings || []).map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                {pers.bandarmology_order_flow.flow_summary && (
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>Ringkasan Flow:</strong> {pers.bandarmology_order_flow.flow_summary}
                  </div>
                )}
              </div>
            )}

            {/* Perspective 3: Quantitative & Momentum */}
            {(activeTab === 'all' || activeTab === 'quant') && pers.quantitative_momentum && (
              <div
                style={{
                  backgroundColor: '#0b111e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                        3. Konfluensi Kuantitatif, Osilator & Volatilitas
                      </span>
                      <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '700', marginTop: '2px' }}>
                        {pers.quantitative_momentum.status || 'Active Momentum'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontSize: '12px', fontWeight: '900', fontFamily: 'monospace' }}>
                    Skor: {pers.quantitative_momentum.score || 0}/100
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(pers.quantitative_momentum.findings || []).map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                {pers.quantitative_momentum.indicator_signals && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RSI Verdict</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{pers.quantitative_momentum.indicator_signals.rsi_verdict || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MACD Verdict</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80' }}>{pers.quantitative_momentum.indicator_signals.macd_verdict || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volatility Regime</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#60a5fa' }}>{pers.quantitative_momentum.indicator_signals.volatility_regime || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Perspective 4: Forensic Valuation & Fundamental Health */}
            {(activeTab === 'all' || activeTab === 'forensic') && pers.fundamental_valuation && (
              <div
                style={{
                  backgroundColor: '#0b111e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                        4. Forensik Finansial Multi-Tahun & Valuasi Nilai Wajar
                      </span>
                      <div style={{ fontSize: '12px', color: '#c084fc', fontWeight: '700', marginTop: '2px' }}>
                        {pers.fundamental_valuation.status || 'Undervalued / Healthy'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c084fc', fontSize: '12px', fontWeight: '900', fontFamily: 'monospace' }}>
                    Skor: {pers.fundamental_valuation.score || 0}/100
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(pers.fundamental_valuation.findings || []).map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                {pers.fundamental_valuation.metrics_summary && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consolidated Fair Value</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', fontFamily: 'monospace' }}>Rp {Number(pers.fundamental_valuation.metrics_summary.fair_value || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margin of Safety</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#60a5fa' }}>{pers.fundamental_valuation.metrics_summary.margin_of_safety_pct || 0}%</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Piotroski F-Score</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24' }}>{pers.fundamental_valuation.metrics_summary.f_score || '-'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Solvabilitas & Arus Kas</span>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{pers.fundamental_valuation.metrics_summary.solvency_verdict || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. ASYMMETRIC SCENARIO MATRIX */}
          {(activeTab === 'all' || activeTab === 'execution') && scen && (
            <div
              style={{
                backgroundColor: '#0b111e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#60a5fa" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                  Matriks Skenario Asimetris & Probabilitas Risiko
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {/* Bullish Scenario */}
                {scen.primary_bullish && (
                  <div
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#4ade80' }}>🟢 Skenario Bullish Utama</span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: '#4ade80', fontFamily: 'monospace' }}>
                        {scen.primary_bullish.probability_pct || 65}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${scen.primary_bullish.probability_pct || 65}%`, height: '100%', backgroundColor: '#4ade80' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Target: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>Rp {Number(scen.primary_bullish.target_price || 0).toLocaleString()}</strong> ({scen.primary_bullish.timeline || '2-3 Minggu'})
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                      {scen.primary_bullish.narrative}
                    </p>
                  </div>
                )}

                {/* Bearish Scenario */}
                {scen.alternative_bearish && (
                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#f87171' }}>🔴 Skenario Bearish Pembatalan</span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: '#f87171', fontFamily: 'monospace' }}>
                        {scen.alternative_bearish.probability_pct || 25}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${scen.alternative_bearish.probability_pct || 25}%`, height: '100%', backgroundColor: '#f87171' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Invalidation: <strong style={{ color: '#f87171', fontFamily: 'monospace' }}>Rp {Number(scen.alternative_bearish.invalidation_price || 0).toLocaleString()}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                      {scen.alternative_bearish.narrative}
                    </p>
                  </div>
                )}

                {/* Sideways Scenario */}
                {scen.sideways_consolidation && (
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>⚪ Skenario Sideways</span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {scen.sideways_consolidation.probability_pct || 10}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${scen.sideways_consolidation.probability_pct || 10}%`, height: '100%', backgroundColor: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Range: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{scen.sideways_consolidation.range_bounds || '-'}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                      {scen.sideways_consolidation.narrative}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. ACTIONABLE EXECUTION BLUEPRINT */}
          {(activeTab === 'all' || activeTab === 'execution') && execBp && (
            <div
              style={{
                backgroundColor: '#0b111e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="#60a5fa" />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                    Actionable Trade Execution Blueprint
                  </h3>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                  {execBp.action || 'BUY ON PULLBACK'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Entry Zones */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Zona Entry Bertahap
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(execBp.entry_zones || []).map((z, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{z.type}</span>
                        <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>Rp {z.range} ({z.allocation_pct}%)</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stop Loss & Invalidation */}
                {execBp.stop_loss && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#f87171', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Proteksi Modal (Stop Loss)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#f87171', fontFamily: 'monospace' }}>
                        Rp {Number(execBp.stop_loss.price || 0).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#f87171' }}>
                        -{execBp.stop_loss.risk_pct || 0}% Risiko
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {execBp.stop_loss.rationale}
                    </p>
                  </div>
                )}
              </div>

              {/* Take Profit Roadmap */}
              {execBp.take_profit_levels && (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Roadmap Take Profit Bertahap
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {execBp.take_profit_levels.map((tp, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>{tp.level}</span>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80' }}>+{tp.gain_pct}%</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#4ade80', fontFamily: 'monospace' }}>
                          Rp {Number(tp.price || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tp.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {execBp.position_sizing_advice && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong>Manajemen Alokasi Lot:</strong> {execBp.position_sizing_advice}
                </div>
              )}
            </div>
          )}

          {/* 8. FORENSIC AUDIT CHECKLIST TABLE */}
          {(activeTab === 'all' || activeTab === 'forensic') && forensic && forensic.length > 0 && (
            <div
              style={{
                backgroundColor: '#0b111e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BadgeCheck size={18} color="#34d399" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                  Institutional Forensic Health Checklist
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 12px' }}>Item Uji Tuntas</th>
                      <th style={{ padding: '8px 12px' }}>Status Audit</th>
                      <th style={{ padding: '8px 12px' }}>Catatan Forensik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forensic.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#ffffff' }}>{item.item}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: item.status === 'PASS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: item.status === 'PASS' ? '#4ade80' : '#f87171'
                            }}
                          >
                            {item.status === 'PASS' ? <Check size={11} /> : <AlertTriangle size={11} />}
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. RAW JSON INSPECTOR */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileCode2 size={13} />
              {showRawJson ? 'Sembunyikan Raw JSON' : 'Lihat Raw JSON Analisis AI'}
            </button>
          </div>

          {showRawJson && (
            <div
              style={{
                backgroundColor: '#050811',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '320px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.85)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {JSON.stringify(aiData, null, 2)}
            </div>
          )}
        </div>
      );
    }
