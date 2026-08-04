export default function LoadingState() {
  return (
    <div className="flex-col gap-md" style={{ padding: '32px' }}>
      {/* Header Skeleton */}
      <div className="card" style={{ height: '100px', animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      
      {/* TopCards Skeleton */}
      <div className="bento-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card flex-col justify-between" style={{ gridColumn: 'span 1', height: '135px', animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <div style={{ width: '65%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div className="flex-col gap-xs mt-auto">
              <div style={{ width: '85%', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
              <div style={{ width: '55%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '6px' }}></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart Skeleton */}
      <div className="card" style={{ height: '400px', animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      
      {/* 2 Cols Skeleton */}
      <div className="grid-2-cols">
         <div className="card" style={{ height: '250px', animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
         <div className="card" style={{ height: '250px', animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; background-color: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); }
          50% { opacity: 0.5; background-color: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
        }
      `}} />
    </div>
  );
}
