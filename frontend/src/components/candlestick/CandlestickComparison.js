import React, { useState } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import CandlestickIllustration from './CandlestickIllustration';
import { CANDLESTICK_PATTERNS } from '../../data/candlestickData';

export default function CandlestickComparison() {
  const [pattern1Id, setPattern1Id] = useState('hammer');
  const [pattern2Id, setPattern2Id] = useState('inverted-hammer');

  const pattern1 = CANDLESTICK_PATTERNS.find(p => p.id === pattern1Id);
  const pattern2 = CANDLESTICK_PATTERNS.find(p => p.id === pattern2Id);

  return (
    <div className="flex-col gap-lg">
      <div className="flex-row items-center gap-md mb-4">
        <div className="flex-1">
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Pattern A</label>
          <select 
            value={pattern1Id}
            onChange={(e) => setPattern1Id(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
          >
            {CANDLESTICK_PATTERNS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </div>
        
        <div style={{ padding: '10px', marginTop: '24px', color: 'var(--text-muted)' }}>
          <ArrowLeftRight size={20} />
        </div>

        <div className="flex-1">
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Pattern B</label>
          <select 
            value={pattern2Id}
            onChange={(e) => setPattern2Id(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}
          >
            {CANDLESTICK_PATTERNS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[pattern1, pattern2].map((p, idx) => (
          <div key={idx} className="ide-panel" style={{ overflow: 'hidden' }}>
            <div style={{ height: '160px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CandlestickIllustration patternId={p.id} />
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '10px', color: p.type === 'bullish' ? 'var(--bullish)' : p.type === 'bearish' ? 'var(--bearish)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${p.type === 'bullish' ? 'var(--bullish)' : p.type === 'bearish' ? 'var(--bearish)' : 'var(--text-secondary)'}`, padding: '2px 6px', borderRadius: '4px' }}>
                  {p.type}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Psychology</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{p.psychology}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Confirmation</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{p.confirmation}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
