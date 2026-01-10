/**
 * CAKTO PANEL - Painel de gerenciamento profissional
 * Layout SaaS inspirado em Stripe, HubSpot, Shopify
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings2, 
  BarChart3, 
  Zap, 
  History, 
  TestTube2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Link2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CaktoDashboard } from './CaktoDashboard';
import { CaktoEventRules } from './CaktoEventRules';
import { CaktoEventsLog } from './CaktoEventsLog';
import { CaktoSimulator } from './CaktoSimulator';
import { CaktoConfigModal } from './CaktoConfigModal';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import caktoLogo from '@/assets/integrations/cakto-logo.png';

interface CaktoPanelProps {
  instanceId: string;
  onBack: () => void;
}

export function CaktoPanel({ instanceId, onBack }: CaktoPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfig, setShowConfig] = useState(false);
  const { integration, loading, refetch, isConnected, hasError } = useCaktoIntegration(instanceId);

  const copyWebhookUrl = () => {
    if (integration?.webhook_url) {
      navigator.clipboard.writeText(integration.webhook_url);
      toast.success('URL do Webhook copiada!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER FIXO - Logo, Status, Configurar, Webhook
      ═══════════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
        {/* Linha Principal */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Esquerda: Voltar + Logo + Info */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack} 
              className="h-9 w-9 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                <img src={caktoLogo} alt="Cakto" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold">Cakto</h1>
                  <StatusBadge isConnected={isConnected} hasError={hasError} />
                </div>
                <p className="text-sm text-muted-foreground">Infoprodutos</p>
              </div>
            </div>
          </div>

          {/* Direita: Ações */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9" 
              onClick={() => refetch()}
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-9" 
              onClick={() => setShowConfig(true)}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </div>

        {/* Webhook URL - Linha secundária compacta */}
        {isConnected && integration?.webhook_url && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Link2 className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Webhook:</span>
                <code className="text-xs font-mono truncate flex-1">{integration.webhook_url}</code>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyWebhookUrl} 
                className="gap-1.5 h-7 px-2 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Copiar</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          CONTEÚDO COM TABS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Navegação por Tabs */}
          <div className="flex-shrink-0 px-6 pt-4">
            <TabsList className="inline-flex h-10 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="dashboard" 
                className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rules" 
                className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <Zap className="w-4 h-4" />
                <span>Regras</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <History className="w-4 h-4" />
                <span>Eventos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="simulator" 
                className="gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <TestTube2 className="w-4 h-4" />
                <span>Simular</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="flex-1 px-6 py-6 overflow-auto">
            <TabsContent value="dashboard" className="mt-0 h-full">
              <CaktoDashboard instanceId={instanceId} />
            </TabsContent>

            <TabsContent value="rules" className="mt-0">
              <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <CaktoEventsLog instanceId={instanceId} />
            </TabsContent>

            <TabsContent value="simulator" className="mt-0">
              <CaktoSimulator instanceId={instanceId} integrationId={integration?.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Config Modal */}
      <CaktoConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        instanceId={instanceId}
        existingIntegration={integration}
        onSuccess={refetch}
      />
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ isConnected, hasError }: { isConnected: boolean; hasError: boolean }) {
  if (hasError) {
    return (
      <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-xs">
        <AlertCircle className="w-3 h-3" />
        Erro
      </Badge>
    );
  }
  
  if (isConnected) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1 px-2 py-0.5 text-xs">
        <CheckCircle2 className="w-3 h-3" />
        Conectado
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
      <AlertCircle className="w-3 h-3" />
      Desconectado
    </Badge>
  );
}
