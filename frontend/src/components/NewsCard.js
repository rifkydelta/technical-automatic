import { ExternalLink, Loader2, Newspaper } from 'lucide-react';

export default function NewsCard({ newsData, isLoading, ticker }) {
  
  const getSource = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  };

  if (!newsData && !isLoading) return null;

  return (
    <div className="card flex-col" style={{ padding: '24px', height: '100%' }}>
      <div className="flex-row items-center gap-sm" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/>
          <path d="M15 18h-5"/>
          <path d="M10 6h8v4h-8V6Z"/>
        </svg>
        <h3 className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
          LATEST NEWS & CATALYSTS {ticker ? `- ${ticker.toUpperCase()}` : ''}
        </h3>
        {isLoading && <Loader2 size={14} className="animate-spin text-secondary ml-auto" />}
      </div>

      <div className="flex-col gap-sm">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ 
              height: '42px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              borderRadius: '8px',
              animation: 'skeleton-pulse 2s infinite'
            }} />
          ))
        ) : newsData && newsData.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {newsData.map((news, i) => (
              <a 
                key={i} 
                href={news.url} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <div className="flex-col" style={{ overflow: 'hidden', gap: '8px', flex: 1 }}>
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '13px', 
                    fontWeight: '500',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {news.title}
                  </span>
                  <div className="flex-row items-center justify-between" style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ opacity: 0.8 }}>{getSource(news.url)}</span>
                    {news.date && (
                      <span style={{ opacity: 0.8 }}>{news.date}</span>
                    )}
                  </div>
                </div>
                <ExternalLink size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
              </a>
            ))}
          </div>
        ) : (
          <div className="flex-col items-center justify-center" style={{ padding: '32px 0', opacity: 0.5 }}>
            <Newspaper size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <span className="text-sm font-mono text-muted uppercase tracking-wider">No recent news found in sitemaps</span>
          </div>
        )}
      </div>
    </div>
  );
}