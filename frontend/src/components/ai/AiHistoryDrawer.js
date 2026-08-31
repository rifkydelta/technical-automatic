'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  History,
  Trash2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Check
} from 'lucide-react';

export default function AiHistoryDrawer({
  isOpen,
  onClose,
  ticker = '',
  onSelectAnalysis
}) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    if (!ticker) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/history/${ticker}`);
      if (res.ok) {
        const json = await res.json();
        setHistoryList(json.data || []);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.warn('Could not fetch history from backend:', err);
      // Fallback: check LocalStorage
      const lsKey = `idx_ai_analysis_${ticker.toUpperCase()}`;
      try {
        const cached = localStorage.getItem(lsKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setHistoryList([{
            id: 'local_current',
            ticker: parsed.meta?.ticker || ticker,
            company_name: parsed.meta?.company_name || ticker,
            analysis_date: parsed.meta?.analysis_date || 'Tersimpan di Browser',
            provider_model: parsed.meta?.ai_provider_model || 'LocalStorage',
            master_bias: parsed.executive_summary?.master_bias || 'NEUTRAL',
            conviction_score: parsed.executive_summary?.conviction_score || 0,
            primary_action: parsed.executive_summary?.primary_action || 'WATCHLIST',
            one_sentence_thesis: parsed.executive_summary?.one_sentence_thesis || '',
            created_at: new Date().toISOString()
          }]);
        }
      } catch (lsErr) {
        setHistoryList([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticker) {
      fetchHistory();
    }
  }, [isOpen, ticker]);

  if (!isOpen) return null;

  const handleSelect = async (item) => {
    if (item.id === 'local_current') {
      try {
        const cached = localStorage.getItem(`idx_ai_analysis_${ticker.toUpperCase()}`);
        if (cached) {
          onSelectAnalysis(JSON.parse(cached));
          onClose();
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/ai/analysis/${item.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.parsed_json) {
          onSelectAnalysis(json.data.parsed_json);
          setActiveId(item.id);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat analisis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (id === 'local_current') {
      localStorage.removeItem(`idx_ai_analysis_${ticker.toUpperCase()}`);
      setHistoryList([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/ai/analysis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(3, 7, 18, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      <div
        style={{
          backgroundColor: '#0c1017',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={18} color="#60a5fa" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                Riwayat Analisis AI
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Emiten {ticker} ({historyList.length} laporan tersimpan)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1
          }}
        >
          {isLoading && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
              Memuat riwayat...
            </div>
          )}

          {!isLoading && historyList.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Belum ada riwayat laporan AI yang tersimpan untuk emiten ini.
            </div>
          )}

          {!isLoading &&
            historyList.map((item) => {
              const bias = (item.master_bias || 'NEUTRAL').toUpperCase();
              const isBull = bias.includes('BULLISH');
              const isBear = bias.includes('BEARISH');
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: isBull ? 'rgba(74, 222, 128, 0.15)' : isBear ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                          color: isBull ? 'var(--bullish)' : isBear ? 'var(--bearish)' : 'var(--text-primary)'
                        }}
                      >
                        {item.master_bias || 'NEUTRAL'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        {item.primary_action || 'WATCHLIST'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#60a5fa', fontFamily: 'monospace' }}>
                        {item.conviction_score || 0}/100
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Hapus riwayat ini"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {item.one_sentence_thesis && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {item.one_sentence_thesis}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>Model: {item.provider_model || 'LLM'}</span>
                    <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>,
    document.body
  );
}
