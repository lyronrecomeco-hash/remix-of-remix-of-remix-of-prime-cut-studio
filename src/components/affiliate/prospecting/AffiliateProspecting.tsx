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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProspects } from './hooks/useProspects';
import { ProspectStats } from './ProspectStats';
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

type ToolsTab = 'cards' | 'search' | 'proposal' | 'history';

export const AffiliateProspecting = ({ affiliateId }: AffiliateProspectingProps) => {
  const [activeMainTab, setActiveMainTab] = useState('tools');
  const [activeToolsTab, setActiveToolsTab] = useState<ToolsTab>('cards');
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
    switch (activeToolsTab) {
      case 'search': return 'Buscar Clientes';
      case 'proposal': return 'Criar Proposta';
      case 'history': return 'Histórico de Prospects';
      default: return null;
    }
  };

  const renderToolsContent = () => {
    if (activeToolsTab === 'cards') {
      return (
        <ProspectingCards
          affiliateId={affiliateId}
          prospects={prospects}
          activeTab={activeToolsTab}
          onTabChange={setActiveToolsTab}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Back Button and Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveToolsTab('cards')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">{getTabTitle()}</h2>
        </div>

        {/* Tab Content */}
        {activeToolsTab === 'search' && (
          <SearchClientsTab
            affiliateId={affiliateId}
            onAddProspect={createProspect}
          />
        )}
        
        {activeToolsTab === 'proposal' && (
          <CreateProposalTab affiliateId={affiliateId} />
        )}
        
        {activeToolsTab === 'history' && (
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            ProspectAI Genesis
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema inteligente de prospecção com IA
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProspects()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
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
              Analisar Todos ({pendingCount})
            </Button>
          )}
          
          {readyToSendCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => sendBatch(5)}
              disabled={sending}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Zap className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
              Enviar Lote ({readyToSendCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <ProspectStats stats={stats} />

      {/* Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="tools" className="gap-2">
            <Target className="w-4 h-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-6">
          {renderToolsContent()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProspectSettingsComponent
            settings={settings}
            onSave={saveSettings}
            affiliateId={affiliateId}
          />
        </TabsContent>
      </Tabs>

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
