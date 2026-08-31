'use client';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Bot,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  SlidersHorizontal,
  Wallet,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Database
} from 'lucide-react';
import { buildClientAiPrompt } from '@/utils/aiPromptGenerator';

export default function AiPromptModal({
  isOpen,
  onClose,
  data,
  newsData = [],
  onOpenPasteModal
}) {
  const [selectedStyle, setSelectedStyle] = useState('institutional');
  const [avgPrice, setAvgPrice] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [launchedProvider, setLaunchedProvider] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const lastPrice = Number(data?.last_price || 0);
  const ticker = data?.ticker || 'UNKNOWN';

  const numericAvg = avgPrice && !isNaN(Number(avgPrice)) && Number(avgPrice) > 0 ? Number(avgPrice) : null;

  const promptText = useMemo(() => {
    if (!data) return '';
    return buildClientAiPrompt(data, newsData, selectedStyle, numericAvg, null);
  }, [data, newsData, selectedStyle, numericAvg]);

  const pnlCalculation = useMemo(() => {
    if (!avgPrice || isNaN(Number(avgPrice)) || Number(avgPrice) <= 0 || lastPrice <= 0) return null;
    const avg = Number(avgPrice);
    const diff = lastPrice - avg;
    const pct = ((lastPrice - avg) / avg) * 100;
    return {
      avg,
      diff,
      pct,
      isProfit: pct > 0,
      isLoss: pct < 0,
      isBep: pct === 0
    };
  }, [avgPrice, lastPrice]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const copyToClipboard = async (textToCopy) => {
    const text = textToCopy || promptText;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  };

  const handleCopy = async () => {
    const genericPrompt = buildClientAiPrompt(data, newsData, selectedStyle, numericAvg, null);
    const success = await copyToClipboard(genericPrompt);
    if (success) {
      setIsCopied(true);
      setToastMsg(`⚡ Seluruh prompt analisis ${ticker} (${genericPrompt.length.toLocaleString()} karakter) berhasil disalin ke clipboard!`);
      setTimeout(() => setIsCopied(false), 2500);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleLaunchProvider = async (provider) => {
    const providerPrompt = buildClientAiPrompt(data, newsData, selectedStyle, numericAvg, provider.name);
    await copyToClipboard(providerPrompt);
    setIsCopied(true);
    setLaunchedProvider(provider.name);
    setToastMsg(`⚡ Prompt ${ticker} khusus ${provider.name} berhasil disalin otomatis! Tab ${provider.name} telah dibuka — silakan langsung tekan Ctrl+V.`);
    window.open(provider.url, '_blank');
    setTimeout(() => {
      setIsCopied(false);
      setLaunchedProvider(null);
    }, 4000);
    setTimeout(() => setToastMsg(null), 6000);
  };

  const styleOptions = [
    {
      id: 'institutional',
      label: 'Institutional 360°',
      desc: 'Price Action + SMC + Bandar + Valuasi Forensik + Skenario Risiko',
      icon: Sparkles,
      color: '#3b82f6'
    },
    {
      id: 'smc_swing',
      label: 'SMC & Swing',
      desc: 'Order Block, FVG, Liquidity Sweeps & Setup Asimetris',
      icon: Layers,
      color: '#10b981'
    },
    {
      id: 'scalping',
      label: 'Intraday & Momentum',
      desc: 'Konfluensi H1/M15, Volume Surge & Target Cepat',
      icon: Zap,
      color: '#f59e0b'
    },
    {
      id: 'value_investing',
      label: 'Value & Forensik',
      desc: 'Valuasi Multi-Model (DCF/Graham), F-Score & MoS',
      icon: ShieldCheck,
      color: '#8b5cf6'
    }
  ];

  const aiProviders = [
    { name: 'ChatGPT', url: 'https://chatgpt.com', color: '#10a37f' },
    { name: 'Claude', url: 'https://claude.ai', color: '#d97706' },
    { name: 'DeepSeek', url: 'https://chat.deepseek.com', color: '#3b82f6' },
    { name: 'Google Gemini', url: 'https://gemini.google.com', color: '#8b5cf6' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', color: '#06b6d4' }
  ];

  const newsCount = (newsData && newsData.length) || 0;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .prompt-step-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }
      `}</style>
      <div
        style={{
          backgroundColor: '#0b111e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                boxShadow: '0 0 16px rgba(59, 130, 246, 0.25)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Institutional AI Prompt Generator
                </h3>
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
                  {data.ticker}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Ekstraksi intelijen pasar 360° untuk analisis mendalam di ChatGPT, Claude, DeepSeek, atau Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '22px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="prompt-step-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  1
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Konfigurasi Fokus & Posisi Modal
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Harga Acuan: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>Rp {lastPrice.toLocaleString()}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {styleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? opt.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 14px ${opt.color}33` : 'none'
                    }}
                  >
                    <Icon size={16} color={isSelected ? opt.color : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: isSelected ? '800' : '600', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {opt.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wallet size={14} color="#60a5fa" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Harga Modal / Average Beli Anda (Opsional):
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setAvgPrice(String(lastPrice))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#60a5fa',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Gunakan Harga Pasar (Rp {lastPrice.toLocaleString()})
                  </button>
                  {avgPrice && (
                    <button
                      type="button"
                      onClick={() => setAvgPrice('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      Reset / Fresh Entry
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '200px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Contoh: 9850"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {pnlCalculation ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: pnlCalculation.isProfit
                        ? 'rgba(34, 197, 94, 0.15)'
                        : pnlCalculation.isLoss
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${
                        pnlCalculation.isProfit
                          ? 'rgba(34, 197, 94, 0.35)'
                          : pnlCalculation.isLoss
                            ? 'rgba(239, 68, 68, 0.35)'
                            : 'rgba(255, 255, 255, 0.2)'
                      }`
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: pnlCalculation.isProfit
                          ? '#4ade80'
                          : pnlCalculation.isLoss
                            ? '#f87171'
                            : '#ffffff'
                      }}
                    >
                      {pnlCalculation.isProfit ? '🟢 Profit' : pnlCalculation.isLoss ? '🔴 Loss' : '⚪ BEP'}:{' '}
                      {pnlCalculation.pct >= 0 ? '+' : ''}
                      {pnlCalculation.pct.toFixed(2)}%
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({pnlCalculation.diff >= 0 ? '+Rp ' : '-Rp '}
                      {Math.abs(pnlCalculation.diff).toLocaleString()}/lembar)
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Mode Entri Baru (Watchlist Mode) — AI akan merumuskan zona entry optimal.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="prompt-step-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  2
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Intelijen Data Terkini yang Diekstrak
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {showFullPrompt ? (
                  <>Sembunyikan Pratinjau Teks <ChevronUp size={13} /></>
                ) : (
                  <>Lihat Seluruh Teks Prompt ({promptText.length.toLocaleString()} Karakter) <ChevronDown size={13} /></>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '700' }}>
                📊 Laporan Keuangan 4 Tahun
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#6ee7b7', fontSize: '11px', fontWeight: '700' }}>
                💎 Forensik 9-Poin & Beneish M-Score
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#c4b5fd', fontSize: '11px', fontWeight: '700' }}>
                🧠 SMC Order Blocks & FVG
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fcd34d', fontSize: '11px', fontWeight: '700' }}>
                🎯 Pivot Points Classic & Camarilla
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', color: '#f9a8d4', fontSize: '11px', fontWeight: '700' }}>
                📰 {newsCount > 0 ? `${newsCount} Artikel Berita Terkini` : 'Berita Terkini Terintegrasi'}
              </span>
            </div>

            {showFullPrompt && (
              <div
                style={{
                  backgroundColor: '#050811',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '14px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.8)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  marginTop: '4px'
                }}
              >
                {promptText}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="prompt-step-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  3
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Luncurkan Provider AI Favorit Anda
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                ⚡ 1-Klik Salin Otomatis & Buka Tab
              </span>
            </div>

            {toastMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.18)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#4ade80',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
                }}
              >
                <Check size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: '1.4' }}>{toastMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {aiProviders.map((p) => {
                const isThisLaunched = launchedProvider === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleLaunchProvider(p)}
                    title={`Klik untuk otomatis salin prompt dan buka ${p.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: isThisLaunched ? 'rgba(34, 197, 94, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isThisLaunched ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isThisLaunched ? '#4ade80' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isThisLaunched ? '0 0 16px rgba(74, 222, 128, 0.35)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isThisLaunched ? '#4ade80' : p.color, flexShrink: 0 }} />
                      <span>{p.name}</span>
                    </div>
                    {isThisLaunched ? <Check size={14} color="#4ade80" /> : <ExternalLink size={12} color="var(--text-muted)" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPasteModal) onOpenPasteModal();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: 'var(--text-secondary)',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} />
            Sudah ada hasil? Paste JSON
            <ArrowRight size={13} style={{ opacity: 0.7 }} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isCopied ? '#22c55e' : '#3b82f6',
              border: 'none',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: isCopied ? '0 0 20px rgba(34, 197, 94, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Prompt'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
