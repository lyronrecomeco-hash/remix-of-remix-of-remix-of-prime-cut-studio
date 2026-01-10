/**
 * CAKTO PANEL - Painel principal da integração Cakto
 * Layout organizado e profissional
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
  Link2
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
      toast.success('URL do Webhook copiada!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack} 
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border-2 border-border flex items-center justify-center shadow-sm">
              <img src={caktoLogo} alt="Cakto" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Cakto</h1>
                {isConnected && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Infoprodutos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9" 
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setShowConfig(true)}
          >
            <Settings2 className="w-4 h-4" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Webhook URL */}
      {isConnected && integration?.webhook_url && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
          <Link2 className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Webhook URL</p>
            <code className="text-sm truncate block">{integration.webhook_url}</code>
          </div>
          <Button variant="outline" size="sm" onClick={copyWebhookUrl} className="gap-2 shrink-0">
            <Copy className="w-4 h-4" />
            Copiar
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex bg-muted p-1 h-auto">
          <TabsTrigger 
            value="dashboard" 
            className="gap-2 py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            className="gap-2 py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="gap-2 py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="simulator" 
            className="gap-2 py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TestTube2 className="w-4 h-4" />
            <span className="hidden sm:inline">Simular</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
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
