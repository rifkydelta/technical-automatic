'use client';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ClipboardPaste,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  ArrowRight,
  RefreshCw,
  Layers,
  ShieldCheck,
  Target,
  Wallet,
  Check
} from 'lucide-react';
import { cleanAndParseAiJson, getSampleAiAnalysis } from '@/utils/aiPromptGenerator';

export default function AiPasteModal({
  isOpen,
  onClose,
  onSuccessImport,
  ticker = '',
  companyName = '',
  lastPrice = 0
}) {
  const [inputText, setInputText] = useState('');
  const [saveToDb, setSaveToDb] = useState(true);
  const [validationResult, setValidationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  useEffect(() => {
    if (!inputText.trim()) {
      setValidationResult(null);
      setSubmitError(null);
      return;
    }

    const res = cleanAndParseAiJson(inputText);
    setValidationResult(res);
    if (res.success) {
      setSubmitError(null);
    }
  }, [inputText]);

  const schemaChecks = useMemo(() => {
    if (!validationResult || !validationResult.success || !validationResult.data) {
      return {
        meta: false,
        exec: false,
        perspectives: false,
        scenarios: false,
        blueprint: false,
        portfolio: false
      };
    }
    const d = validationResult.data;
    return {
      meta: Boolean(d.meta?.ticker),
      exec: Boolean(d.executive_summary?.master_bias),
      perspectives: Boolean(d.perspectives && Object.keys(d.perspectives).length >= 3),
      scenarios: Boolean(d.scenario_matrix?.primary_bullish),
      blueprint: Boolean(d.execution_blueprint?.action || d.execution_blueprint?.entry_zones),
      portfolio: Boolean(d.portfolio_context)
    };
  }, [validationResult]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setInputText(text);
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  };

  const handleLoadDemo = () => {
    const sample = getSampleAiAnalysis(ticker || 'BBCA', companyName || 'PT Bank Central Asia Tbk', lastPrice || 9850);
    setInputText(JSON.stringify(sample, null, 2));
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.success) {
      setSubmitError('Harap masukkan format JSON yang valid terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const parsedData = validationResult.data;
    const rawCleaned = validationResult.rawCleaned;

    try {
      if (saveToDb) {
        try {
          const payload = {
            ticker: (parsedData.meta?.ticker || ticker || 'UNKNOWN').toUpperCase(),
            company_name: parsedData.meta?.company_name || companyName,
            analysis_date: parsedData.meta?.analysis_date || new Date().toISOString().split('T')[0],
            provider_model: parsedData.meta?.ai_provider_model || 'External AI',
            master_bias: parsedData.executive_summary?.master_bias || 'NEUTRAL',
            conviction_score: parsedData.executive_summary?.conviction_score || 0,
            primary_action: parsedData.executive_summary?.primary_action || 'WATCHLIST',
            one_sentence_thesis: parsedData.executive_summary?.one_sentence_thesis || '',
            raw_json: rawCleaned
          };

          await fetch(`${API_URL}/api/ai/save-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (dbErr) {
          console.warn('Could not save to backend SQLite, fallback to client state only:', dbErr);
        }
      }

      const storageKey = `idx_ai_analysis_${(parsedData.meta?.ticker || ticker).toUpperCase()}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(parsedData));
      } catch (lsErr) {
        // quota ignore
      }

      if (onSuccessImport) {
        onSuccessImport(parsedData);
      }
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Gagal merender analisis AI.');
    } finally {
      setIsSubmitting(false);
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
        .schema-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.15s ease;
        }
      `}</style>
      <div
        style={{
          backgroundColor: '#0b111e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(16, 185, 129, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)'
              }}
            >
              <FileCode2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Import JSON Hasil Analisis AI
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    fontFamily: 'monospace'
                  }}
                >
                  {ticker || 'JSON'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Paste teks / JSON output dari ChatGPT, Claude, DeepSeek, atau Gemini untuk dirender seketika
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Tutup Modal"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1
          }}
        >
          {/* Quick Helper Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Auto-Cleaner Aktif: <span style={{ color: '#60a5fa', fontWeight: '600' }}>Markdown codeblock & teks pembuka AI otomatis dibersihkan</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ClipboardPaste size={13} />
                Paste dari Clipboard
              </button>
              <button
                type="button"
                onClick={handleLoadDemo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#60a5fa',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={13} />
                Muat Contoh Demo
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste JSON respon AI di sini...\n{\n  "meta": { "ticker": "${ticker || 'BBCA'}" },\n  "executive_summary": {\n    "master_bias": "STRONG BULLISH",\n    "conviction_score": 88,\n    "primary_action": "PULLBACK BUY"\n  },\n  "perspectives": { ... }\n}`}
              rows={11}
              style={{
                width: '100%',
                backgroundColor: '#050811',
                border: validationResult
                  ? validationResult.success
                    ? '1px solid rgba(34, 197, 94, 0.5)'
                    : '1px solid rgba(239, 68, 68, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#ffffff',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Live Schema Integrity Indicators */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integritas Struktur Komponen JSON:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.meta ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.meta ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.meta ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.meta ? <Check size={11} /> : '○'} Meta Data
              </span>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.exec ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.exec ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.exec ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.exec ? <Check size={11} /> : '○'} Executive Bias & Score
              </span>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.perspectives ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.perspectives ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.perspectives ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.perspectives ? <Check size={11} /> : '○'} 5 Perspektif Analisis
              </span>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.scenarios ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.scenarios ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.scenarios ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.scenarios ? <Check size={11} /> : '○'} Matriks Skenario Risiko
              </span>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.blueprint ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.blueprint ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.blueprint ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.blueprint ? <Check size={11} /> : '○'} Blueprint Eksekusi
              </span>
              <span
                className="schema-badge"
                style={{
                  backgroundColor: schemaChecks.portfolio ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: schemaChecks.portfolio ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${schemaChecks.portfolio ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {schemaChecks.portfolio ? <Check size={11} /> : '○'} Konteks Portofolio
              </span>
            </div>
          </div>

          {/* Validation Feedback Message */}
          {validationResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: validationResult.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: validationResult.success ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                color: validationResult.success ? '#4ade80' : '#f87171',
                fontSize: '12px',
                fontWeight: '700'
              }}
            >
              {validationResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>
                {validationResult.success
                  ? `Format JSON Valid! Terdeteksi analisis ${validationResult.data.meta?.ticker || ticker} (${validationResult.data.executive_summary?.master_bias || 'BULLISH'}, Conviction: ${validationResult.data.executive_summary?.conviction_score || 0}/100)`
                  : validationResult.error}
              </span>
            </div>
          )}

          {submitError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '12px'
              }}
            >
              {submitError}
            </div>
          )}

          {/* Storage Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={saveToDb}
                onChange={(e) => setSaveToDb(e.target.checked)}
                style={{ accentColor: '#22c55e', width: '14px', height: '14px' }}
              />
              <Database size={13} color="#22c55e" />
              Simpan laporan ini ke database lokal SQLite (Bisa dibuka kembali kapan saja)
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-secondary)',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={!validationResult?.success || isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: validationResult?.success ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: validationResult?.success ? '#ffffff' : 'var(--text-muted)',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: validationResult?.success && !isSubmitting ? 'pointer' : 'not-allowed',
              boxShadow: validationResult?.success ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Render Laporan Analisis AI
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
