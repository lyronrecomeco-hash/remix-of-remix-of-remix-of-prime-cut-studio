/**
 * CAKTO PANEL - Painel de gerenciamento profissional
 * Layout SaaS - Dashboard direto, modais para Regras/Eventos/Webhook
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  History, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Link2,
  ExternalLink,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CaktoDashboard } from './CaktoDashboard';
import { CaktoEventRules } from './CaktoEventRules';
import { CaktoEventsLog } from './CaktoEventsLog';
import { CaktoConfigModal } from './CaktoConfigModal';
import { CaktoAutomationModal } from './CaktoAutomationModal';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import caktoLogo from '@/assets/integrations/cakto-logo.png';
import caktoLogo from '@/assets/integrations/cakto-logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CaktoPanelProps {
  instanceId: string;
  onBack: () => void;
}

export function CaktoPanel({ instanceId, onBack }: CaktoPanelProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const { integration, loading, refetch, isConnected, hasError } = useCaktoIntegration(instanceId);

  // Webhook URL com domínio customizado
  const webhookUrl = integration?.webhook_url 
    ? `https://genesishub.cloud/webhook/cakto/${integration.id}` 
    : '';

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
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
          HEADER FIXO - Logo, Status, Ações
      ═══════════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Esquerda: Voltar + Logo + Info */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack} 
              className="h-10 w-10 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Separator orientation="vertical" className="h-10" />
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/20 flex items-center justify-center shadow-md">
                <img src={caktoLogo} alt="Cakto" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">Cakto</h1>
                  <StatusBadge isConnected={isConnected} hasError={hasError} />
                </div>
                <p className="text-base text-muted-foreground">Plataforma de Infoprodutos</p>
              </div>
            </div>
          </div>

          {/* Direita: Ações */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4" 
              onClick={() => setShowAutomationModal(true)}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Automação</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4" 
              onClick={() => setShowWebhookModal(true)}
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Webhook</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4" 
              onClick={() => setShowRulesModal(true)}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Regras</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4" 
              onClick={() => setShowEventsModal(true)}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Eventos</span>
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10" 
              onClick={() => refetch()}
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="gap-2 h-10 px-4" 
              onClick={() => setShowConfig(true)}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          CONTEÚDO - DASHBOARD DIRETO (subido)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <CaktoDashboard instanceId={instanceId} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAIS
      ═══════════════════════════════════════════════════════════════ */}
      
      {/* Modal de Webhook com Instruções */}
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              Configuração de Webhook
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* URL do Webhook */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">URL do Webhook</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-muted rounded-lg text-sm font-mono break-all border">
                  {webhookUrl || 'Configure a integração primeiro'}
                </code>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={copyWebhookUrl}
                  disabled={!webhookUrl}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Instruções */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-xl border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Como configurar na Cakto</h4>
              </div>
              
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Acesse o painel da Cakto em <strong>cakto.com.br</strong></li>
                <li>Vá em <strong>Integrações → Webhooks</strong></li>
                <li>Clique em <strong>"Novo Webhook"</strong></li>
                <li>Cole a URL acima no campo de endpoint</li>
                <li>Selecione os eventos que deseja receber:
                  <ul className="ml-6 mt-2 space-y-1 list-disc">
                    <li>checkout_initiated</li>
                    <li>purchase_approved</li>
                    <li>purchase_refused</li>
                    <li>purchase_refunded</li>
                    <li>cart_abandoned</li>
                  </ul>
                </li>
                <li>Salve e teste o webhook</li>
              </ol>
            </div>

            {/* Link para documentação */}
            <a 
              href="https://docs.cakto.com.br/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver documentação completa da Cakto
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Regras */}
      <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              Regras de Automação
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Eventos */}
      <Dialog open={showEventsModal} onOpenChange={setShowEventsModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              Histórico de Eventos
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CaktoEventsLog instanceId={instanceId} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <CaktoConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        instanceId={instanceId}
        existingIntegration={integration}
        onSuccess={refetch}
      />

      {/* Automation Modal */}
      <CaktoAutomationModal
        open={showAutomationModal}
        onOpenChange={setShowAutomationModal}
        instanceId={instanceId}
        integrationId={integration?.id}
      />
    </motion.div>
  );
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ isConnected, hasError }: { isConnected: boolean; hasError: boolean }) {
  if (hasError) {
    return (
      <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm">
        <AlertCircle className="w-3.5 h-3.5" />
        Erro
      </Badge>
    );
  }
  
  if (isConnected) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1 text-sm">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Conectado
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
      <AlertCircle className="w-3.5 h-3.5" />
      Desconectado
    </Badge>
  );
}
