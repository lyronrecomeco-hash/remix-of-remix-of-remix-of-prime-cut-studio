import { useState, useEffect } from 'react';
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
import { ReadyTemplatesTab } from './tabs/ReadyTemplatesTab';
import { Prospect, ProspectStatus } from './types';
import React from 'react';

interface AffiliateProspectingProps {
  affiliateId: string;
  onSubHeaderChange?: (header: React.ReactNode | null) => void;
}

type ToolsTab = 'cards' | 'search' | 'proposal' | 'history' | 'settings' | 'templates';

export const AffiliateProspecting = ({ affiliateId, onSubHeaderChange }: AffiliateProspectingProps) => {
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'search': return 'Buscar Clientes';
      case 'proposal': return 'Criar Proposta';
      case 'history': return 'Histórico de Prospects';
      case 'settings': return 'Configurações de Automação';
      case 'templates': return 'Modelos Prontos';
      default: return null;
    }
  };

  // Notify parent about sub-header when tab changes
  useEffect(() => {
    if (!onSubHeaderChange) return;

    if (activeTab !== 'cards') {
      const subHeader = (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab('cards')}
            className="shrink-0 h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {getTabTitle()}
          </h2>
        </div>
      );
      onSubHeaderChange(subHeader);
    } else {
      onSubHeaderChange(null);
    }

    return () => {
      onSubHeaderChange(null);
    };
  }, [activeTab, onSubHeaderChange]);

  const handleUpdateStatus = async (id: string, status: ProspectStatus) => {
    await updateProspect(id, { status } as Partial<Prospect>);
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
            affiliateId={affiliateId}
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

        {activeTab === 'templates' && (
          <ReadyTemplatesTab affiliateId={affiliateId} />
        )}
      </div>
    );
  };

  // Dynamic header based on active tab - only show when parent doesn't handle it
  const renderHeader = () => {
    // If parent handles the sub-header, don't render internal sub-header
    if (onSubHeaderChange && activeTab !== 'cards') {
      return null;
    }

    const isSubTab = activeTab !== 'cards';

    // Sub-tab header: just back button + title (only for mobile or when no parent callback)
    if (isSubTab) {
      return (
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab('cards')}
            className="shrink-0 h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {getTabTitle()}
          </h1>
        </div>
      );
    }

    // Main tab header: full header with buttons
    return (
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              ProspectAI Genesis
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema inteligente de prospecção com IA
            </p>
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

  // Hide parent header when in sub-tab (only for mobile when parent doesn't handle)
  const isSubTab = activeTab !== 'cards';
  const needsMobileOffset = isSubTab && !onSubHeaderChange;

  return (
    <div className={`space-y-6 ${needsMobileOffset ? '-mt-12 lg:-mt-0' : ''}`}>
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
