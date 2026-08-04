import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PATTERN_VOLUME_RULES } from '../../data/volumeData';
import { CATEGORIES } from '../../data/chartpatterns/index';
import { getPatternById } from '../../data/chartpatterns/index';
import PatternIllustration from '../chartpattern/PatternIllustration';

export default function VolumeChapter({ chapterId }) {
  const [activePattern, setActivePattern] = useState(null);

  // State for order book simulation in Chapter 2
  const [volumeHistory, setVolumeHistory] = useState([
    { type: 'buy', value: 30 },
    { type: 'sell', value: 20 },
    { type: 'buy', value: 45 },
    { type: 'sell', value: 15 },
    { type: 'buy', value: 25 },
  ]);
  const [lastAction, setLastAction] = useState(null); // 'HAKA' or 'HAKI'
  const [simulatedBidVol, setSimulatedBidVol] = useState(12400);
  const [simulatedAskVol, setSimulatedAskVol] = useState(8500);
  const [flashType, setFlashType] = useState(null); // 'buy' or 'sell'

  // Chapter 1: Mengenal Volume
  if (chapterId === 1) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Mengenal Volume</h2>

        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Volume adalah jumlah transaksi saham yang terjadi pada suatu periode waktu tertentu (misalnya dalam 1 hari).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="ide-panel" style={{ padding: '16px', borderLeft: '2px solid var(--info)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--info)', marginBottom: '4px' }}>Volume Besar</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Semakin banyak partisipasi transaksi pasar.</p>
          </div>
          <div className="ide-panel" style={{ padding: '16px', borderLeft: '2px solid var(--text-muted)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Volume Kecil</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Semakin sedikit partisipasi transaksi pasar.</p>
          </div>
        </div>

        <div style={{ padding: '20px', background: 'rgba(74, 222, 128, 0.04)', border: '1px dashed rgba(74, 222, 128, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bullish)', lineHeight: '1.6' }}>
            Volume BUKAN Sinyal.<br/>Volume adalah KONFIRMASI.
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--info)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Fungsi Volume
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              "Mengukur aktivitas transaksi",
              "Mengukur kekuatan trend",
              "Mengkonfirmasi breakout",
              "Mengkonfirmasi breakdown",
              "Mengkonfirmasi validitas chart pattern",
              "Menghindari jebakan False Breakout"
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={12} color="var(--info)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chapter 2: Cara Membaca Volume
  if (chapterId === 2) {
    const handleHaka = () => {
      setLastAction('HAKA');
      setFlashType('buy');
      const val = Math.floor(Math.random() * 40) + 35;
      setVolumeHistory(prev => [...prev.slice(1), { type: 'buy', value: val }]);
      setSimulatedAskVol(prev => Math.max(1000, prev - 1200));
      setTimeout(() => {
        setSimulatedAskVol(prev => prev + 1200); // replenish
        setFlashType(null);
      }, 400);
    };

    const handleHaki = () => {
      setLastAction('HAKI');
      setFlashType('sell');
      const val = Math.floor(Math.random() * 40) + 35;
      setVolumeHistory(prev => [...prev.slice(1), { type: 'sell', value: val }]);
      setSimulatedBidVol(prev => Math.max(1000, prev - 1500));
      setTimeout(() => {
        setSimulatedBidVol(prev => prev + 1500); // replenish
        setFlashType(null);
      }, 400);
    };

    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Cara Membaca Volume</h2>

        {/* Mitos vs Fakta Card */}
        <div className="ide-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(96,165,250,0.1)', color: 'var(--info)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mitos vs Fakta</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Netralitas Transaksi</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            <strong>Mitos:</strong> <em>"Volume Beli" berarti hanya ada pembeli, dan "Volume Jual" berarti hanya ada penjual.</em><br/>
            <strong>Fakta:</strong> Setiap transaksi selalu melibatkan tepat <strong>1 pembeli dan 1 penjual</strong>. Volume transaksi itu netral. Kita melabeli volume sebagai <strong>Buy</strong> atau <strong>Sell</strong> berdasarkan pihak mana yang bertindak lebih <strong>agresif</strong> untuk segera mengeksekusi order.
          </p>
        </div>

        {/* HAKA/HAKI Order Book Simulator */}
        <div className="ide-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--info)" />
            Order Book & Mekanisme Volume (HAKA vs HAKI)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Bid Side (Buyers Queue) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bullish)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(74,222,128,0.1)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bid (Antrean Beli)</span>
                <span>Volume</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: flashType === 'sell' ? 'rgba(244,63,94,0.15)' : 'transparent', transition: 'background 0.2s', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--bullish)' }}>Rp 1.000</span>
                  <span>{simulatedBidVol.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', color: 'rgba(255,255,255,0.6)' }}>
                  <span>Rp 995</span>
                  <span>18.400</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>Rp 990</span>
                  <span>24.100</span>
                </div>
              </div>
            </div>

            {/* Ask Side (Sellers Queue) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bearish)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(244,63,94,0.1)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Ask (Antrean Jual)</span>
                <span>Volume</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: flashType === 'buy' ? 'rgba(74,222,128,0.15)' : 'transparent', transition: 'background 0.2s', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--bearish)' }}>Rp 1.005</span>
                  <span>{simulatedAskVol.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', color: 'rgba(255,255,255,0.6)' }}>
                  <span>Rp 1.010</span>
                  <span>14.200</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>Rp 1.015</span>
                  <span>31.800</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <button 
              onClick={handleHaka}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                color: 'var(--bullish)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Hajar Kanan (HAKA / Market Buy)
            </button>
            <button 
              onClick={handleHaki}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.15)',
                color: 'var(--bearish)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Hajar Kiri (HAKI / Market Sell)
            </button>
          </div>

          {/* Simulated chart reaction */}
          <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulasi Volume Chart</span>
              {lastAction && (
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: lastAction === 'HAKA' ? 'var(--bullish)' : 'var(--bearish)', textTransform: 'uppercase' }}>
                  {lastAction === 'HAKA' ? '✓ HAKA: Memicu Volume BUY' : '✓ HAKI: Memicu Volume SELL'}
                </span>
              )}
            </div>
            
            {/* The dynamic mini bar chart representing volume accumulation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '60px', paddingBottom: '4px' }}>
              {volumeHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    width: '24px', 
                    height: `${item.value}%`, 
                    background: item.type === 'buy' ? 'var(--bullish)' : 'var(--bearish)', 
                    borderRadius: '3px 3px 0 0',
                    opacity: idx === volumeHistory.length - 1 ? 1 : 0.4,
                    transition: 'all 0.3s ease',
                    boxShadow: idx === volumeHistory.length - 1 ? `0 0 12px ${item.type === 'buy' ? 'rgba(74,222,128,0.4)' : 'rgba(244,63,94,0.4)'}` : 'none'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic explanations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="ide-panel" style={{ padding: '16px', borderTop: '2px solid var(--bullish)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bullish)', marginBottom: '4px' }}>Volume Buy / Akumulasi</div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Terbentuk ketika pembeli agresif rela membeli langsung pada harga Ask (HAKA). Ini mencerminkan desakan beli yang tinggi dan memicu naiknya harga saham.
            </p>
          </div>
          <div className="ide-panel" style={{ padding: '16px', borderTop: '2px solid var(--bearish)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bearish)', marginBottom: '4px' }}>Volume Sell / Distribusi</div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Terbentuk ketika penjual agresif rela langsung menjual pada harga Bid (HAKI). Ini mencerminkan kepanikan atau pembagian barang (distribusi) yang menurunkan harga saham.
            </p>
          </div>
        </div>

        {/* Candlestick Logic Card */}
        <div className="ide-panel" style={{ padding: '16px', borderLeft: '2px solid var(--info)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--info)', marginBottom: '6px' }}>Bagaimana Charting Tools Mewarnai Volume?</div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Hampir semua platform charting (seperti TradingView) mewarnai bar volume di bawah chart harga berdasarkan warna candlestick harga:<br/>
            • <strong>Bar Hijau (Volume Buy)</strong>: Terjadi jika harga ditutup lebih tinggi atau sama dengan harga pembukaan (<code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '3px' }}>Close &ge; Open</code>).<br/>
            • <strong>Bar Merah (Volume Sell)</strong>: Terjadi jika harga ditutup lebih rendah dari harga pembukaan (<code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '3px' }}>Close &lt; Open</code>).
          </p>
        </div>
      </div>
    );
  }

  // Chapter 3: Volume pada Trend
  if (chapterId === 3) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Volume pada Trend</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { icon: TrendingUp, label: 'Bullish Trend + Volume Naik', strength: 'STRONG', color: 'var(--bullish)', desc: 'Trend kenaikan kemungkinan besar berlanjut.' },
            { icon: TrendingUp, label: 'Bullish Trend + Volume Turun', strength: 'WEAK', color: 'var(--warning)', desc: 'Trend mulai kehilangan tenaga, waspada koreksi.' },
            { icon: TrendingDown, label: 'Bearish Trend + Volume Naik', strength: 'STRONG', color: 'var(--bearish)', desc: 'Tekanan jual sangat kuat dan kemungkinan berlanjut.' },
            { icon: TrendingDown, label: 'Bearish Trend + Volume Turun', strength: 'WEAK', color: 'var(--warning)', desc: 'Tekanan jual melemah, potensi reversal meningkat.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${item.color}`, borderRadius: '0 6px 6px 0' }}>
                <Icon size={16} color={item.color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: item.color, letterSpacing: '0.05em' }}>{item.strength}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 16px', background: 'rgba(251, 191, 36, 0.06)', borderRadius: '6px', borderLeft: '2px solid var(--warning)' }}>
          <AlertCircle size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--warning)' }}>Catatan:</strong> Volume hanya berfungsi sebagai konfirmasi. Jangan entry hanya karena volume tiba-tiba naik tanpa sinyal Price Action atau pola teknikal.
          </div>
        </div>
      </div>
    );
  }

  // Chapter 4: Volume pada Breakout & Breakdown
  if (chapterId === 4) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Volume pada Breakout & Breakdown</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Breakout Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bullish)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Breakout (Resistance)</div>
            
            {/* Diagram Breakout */}
            <div className="ide-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {/* Price bars going up through resistance */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                  <span style={{ width: '70px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '10px' }}>Resistance</span>
                  <div style={{ flex: 1, height: '1px', borderTop: '1px dashed var(--text-muted)' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', marginLeft: '78px' }}>
                  <div style={{ width: '60%', height: '6px', background: 'var(--bullish)', borderRadius: '3px', boxShadow: '0 0 8px rgba(74,222,128,0.3)' }}></div>
                  <span style={{ fontSize: '10px', color: 'var(--bullish)', fontWeight: 600 }}>Breakout</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                  <span style={{ width: '70px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '10px' }}>Resistance</span>
                  <div style={{ flex: 1, height: '1px', borderTop: '1px dashed var(--text-muted)' }}></div>
                </div>
                <div style={{ marginLeft: '78px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
                    {[20, 30, 25, 35, 28, 90].map((h, i) => (
                      <div key={i} style={{ width: '12px', height: `${h}%`, background: i === 5 ? 'var(--bullish)' : 'rgba(96,165,250,0.3)', borderRadius: '2px 2px 0 0' }}></div>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Volume</div>
                </div>
              </div>
            </div>

            {/* Validation cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--bullish)', borderRadius: '0 6px 6px 0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>+ Volume Besar</div>
                  <div style={{ fontSize: '10px', color: 'var(--bullish)', marginTop: '2px' }}>Sangat Valid</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--bullish)', letterSpacing: '1px' }}>★★★★★</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--warning)', borderRadius: '0 6px 6px 0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>+ Volume Kecil</div>
                  <div style={{ fontSize: '10px', color: 'var(--warning)', marginTop: '2px' }}>Potensi False Break</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--warning)', letterSpacing: '1px' }}>★★☆☆☆</div>
              </div>
            </div>
          </div>

          {/* Breakdown Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bearish)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Breakdown (Support)</div>
            
            {/* Diagram Breakdown */}
            <div className="ide-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ marginLeft: '78px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
                    {[20, 25, 22, 30, 28, 85].map((h, i) => (
                      <div key={i} style={{ width: '12px', height: `${h}%`, background: i === 5 ? 'var(--bearish)' : 'rgba(96,165,250,0.3)', borderRadius: '2px 2px 0 0' }}></div>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Volume</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                  <span style={{ width: '70px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '10px' }}>Support</span>
                  <div style={{ flex: 1, height: '1px', borderTop: '1px dashed var(--text-muted)' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', marginLeft: '78px' }}>
                  <div style={{ width: '60%', height: '6px', background: 'var(--bearish)', borderRadius: '3px', boxShadow: '0 0 8px rgba(244,63,94,0.3)' }}></div>
                  <span style={{ fontSize: '10px', color: 'var(--bearish)', fontWeight: 600 }}>Breakdown</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                  <span style={{ width: '70px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '10px' }}>Support</span>
                  <div style={{ flex: 1, height: '1px', borderTop: '1px dashed var(--text-muted)' }}></div>
                </div>
              </div>
            </div>

            {/* Validation cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--bearish)', borderRadius: '0 6px 6px 0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>+ Volume Besar</div>
                  <div style={{ fontSize: '10px', color: 'var(--bearish)', marginTop: '2px' }}>Sangat Valid</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--bearish)', letterSpacing: '1px' }}>★★★★★</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--warning)', borderRadius: '0 6px 6px 0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>+ Volume Kecil</div>
                  <div style={{ fontSize: '10px', color: 'var(--warning)', marginTop: '2px' }}>Potensi False Break</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--warning)', letterSpacing: '1px' }}>★★☆☆☆</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 16px', background: 'rgba(96, 165, 250, 0.06)', borderRadius: '6px', borderLeft: '2px solid var(--info)' }}>
          <Info size={14} color="var(--info)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Volume merepresentasikan partisipasi pasar sesungguhnya. Semakin banyak pelaku pasar ikut serta saat level ditembus, semakin valid pergerakan tersebut dan semakin kecil kemungkinan terjadinya False Break.
          </div>
        </div>
      </div>
    );
  }

  // Chapter 5: Volume pada Chart Pattern
  if (chapterId === 5) {
    return (
      <div className="flex-col fade-in" style={{ gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Volume pada Chart Pattern</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Klik pola di bawah ini untuk melihat aturan volume konfirmasi pada masing-masing pola Bullish.
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', background: 'rgba(251, 191, 36, 0.06)', borderRadius: '6px', borderLeft: '2px solid var(--warning)' }}>
          <AlertTriangle size={12} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Aturan volume ini <strong>tidak</strong> selalu berlaku untuk pola Bearish. Penurunan harga seringkali terjadi hanya karena ketiadaan pembeli.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.keys(PATTERN_VOLUME_RULES).map(patternId => {
            const rule = PATTERN_VOLUME_RULES[patternId];
            const isActive = activePattern === patternId;
            const fullPattern = getPatternById(patternId);

            return (
              <div key={patternId} style={{ background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: isActive ? '2px solid var(--info)' : '2px solid transparent', borderRadius: '0 6px 6px 0', overflow: 'hidden', transition: 'all 0.2s' }}>
                <div 
                  onClick={() => setActivePattern(isActive ? null : patternId)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PatternIllustration patternId={fullPattern?.illustration || patternId} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{rule.name}</span>
                  </div>
                  {isActive ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>

                {isActive && (
                  <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Volume Rules</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {rule.rules.map((r, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--info)', color: '#000', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.step}</div>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--bullish)' }}>{r.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Checklist</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {rule.checklist.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <CheckCircle size={12} color="var(--bullish)" style={{ flexShrink: 0, marginTop: '1px' }} />
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Chapter 6: Menentukan Volume Besar
  if (chapterId === 6) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Menentukan Volume Besar & Kecil</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Tidak ada angka absolut. Volume 1 juta lot mungkin besar untuk saham lapis tiga, tapi kecil untuk saham perbankan raksasa. Volume selalu bersifat <strong>relatif</strong> terhadap histori saham tersebut.
        </p>

        {/* Proper Volume Chart with MA20 line */}
        <div className="ide-panel" style={{ padding: '24px 20px 16px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Volume Chart + MA20</div>
          
          <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: '20px' }}>
            {/* MA20 line */}
            <div style={{ position: 'absolute', bottom: '55px', left: 0, right: 0, height: '1px', borderTop: '1.5px dashed var(--warning)', zIndex: 2 }}></div>
            <div style={{ position: 'absolute', bottom: '57px', right: '0', fontSize: '9px', color: 'var(--warning)', fontWeight: 600, background: 'var(--bg-primary)', padding: '1px 4px', zIndex: 3 }}>MA20</div>
            
            {/* Bars */}
            {[
              { h: 25, label: '' },
              { h: 35, label: '' },
              { h: 30, label: '' },
              { h: 40, label: '' },
              { h: 28, label: '' },
              { h: 32, label: '' },
              { h: 22, label: '' },
              { h: 45, label: '' },
              { h: 38, label: '' },
              { h: 85, label: 'Breakout', highlight: true },
              { h: 55, label: '' },
              { h: 30, label: '' },
            ].map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${bar.h}px`, 
                  background: bar.highlight ? 'var(--bullish)' : bar.h > 35 ? 'var(--info)' : 'rgba(96,165,250,0.25)', 
                  borderRadius: '2px 2px 0 0',
                  boxShadow: bar.highlight ? '0 0 6px rgba(74,222,128,0.3)' : 'none',
                  position: 'relative'
                }}>
                  {bar.highlight && <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50)', fontSize: '8px', color: 'var(--bullish)', fontWeight: 700, whiteSpace: 'nowrap' }}>▲</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: 'rgba(96,165,250,0.25)', borderRadius: '1px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Di bawah MA20</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--info)', borderRadius: '1px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Di atas MA20</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--bullish)', borderRadius: '1px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Spike (Breakout)</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ padding: '14px', textAlign: 'center', borderTop: '2px solid var(--bullish)', background: 'rgba(74,222,128,0.04)', borderRadius: '0 0 6px 6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Volume &gt; MA20</div>
            <div style={{ fontSize: '11px', color: 'var(--bullish)', fontWeight: 600 }}>= Volume Besar (Relatif)</div>
          </div>
          <div style={{ padding: '14px', textAlign: 'center', borderTop: '2px solid var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 6px 6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Volume &lt; MA20</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>= Volume Kecil (Relatif)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 16px', background: 'rgba(96, 165, 250, 0.06)', borderRadius: '6px', borderLeft: '2px solid var(--info)' }}>
          <BookOpen size={14} color="var(--info)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Aturan praktis: bandingkan dengan <strong>Moving Average Volume 20 (MA20)</strong>. Volume yang menembus garis MA20 dianggap relatif besar. Lebih objektif daripada menebak secara visual.
          </div>
        </div>
      </div>
    );
  }

  // Chapter 7: Summary & Golden Rule
  if (chapterId === 7) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Summary</h2>
        
        <div style={{ padding: '24px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bullish)', marginBottom: '4px' }}>Volume = Confirmation</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>NOT Signal</div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Volume wajib digunakan untuk mengkonfirmasi:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Kekuatan Trend', 'Validitas Breakout', 'Validitas Breakdown', 'Akurasi Chart Pattern', 'Potensi Reversal', 'Indikasi False Break'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '100px', fontSize: '11px' }}>
                <CheckCircle size={11} color="var(--bullish)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.06) 0%, transparent 100%)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Golden Rule
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.6', marginBottom: '12px' }}>
            Jangan pernah membeli saham HANYA karena volumenya tiba-tiba naik tajam.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
            Volume tinggi tanpa alasan teknikal yang jelas seringkali merupakan <strong style={{ color: 'var(--bearish)' }}>jebakan distribusi</strong>. Volume harus selalu dikombinasikan dengan:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Trend', 'Support / Resistance', 'Chart Pattern', 'Price Action'].map((t, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning)', padding: '4px 10px', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '4px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
