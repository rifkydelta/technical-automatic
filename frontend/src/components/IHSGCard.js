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
        now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + 
        ' - ' + 
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
        console.error("Failed to fetch IHSG:", err);
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
      <div style={{
        maxWidth: '440px',
        width: '100%',
        marginBottom: '24px',
        padding: '16px 24px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'skeleton-pulse 2s infinite',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '14px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            <div style={{ width: '130px', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
          </div>
          <div style={{ width: '160px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ width: '120px', height: '26px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }} />
          <div style={{ width: '140px', height: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isUp = data.change >= 0;
  const color = isUp ? 'var(--bullish)' : 'var(--bearish)';
  const Icon = isUp ? TrendingUp : TrendingDown;
  const sign = isUp ? '+' : '';

  return (
    <div style={{
      maxWidth: '440px',
      width: '100%',
      marginBottom: '24px',
      padding: '16px 24px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
            IHSG (COMPOSITE)
          </span>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: '1' }}>
          {data.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', 
          backgroundColor: isUp ? 'rgba(0,255,128,0.1)' : 'rgba(244,63,94,0.1)',
          padding: '6px 12px',
          borderRadius: '20px',
          color, 
          border: `1px solid ${isUp ? 'rgba(0,255,128,0.2)' : 'rgba(244,63,94,0.2)'}`
        }}>
          <Icon size={14} strokeWidth={3} />
          <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            {sign}{data.change.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({sign}{data.change_pct.toFixed(2)}%)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
          <Clock size={10} />
          <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{time || data.timestamp}</span>
        </div>
      </div>
    </div>
  );
}
