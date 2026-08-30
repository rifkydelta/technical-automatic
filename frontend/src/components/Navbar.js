'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Terminal,
  Radio,
  Search,
  BookOpen,
  Layers,
  Zap,
  ArrowRight,
  Clock,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, text: 'IDX Closed', timeStr: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // 1. Calculate IDX Market Session (WIB / UTC+7)
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      // Convert to WIB (UTC+7)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const wibDate = new Date(utc + (3600000 * 7));
      
      const day = wibDate.getDay(); // 0 = Sun, 6 = Sat
      const hours = wibDate.getHours();
      const minutes = wibDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

      // IDX Trading Hours: Monday(1) - Friday(5)
      // Session 1: 09:00 - 12:00 (540 - 720 mins) (Friday 09:00 - 11:30 -> 540 - 690)
      // Session 2: 13:30 - 16:00 (810 - 960 mins) (Friday 14:00 - 16:00 -> 840 - 960)
      let isOpen = false;
      if (day >= 1 && day <= 5) {
        if (day === 5) {
          // Friday
          if ((totalMinutes >= 540 && totalMinutes <= 690) || (totalMinutes >= 840 && totalMinutes <= 960)) {
            isOpen = true;
          }
        } else {
          // Monday - Thursday
          if ((totalMinutes >= 540 && totalMinutes <= 720) || (totalMinutes >= 810 && totalMinutes <= 960)) {
            isOpen = true;
          }
        }
      }

      setMarketStatus({
        isOpen,
        text: isOpen ? 'IDX Buka' : 'IDX Tutup',
        timeStr
      });
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // 2. Global Keydown Shortcut ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanTicker = searchQuery.trim().toUpperCase();
    if (cleanTicker) {
      if (cleanTicker.includes(',')) {
        router.push(`/screener?tickers=${cleanTicker}`);
      } else {
        router.push(`/analysis/${cleanTicker}`);
      }
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    {
      href: '/',
      label: 'Live Terminal',
      icon: Terminal,
      active: pathname === '/'
    },
    {
      href: '/signals',
      label: 'Live Signal',
      icon: Radio,
      active: pathname.startsWith('/signals'),
      badge: 'LIVE'
    },
    {
      href: '/screener',
      label: 'Screener & Presets',
      icon: Layers,
      active: pathname.startsWith('/screener')
    },
    {
      href: '/learning',
      label: 'Learning Center',
      icon: BookOpen,
      active: pathname.startsWith('/learning')
    }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(8, 11, 18, 0.88)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Left: Brand Logo & Desktop Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.45)'
            }}
          >
            <Zap size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.02em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              IDX <span style={{ color: 'var(--bullish)', fontWeight: '900' }}>TERMINAL</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '-2px' }}>
              PRO ALGORITHMIC INTELLIGENCE
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: item.active ? '700' : '500',
                  textDecoration: 'none',
                  color: item.active ? '#ffffff' : 'var(--text-secondary)',
                  background: item.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: item.active ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid transparent',
                  boxShadow: item.active ? '0 2px 12px rgba(0, 0, 0, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={item.active ? (item.href === '/signals' ? '#60a5fa' : 'var(--bullish)') : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(74, 222, 128, 0.2)',
                      color: 'var(--bullish)',
                      border: '1px solid rgba(74, 222, 128, 0.35)',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Market Status Pill & Quick Search Form */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* IDX Market Status Badge */}
        <div
          className="desktop-market-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: marketStatus.isOpen ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${marketStatus.isOpen ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: marketStatus.isOpen ? 'var(--bullish)' : 'var(--text-muted)',
              boxShadow: marketStatus.isOpen ? '0 0 8px var(--bullish)' : 'none'
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: '700', color: marketStatus.isOpen ? 'var(--bullish)' : 'var(--text-secondary)' }}>
            {marketStatus.text}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {marketStatus.timeStr}
          </span>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '6px 12px',
              width: '260px',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari emiten (e.g. BBCA, VKTR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'monospace',
                width: '100%'
              }}
            />
            {searchQuery ? (
              <button
                type="submit"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--bullish)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowRight size={13} />
              </button>
            ) : (
              <kbd
                style={{
                  padding: '2px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                /
              </kbd>
            )}
          </div>
        </form>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
