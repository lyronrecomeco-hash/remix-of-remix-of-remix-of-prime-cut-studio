/**
 * CAKTO PANEL - Painel principal da integração Cakto
 * Layout profissional, compacto e responsivo
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
      toast.success('URL copiada!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-3"
    >
      {/* Header Compacto */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <img src={caktoLogo} alt="Cakto" className="w-4.5 h-4.5 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold">Cakto</h1>
                {isConnected && (
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px] h-4 px-1">
                    <CheckCircle2 className="w-2 h-2 mr-0.5" />
                    Conectado
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="destructive" className="text-[9px] h-4 px-1">
                    <AlertCircle className="w-2 h-2 mr-0.5" />
                    Erro
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Infoprodutos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => refetch()}
            title="Atualizar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1 text-xs px-2" 
            onClick={() => setShowConfig(true)}
          >
            <Settings2 className="w-3 h-3" />
            <span className="hidden sm:inline">Configurar</span>
          </Button>
        </div>
      </div>

      {/* Webhook URL - Linha compacta */}
      {isConnected && integration?.webhook_url && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border/50">
          <Link2 className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[10px] text-muted-foreground shrink-0">Webhook:</span>
          <code className="text-[10px] truncate flex-1 text-foreground/80 font-mono">
            {integration.webhook_url}
          </code>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyWebhookUrl} 
            className="h-5 w-5 p-0 shrink-0"
            title="Copiar URL"
          >
            <Copy className="w-2.5 h-2.5" />
          </Button>
        </div>
      )}

      {/* Tabs Compactas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="w-full justify-start bg-muted/40 p-0.5 rounded-lg h-8 gap-0.5">
          <TabsTrigger 
            value="dashboard" 
            className="gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2.5 text-[11px] h-7"
          >
            <BarChart3 className="w-3 h-3" />
            <span className="hidden xs:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            className="gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2.5 text-[11px] h-7"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden xs:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2.5 text-[11px] h-7"
          >
            <History className="w-3 h-3" />
            <span className="hidden xs:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="simulator" 
            className="gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2.5 text-[11px] h-7"
          >
            <TestTube2 className="w-3 h-3" />
            <span className="hidden xs:inline">Simular</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
          <CaktoDashboard instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="rules" className="mt-0 focus-visible:ring-0">
          <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
        </TabsContent>

        <TabsContent value="events" className="mt-0 focus-visible:ring-0">
          <CaktoEventsLog instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="simulator" className="mt-0 focus-visible:ring-0">
          <CaktoSimulator instanceId={instanceId} integrationId={integration?.id} />
        </TabsContent>
      </Tabs>

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
