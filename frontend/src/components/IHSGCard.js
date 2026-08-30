'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

export default function IHSGCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState('');

  // Live ticking clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll API every 1 second
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    async function fetchIHSG() {
      try {
        const res = await fetch(`${API_URL}/api/market/ihsg`);
        const json = await res.json();
        if (!json.error) {
          setData(json);
        }
      } catch (err) {
        // silently ignore polling error
      } finally {
        if (loading) setLoading(false);
      }
    }
    
    fetchIHSG();
    const interval = setInterval(fetchIHSG, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading && !data) {
    return (
      <div
        style={{
          width: '100%',
          marginBottom: '14px',
          padding: '14px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'skeleton-pulse 2s infinite',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '110px', height: '10px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
          <div style={{ width: '130px', height: '24px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '6px' }} />
        </div>
        <div style={{ width: '110px', height: '24px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '20px' }} />
      </div>
    );
  }

  if (!data) return null;

  const isUp = data.change >= 0;
  const color = isUp ? 'var(--bullish)' : 'var(--bearish)';
  const Icon = isUp ? TrendingUp : TrendingDown;
  const sign = isUp ? '+' : '';

  return (
    <div
      style={{
        width: '100%',
        marginBottom: '14px',
        padding: '14px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        transition: 'border-color 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%' }} />
          <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            IHSG • COMPOSITE
          </span>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-mono)', lineHeight: '1.1' }}>
          {data.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px', 
            backgroundColor: isUp ? 'rgba(74, 222, 128, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            padding: '4px 10px',
            borderRadius: '20px',
            color: color, 
            border: `1px solid ${isUp ? 'rgba(74, 222, 128, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
          }}
        >
          <Icon size={12} strokeWidth={2.5} />
          <span style={{ fontSize: '12px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
            {sign}{data.change.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({sign}{data.change_pct.toFixed(2)}%)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>
          <Clock size={9} />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
