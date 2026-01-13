import { useState } from 'react';
import { 
  Target, 
  Settings, 
  RefreshCw,
  Zap,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProspects } from './hooks/useProspects';
import { ProspectViewer } from './ProspectViewer';
import { ProspectSettingsComponent } from './ProspectSettings';
import { ProspectingCards } from './ProspectingCards';
import { SearchClientsTab } from './tabs/SearchClientsTab';
import { CreateProposalTab } from './tabs/CreateProposalTab';
import { HistoryTab } from './tabs/HistoryTab';
import { Prospect, ProspectStatus } from './types';

interface AffiliateProspectingProps {
  affiliateId: string;
}

type ToolsTab = 'cards' | 'search' | 'proposal' | 'history' | 'settings';

export const AffiliateProspecting = ({ affiliateId }: AffiliateProspectingProps) => {
  const [activeTab, setActiveTab] = useState<ToolsTab>('cards');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  
  const {
    prospects,
    settings,
    loading,
    analyzing,
    sending,
    fetchProspects,
    createProspect,
    analyzeProspect,
    analyzeAll,
    sendProposal,
    sendBatch,
    updateProspect,
    deleteProspect,
    saveSettings,
    getStats,
  } = useProspects(affiliateId);

  const stats = getStats();
  const pendingCount = stats.pending;
  const readyToSendCount = stats.proposal_ready + stats.analyzed;

  const handleUpdateStatus = async (id: string, status: ProspectStatus) => {
    await updateProspect(id, { status } as Partial<Prospect>);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'search': return 'Buscar Clientes';
      case 'proposal': return 'Criar Proposta';
      case 'history': return 'Histórico de Prospects';
      case 'settings': return 'Configurações de Automação';
      default: return null;
    }
  };

  const renderContent = () => {
    if (activeTab === 'cards') {
      return (
        <ProspectingCards
          affiliateId={affiliateId}
          prospects={prospects}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      );
    }

    return (
      <div className="space-y-4">
        {/* Tab Content */}
        {activeTab === 'search' && (
          <SearchClientsTab
            affiliateId={affiliateId}
            onAddProspect={createProspect}
          />
        )}
        
        {activeTab === 'proposal' && (
          <CreateProposalTab affiliateId={affiliateId} />
        )}
        
        {activeTab === 'history' && (
          <HistoryTab
            prospects={prospects}
            loading={loading}
            analyzing={analyzing}
            sending={sending}
            onAnalyze={analyzeProspect}
            onSend={sendProposal}
            onView={setSelectedProspect}
            onDelete={deleteProspect}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'settings' && (
          <ProspectSettingsComponent
            settings={settings}
            onSave={saveSettings}
            affiliateId={affiliateId}
          />
        )}
      </div>
    );
  };

  // Dynamic header based on active tab
  const renderHeader = () => {
    const isSubTab = activeTab !== 'cards';
    const title = getTabTitle() || 'ProspectAI Genesis';
    const subtitle = isSubTab ? null : 'Sistema inteligente de prospecção com IA';

    return (
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSubTab ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('cards')}
              className="shrink-0 h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProspects()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('settings')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Config
          </Button>
          
          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzeAll()}
              disabled={analyzing}
              className="gap-2"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
              Analisar ({pendingCount})
            </Button>
          )}
          
          {readyToSendCount > 0 && (
            <Button
              size="sm"
              onClick={() => sendBatch(5)}
              disabled={sending}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Zap className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
              Enviar Lote ({readyToSendCount})
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader()}

      {/* Content */}
      {renderContent()}

      {/* Modal Viewer */}
      {selectedProspect && (
        <ProspectViewer
          prospect={selectedProspect}
          open={!!selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onSend={() => {
            sendProposal(selectedProspect.id);
            setSelectedProspect(null);
          }}
          onAnalyze={() => {
            analyzeProspect(selectedProspect.id);
          }}
          sending={sending}
          analyzing={analyzing}
        />
      )}
    </div>
  );
};

export default AffiliateProspecting;
