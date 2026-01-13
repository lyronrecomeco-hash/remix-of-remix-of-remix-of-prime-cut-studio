import { useState } from 'react';
import { 
  Target, 
  Settings, 
  RefreshCw,
  Zap,
  Sparkles,
  Search,
  FileText,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProspects } from './hooks/useProspects';
import { ProspectStats } from './ProspectStats';
import { ProspectViewer } from './ProspectViewer';
import { ProspectSettingsComponent } from './ProspectSettings';
import { SearchClientsTab } from './tabs/SearchClientsTab';
import { CreateProposalTab } from './tabs/CreateProposalTab';
import { HistoryTab } from './tabs/HistoryTab';
import { Prospect, ProspectStatus } from './types';

interface AffiliateProspectingProps {
  affiliateId: string;
}

export const AffiliateProspecting = ({ affiliateId }: AffiliateProspectingProps) => {
  const [activeMainTab, setActiveMainTab] = useState('search');
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
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <Zap className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
              Enviar Lote ({readyToSendCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <ProspectStats stats={stats} />

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-muted/50 p-1 gap-1">
          <TabsTrigger 
            value="search" 
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Buscar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="proposal" 
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Proposta</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
            {prospects.length > 0 && (
              <span className="hidden lg:inline-flex ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
                {prospects.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <SearchClientsTab
            affiliateId={affiliateId}
            onAddProspect={createProspect}
          />
        </TabsContent>

        <TabsContent value="proposal" className="mt-6">
          <CreateProposalTab affiliateId={affiliateId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
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
