'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Loader2, Briefcase, Info, X, ExternalLink, Building2, Globe, MapPin, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

export default function Header({ data, mode = 'live', onOpenAiPrompt }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [livePrice, setLivePrice] = useState(data?.last_price);
  const [liveLabel, setLiveLabel] = useState(data?.session_info?.mode_label || 'Live');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!data?.ticker) return;
    setLivePrice(data.last_price);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fetchLivePrice = async () => {
      try {
        const response = await fetch(`${API_URL}/api/price/${data.ticker}?mode=${mode}`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.price) {
            setLivePrice(result.price);
            if (result.label) setLiveLabel(result.label);
          }
        }
      } catch (e) {
        // silently ignore
      }
    };

    const interval = setInterval(fetchLivePrice, 1000);
    return () => clearInterval(interval);
  }, [data?.ticker, mode]);

  const handleOpenProfile = async () => {
    setIsProfileOpen(true);
    if (!profileInfo && data?.ticker) {
      setIsLoadingProfile(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/ticker/ticker-info/${data.ticker}`);
        if (res.ok) {
          const info = await res.json();
          setProfileInfo(info);
        }
      } catch (err) {
        console.error('Failed to fetch ticker info:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
  };

  const formatMarketCap = (val) => {
    if (!val) return 'N/A';
    if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(2)} T`;
    if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(2)} B`;
    if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(2)} M`;
    return `Rp ${val.toLocaleString()}`;
  };

  const formatNumber = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toLocaleString();
  };

  const formatRatio = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return `${val.toFixed(2)}x`;
  };

  const formatPct = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const num = Number(val);
    if (isNaN(num)) return 'N/A';
    const pct = Math.abs(num) > 1.0 ? num : num * 100;
    return `${pct.toFixed(2)}%`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('export-container');
      if (!element) return;

      // 1. Setup Wrapper dengan Aurora Background
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '1200px';
      wrapper.style.backgroundColor = '#050505';
      wrapper.style.backgroundImage = 'radial-gradient(ellipse at 50% 10%, rgba(30, 41, 59, 0.8) 0%, transparent 60%), radial-gradient(ellipse at 50% 90%, rgba(20, 50, 40, 0.6) 0%, transparent 50%)';
      wrapper.style.padding = '40px';
      wrapper.style.zIndex = '-999';

      // Simpan referensi asli
      const parent = element.parentNode;
      const nextSibling = element.nextSibling;
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;

      // Pindahkan element ke dalam wrapper
      wrapper.appendChild(element);
      document.body.appendChild(wrapper);

      // Paksa ukuran element
      element.style.width = '100%';
      element.style.minWidth = '100%';
      element.style.maxWidth = '100%';

      // 2. Injeksi style untuk memaksa layout Desktop walaupun di HP
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        .bento-grid { grid-template-columns: repeat(6, 1fr) !important; }
        .grid-6-cols { grid-template-columns: repeat(6, 1fr) !important; }
        .grid-4-cols { grid-template-columns: repeat(4, 1fr) !important; }
        .grid-3-cols { grid-template-columns: repeat(3, 1fr) !important; }
        .grid-2-cols { grid-template-columns: repeat(2, 1fr) !important; }
        .risk-grid { grid-template-columns: repeat(5, 1fr) !important; }
        .header-grid { grid-template-columns: 1.2fr 1fr !important; text-align: left !important; }
        .header-grid > .flex-col { align-items: flex-start !important; }
        .header-grid .flex-row { justify-content: flex-start !important; }
        .mobile-col { flex-direction: row !important; align-items: flex-start !important; }
        .mobile-col-right { flex-direction: column !important; align-items: flex-end !important; justify-content: flex-start !important; width: auto !important; }
        .mobile-text-3xl { font-size: 2.25rem !important; }
      `;
      document.head.appendChild(styleTag);

      // Trigger event resize untuk TradingView chart
      window.dispatchEvent(new Event('resize'));

      // Beri jeda waktu agar DOM & Chart selesai render ulang
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Gunakan html2canvas yang lebih stabil menghadapi browser extension
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#050505',
        scale: 2,
        width: 1200,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 5000
      });
      const dataUrl = canvas.toDataURL('image/png');

      // 3. Kembalikan semua ke kondisi awal
      document.head.removeChild(styleTag);
      if (nextSibling) {
        parent.insertBefore(element, nextSibling);
      } else {
        parent.appendChild(element);
      }
      document.body.removeChild(wrapper);

      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.maxWidth = originalMaxWidth;

      window.dispatchEvent(new Event('resize'));

      // Convert dataUrl ke Blob secara manual untuk menghindari Chrome Extension membajak window.fetch
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });

      const fileName = `${data.ticker}_Analysis_${new Date().toISOString().split('T')[0]}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Jika browser mendukung Web Share API (umumnya di HP/Mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${data.ticker} Analysis`,
            text: `Technical Analysis for ${data.ticker}`,
            files: [file]
          });
        } catch (err) {
          console.log('User cancelled share or share failed', err);
        }
      } else {
        // Fallback download langsung (PC/Desktop Browser)
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      }

      setIsExporting(false);

    } catch (error) {
      console.error('Failed to export image:', error);
      setIsExporting(false);
    }
  };

  if (!data) return null;

  return (
    <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
      <div className="flex-row justify-between flex-wrap gap-md mobile-col" style={{ alignItems: 'stretch' }}>
        <div className="flex-col gap-xs">
          <div className="flex-row items-center gap-sm mb-1" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <div className="font-semibold tracking-widest uppercase" style={{ color: 'var(--bullish)', letterSpacing: '0.15em', fontSize: 'clamp(9px, 2.5vw, 12px)' }}>
              Technical Analysis
            </div>
            <div className="text-muted tracking-widest uppercase" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '8px', fontSize: 'clamp(9px, 2.5vw, 12px)' }}>
              powered by <span style={{ color: 'var(--bullish)', fontWeight: 'bold', textTransform: 'lowercase' }}>@rifkydelta</span>
            </div>
          </div>
          <div className="flex-row gap-md items-center">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <img
                src={`https://assets.stockbit.com/logos/companies/${data.ticker}.png`}
                alt={data.ticker}
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'white' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {data.ticker.charAt(0)}
              </div>
            </div>

            <div className="flex-col" style={{ gap: '4px' }}>
              <h1 className="text-4xl font-mono text-primary tracking-tight font-bold mobile-text-3xl" style={{ margin: 0, lineHeight: 1 }}>{data.ticker}</h1>
              <div className="flex-row items-center gap-xs text-secondary text-sm" style={{ gap: '6px' }}>
                <span>{data.company_name} - IDX</span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(38, 166, 154, 0.1)',
                border: '1px solid rgba(38, 166, 154, 0.25)',
                color: 'var(--bullish)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                width: 'fit-content',
                marginTop: '2px'
              }}>
                <Briefcase size={12} strokeWidth={2.5} />
                {data.sector || 'UNKNOWN'}
              </div>
            </div>
          </div>
          {data.ohlcv_daily && data.ohlcv_daily.length > 0 && (() => {
            let lastBar = data.ohlcv_daily[data.ohlcv_daily.length - 1];
            if (data.session_info?.reference_ohlcv) {
              lastBar = data.session_info.reference_ohlcv;
            }
            const formatVol = (v) => {
              if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
              if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
              if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
              return v;
            };
            const closeColor = lastBar.close > lastBar.open ? 'var(--bullish)' : (lastBar.close < lastBar.open ? 'var(--bearish)' : 'var(--text-primary)');
            const metrics = [
              { label: 'O', value: lastBar.open.toLocaleString(), color: 'var(--text-primary)' },
              { label: 'H', value: lastBar.high.toLocaleString(), color: 'var(--text-primary)' },
              { label: 'L', value: lastBar.low.toLocaleString(), color: 'var(--text-primary)' },
              { label: 'C', value: lastBar.close.toLocaleString(), color: closeColor },
              { label: 'Vol', value: formatVol(lastBar.volume), color: 'var(--text-primary)' }
            ];

            return (
              <div className="flex-row flex-wrap mt-3" style={{ gap: '6px' }}>
                {metrics.map((m) => (
                  <div key={m.label} className="flex-row items-center" style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    gap: '8px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>{m.label}</span>
                    <span style={{ color: m.color, fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right Section: Clean Live Price Hero Badge & Action Buttons */}
        <div className="flex-col mobile-col-right" style={{ alignItems: 'flex-end', justifyContent: 'center', gap: '14px' }}>
          {/* Live Price Widget */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '12px 20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                HARGA REALTIME ({liveLabel})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {(() => {
                const todayBar = data.ohlcv_daily?.[data.ohlcv_daily.length - 1];
                const openPrice = todayBar?.open;
                const displayPrice = livePrice || data.last_price;
                const pctChange = openPrice ? ((displayPrice - openPrice) / openPrice) * 100 : 0;
                const pctColor = pctChange > 0 ? 'var(--bullish)' : (pctChange < 0 ? 'var(--bearish)' : 'var(--text-secondary)');
                const diffVal = openPrice ? (displayPrice - openPrice) : 0;

                return (
                  <>
                    <span style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#ffffff', lineHeight: '1.1' }}>
                      {displayPrice ? `Rp${displayPrice.toLocaleString('id-ID')}` : '-'}
                    </span>
                    {openPrice && (
                      <span
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: pctColor,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: pctChange >= 0 ? 'rgba(74, 222, 128, 0.12)' : 'rgba(244, 63, 94, 0.12)'
                        }}
                      >
                        {pctChange > 0 ? `+${pctChange.toFixed(2)}%` : `${pctChange.toFixed(2)}%`}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Update: {data.date}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {onOpenAiPrompt && (
              <button
                onClick={onOpenAiPrompt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#60a5fa',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={13} />
                AI Prompt
              </button>
            )}

            <a
              href={`https://stockbit.com/symbol/${data.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka Stream, Komunitas & Analisis ${data.ticker} di Stockbit`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '800',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.22)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 18px rgba(16, 185, 129, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <ExternalLink size={13} />
              Stockbit
            </a>

            <button
              onClick={handleOpenProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Info size={13} />
              Profil Emiten
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                opacity: isExporting ? 0.7 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* COMPANY PROFILE POPUP MODAL */}
      {mounted && isProfileOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(3, 7, 18, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end', // Align drawer to the right side of the screen
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsProfileOpen(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
          <div
            style={{
              backgroundColor: '#0c1017',
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              width: '100%',
              maxWidth: '480px',
              height: '100%',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), inset 1px 0 0 rgba(255, 255, 255, 0.05)',
              padding: 0, // No padding on outer wrapper to allow header/body separation
              position: 'relative',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden', // Hide scroll on outer wrapper
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* STICKY HEADER SECTION */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '24px 24px 18px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#0c1017',
              zIndex: 10,
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  <img
                    src={`https://assets.stockbit.com/logos/companies/${data.ticker}.png`}
                    alt={data.ticker}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#111' }}>
                    {data.ticker.charAt(0)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {data.ticker}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(74, 222, 128, 0.12)',
                      border: '1px solid rgba(74, 222, 128, 0.3)',
                      color: 'var(--bullish)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      IDX
                    </span>
                  </div>
                  <h2 style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, margin: '2px 0 0 0', lineHeight: '1.4' }}>
                    {profileInfo?.name || data.company_name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-secondary)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                  e.currentTarget.style.borderColor = 'var(--bearish)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* SCROLLABLE BODY CONTENT */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {isLoadingProfile ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '13px' }}>Memuat profil emiten...</div>
                </div>
              ) : (
                <>
                  {/* Quick Badges Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Briefcase size={16} style={{ color: 'var(--bullish)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Sektor & Industri</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {profileInfo?.sector || data.sector || 'N/A'} {profileInfo?.industry && profileInfo.industry !== profileInfo.sector ? `(${profileInfo.industry})` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {profileInfo?.city && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MapPin size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Kantor Pusat</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{profileInfo.city}</div>
                          </div>
                        </div>
                      )}

                      {profileInfo?.website && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Globe size={16} style={{ color: 'var(--neutral)', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Situs Resmi</div>
                            <a
                              href={profileInfo.website.startsWith('http') ? profileInfo.website : `https://${profileInfo.website}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--bullish)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{profileInfo.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deskripsi Perusahaan */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bullish)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={13} /> Tentang Perusahaan
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                      {profileInfo?.description || `${data.company_name} (${data.ticker}) adalah emiten publik yang terdaftar di Bursa Efek Indonesia (IDX).`}
                    </p>
                  </div>

                  {/* Key Metrics / Valuation Grid */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bullish)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart3 size={13} /> Valuasi & Statistik Saham
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>MARKET CAP</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
                          {formatMarketCap(data.valuation?.market_cap || profileInfo?.valuation?.market_cap)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>PER (P/E)</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
                          {formatRatio(data.valuation?.pe_ratio || profileInfo?.valuation?.pe_ratio)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>PBV (P/B)</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
                          {formatRatio(data.valuation?.pb_ratio || profileInfo?.valuation?.pb_ratio)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>DIV YIELD</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
                          {formatPct(data.valuation?.dividend_yield || profileInfo?.valuation?.dividend_yield)}
                        </div>
                      </div>

                      {profileInfo?.shares_outstanding && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL SAHAM</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
                            {formatNumber(profileInfo.shares_outstanding)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financials Table if present */}
                  {data.financials && data.financials.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bullish)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={13} /> Kinerja Keuangan (Tahunan)
                      </div>
                      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>
                              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Thn</th>
                              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Revenue</th>
                              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Laba Bersih</th>
                              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Margin</th>
                              <th style={{ padding: '8px 10px', textAlign: 'right' }}>EPS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.financials.map((f, idx) => (
                              <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '8px 10px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{f.year}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{f.revenue}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: f.net_income.includes('-') ? 'var(--bearish)' : 'var(--bullish)' }}>{f.net_income}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{f.net_margin}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{f.eps}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Stockbit Community & Stream Banner */}
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={`https://stockbit.com/symbol/${data.ticker}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#34d399',
                        fontSize: '12px',
                        fontWeight: '800',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.22)';
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                      }}
                    >
                      <ExternalLink size={14} />
                      Buka Diskusi & Stream {data.ticker} di Stockbit
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
