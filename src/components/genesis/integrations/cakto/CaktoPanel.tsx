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
      className="space-y-6"
    >
      {/* Header Compacto e Profissional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-primary hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
              <img 
                src={caktoLogo} 
                alt="Cakto" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Cakto</h1>
                {isConnected && (
                  <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Plataforma de Infoprodutos</p>
            </div>
          </div>
        </div>

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
            variant="default" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowConfig(true)}
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Configurar</span>
          </Button>
        </div>
      </div>

      {/* Webhook URL Card - Compact */}
      {isConnected && integration?.webhook_url && (
        <Card className="border bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Webhook URL</p>
                  <p className="text-xs text-foreground truncate max-w-sm">
                    {integration.webhook_url}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={copyWebhookUrl} className="gap-1.5 flex-shrink-0 h-8">
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Copiar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principais - Design Limpo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-lg h-auto flex-wrap">
          <TabsTrigger 
            value="dashboard" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            Regras
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm"
          >
            <History className="w-4 h-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger 
            value="simulator" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm"
          >
            <TestTube2 className="w-4 h-4" />
            Simular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <CaktoDashboard instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Regras de Automação
              </CardTitle>
              <CardDescription>
                Configure campanhas automáticas para cada evento da Cakto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Histórico de Eventos
              </CardTitle>
              <CardDescription>
                Eventos recebidos da Cakto e status de processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaktoEventsLog instanceId={instanceId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TestTube2 className="w-5 h-5 text-primary" />
                Simulador de Eventos
              </CardTitle>
              <CardDescription>
                Teste eventos para validar suas automações
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
