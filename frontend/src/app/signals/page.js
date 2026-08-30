'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignalDashboard from '@/components/SignalDashboard';

export default function SignalsPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Live Signal Scanner | IDX Terminal';
  }, []);

  return (
    <main className="dashboard-container" style={{ paddingBottom: '60px' }}>
      <SignalDashboard
        onTickerSelect={(ticker) => {
          router.push(`/analysis/${ticker}`);
        }}
        onSelectTicker={(ticker) => {
          router.push(`/analysis/${ticker}`);
        }}
      />
    </main>
  );
}
