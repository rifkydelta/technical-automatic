'use client';
import React, { useEffect } from 'react';
import LearningCenter from '@/components/LearningCenter';

export default function LearningPage() {
  useEffect(() => {
    document.title = 'Learning Center & Panduan Teknikal | IDX Terminal';
  }, []);

  return (
    <main className="dashboard-container" style={{ paddingBottom: '60px' }}>
      <LearningCenter />
    </main>
  );
}
