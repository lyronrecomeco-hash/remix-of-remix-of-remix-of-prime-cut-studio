import { useState } from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  Send, 
  Settings, 
  RefreshCw,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProspects } from './hooks/useProspects';
import { ProspectStats } from './ProspectStats';
import { ProspectList } from './ProspectList';
import { ProspectViewer } from './ProspectViewer';
import { ProspectSettingsComponent } from './ProspectSettings';
import { AddProspectModal } from './AddProspectModal';
import { Prospect } from './types';

interface AffiliateProspectingProps {
  affiliateId: string;
}

export const AffiliateProspecting = ({ affiliateId }: AffiliateProspectingProps) => {
  const [activeTab, setActiveTab] = useState('prospects');
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateProspect(id, { status } as Partial<Prospect>);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-7 h-7 text-primary" />
            ProspectAI Genesis
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema inteligente de prospecção com análise automática e envio via WhatsApp
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
          
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ProspectStats stats={stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="prospects" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Prospects
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="mt-4">
          <ProspectList
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

        <TabsContent value="settings" className="mt-4">
          <ProspectSettingsComponent
            settings={settings}
            onSave={saveSettings}
            affiliateId={affiliateId}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddProspectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createProspect}
      />

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
