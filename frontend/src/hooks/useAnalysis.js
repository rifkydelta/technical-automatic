'use client';
import { useState } from 'react';
import { analyzeStock } from '../lib/api';

export function useAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performAnalysis = async (ticker, orderFlow) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeStock(ticker, orderFlow);
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setData(null);
    setError(null);
  };

  return { data, loading, error, performAnalysis, resetAnalysis };
}
