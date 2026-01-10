/**
 * CAKTO PANEL - Painel principal da integração Cakto
 * Layout profissional com tabs únicas
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      className="space-y-4"
    >
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-primary hover:bg-primary/10 h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
              <img src={caktoLogo} alt="Cakto" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Cakto</h1>
                {isConnected && (
                  <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px] px-1.5 py-0">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                    Conectado
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                    Erro
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Infoprodutos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setShowConfig(true)}>
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar</span>
          </Button>
        </div>
      </div>

      {/* Webhook URL - Inline */}
      {isConnected && integration?.webhook_url && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border text-xs">
          <Link2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">Webhook:</span>
          <code className="truncate flex-1 text-foreground">{integration.webhook_url}</code>
          <Button variant="ghost" size="sm" onClick={copyWebhookUrl} className="h-6 px-2">
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Tabs Únicas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-lg h-10">
          <TabsTrigger 
            value="dashboard" 
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            Regras
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
          >
            <History className="w-3.5 h-3.5" />
            Eventos
          </TabsTrigger>
          <TabsTrigger 
            value="simulator" 
            className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
          >
            <TestTube2 className="w-3.5 h-3.5" />
            Simular
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
