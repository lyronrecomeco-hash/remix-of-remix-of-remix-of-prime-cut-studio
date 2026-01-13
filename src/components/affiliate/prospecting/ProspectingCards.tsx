import { 
  Search, 
  FileText, 
  History, 
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Prospect, ProspectStatus } from './types';

interface ProspectingCardsProps {
  affiliateId: string;
  prospects: Prospect[];
  activeTab: 'cards' | 'search' | 'proposal' | 'history';
  onTabChange: (tab: 'cards' | 'search' | 'proposal' | 'history') => void;
}

const CARDS = [
  {
    id: 'search' as const,
    title: 'Buscar Clientes',
    description: 'Encontre estabelecimentos reais por cidade e nicho',
    icon: Search,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/5',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    stats: 'Google Maps',
  },
  {
    id: 'proposal' as const,
    title: 'Criar Proposta',
    description: 'Gere propostas personalizadas com IA',
    icon: FileText,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/5',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    stats: 'IA Avançada',
  },
  {
    id: 'history' as const,
    title: 'Histórico',
    description: 'Gerencie todos os seus prospects',
    icon: History,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    stats: 'Prospects',
  },
];

export const ProspectingCards = ({
  prospects,
  onTabChange,
}: ProspectingCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const count = card.id === 'history' ? prospects.length : null;
        
        return (
          <Card
            key={card.id}
            className={`group relative overflow-hidden border-2 ${card.borderColor} bg-gradient-to-br ${card.bgGradient} cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
            onClick={() => onTabChange(card.id)}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.gradient} blur-3xl -z-10`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {count !== null && (
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all duration-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-foreground/90 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {card.description}
              </p>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${card.gradient} text-white text-xs font-medium`}>
                {card.stats}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
