import React, { useState } from 'react';
import { ArrowLeftRight, HelpCircle, CheckCircle } from 'lucide-react';
import { INDICATORS, COMPARISONS } from '../../data/indicatorsData';

export default function IndicatorComparison() {
  const [indicatorA, setIndicatorA] = useState('rsi');
  const [indicatorB, setIndicatorB] = useState('macd');

  const getIndicatorData = (id) => INDICATORS.find(ind => ind.id === id);

  const dataA = getIndicatorData(indicatorA);
  const dataB = getIndicatorData(indicatorB);

  const getComparisonSynergy = (a, b) => {
    const key1 = `${a}-${b}`;
    const key2 = `${b}-${a}`;
    
    if (COMPARISONS[key1]) return COMPARISONS[key1];
    if (COMPARISONS[key2]) return COMPARISONS[key2];
    
    return {
      metric: 'General Integration',
      synergy: 'Kombinasi kedua indikator ini memberikan wawasan yang berbeda tentang pergerakan harga. Pastikan Anda tidak menumpuk indikator dengan fungsi sejenis (misalnya menggunakan RSI bersama Stochastic RSI) agar terhindar dari bias konfirmasi ganda.'
    };
  };

  const synergyInfo = getComparisonSynergy(indicatorA, indicatorB);

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'lagging':
        return { color: '#60a5fa', text: 'Lagging' };
      case 'leading':
        return { color: '#10b981', text: 'Leading' };
      case 'tool':
      default:
        return { color: '#f59e0b', text: 'Drawing Tool' };
    }
  };

  return (
    <div className="flex-col w-full" style={{ gap: '20px' }}>
      {/* Dropdown Selectors Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Dropdown A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>INDikATOR A</label>
          <select 
            value={indicatorA}
            onChange={(e) => setIndicatorA(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {INDICATORS.map(ind => (
              <option key={ind.id} value={ind.id} disabled={ind.id === indicatorB}>{ind.name}</option>
            ))}
          </select>
        </div>

        {/* Swap Icon */}
        <div style={{ display: 'flex', paddingTop: '16px' }}>
          <ArrowLeftRight size={16} color="var(--text-muted)" />
        </div>

        {/* Dropdown B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>INDikATOR B</label>
          <select 
            value={indicatorB}
            onChange={(e) => setIndicatorB(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {INDICATORS.map(ind => (
              <option key={ind.id} value={ind.id} disabled={ind.id === indicatorA}>{ind.name}</option>
            ))}
          </select>
        </div>
      </div>

      {indicatorA === indicatorB ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--bearish)', fontSize: '12px' }}>
          Pilih dua indikator yang berbeda untuk membandingkan.
        </div>
      ) : (
        <div className="flex-col w-full" style={{ gap: '16px', marginTop: '8px' }}>
          {/* Comparison Cards Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Card A */}
            <div className="ide-panel" style={{ padding: '20px', borderTop: `2px solid ${getBadgeStyle(dataA.type).color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: getBadgeStyle(dataA.type).color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getBadgeStyle(dataA.type).text}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dataA.category}</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{dataA.name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {dataA.description}
              </p>
            </div>

            {/* Card B */}
            <div className="ide-panel" style={{ padding: '20px', borderTop: `2px solid ${getBadgeStyle(dataB.type).color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: getBadgeStyle(dataB.type).color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getBadgeStyle(dataB.type).text}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dataB.category}</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{dataB.name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {dataB.description}
              </p>
            </div>
          </div>

          {/* Detailed Metric Table */}
          <div className="ide-panel" style={{ overflowX: 'auto', padding: '16px 20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', width: '25%', fontWeight: 600 }}>Metrik</th>
                  <th style={{ padding: '10px 8px', color: getBadgeStyle(dataA.type).color, width: '37.5%', fontWeight: 700 }}>{dataA.name}</th>
                  <th style={{ padding: '10px 8px', color: getBadgeStyle(dataB.type).color, width: '37.5%', fontWeight: 700 }}>{dataB.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>Tipe Respons</td>
                  <td style={{ padding: '12px 8px' }}>{dataA.type === 'lagging' ? 'Terlambat (Mengikuti tren harga)' : dataA.type === 'leading' ? 'Mendahului (Mengukur momentum kecepatan)' : 'Manual (Mengukur area level harga)'}</td>
                  <td style={{ padding: '12px 8px' }}>{dataB.type === 'lagging' ? 'Terlambat (Mengikuti tren harga)' : dataB.type === 'leading' ? 'Mendahului (Mengukur momentum kecepatan)' : 'Manual (Mengukur area level harga)'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>Kondisi Pasar Ideal</td>
                  <td style={{ padding: '12px 8px' }}>{dataA.id === 'ma' || dataA.id === 'macd' ? 'Pasar Trending Kuat' : dataA.id === 'bb' ? 'Pasar Sideways atau Menjelang Breakout' : 'Pasar Trending Jenuh'}</td>
                  <td style={{ padding: '12px 8px' }}>{dataB.id === 'ma' || dataB.id === 'macd' ? 'Pasar Trending Kuat' : dataB.id === 'bb' ? 'Pasar Sideways atau Menjelang Breakout' : 'Pasar Trending Jenuh'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>Kerentanan Utama</td>
                  <td style={{ padding: '12px 8px' }}>{dataA.commonMistakes}</td>
                  <td style={{ padding: '12px 8px' }}>{dataB.commonMistakes}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>Tips Penggabungan</td>
                  <td style={{ padding: '12px 8px' }}>{dataA.tips}</td>
                  <td style={{ padding: '12px 8px' }}>{dataB.tips}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dynamic synergy card */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, transparent 100%)', border: '1px solid rgba(96, 165, 250, 0.15)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={14} color="#60a5fa" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sinergi Analisis: {synergyInfo.metric}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {synergyInfo.synergy}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
