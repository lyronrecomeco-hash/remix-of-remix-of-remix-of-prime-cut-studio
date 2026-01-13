import { useState } from 'react';
import { 
  Search, 
  FileText, 
  History, 
  ChevronRight,
  X,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SearchClientsPanel } from './panels/SearchClientsPanel';
import { CreateProposalPanel } from './panels/CreateProposalPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { Prospect, ProspectStatus } from './types';

interface ProspectingCardsProps {
  affiliateId: string;
  prospects: Prospect[];
  loading: boolean;
  analyzing: boolean;
  sending: boolean;
  onCreateProspect: (data: any) => Promise<unknown>;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  onView: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
}

type ActivePanel = 'search' | 'proposal' | 'history' | null;

const CARDS = [
  {
    id: 'search' as const,
    title: 'Buscar Clientes',
    description: 'Encontre estabelecimentos reais por cidade e nicho',
    icon: Search,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/5',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    stats: 'Google Places',
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
  affiliateId,
  prospects,
  loading,
  analyzing,
  sending,
  onCreateProspect,
  onAnalyze,
  onSend,
  onView,
  onDelete,
  onUpdateStatus,
}: ProspectingCardsProps) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const renderPanel = () => {
    switch (activePanel) {
      case 'search':
        return (
          <SearchClientsPanel
            affiliateId={affiliateId}
            onAddProspect={onCreateProspect}
            onClose={() => setActivePanel(null)}
          />
        );
      case 'proposal':
        return (
          <CreateProposalPanel
            affiliateId={affiliateId}
            onClose={() => setActivePanel(null)}
          />
        );
      case 'history':
        return (
          <HistoryPanel
            prospects={prospects}
            loading={loading}
            analyzing={analyzing}
            sending={sending}
            onAnalyze={onAnalyze}
            onSend={onSend}
            onView={onView}
            onDelete={onDelete}
            onUpdateStatus={onUpdateStatus}
            onClose={() => setActivePanel(null)}
          />
        );
      default:
        return null;
    }
  };

  const activeCard = CARDS.find(c => c.id === activePanel);

  return (
    <>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const count = card.id === 'history' ? prospects.length : null;
          
          return (
            <Card
              key={card.id}
              className={`group relative overflow-hidden border-2 ${card.borderColor} bg-gradient-to-br ${card.bgGradient} cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
              onClick={() => setActivePanel(card.id)}
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

      {/* Full Screen Panel Dialog */}
      <Dialog open={activePanel !== null} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          {activeCard && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${activeCard.bgGradient} border-b border-border`}>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActivePanel(null)}
                    className="shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCard.gradient} flex items-center justify-center shadow-lg`}>
                      <activeCard.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{activeCard.title}</h2>
                      <p className="text-sm text-muted-foreground">{activeCard.description}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActivePanel(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {renderPanel()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
