/**
 * CAKTO PANEL - Painel principal da integração Cakto
 * Layout profissional e organizado
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
  ExternalLink,
  Copy,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header Profissional */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Lado Esquerdo */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-primary">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <Separator orientation="vertical" className="h-8 hidden lg:block" />
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
                  <img 
                    src={caktoLogo} 
                    alt="Cakto" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Cakto</h1>
                    {isConnected && (
                      <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
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
                  <p className="text-sm text-muted-foreground">Plataforma de Infoprodutos</p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Ações */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowConfig(true)}
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Configurações</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info do Webhook - Apenas se conectado */}
      {isConnected && integration?.webhook_url && (
        <Card className="border bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">URL do Webhook</p>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {integration.webhook_url}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={copyWebhookUrl} className="gap-2 flex-shrink-0">
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card className="border-0 shadow-none">
          <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4"
            >
              <Zap className="w-4 h-4" />
              <span>Regras de Automação</span>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4"
            >
              <History className="w-4 h-4" />
              <span>Histórico de Eventos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="simulator" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4"
            >
              <TestTube2 className="w-4 h-4" />
              <span>Simulador</span>
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="dashboard" className="mt-0">
          <CaktoDashboard instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Regras de Automação
              </CardTitle>
              <CardDescription>
                Configure quais campanhas devem ser acionadas automaticamente para cada tipo de evento da Cakto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico de Eventos
              </CardTitle>
              <CardDescription>
                Visualize todos os eventos recebidos da Cakto e seu status de processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaktoEventsLog instanceId={instanceId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-primary" />
                Simulador de Eventos
              </CardTitle>
              <CardDescription>
                Teste o recebimento de eventos da Cakto para validar suas automações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaktoSimulator instanceId={instanceId} integrationId={integration?.id} />
            </CardContent>
          </Card>
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
