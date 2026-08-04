const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeStock(ticker, orderFlow = null) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, order_flow: orderFlow }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || await res.text());
  }
  return res.json();
}

export async function getTickerInfo(ticker) {
  const res = await fetch(`${API_BASE}/api/ticker-info/${ticker}`);
  if (!res.ok) throw new Error('Failed to fetch ticker info');
  return res.json();
}
