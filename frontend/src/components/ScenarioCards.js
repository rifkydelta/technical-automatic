import { Target, GitBranch, AlertTriangle } from 'lucide-react';

export default function ScenarioCards({ data }) {
  if (!data || !data.scenarios) return null;

  const { primary, alternative, worst_case } = data.scenarios;

  const ScenarioCard = ({ scenario, icon: Icon, color, title }) => {
    return (
      <div className="card flex-col gap-sm" style={{ 
        borderTop: `4px solid ${color}`,
        position: 'relative',
        padding: '20px'
      }}>
        <div className="flex-row justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex-row gap-sm items-center">
            <Icon size={16} color={color} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: color }}>
              {title}
            </span>
          </div>
          <div className="text-xs font-mono font-bold" style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '2px 6px', 
            borderRadius: '4px' 
          }}>
            {scenario.probability}%
          </div>
        </div>

        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '16px' }}>
          {scenario.description || 'Description not available.'}
        </div>

        <div className="flex-col mt-auto" style={{ gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          <div className="text-xs text-muted">
            <span className="font-semibold text-secondary">Trigger:</span> {scenario.trigger}
          </div>
          <div className="text-xs text-muted">
            <span className="font-semibold text-secondary">Target:</span> {scenario.target}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-col gap-md" style={{ marginBottom: '24px' }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase text-secondary">
        Market Scenarios Outlook
      </h3>
      <div className="grid-3-cols">
        <ScenarioCard 
          scenario={primary} 
          icon={Target} 
          color="var(--info)" 
          title="Utama" 
        />
        <ScenarioCard 
          scenario={alternative} 
          icon={GitBranch} 
          color="#f97316" 
          title="Alternatif" 
        />
        <ScenarioCard 
          scenario={worst_case} 
          icon={AlertTriangle} 
          color="var(--bearish)" 
          title="Worst Case" 
        />
      </div>
    </div>
  );
}
