import React, { useState } from 'react';
import { Info, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import InteractiveSVGDiagram from './InteractiveSVGDiagram';
import IndicatorExplorer from './IndicatorExplorer';
import IndicatorComparison from './IndicatorComparison';
import TradingStyleRecommendation from './TradingStyleRecommendation';

export default function IndicatorsChapter({ chapterId }) {
  // Chapter 1: Introduction
  if (chapterId === 1) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Introduction to Technical Indicators</h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Indikator Teknikal merupakan formula perhitungan matematis berdasarkan data historis harga (open, high, low, close) dan terkadang volume transaksi. Indikator berguna untuk membantu trader menyaring fluktuasi harga jangka pendek sehingga dapat mengamati kondisi pasar yang sebenarnya.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <div className="ide-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--info)', fontFamily: 'monospace', fontWeight: 'bold' }}>FUNGSI UTAMA INDIKATOR</span>
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Mengidentifikasi arah tren pasar secara objektif.</li>
              <li>Mengukur tingkat momentum dan kecepatan pergerakan harga.</li>
              <li>Mengukur volatilitas untuk memprediksi potensi pembalikan atau lonjakan harga.</li>
              <li>Mengidentifikasi titik overbought (jenuh beli) dan oversold (jenuh jual).</li>
            </ul>
          </div>

          <div style={{ padding: '24px', background: 'rgba(96, 165, 250, 0.05)', border: '1px dashed rgba(96,165,250,0.2)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Indicator</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bearish)', marginBottom: '12px' }}>≠ Buy Signal (Sinyal Beli Mutlak)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Indicator</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--info)' }}>= Decision Support (Alat Pengambil Keputusan)</div>
          </div>
        </div>

        <div style={{ marginTop: '12px', padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--info)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Struktur Pengambilan Keputusan Trading yang Ideal:
          </div>
          
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 600 }}>
              <span>Trend Utama</span>
              <span style={{ color: 'var(--text-muted)' }}>+</span>
              <span>Price Action</span>
              <span style={{ color: 'var(--text-muted)' }}>+</span>
              <span>Volume</span>
              <span style={{ color: 'var(--text-muted)' }}>+</span>
              <span style={{ color: 'var(--info)' }}>Indicator</span>
              <span style={{ color: 'var(--text-muted)' }}>=</span>
              <span style={{ color: 'var(--bullish)', fontWeight: 700 }}>High Probability Setup</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chapter 2: Lagging vs Leading
  if (chapterId === 2) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Lagging vs Leading Indicators</h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Berdasarkan sifat responsnya terhadap harga, indikator teknikal terbagi menjadi dua kategori utama. Memahami perbedaan ini sangat krusial agar Anda tidak salah menafsirkan sinyal yang diberikan.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
          <div className="ide-panel" style={{ padding: '20px', borderTop: '3px solid #60a5fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#60a5fa' }}>Lagging Indicator</span>
              <span style={{ fontSize: '9px', fontWeight: 600, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px' }}>CONFIRMATION</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Bereaksi <strong>setelah</strong> pergerakan harga terjadi. Indikator ini menghitung rata-rata pergerakan masa lalu untuk mengonfirmasi bahwa suatu tren telah terbentuk.
            </p>
            <ul style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '16px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Mengikuti arah tren harga (Trend Following).</li>
              <li>Memiliki keandalan sinyal lebih stabil (sedikit false signals).</li>
              <li>Contoh: Moving Average (MA), MACD, Bollinger Bands.</li>
            </ul>
          </div>

          <div className="ide-panel" style={{ padding: '20px', borderTop: '3px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>Leading Indicator</span>
              <span style={{ fontSize: '9px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>PREDICTION</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Mengukur momentum kecepatan harga untuk mendeteksi potensi pembalikan arah (reversal) <strong>sebelum</strong> hal tersebut terjadi pada chart utama.
            </p>
            <ul style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '16px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Mengukur area jenuh beli (overbought) dan jenuh jual (oversold).</li>
              <li>Memberikan sinyal lebih awal, namun memiliki risiko false signals yang lebih tinggi.</li>
              <li>Contoh: RSI (Relative Strength Index), Fibonacci Retracement.</li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="ide-panel" style={{ padding: '16px 20px', marginTop: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>Karakteristik</th>
                <th style={{ padding: '10px 8px', color: '#60a5fa', fontWeight: 600 }}>Lagging (Pengikut Tren)</th>
                <th style={{ padding: '10px 8px', color: '#10b981', fontWeight: 600 }}>Leading (Oscillator Momentum)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>Fokus Utama</td>
                <td style={{ padding: '10px 8px' }}>Konfirmasi kelanjutan atau awal tren baru</td>
                <td style={{ padding: '10px 8px' }}>Prediksi batas pembalikan harga (reversal)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>Kecepatan Sinyal</td>
                <td style={{ padding: '10px 8px' }}>Lambat (delay), menunggu data terakumulasi</td>
                <td style={{ padding: '10px 8px' }}>Cepat, langsung bereaksi terhadap laju momentum</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>Kecocokan Gaya</td>
                <td style={{ padding: '10px 8px' }}>Swing Trading, Trend Following</td>
                <td style={{ padding: '10px 8px' }}>Scalping, Active Trading, Timing Entry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Chapter 3: Moving Average (MA)
  if (chapterId === 3) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Moving Average (MA)</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
              Moving Average (MA) menghitung rata-rata harga penutupan suatu aset selama periode waktu tertentu. Indikator ini bertindak sebagai support dan resistance dinamis serta penentu arah tren pasar secara objektif.
            </p>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Periode MA Standar & Kegunaan</div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>MA5 / MA20</strong>: Untuk mengukur tren jangka pendek (scalping/day trading).</li>
                <li><strong>MA50</strong>: Untuk tren jangka menengah (swing trading).</li>
                <li><strong>MA200</strong>: Untuk mengidentifikasi tren jangka panjang (major trend).</li>
              </ul>
            </div>

            <div className="ide-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '8px' }}>GOLDEN CROSS VS DEATH CROSS</div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                <strong>Golden Cross</strong> terjadi saat MA pendek memotong MA panjang ke atas (sinyal bullish kuat). Sebaliknya, <strong>Death Cross</strong> terjadi saat MA pendek memotong MA panjang ke bawah (sinyal bearish kuat).
              </p>
            </div>
          </div>

          {/* Visual Diagram */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>VISUALISASI GOLDEN CROSS</span>
            <InteractiveSVGDiagram type="crossover" />
          </div>
        </div>
      </div>
    );
  }

  // Chapter 4: MACD
  if (chapterId === 4) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>MACD (Moving Average Convergence Divergence)</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
              MACD dikembangkan oleh Gerald Appel untuk mengukur momentum harga sekaligus arah tren secara dinamis. MACD dihitung dari selisih dua Exponential Moving Average yang berbeda periode.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--info)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>MACD LINE</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mengukur momentum harga (selisih EMA12 - EMA26).</span>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--warning)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>SIGNAL LINE</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EMA 9 dari MACD Line untuk konfirmasi crossover.</span>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>ZERO LINE</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Titik tengah. MACD &gt; 0 = Bullish; MACD &lt; 0 = Bearish.</span>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--bullish)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>HISTOGRAM</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Selisih tinggi garis MACD dengan Signal Line (kekuatan tren).</span>
              </div>
            </div>

            <div className="ide-panel" style={{ padding: '16px', background: 'rgba(16,185,129,0.02)', borderLeft: '2px solid var(--bullish)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bullish)', display: 'block', marginBottom: '4px' }}>BULLISH DIVERGENCE</span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Terjadi saat chart harga membuat <strong>Lower Low</strong> (puncak lembah menurun), namun indikator MACD justru membentuk <strong>Higher Low</strong> (puncak lembah naik). Sinyal ini menunjukkan tekanan jual melemah dan potensi pembalikan arah naik.
              </p>
            </div>
          </div>

          {/* Visual Diagram */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>VISUALISASI DIVERGENCE</span>
            <InteractiveSVGDiagram type="macd-divergence" />
          </div>
        </div>
      </div>
    );
  }

  // Chapter 5: Bollinger Bands
  if (chapterId === 5) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Bollinger Bands</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
              Bollinger Bands terdiri dari saluran harga yang melebar dan menyempit dinamis berdasarkan standar deviasi harga. Indikator ini sangat berguna untuk mendeteksi perubahan volatilitas pasar secara instan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Bollinger Bands Squeeze (Penyempitan)</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                  Saat band menyempit secara ekstrem, itu berarti volatilitas pasar sedang sangat rendah (fase konsolidasi ketat). Biasanya, fase ini akan diikuti oleh pergerakan harga menembus batas atas (breakout) atau bawah (breakdown) dengan sangat agresif.
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Mean Reversion (Kembali ke Rata-Rata)</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                  Harga cenderung memiliki memori untuk kembali ke area rata-rata pergerakannya (Middle Band) apabila sudah menyentuh batas ekstrem (Upper atau Lower Band).
                </p>
              </div>
            </div>
          </div>

          {/* Visual Diagram */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>VISUALISASI BB SQUEEZE</span>
            <InteractiveSVGDiagram type="bb-squeeze" />
          </div>
        </div>
      </div>
    );
  }

  // Chapter 6: RSI
  if (chapterId === 6) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>RSI (Relative Strength Index)</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
              RSI mengukur kecepatan serta besar perubahan harga dalam skala 0 hingga 100. RSI bertindak sebagai leading indicator untuk memperkirakan kejenuhan harga pasar.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="ide-panel" style={{ padding: '16px', borderTop: '2px solid var(--bearish)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bearish)', display: 'block', marginBottom: '4px' }}>OVERBOUGHT (&gt;70)</span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  Kondisi Jenuh Beli. Tekanan beli sudah terlalu tinggi secara relatif, sering memicu terjadinya koreksi turun (pullback).
                </p>
              </div>

              <div className="ide-panel" style={{ padding: '16px', borderTop: '2px solid var(--bullish)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bullish)', display: 'block', marginBottom: '4px' }}>OVERSOLD (&lt;30)</span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  Kondisi Jenuh Jual. Tekanan jual sudah terlalu ekstrem secara relatif, sering memicu terjadinya pantulan naik (rebound).
                </p>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertTriangle size={14} color="var(--bearish)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Peringatan Tren Kuat:</strong> Pada pasar yang sedang berada dalam tren naik (uptrend) kuat, RSI dapat bertahan di area overbought (&gt;70) untuk jangka waktu yang sangat lama. Jangan terburu-buru melakukan penjualan jika tidak ada konfirmasi price action yang berbalik arah.
              </div>
            </div>
          </div>

          {/* Visual Diagram */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>VISUALISASI RSI LIMITS</span>
            <InteractiveSVGDiagram type="rsi-thresholds" />
          </div>
        </div>
      </div>
    );
  }

  // Chapter 7: Fibonacci Retracement
  if (chapterId === 7) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Fibonacci Retracement</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Info */}
          <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
              Fibonacci Retracement adalah **alat bantu gambar (drawing tool)** berdasarkan rasio matematis deret Fibonacci. Berbeda dengan indikator otomatis, alat ini membantu trader memetakan area support dan resistance potensial secara manual di chart harga.
            </p>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Rasio Retracement Kunci</div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>38.2%</strong>: Koreksi dangkal. Terjadi pada tren yang sangat kuat.</li>
                <li><strong>50.0%</strong>: Koreksi menengah. Sering menjadi area konsolidasi penting.</li>
                <li><strong>61.8% (Golden Ratio)</strong>: Koreksi ideal. Tingkat probabilitas pantulan (rebound) paling tinggi.</li>
              </ul>
            </div>

            <div className="ide-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--info)', display: 'block', marginBottom: '6px' }}>CARA MENGGAMBAR:</span>
              <ul style={{ fontSize: '11.5px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Pada Uptrend:</strong> Tarik dari Swing Low (titik terendah) ke Swing High (titik tertinggi).</li>
                <li><strong>Pada Downtrend:</strong> Tarik dari Swing High (titik tertinggi) ke Swing Low (titik terendah).</li>
              </ul>
            </div>
          </div>

          {/* Visual Diagram */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>VISUALISASI FIBONACCI PULLBACK</span>
            <InteractiveSVGDiagram type="fibonacci" />
          </div>
        </div>
      </div>
    );
  }

  // Chapter 8: How to Combine Indicators
  if (chapterId === 8) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>How to Combine Indicators</h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          Kombinasikan indikator yang berbeda jenis untuk saling mendukung keputusan trading Anda, bukan menumpuk indikator sejenis yang justru memicu bias konfirmasi ganda.
        </p>

        {/* Workflow Diagram */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', flexWrap: 'wrap', gap: '8px' }}>
          {['Trend (MA200)', 'Support / Resistance', 'Volume Confirmation', 'Price Action (Candle)', 'Indicator (RSI/MACD)', 'Decision'].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step}</div>
              {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Style Recommendations component inside Chapter 8 */}
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Trading Style Setup Selector</h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Pilih gaya trading Anda di bawah ini untuk melihat kombinasi indikator dan panduan aturan bakunya:
          </p>
          <TradingStyleRecommendation />
        </div>
      </div>
    );
  }

  // Chapter 9: Common Mistakes
  if (chapterId === 9) {
    return (
      <div className="flex-col fade-in" style={{ gap: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Common Mistakes in Using Indicators</h2>
        
        <div className="ide-panel" style={{ padding: '24px', borderLeft: '3px solid var(--bearish)', background: 'rgba(239,68,68,0.01)' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bearish)', display: 'block', marginBottom: '16px' }}>
            Hindari Kesalahan Fatal Ini:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--bearish)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>X</div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Terlalu Banyak Indikator (Analysis Paralysis)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Menumpuk lebih dari 4 indikator di chart sehingga sinyal saling bertentangan dan memicu keraguan saat entry.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--bearish)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>X</div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Membeli Hanya Karena Indikator Ekstrem</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Melakukan buy hanya karena RSI oversold atau sell karena RSI overbought tanpa mengindahkan tren utama yang sedang berlangsung.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--bearish)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>X</div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Mengabaikan Volume dan Tren Utama</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Menggunakan oscillator leading saat pasar sedang dalam kondisi crash/panic sell, memicu sinyal beli palsu berulang.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--bearish)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>X</div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Tidak Menggunakan Proteksi Batas Rugi</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Menganggap indikator 100% selalu benar dan mengabaikan stop loss pengaman saat harga berbalik arah secara drastis.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', textAlign: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>PERINGATAN EMAS</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>Indicator ≠ Prediction Tool (Bukan Alat Peramal)</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Indicator = Probability Calculator (Alat Pengukur Probabilitas)</div>
        </div>
      </div>
    );
  }

  // Chapter 10: Summary
  if (chapterId === 10) {
    return (
      <div className="flex-col fade-in" style={{ gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Summary & Golden Rules</h2>
        
        {/* Core summary table */}
        <div className="ide-panel" style={{ overflowX: 'auto', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Ringkasan Tipe Indikator</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', color: 'var(--text-secondary)', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Indikator</th>
                <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Tipe</th>
                <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Fungsi Utama</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>Moving Average (MA)</td>
                <td style={{ padding: '8px', color: '#60a5fa' }}>Lagging (Confirmation)</td>
                <td style={{ padding: '8px' }}>Membaca Tren & Support/Resistance Dinamis</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>MACD</td>
                <td style={{ padding: '8px', color: '#60a5fa' }}>Lagging (Confirmation)</td>
                <td style={{ padding: '8px' }}>Mengukur Momentum Tren & Divergence Reversal</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>Bollinger Bands</td>
                <td style={{ padding: '8px', color: '#60a5fa' }}>Lagging (Confirmation)</td>
                <td style={{ padding: '8px' }}>Mengukur Volatilitas Dinamis & Breakout Squeeze</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>RSI</td>
                <td style={{ padding: '8px', color: '#10b981' }}>Leading (Prediction)</td>
                <td style={{ padding: '8px' }}>Mendeteksi Kejenuhan Beli/Jual & Divergence Reversal</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>Fibonacci Retracement</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>Drawing Tool</td>
                <td style={{ padding: '8px' }}>Menentukan Target Level Support/Resistance Koreksi</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Golden rule card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="ide-panel" style={{ padding: '20px', borderLeft: '2px solid var(--warning)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Golden Rules of Trading
            </span>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Gunakan indikator murni sebagai alat bantu visualisasi data harga historis demi memperkirakan tingkat probabilitas saat ini. Jangan pernah menggantungkan keputusan jual/beli secara otomatis tanpa menganalisis Price Action utama, support/resistance, dan volume pasar.
            </p>
          </div>
          
          <div className="ide-panel" style={{ padding: '20px', borderLeft: '2px solid var(--bullish)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--bullish)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RUMUS PROBABILITAS TINGGI
            </span>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Price Action + Trend + Volume + Indicator = High Probability Setup
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Selalu letakkan manajemen risiko (stop loss & target risk-reward minimum 1:2) di atas segalanya saat Anda bertransaksi di pasar keuangan.
            </p>
          </div>
        </div>

        {/* Interactive Explorer / Comparison tool at summary step */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--info)" /> Interactive Exploration & Comparison Mode
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Tinjau ulang konsep indikator, kelebihannya, dan bandingkan secara berdampingan sebelum Anda lanjut menyelesaikan kuis simulator di bab selanjutnya.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '8px' }}>
            <IndicatorExplorer />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Bandingkan Indikator Berdampingan</h4>
              <IndicatorComparison />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
