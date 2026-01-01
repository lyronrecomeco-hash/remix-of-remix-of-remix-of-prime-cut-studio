import { FileText, Send, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProposalsStatsProps {
  stats: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    cancelled: number;
  };
}

export function ProposalsStats({ stats }: ProposalsStatsProps) {
  const statItems = [
    { 
      label: 'Total', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-primary',
      bgColor: 'bg-primary/10' 
    },
    { 
      label: 'Em Elaboração', 
      value: stats.draft, 
      icon: FileText, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30' 
    },
    { 
      label: 'Enviadas', 
      value: stats.sent, 
      icon: Send, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30' 
    },
    { 
      label: 'Aceitas', 
      value: stats.accepted, 
      icon: CheckCircle, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
