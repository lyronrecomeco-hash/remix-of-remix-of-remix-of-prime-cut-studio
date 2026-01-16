import { 
  Search, 
  FileText, 
  History, 
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  Layout,
  Radar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Prospect } from './types';
import { GlobalRadarCard } from './GlobalRadarCard';

interface ProspectingCardsProps {
  affiliateId: string;
  prospects: Prospect[];
  activeTab: 'cards' | 'search' | 'proposal' | 'history' | 'templates' | 'radar';
  onTabChange: (tab: 'cards' | 'search' | 'proposal' | 'history' | 'templates' | 'radar') => void;
  onAddProspect?: (data: any) => Promise<unknown>;
}

export const ProspectingCards = ({
  affiliateId,
  prospects,
  onTabChange,
  onAddProspect,
}: ProspectingCardsProps) => {
  const pendingCount = prospects.filter(p => p.status === 'pending').length;
  const proposalReadyCount = prospects.filter(p => p.status === 'proposal_ready' || p.status === 'analyzed').length;

  const handleAcceptRadarOpportunity = async (opportunity: any) => {
    if (!onAddProspect) return;
    
    await onAddProspect({
      company_name: opportunity.company_name,
      company_phone: opportunity.company_phone,
      company_website: opportunity.company_website,
      company_address: opportunity.company_address,
      company_city: opportunity.company_city,
      niche: opportunity.niche,
      source: 'radar',
      analysis_score: opportunity.opportunity_score,
    });
  };

  const CARDS = [
    {
      id: 'search' as const,
      title: 'Buscar Clientes',
      description: 'Encontre estabelecimentos reais por cidade e nicho no Google',
      icon: Search,
      badge: 'Google Places',
      badgeClass: 'bg-primary/10 text-primary border-primary/30',
    },
    {
      id: 'proposal' as const,
      title: 'Criar Proposta',
      description: 'Gere propostas personalizadas com IA para cada cliente',
      icon: FileText,
      badge: 'Luna AI',
      badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    },
    {
      id: 'templates' as const,
      title: 'Modelos Prontos',
      description: 'Templates profissionais por nicho com Prompt Builder inteligente',
      icon: Layout,
      badge: 'Prompt Builder',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    },
    {
      id: 'history' as const,
      title: 'Histórico',
      description: 'Gerencie todos os prospects salvos e acompanhe o status',
      icon: History,
      badge: `${prospects.length} prospects`,
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      extraInfo: pendingCount > 0 ? `${pendingCount} pendentes` : proposalReadyCount > 0 ? `${proposalReadyCount} prontos` : null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Card especial do Radar Global */}
      <GlobalRadarCard 
        affiliateId={affiliateId} 
        onAcceptOpportunity={handleAcceptRadarOpportunity}
      />
      
      {/* Cards normais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          
          return (
            <Card
              key={card.id}
              className="group relative overflow-hidden border border-border bg-card cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => onTabChange(card.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {card.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${card.badgeClass}`}>
                    {card.badge}
                  </Badge>
                  {card.extraInfo && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {card.extraInfo}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
