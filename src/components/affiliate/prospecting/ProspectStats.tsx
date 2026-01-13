import { 
  Target, 
  Search, 
  FileCheck, 
  Send, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  TrendingUp 
} from 'lucide-react';
import { ProspectStats as Stats } from './types';

interface ProspectStatsProps {
  stats: Stats;
}

export const ProspectStats = ({ stats }: ProspectStatsProps) => {
  const statCards = [
    { label: 'Total', value: stats.total, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pendentes', value: stats.pending, icon: Search, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Propostas', value: stats.proposal_ready, icon: FileCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Enviadas', value: stats.sent, icon: Send, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Respostas', value: stats.replied, icon: MessageCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Convertidos', value: stats.converted, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Falhas', value: stats.failed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Score Médio', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card rounded-lg border border-border p-3 text-center"
          >
            <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};
